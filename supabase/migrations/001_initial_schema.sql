-- ======================================================================
-- Joe's Shop — Initial Schema
-- PostgreSQL / Supabase migration
-- ======================================================================

-- Extensions ------------------------------------------------------------
create extension if not exists "pgcrypto";   -- gen_random_uuid()
create extension if not exists "pg_trgm";    -- trigram search

-- ======================================================================
-- Roles
-- ======================================================================
create table if not exists public.roles (
  id          uuid primary key default gen_random_uuid(),
  name        text unique not null,
  description text,
  created_at  timestamptz not null default now()
);

insert into public.roles (name, description) values
  ('super_admin', 'Full unrestricted access'),
  ('admin',       'Administrative access'),
  ('manager',     'Manage products, orders, customers'),
  ('employee',    'Limited staff access'),
  ('customer',    'Registered shopper')
on conflict (name) do nothing;

-- ======================================================================
-- Profiles (1:1 with auth.users)
-- ======================================================================
create table if not exists public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  first_name   text default '',
  last_name    text default '',
  phone        text default '',
  avatar_url   text,
  role         text not null default 'customer' references public.roles(name),
  banned       boolean not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ======================================================================
-- Categories (self-referencing tree)
-- ======================================================================
create table if not exists public.categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text unique not null,
  description text,
  image_url   text,
  parent_id   uuid references public.categories(id) on delete set null,
  sort_order  integer not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ======================================================================
