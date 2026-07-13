# The Tech Shelf

Modern React + Supabase e-commerce storefront with a protected admin dashboard for catalog, orders, customers, marketing, reviews, analytics, inventory, media, settings, and roles.

## Stack

- React 18, Vite, TypeScript
- Tailwind CSS, Framer Motion, lucide-react
- React Router, TanStack Query, Zustand
- Supabase Auth, PostgreSQL, Storage, Row Level Security
- Recharts for admin analytics
- Supabase Edge Functions for webhooks and admin alert summaries

## Quick Start

```bash
npm install
cp .env.example .env
npm run dev
```

Set these client values in `.env`:

```bash
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

## Supabase Setup

1. Create a Supabase project.
2. Run `supabase/migrations/001_initial_schema.sql` in the SQL editor or through the Supabase CLI.
3. Run `supabase/seed.sql` for demo categories, brands, products, coupons, settings, and sample content.
4. Create an admin user through Supabase Auth, then update its profile role:

```sql
update public.profiles
set role = 'super_admin'
where id = '<auth-user-id>';
```

5. Confirm Storage buckets exist: `product-images`, `category-images`, `brand-logos`, `media-library`, `avatars`.

## Edge Functions

Functions live in `supabase/functions`.

- `order-webhook`: accepts provider callbacks to update order and payment status.
- `admin-alerts`: returns low-stock products, open orders, and pending reviews for authenticated staff.
- `order-email`: sends order confirmations and status/payment updates to customers through Resend.

Set function secrets:

```bash
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=...
supabase secrets set ORDER_WEBHOOK_SECRET=...
supabase secrets set RESEND_API_KEY=...
supabase secrets set ORDER_EMAIL_FROM="The Tech Shelf <orders@your-verified-domain.com>"
supabase secrets set SITE_URL="https://joetheproz5.github.io/joe-s-shop"
```

Deploy:

```bash
supabase functions deploy order-webhook
supabase functions deploy admin-alerts
supabase functions deploy order-email --no-verify-jwt
```

Example webhook call:

```bash
curl -X POST "$SUPABASE_URL/functions/v1/order-webhook" \
  -H "Content-Type: application/json" \
  -H "x-webhook-secret: $ORDER_WEBHOOK_SECRET" \
  -d '{"order_number":"TTS-260709-ABC123","status":"paid","payment_status":"paid","provider":"demo"}'
```

## Admin Modules

- Dashboard: revenue, orders, customers, products, charts, recent orders, low stock.
- Products: create/edit, hide, archive, restore, duplicate, bulk status, CSV import/export, multi-image upload.
- Categories: parent categories, ordering, images, visibility.
- Brands: logos, descriptions, visibility.
- Orders: search, status/payment updates, internal notes, invoice print action.
- Customers: role management, ban flag, purchase history metrics, lifetime value.
- Coupons: percentage, fixed, free shipping, date windows, usage limits.
- Reviews: approve, reject, reply, delete.
- Analytics: revenue/orders chart, inventory health, top products/customers.
- Inventory: low stock, out of stock, stock adjustments, history inserts.
- Media: upload/list/delete assets by folder.
- Settings: no-code editing for store identity, contact, footer, shipping, tax, and payment copy.
- Roles: permission matrix for super admin, admin, manager, employee, and customer.

## Production Build

```bash
npm run build
npm run preview
```

The build output is written to `dist/`.

## Deployment Checklist

- Configure `.env` in the hosting provider with only `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
- Keep `SUPABASE_SERVICE_ROLE_KEY` only in Supabase Edge Function secrets.
- Enable Supabase email templates and redirect URLs for login/reset flows.
- Apply the SQL migration before deploying the frontend.
- Seed only non-sensitive demo data in production, or replace it with real catalog data.
- Deploy Edge Functions and set `ORDER_WEBHOOK_SECRET`.
- Create the first `super_admin` profile.
- Verify RLS policies by testing customer and staff accounts separately.
- Run `npm run build` before every release.

## Project Structure

```text
src/
  components/      Shared UI, layout, storefront cards, route guards
  context/         Auth and theme providers
  hooks/           Query hooks for products, categories, brands, orders, settings
  lib/             Supabase client, constants, utilities, API modules
  pages/           Storefront, account, and admin routes
  stores/          Zustand cart, wishlist, UI state
  styles/          Tailwind layers and app-level component classes
  types/           Domain types shared across app and admin
supabase/
  migrations/      Database schema, RLS, triggers, storage buckets
  functions/       Edge Functions for secure server-side workflows
  seed.sql         Demo data
```
