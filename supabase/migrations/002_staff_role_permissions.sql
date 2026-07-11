-- Align database write access with the dashboard permission matrix.

create or replace function public.has_any_role(allowed_roles text[])
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid() and role = any(allowed_roles)
  )
$$;

-- Admin-only account and configuration management.
drop policy if exists "Staff manage profiles" on public.profiles;
create policy "Admins manage profiles" on public.profiles for all
  using (public.has_any_role(array['super_admin', 'admin']))
  with check (public.has_any_role(array['super_admin', 'admin']));

drop policy if exists "Settings staff write" on public.settings;
create policy "Admins write settings" on public.settings for all
  using (public.has_any_role(array['super_admin', 'admin']))
  with check (public.has_any_role(array['super_admin', 'admin']));

-- Managers can maintain the catalog, marketing, and reviews.
drop policy if exists "Categories staff write" on public.categories;
create policy "Catalog staff write categories" on public.categories for all
  using (public.has_any_role(array['super_admin', 'admin', 'manager']))
  with check (public.has_any_role(array['super_admin', 'admin', 'manager']));

drop policy if exists "Brands staff write" on public.brands;
create policy "Catalog staff write brands" on public.brands for all
  using (public.has_any_role(array['super_admin', 'admin', 'manager']))
  with check (public.has_any_role(array['super_admin', 'admin', 'manager']));

drop policy if exists "Products staff write" on public.products;
create policy "Catalog staff write products" on public.products for all
  using (public.has_any_role(array['super_admin', 'admin', 'manager']))
  with check (public.has_any_role(array['super_admin', 'admin', 'manager']));

drop policy if exists "Product categories staff" on public.product_categories;
create policy "Catalog staff write product categories" on public.product_categories for all
  using (public.has_any_role(array['super_admin', 'admin', 'manager']))
  with check (public.has_any_role(array['super_admin', 'admin', 'manager']));

drop policy if exists "Product tags staff" on public.product_tags;
create policy "Catalog staff write product tags" on public.product_tags for all
  using (public.has_any_role(array['super_admin', 'admin', 'manager']))
  with check (public.has_any_role(array['super_admin', 'admin', 'manager']));

drop policy if exists "Product images staff" on public.product_images;
create policy "Catalog staff write product images" on public.product_images for all
  using (public.has_any_role(array['super_admin', 'admin', 'manager']))
  with check (public.has_any_role(array['super_admin', 'admin', 'manager']));

drop policy if exists "Product variants staff" on public.product_variants;
create policy "Catalog staff write product variants" on public.product_variants for all
  using (public.has_any_role(array['super_admin', 'admin', 'manager']))
  with check (public.has_any_role(array['super_admin', 'admin', 'manager']));

drop policy if exists "Coupons staff all" on public.coupons;
create policy "Managers manage coupons" on public.coupons for all
  using (public.has_any_role(array['super_admin', 'admin', 'manager']))
  with check (public.has_any_role(array['super_admin', 'admin', 'manager']));

drop policy if exists "Reviews staff all" on public.reviews;
create policy "Managers manage reviews" on public.reviews for all
  using (public.has_any_role(array['super_admin', 'admin', 'manager']))
  with check (public.has_any_role(array['super_admin', 'admin', 'manager']));

-- Employees can handle fulfillment, inventory, and media operations.
drop policy if exists "Orders staff update" on public.orders;
create policy "Operations staff update orders" on public.orders for update
  using (public.has_any_role(array['super_admin', 'admin', 'manager', 'employee']))
  with check (public.has_any_role(array['super_admin', 'admin', 'manager', 'employee']));

drop policy if exists "Order items staff all" on public.order_items;
create policy "Operations staff manage order items" on public.order_items for all
  using (public.has_any_role(array['super_admin', 'admin', 'manager', 'employee']))
  with check (public.has_any_role(array['super_admin', 'admin', 'manager', 'employee']));

drop policy if exists "Inventory staff" on public.inventory_history;
create policy "Operations staff manage inventory" on public.inventory_history for all
  using (public.has_any_role(array['super_admin', 'admin', 'manager', 'employee']))
  with check (public.has_any_role(array['super_admin', 'admin', 'manager', 'employee']));

drop policy if exists "Media staff write" on public.media;
create policy "Operations staff write media" on public.media for all
  using (public.has_any_role(array['super_admin', 'admin', 'manager', 'employee']))
  with check (public.has_any_role(array['super_admin', 'admin', 'manager', 'employee']));