-- Brands
-- ======================================================================
create table if not exists public.brands (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text unique not null,
  logo_url    text,
  description text,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ======================================================================
-- Products
-- ======================================================================
create table if not exists public.products (
  id                  uuid primary key default gen_random_uuid(),
  name                text not null,
  slug                text unique not null,
  description         text,
  short_description   text,
  sku                 text,
  barcode             text,
  brand_id            uuid references public.brands(id) on delete set null,
  cost_price          numeric(10,2) not null default 0,
  selling_price       numeric(10,2) not null,
  sale_price          numeric(10,2),
  discount_percentage integer default 0,
  stock_quantity      integer not null default 0,
  low_stock_threshold integer not null default 5,
  weight              numeric(8,2),
  dimensions          jsonb,
  seo_title           text,
  seo_description     text,
  status              text not null default 'draft'
                        check (status in ('active','draft','archived','hidden')),
  is_featured         boolean not null default false,
  is_new_arrival      boolean not null default false,
  is_best_seller      boolean not null default false,
  average_rating      numeric(3,2) not null default 0,
  review_count        integer not null default 0,
  total_sold          integer not null default 0,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- ======================================================================
-- Product relations: categories, tags, images, variants
-- ======================================================================
create table if not exists public.product_categories (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references public.products(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete cascade,
  unique (product_id, category_id)
);

create table if not exists public.product_tags (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references public.products(id) on delete cascade,
  tag         text not null
);

create table if not exists public.product_images (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references public.products(id) on delete cascade,
  url         text not null,
  alt_text    text,
  sort_order  integer not null default 0,
  is_featured boolean not null default false,
  created_at  timestamptz not null default now()
);

create table if not exists public.product_variants (
  id             uuid primary key default gen_random_uuid(),
  product_id     uuid not null references public.products(id) on delete cascade,
  sku            text,
  barcode        text,
  price          numeric(10,2) not null,
  sale_price     numeric(10,2),
  cost_price     numeric(10,2),
  stock_quantity integer not null default 0,
  color          text,
  size           text,
  weight         numeric(8,2),
  is_active      boolean not null default true,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- ======================================================================
-- Reviews
-- ======================================================================
create table if not exists public.reviews (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references public.products(id) on delete cascade,
  user_id     uuid not null references public.profiles(id) on delete cascade,
  rating      integer not null check (rating between 1 and 5),
  title       text,
  comment     text,
  status      text not null default 'pending'
                check (status in ('pending','approved','rejected')),
  admin_reply text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ======================================================================
-- Cart & Wishlist
-- ======================================================================
create table if not exists public.cart_items (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  variant_id uuid references public.product_variants(id) on delete cascade,
  quantity   integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.wishlist_items (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);

-- ======================================================================
-- Addresses
-- ======================================================================
create table if not exists public.addresses (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references public.profiles(id) on delete cascade,
  label             text not null default 'Home',
  first_name        text not null,
  last_name         text not null,
  street_address_1  text not null,
  street_address_2  text,
  city              text not null,
  state             text not null,
  postal_code       text not null,
  country           text not null default 'United States',
  phone             text,
  is_default        boolean not null default false,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- ======================================================================
-- Coupons
-- ======================================================================
create table if not exists public.coupons (
  id           uuid primary key default gen_random_uuid(),
  code         text unique not null,
  type         text not null check (type in ('percentage','fixed','free_shipping')),
  value        numeric(10,2) not null default 0,
  min_purchase numeric(10,2),
  max_uses     integer,
  used_count   integer not null default 0,
  starts_at    timestamptz,
  expires_at   timestamptz,
  is_active    boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- ======================================================================
-- Orders & Order Items
-- ======================================================================
create table if not exists public.orders (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references public.profiles(id) on delete restrict,
  order_number     text unique not null,
  status           text not null default 'pending'
                     check (status in ('pending','paid','processing','shipped','delivered','cancelled','refunded')),
  payment_status   text not null default 'pending'
                     check (payment_status in ('pending','paid','failed','refunded')),
  subtotal         numeric(10,2) not null default 0,
  tax              numeric(10,2) not null default 0,
  shipping_cost    numeric(10,2) not null default 0,
  discount         numeric(10,2) not null default 0,
  total            numeric(10,2) not null default 0,
  coupon_id        uuid references public.coupons(id) on delete set null,
  shipping_method  text,
  shipping_address jsonb,
  billing_address  jsonb,
  customer_note    text,
  internal_note    text,
  paid_at          timestamptz,
  shipped_at       timestamptz,
  delivered_at     timestamptz,
  cancelled_at     timestamptz,
  refunded_at      timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create table if not exists public.order_items (
  id            uuid primary key default gen_random_uuid(),
  order_id      uuid not null references public.orders(id) on delete cascade,
  product_id    uuid references public.products(id) on delete set null,
  variant_id    uuid references public.product_variants(id) on delete set null,
  product_name  text not null,
  product_image text,
  sku           text,
  quantity      integer not null,
  unit_price    numeric(10,2) not null,
  total_price   numeric(10,2) not null
);

-- ======================================================================
-- Inventory History
-- ======================================================================
create table if not exists public.inventory_history (
  id             uuid primary key default gen_random_uuid(),
  product_id     uuid not null references public.products(id) on delete cascade,
  variant_id     uuid references public.product_variants(id) on delete cascade,
  action         text not null check (action in ('in','out','adjustment','return')),
  quantity       integer not null,
  note           text,
  previous_stock integer not null default 0,
  new_stock      integer not null default 0,
  created_by     uuid references public.profiles(id) on delete set null,
  created_at     timestamptz not null default now()
);

-- ======================================================================
-- Media Library
-- ======================================================================
create table if not exists public.media (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  url        text not null,
  type       text not null check (type in ('image','video','pdf','document')),
  size       bigint not null default 0,
  folder     text default '',
  metadata   jsonb,
  created_at timestamptz not null default now()
);

-- ======================================================================
-- Settings (key/value store)
-- ======================================================================
create table if not exists public.settings (
  id         serial primary key,
  key        text unique not null,
  value      text,
  type       text not null default 'string' check (type in ('string','number','boolean','json')),
  updated_at timestamptz not null default now()
);

-- ======================================================================
-- Notifications
-- ======================================================================
create table if not exists public.notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  type       text not null default 'system',
  title      text not null,
  message    text not null,
  is_read    boolean not null default false,
  data       jsonb,
  created_at timestamptz not null default now()
);

-- ======================================================================
-- Indexes
-- ======================================================================
create index idx_products_slug           on public.products (slug);
create index idx_products_status         on public.products (status);
create index idx_products_brand          on public.products (brand_id);
create index idx_products_featured       on public.products (is_featured) where is_featured;
create index idx_products_new_arrival    on public.products (is_new_arrival) where is_new_arrival;
create index idx_products_best_seller    on public.products (is_best_seller) where is_best_seller;
create index idx_products_name_trgm      on public.products using gin (name gin_trgm_ops);

create index idx_categories_slug         on public.categories (slug);
create index idx_categories_parent       on public.categories (parent_id);

create index idx_brands_slug             on public.brands (slug);

create index idx_product_images_product  on public.product_images (product_id);
create index idx_product_variants_prod   on public.product_variants (product_id);

create index idx_reviews_product         on public.reviews (product_id);
create index idx_reviews_status          on public.reviews (status);
create index idx_reviews_user            on public.reviews (user_id);

create index idx_cart_user               on public.cart_items (user_id);
create unique index idx_cart_unique_item on public.cart_items (
  user_id,
  product_id,
  coalesce(variant_id, '00000000-0000-0000-0000-000000000000'::uuid)
);
create index idx_wishlist_user           on public.wishlist_items (user_id);

create index idx_orders_user             on public.orders (user_id);
create index idx_orders_status           on public.orders (status);
create index idx_orders_number           on public.orders (order_number);
create index idx_orders_created          on public.orders (created_at desc);

create index idx_order_items_order       on public.order_items (order_id);

create index idx_inventory_product       on public.inventory_history (product_id);
create index idx_notifications_user       on public.notifications (user_id);

-- ======================================================================
-- Helper: slugify
-- ======================================================================
create or replace function public.slugify(raw text)
returns text language plpgsql immutable as $$
declare
  s text;
begin
  s := lower(coalesce(raw, ''));
  s := regexp_replace(s, '[^\w\s-]', '', 'g');
  s := regexp_replace(s, '\s+', '-', 'g');
  s := regexp_replace(s, '-+', '-', 'g');
  return trim(both '-' from s);
end;
$$;

-- ======================================================================
-- Trigger: updated_at on all tables
-- ======================================================================
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
declare t text;
begin
  for t in select unnest(array[
    'profiles','categories','brands','products','product_variants',
    'reviews','cart_items','addresses','coupons','orders','settings'
  ])
  loop
    execute format(
      'drop trigger if exists trg_%s_updated on public.%s;', t, t
    );
    execute format(
      'create trigger trg_%s_updated before update on public.%s
       for each row execute function public.set_updated_at();', t, t
    );
  end loop;
end$$;

-- ======================================================================
-- Trigger: auto-create profile on auth.users insert
-- ======================================================================
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, first_name, last_name, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'first_name', ''),
    coalesce(new.raw_user_meta_data->>'last_name', ''),
    coalesce(new.raw_user_meta_data->>'phone', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ======================================================================
-- Trigger: auto-slug from name (products, categories, brands)
-- ======================================================================
create or replace function public.auto_slug()
returns trigger language plpgsql as $$
begin
  if new.slug is null or new.slug = '' then
    new.slug := public.slugify(new.name);
  end if;
  return new;
end;
$$;

drop trigger if exists trg_products_slug  on public.products;
create trigger trg_products_slug  before insert or update on public.products
  for each row execute function public.auto_slug();

drop trigger if exists trg_categories_slug on public.categories;
create trigger trg_categories_slug before insert or update on public.categories
  for each row execute function public.auto_slug();

drop trigger if exists trg_brands_slug    on public.brands;
create trigger trg_brands_slug    before insert or update on public.brands
  for each row execute function public.auto_slug();

-- ======================================================================
-- Trigger: recalc product rating on review changes
-- ======================================================================
create or replace function public.update_product_rating()
returns trigger language plpgsql as $$
declare
  pid uuid;
begin
  pid := coalesce(new.product_id, old.product_id);
  update public.products p set
    average_rating = coalesce(r.avg_rating, 0),
    review_count   = coalesce(r.cnt, 0)
  from (
    select avg(rating)::numeric(3,2) avg_rating, count(*)::int cnt
    from public.reviews
    where product_id = pid and status = 'approved'
  ) r
  where p.id = pid;
  return coalesce(new, old);
end;
$$;

drop trigger if exists trg_reviews_rating on public.reviews;
create trigger trg_reviews_rating
  after insert or update or delete on public.reviews
  for each row execute function public.update_product_rating();

-- ======================================================================
-- Trigger: order number generator
-- ======================================================================
create or replace function public.generate_order_number()
returns text language sql as $$
  select 'JOE-' || to_char(now(), 'YYMMDD') || '-' ||
         upper(substr(encode(gen_random_bytes(4), 'hex'), 1, 6))
$$;

-- ======================================================================
-- ROW LEVEL SECURITY
-- ======================================================================
alter table public.profiles            enable row level security;
alter table public.roles               enable row level security;
alter table public.categories          enable row level security;
alter table public.brands              enable row level security;
alter table public.products            enable row level security;
alter table public.product_categories  enable row level security;
alter table public.product_tags        enable row level security;
alter table public.product_images      enable row level security;
alter table public.product_variants    enable row level security;
alter table public.reviews             enable row level security;
alter table public.cart_items          enable row level security;
alter table public.wishlist_items      enable row level security;
alter table public.addresses           enable row level security;
alter table public.coupons             enable row level security;
alter table public.orders              enable row level security;
alter table public.order_items         enable row level security;
alter table public.inventory_history   enable row level security;
alter table public.media               enable row level security;
alter table public.settings            enable row level security;
alter table public.notifications       enable row level security;

-- Helper: is current user staff?
create or replace function public.is_staff()
returns boolean language sql security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('super_admin','admin','manager','employee')
  )
$$;

-- Profiles
create policy "Profiles are viewable by everyone"
  on public.profiles for select using (true);
create policy "Users update own profile"
  on public.profiles for update using (auth.uid() = id);
create policy "Staff manage profiles"
  on public.profiles for all using (public.is_staff());

-- Roles
create policy "Roles are public read"
  on public.roles for select using (true);

-- Categories / Brands (public read, staff write)
create policy "Categories public read" on public.categories for select using (true);
create policy "Categories staff write" on public.categories for all using (public.is_staff());

create policy "Brands public read" on public.brands for select using (true);
create policy "Brands staff write" on public.brands for all using (public.is_staff());

-- Products (public read active only, staff full)
create policy "Products public read"
  on public.products for select using (status = 'active' or public.is_staff());
create policy "Products staff write"
  on public.products for all using (public.is_staff());

-- Product relations (public read, staff write)
create policy "Product categories read" on public.product_categories for select using (true);
create policy "Product categories staff" on public.product_categories for all using (public.is_staff());
create policy "Product tags read" on public.product_tags for select using (true);
create policy "Product tags staff" on public.product_tags for all using (public.is_staff());
create policy "Product images read" on public.product_images for select using (true);
create policy "Product images staff" on public.product_images for all using (public.is_staff());
create policy "Product variants read" on public.product_variants for select using (is_active or public.is_staff());
create policy "Product variants staff" on public.product_variants for all using (public.is_staff());

-- Reviews (public read approved; users write own; staff all)
create policy "Reviews public read"
  on public.reviews for select using (status = 'approved' or user_id = auth.uid() or public.is_staff());
create policy "Reviews user insert own"
  on public.reviews for insert with check (user_id = auth.uid());
create policy "Reviews user update own"
  on public.reviews for update using (user_id = auth.uid());
create policy "Reviews staff all"
  on public.reviews for all using (public.is_staff());

-- Cart (owner only)
create policy "Cart owner read"   on public.cart_items for select using (user_id = auth.uid());
create policy "Cart owner write"  on public.cart_items for insert with check (user_id = auth.uid());
create policy "Cart owner update" on public.cart_items for update using (user_id = auth.uid());
create policy "Cart owner delete" on public.cart_items for delete using (user_id = auth.uid());

-- Wishlist (owner only)
create policy "Wishlist owner read"   on public.wishlist_items for select using (user_id = auth.uid());
create policy "Wishlist owner write"  on public.wishlist_items for insert with check (user_id = auth.uid());
create policy "Wishlist owner delete" on public.wishlist_items for delete using (user_id = auth.uid());

-- Addresses (owner only)
create policy "Addresses owner read"   on public.addresses for select using (user_id = auth.uid());
create policy "Addresses owner write"  on public.addresses for insert with check (user_id = auth.uid());
create policy "Addresses owner update" on public.addresses for update using (user_id = auth.uid());
create policy "Addresses owner delete" on public.addresses for delete using (user_id = auth.uid());

-- Coupons (public read active, staff all)
create policy "Coupons public read" on public.coupons for select using (is_active);
create policy "Coupons staff all"   on public.coupons for all using (public.is_staff());

-- Orders (owner read own, staff all, owner create own)
create policy "Orders owner read"  on public.orders for select using (user_id = auth.uid() or public.is_staff());
create policy "Orders owner create" on public.orders for insert with check (user_id = auth.uid());
create policy "Orders staff update" on public.orders for update using (public.is_staff());

-- Order items (read via order ownership or staff)
create policy "Order items read"
  on public.order_items for select using (
    exists (select 1 from public.orders o where o.id = order_id and (o.user_id = auth.uid() or public.is_staff()))
  );
create policy "Order items staff all"
  on public.order_items for all using (public.is_staff());

-- Inventory history (staff only)
create policy "Inventory staff" on public.inventory_history for all using (public.is_staff());

-- Media (staff write, authenticated read)
create policy "Media staff read"  on public.media for select using (true);
create policy "Media staff write" on public.media for all using (public.is_staff());

-- Settings (public read, staff write)
create policy "Settings public read" on public.settings for select using (true);
create policy "Settings staff write" on public.settings for all using (public.is_staff());

-- Notifications (owner only)
create policy "Notifications owner" on public.notifications for all using (user_id = auth.uid());

-- ======================================================================
-- Storage Buckets (created via Supabase dashboard or SQL below)
-- ======================================================================
insert into storage.buckets (id, name, public)
values
  ('product-images', 'product-images', true),
  ('category-images','category-images', true),
  ('brand-logos',    'brand-logos', true),
  ('media-library',  'media-library', true),
  ('avatars',        'avatars', true)
on conflict (id) do nothing;

-- Storage policies: public read, authenticated write
drop policy if exists "Public read storage" on storage.objects;
create policy "Public read storage"
  on storage.objects for select using (bucket_id in ('product-images','category-images','brand-logos','media-library','avatars'));

drop policy if exists "Auth write storage" on storage.objects;
create policy "Auth write storage"
  on storage.objects for insert with check (
    bucket_id in ('product-images','category-images','brand-logos','media-library','avatars')
    and auth.role() = 'authenticated'
  );

drop policy if exists "Auth update storage" on storage.objects;
create policy "Auth update storage"
  on storage.objects for update using (
    bucket_id in ('product-images','category-images','brand-logos','media-library','avatars')
    and auth.role() = 'authenticated'
  );

drop policy if exists "Auth delete storage" on storage.objects;
create policy "Auth delete storage"
  on storage.objects for delete using (
    bucket_id in ('product-images','category-images','brand-logos','media-library','avatars')
    and auth.role() = 'authenticated'
  );
