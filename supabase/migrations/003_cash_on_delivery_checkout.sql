-- Create cash-on-delivery orders atomically and without exposing privileged keys.

alter table public.orders
  add column if not exists payment_method text not null default 'cash_on_delivery';

alter table public.orders
  add column if not exists stock_deducted boolean not null default false;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'orders_payment_method_check'
      and conrelid = 'public.orders'::regclass
  ) then
    alter table public.orders
      add constraint orders_payment_method_check
      check (payment_method in ('cash_on_delivery', 'credit_card', 'paypal', 'bank_transfer'));
  end if;
end
$$;

create or replace function public.place_cash_on_delivery_order(
  p_shipping_address jsonb,
  p_billing_address jsonb,
  p_items jsonb,
  p_shipping_method text default 'Standard'
)
returns table(order_id uuid, order_number text)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_order_id uuid;
  v_order_number text := public.generate_order_number();
  v_subtotal numeric(10,2) := 0;
  v_tax numeric(10,2);
  v_shipping_cost numeric(10,2);
  v_total numeric(10,2);
  v_item jsonb;
  v_product public.products%rowtype;
  v_variant public.product_variants%rowtype;
  v_product_id uuid;
  v_variant_id uuid;
  v_quantity integer;
  v_available integer;
  v_previous_stock integer;
  v_unit_price numeric(10,2);
  v_product_image text;
begin
  if v_user_id is null then
    raise exception 'Sign in before placing an order' using errcode = '42501';
  end if;

  if jsonb_typeof(p_shipping_address) <> 'object' then
    raise exception 'A shipping address is required' using errcode = '22023';
  end if;

  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'Your cart is empty' using errcode = '22023';
  end if;

  if exists (
    select 1
    from jsonb_array_elements(p_items) as cart_item(value)
    group by value->>'product_id', coalesce(value->>'variant_id', '')
    having count(*) > 1
  ) then
    raise exception 'Duplicate cart items are not allowed' using errcode = '22023';
  end if;

  -- Lock every stock row in a stable order and calculate the trusted subtotal.
  for v_item in
    select value
    from jsonb_array_elements(p_items) as cart_item(value)
    order by value->>'product_id', coalesce(value->>'variant_id', '')
  loop
    begin
      v_product_id := (v_item->>'product_id')::uuid;
      v_variant_id := nullif(v_item->>'variant_id', '')::uuid;
      v_quantity := (v_item->>'quantity')::integer;
    exception
      when invalid_text_representation then
        raise exception 'The cart contains an invalid item' using errcode = '22023';
    end;

    if v_product_id is null or v_quantity is null or v_quantity <= 0 then
      raise exception 'The cart contains an invalid quantity' using errcode = '22023';
    end if;

    select *
    into v_product
    from public.products
    where id = v_product_id and status = 'active'
    for update;

    if not found then
      raise exception 'A product in your cart is no longer available' using errcode = 'P0001';
    end if;

    if v_variant_id is not null then
      select *
      into v_variant
      from public.product_variants
      where id = v_variant_id
        and product_id = v_product_id
        and is_active = true
      for update;

      if not found then
        raise exception '% is no longer available in the selected option', v_product.name using errcode = 'P0001';
      end if;

      v_available := v_variant.stock_quantity;
      v_unit_price := coalesce(v_variant.sale_price, v_variant.price);
    else
      v_available := v_product.stock_quantity;
      v_unit_price := coalesce(v_product.sale_price, v_product.selling_price);
    end if;

    if v_quantity > v_available then
      raise exception '% only has % available', v_product.name, v_available using errcode = 'P0001';
    end if;

    v_subtotal := v_subtotal + (v_unit_price * v_quantity);
  end loop;

  v_tax := round(v_subtotal * 0.10, 2);
  v_shipping_cost := case when v_subtotal > 100 then 0 else 9.99 end;
  v_total := v_subtotal + v_tax + v_shipping_cost;

  insert into public.orders (
    user_id,
    order_number,
    status,
    payment_status,
    payment_method,
    stock_deducted,
    subtotal,
    tax,
    shipping_cost,
    discount,
    total,
    shipping_method,
    shipping_address,
    billing_address,
    customer_note
  ) values (
    v_user_id,
    v_order_number,
    'pending',
    'pending',
    'cash_on_delivery',
    true,
    v_subtotal,
    v_tax,
    v_shipping_cost,
    0,
    v_total,
    coalesce(nullif(p_shipping_method, ''), 'Standard'),
    p_shipping_address,
    coalesce(p_billing_address, p_shipping_address),
    'Payment will be collected on delivery.'
  )
  returning id into v_order_id;

  for v_item in
    select value
    from jsonb_array_elements(p_items) as cart_item(value)
    order by value->>'product_id', coalesce(value->>'variant_id', '')
  loop
    v_product_id := (v_item->>'product_id')::uuid;
    v_variant_id := nullif(v_item->>'variant_id', '')::uuid;
    v_quantity := (v_item->>'quantity')::integer;

    select * into v_product from public.products where id = v_product_id;

    if v_variant_id is not null then
      select * into v_variant from public.product_variants where id = v_variant_id;
      v_previous_stock := v_variant.stock_quantity;
      v_unit_price := coalesce(v_variant.sale_price, v_variant.price);

      update public.product_variants
      set stock_quantity = stock_quantity - v_quantity,
          updated_at = now()
      where id = v_variant_id;

      update public.products
      set stock_quantity = greatest(0, stock_quantity - v_quantity),
          updated_at = now()
      where id = v_product_id;
    else
      v_previous_stock := v_product.stock_quantity;
      v_unit_price := coalesce(v_product.sale_price, v_product.selling_price);

      update public.products
      set stock_quantity = stock_quantity - v_quantity,
          updated_at = now()
      where id = v_product_id;
    end if;

    select url
    into v_product_image
    from public.product_images
    where product_id = v_product_id
    order by is_featured desc, sort_order asc, created_at asc
    limit 1;

    insert into public.order_items (
      order_id,
      product_id,
      variant_id,
      product_name,
      product_image,
      sku,
      quantity,
      unit_price,
      total_price
    ) values (
      v_order_id,
      v_product_id,
      v_variant_id,
      v_product.name,
      v_product_image,
      case
        when v_variant_id is not null then coalesce(v_variant.sku, v_product.sku, '')
        else coalesce(v_product.sku, '')
      end,
      v_quantity,
      v_unit_price,
      v_unit_price * v_quantity
    );

    insert into public.inventory_history (
      product_id,
      variant_id,
      action,
      quantity,
      note,
      previous_stock,
      new_stock,
      created_by
    ) values (
      v_product_id,
      v_variant_id,
      'out',
      v_quantity,
      'Reserved for cash-on-delivery order ' || v_order_number,
      v_previous_stock,
      v_previous_stock - v_quantity,
      v_user_id
    );
  end loop;

  return query select v_order_id, v_order_number;
end;
$$;

revoke all on function public.place_cash_on_delivery_order(jsonb, jsonb, jsonb, text) from public;
grant execute on function public.place_cash_on_delivery_order(jsonb, jsonb, jsonb, text) to authenticated;

create or replace function public.restore_order_stock_on_cancel()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_item record;
  v_previous_stock integer;
begin
  if new.status in ('cancelled', 'refunded')
     and old.status not in ('cancelled', 'refunded')
     and old.stock_deducted then
    for v_item in
      select product_id, variant_id, quantity
      from public.order_items
      where order_id = old.id and product_id is not null
      order by product_id, variant_id nulls first
    loop
      if v_item.variant_id is not null then
        select stock_quantity
        into v_previous_stock
        from public.product_variants
        where id = v_item.variant_id
        for update;

        update public.product_variants
        set stock_quantity = stock_quantity + v_item.quantity,
            updated_at = now()
        where id = v_item.variant_id;

        update public.products
        set stock_quantity = stock_quantity + v_item.quantity,
            updated_at = now()
        where id = v_item.product_id;
      else
        select stock_quantity
        into v_previous_stock
        from public.products
        where id = v_item.product_id
        for update;

        update public.products
        set stock_quantity = stock_quantity + v_item.quantity,
            updated_at = now()
        where id = v_item.product_id;
      end if;

      insert into public.inventory_history (
        product_id,
        variant_id,
        action,
        quantity,
        note,
        previous_stock,
        new_stock,
        created_by
      ) values (
        v_item.product_id,
        v_item.variant_id,
        'return',
        v_item.quantity,
        'Restored from cancelled order ' || old.order_number,
        v_previous_stock,
        v_previous_stock + v_item.quantity,
        auth.uid()
      );
    end loop;

    new.stock_deducted := false;
  elsif old.status in ('cancelled', 'refunded')
        and new.status not in ('cancelled', 'refunded') then
    raise exception 'Cancelled or refunded orders cannot be reactivated' using errcode = 'P0001';
  end if;

  return new;
end;
$$;

drop trigger if exists restore_order_stock_on_cancel on public.orders;
create trigger restore_order_stock_on_cancel
  before update of status on public.orders
  for each row
  execute function public.restore_order_stock_on_cancel();

revoke all on function public.restore_order_stock_on_cancel() from public;
