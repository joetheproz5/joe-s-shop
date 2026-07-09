-- ======================================================================
-- Joe's Shop — Seed Data
-- Run AFTER 001_initial_schema.sql
-- ======================================================================
-- Clear in dependency order
delete from public.order_items;
delete from public.orders;
delete from public.inventory_history;
delete from public.cart_items;
delete from public.wishlist_items;
delete from public.reviews;
delete from public.product_images;
delete from public.product_variants;
delete from public.product_tags;
delete from public.product_categories;
delete from public.products;
delete from public.coupons;
delete from public.categories;
delete from public.brands;
delete from public.settings;
delete from public.media;

-- ======================================================================
-- CATEGORIES
-- ======================================================================
insert into public.categories (id, name, slug, description, sort_order) values
  ('c0000000-0000-0000-0000-000000000001', 'Electronics', 'electronics', 'Phones, laptops, audio, and gadgets', 1),
  ('c0000000-0000-0000-0000-000000000002', 'Clothing', 'clothing', 'Fashion for everyone', 2),
  ('c0000000-0000-0000-0000-000000000003', 'Home & Kitchen', 'home-kitchen', 'Make your house a home', 3),
  ('c0000000-0000-0000-0000-000000000004', 'Sports & Fitness', 'sports-fitness', 'Gear for an active life', 4),
  ('c0000000-0000-0000-0000-000000000005', 'Books & Media', 'books-media', 'Read, watch, learn', 5);

-- Electronics subcategories
insert into public.categories (id, name, slug, parent_id, sort_order) values
  ('c1000000-0000-0000-0000-000000000001', 'Smartphones', 'smartphones', 'c0000000-0000-0000-0000-000000000001', 1),
  ('c1000000-0000-0000-0000-000000000002', 'Laptops',     'laptops',     'c0000000-0000-0000-0000-000000000001', 2),
  ('c1000000-0000-0000-0000-000000000003', 'Audio',       'audio',       'c0000000-0000-0000-0000-000000000001', 3),
  ('c1000000-0000-0000-0000-000000000004', 'Accessories', 'accessories', 'c0000000-0000-0000-0000-000000000001', 4);

-- Clothing subcategories
insert into public.categories (id, name, slug, parent_id, sort_order) values
  ('c2000000-0000-0000-0000-000000000001', 'Men',   'men',   'c0000000-0000-0000-0000-000000000002', 1),
  ('c2000000-0000-0000-0000-000000000002', 'Women', 'women', 'c0000000-0000-0000-0000-000000000002', 2),
  ('c2000000-0000-0000-0000-000000000003', 'Kids',  'kids',  'c0000000-0000-0000-0000-000000000002', 3);

-- Home & Kitchen subcategories
insert into public.categories (id, name, slug, parent_id, sort_order) values
  ('c3000000-0000-0000-0000-000000000001', 'Furniture',   'furniture',   'c0000000-0000-0000-0000-000000000003', 1),
  ('c3000000-0000-0000-0000-000000000002', 'Appliances',  'appliances',  'c0000000-0000-0000-0000-000000000003', 2),
  ('c3000000-0000-0000-0000-000000000003', 'Decor',       'decor',       'c0000000-0000-0000-0000-000000000003', 3);

-- ======================================================================
-- BRANDS
-- ======================================================================
insert into public.brands (id, name, slug, description) values
  ('b0000000-0000-0000-0000-000000000001', 'TechPro',         'techpro',         'Premium technology for professionals'),
  ('b0000000-0000-0000-0000-000000000002', 'StyleHouse',      'stylehouse',      'Modern fashion with timeless appeal'),
  ('b0000000-0000-0000-0000-000000000003', 'HomeEssentials',  'homeessentials',  'Quality goods for everyday living'),
  ('b0000000-0000-0000-0000-000000000004', 'ActiveGear',      'activegear',      'Performance equipment for athletes'),
  ('b0000000-0000-0000-0000-000000000005', 'BookWorm',        'bookworm',        'Curated books and media');

-- ======================================================================
-- PRODUCTS
-- ======================================================================
insert into public.products (id, name, slug, short_description, description, sku, brand_id, cost_price, selling_price, sale_price, stock_quantity, status, is_featured, is_new_arrival, is_best_seller, seo_title, seo_description) values
  ('p0000000-0000-0000-0000-000000000001',
   'TechPro UltraPhone 15 Pro', 'techpro-ultraphone-15-pro',
   'Flagship smartphone with titanium build and pro camera system.',
   'The TechPro UltraPhone 15 Pro features a stunning 6.7-inch OLED display, A17 Pro chip, titanium frame, and a triple-lens pro camera system with 48MP main sensor. All-day battery life and USB-C.',
   'TP-UP15P', 'b0000000-0000-0000-0000-000000000001',
   650.00, 999.00, 899.00, 120, 'active', true, true, false,
   'TechPro UltraPhone 15 Pro - Premium Smartphone',
   'Experience flagship performance with the TechPro UltraPhone 15 Pro.'),

  ('p0000000-0000-0000-0000-000000000002',
   'TechPro ProBook Air 14"', 'techpro-probook-air-14',
   'Ultralight laptop with all-day battery for professionals.',
   'The TechPro ProBook Air 14 is a featherlight 1.24kg laptop with M3 chip, 13-hour battery, 14-inch Liquid Retina display, and 16GB unified memory. Perfect for work on the go.',
   'TP-PBA14', 'b0000000-0000-0000-0000-000000000001',
   850.00, 1299.00, null, 65, 'active', true, false, true,
   'TechPro ProBook Air 14 - Lightweight Pro Laptop',
   'Ultralight 14-inch laptop engineered for productivity.'),

  ('p0000000-0000-0000-0000-000000000003',
   'TechPro SoundMax Pro Headphones', 'techpro-soundmax-pro-headphones',
   'Wireless noise-cancelling over-ear headphones with 40h battery.',
   'TechPro SoundMax Pro delivers studio-grade audio with adaptive active noise cancellation. 40-hour battery life, plush memory foam earcups, multipoint Bluetooth 5.3, and USB-C fast charging.',
   'TP-SMPH', 'b0000000-0000-0000-0000-000000000001',
   180.00, 349.00, 299.00, 200, 'active', false, false, false,
   'TechPro SoundMax Pro Headphones - ANC Wireless',
   'Immersive wireless audio with adaptive noise cancellation.'),

  ('p0000000-0000-0000-0000-000000000004',
   'StyleHouse Classic Denim Jacket', 'stylehouse-classic-denim-jacket',
   'Timeless cotton denim jacket that pairs with everything.',
   'The StyleHouse Classic Denim Jacket is cut from 100% organic cotton denim with a relaxed fit, antique brass buttons, and a washed finish that gets better with age.',
   'SH-CDJ', 'b0000000-0000-0000-0000-000000000002',
   45.00, 129.00, null, 85, 'active', false, false, false,
   'StyleHouse Classic Denim Jacket - Organic Cotton',
   'A wardrobe staple in organic cotton denim.'),

  ('p0000000-0000-0000-0000-000000000005',
   'StyleHouse Summer Maxi Dress', 'stylehouse-summer-maxi-dress',
   'Flowy maxi dress in breathable linen-blend for warm days.',
   'The StyleHouse Summer Maxi Dress features a flattering A-line silhouette in a soft linen-rayon blend. Adjustable straps, side pockets, and a knee-high slit for easy movement.',
   'SH-SMD', 'b0000000-0000-0000-0000-000000000002',
   32.00, 89.00, null, 60, 'active', true, true, false,
   'StyleHouse Summer Maxi Dress - Linen Blend',
   'Effortless summer style in a breathable linen blend.'),

  ('p0000000-0000-0000-0000-000000000006',
   'StyleHouse Kids Adventure Set', 'stylehouse-kids-adventure-set',
   'Play-ready 3-piece set: tee, shorts, and bucket hat.',
   'The StyleHouse Kids Adventure Set includes a soft cotton tee, elastic-waist shorts, and a matching bucket hat. Durable seams, kid-friendly fit, and easy-care fabric.',
   'SH-KAS', 'b0000000-0000-0000-0000-000000000002',
   18.00, 49.00, null, 110, 'active', false, false, false,
   'StyleHouse Kids Adventure Set - 3 Piece',
   'Three-piece play set built for adventure.'),

  ('p0000000-0000-0000-0000-000000000007',
   'HomeEssentials Modern Sofa Set', 'homeessentials-modern-sofa-set',
   '3-seat modular sofa with stain-resistant performance fabric.',
   'The HomeEssentials Modern Sofa Set is a 3-seat modular sofa upholstered in stain-resistant performance fabric with solid pine frame, high-density foam cushions, and tapered oak legs. Seats 4 comfortably.',
   'HE-MSS', 'b0000000-0000-0000-0000-000000000003',
   1400.00, 2499.00, null, 12, 'active', true, false, false,
   'HomeEssentials Modern Sofa Set - Modular 3-Seat',
   'Modular comfort in stain-resistant performance fabric.'),

  ('p0000000-0000-0000-0000-000000000008',
   'HomeEssentials Smart Coffee Maker', 'homeessentials-smart-coffee-maker',
   'App-controlled 12-cup coffee maker with programmable timer.',
   'The HomeEssentials Smart Coffee Maker brews 12 cups and connects to your phone for scheduling, strength control, and maintenance alerts. Removable water reservoir and auto shut-off.',
   'HE-SCM', 'b0000000-0000-0000-0000-000000000003',
   90.00, 199.00, null, 75, 'active', false, false, true,
   'HomeEssentials Smart Coffee Maker - 12 Cup',
   'Brew on schedule with a Wi-Fi-connected coffee maker.'),

  ('p0000000-0000-0000-0000-000000000009',
   'HomeEssentials Ceramic Vase Collection', 'homeessentials-ceramic-vase-collection',
   'Set of 3 hand-glazed ceramic vases in gradient tones.',
   'The HomeEssentials Ceramic Vase Collection is a set of three hand-glazed stoneware vases in small, medium, and large. Subtle gradient finish makes each piece unique.',
   'HE-CVC', 'b0000000-0000-0000-0000-000000000003',
   28.00, 79.00, null, 95, 'active', false, false, false,
   'HomeEssentials Ceramic Vase Collection - Set of 3',
   'Hand-glazed stoneware vases in a gradient finish.'),

  ('p0000000-0000-0000-0000-000000000010',
   'ActiveGear Pro Yoga Mat', 'activegear-pro-yoga-mat',
   '6mm cushioned yoga mat with non-slip natural rubber base.',
   'The ActiveGear Pro Yoga Mat offers 6mm of cushioning with a grippy natural rubber base and sweat-resistant polyurethane top. Alignment lines and carry strap included.',
   'AG-PYM', 'b0000000-0000-0000-0000-000000000004',
   22.00, 59.00, null, 150, 'active', false, false, true,
   'ActiveGear Pro Yoga Mat - 6mm Cushioned',
   'Cushioned non-slip yoga mat for studio and home.'),

  ('p0000000-0000-0000-0000-000000000011',
   'ActiveGear Resistance Band Set', 'activegear-resistance-band-set',
   '5-piece graduated resistance bands with door anchor and guide.',
   'The ActiveGear Resistance Band Set includes five latex bands from 10lb to 50lb resistance, foam handles, door anchor, ankle straps, and a printed workout guide.',
   'AG-RBS', 'b0000000-0000-0000-0000-000000000004',
   14.00, 39.00, null, 220, 'active', false, true, false,
   'ActiveGear Resistance Band Set - 5 Piece',
   'Full-body resistance training anywhere.'),

  ('p0000000-0000-0000-0000-000000000012',
   'BookWorm "The Art of Code" Hardcover', 'bookworm-the-art-of-code-hardcover',
   'Bestselling guide to writing elegant, maintainable software.',
   'The Art of Code by Jane Doe is a 384-page hardcover exploring principles of clean architecture, naming, refactoring, and the craft of programming. Foreword by a leading CTO.',
   'BW-AOC', 'b0000000-0000-0000-0000-000000000005',
   12.00, 34.99, null, 300, 'active', false, false, false,
   'The Art of Code Hardcover - BookWorm',
   'A modern classic on the craft of software.');

-- ======================================================================
-- PRODUCT-CATEGORY LINKS
-- ======================================================================
insert into public.product_categories (product_id, category_id) values
  ('p0000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001'), -- phone -> smartphones
  ('p0000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000002'), -- laptop -> laptops
  ('p0000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000003'), -- headphones -> audio
  ('p0000000-0000-0000-0000-000000000004', 'c2000000-0000-0000-0000-000000000001'), -- denim -> men
  ('p0000000-0000-0000-0000-000000000005', 'c2000000-0000-0000-0000-000000000002'), -- dress -> women
  ('p0000000-0000-0000-0000-000000000006', 'c2000000-0000-0000-0000-000000000003'), -- kids set -> kids
  ('p0000000-0000-0000-0000-000000000007', 'c3000000-0000-0000-0000-000000000001'), -- sofa -> furniture
  ('p0000000-0000-0000-0000-000000000008', 'c3000000-0000-0000-0000-000000000002'), -- coffee -> appliances
  ('p0000000-0000-0000-0000-000000000009', 'c3000000-0000-0000-0000-000000000003'), -- vase -> decor
  ('p0000000-0000-0000-0000-000000000010', 'c0000000-0000-0000-0000-000000000004'), -- yoga -> sports
  ('p0000000-0000-0000-0000-000000000011', 'c0000000-0000-0000-0000-000000000004'), -- bands -> sports
  ('p0000000-0000-0000-0000-000000000012', 'c0000000-0000-0000-0000-000000000005'); -- book -> books

-- ======================================================================
-- PRODUCT TAGS
-- ======================================================================
insert into public.product_tags (product_id, tag) values
  ('p0000000-0000-0000-0000-000000000001', 'flagship'), ('p0000000-0000-0000-0000-000000000001', '5g'), ('p0000000-0000-0000-0000-000000000001', 'titanium'),
  ('p0000000-0000-0000-0000-000000000002', 'laptop'), ('p0000000-0000-0000-0000-000000000002', 'lightweight'), ('p0000000-0000-0000-0000-000000000002', 'pro'),
  ('p0000000-0000-0000-0000-000000000003', 'audio'), ('p0000000-0000-0000-0000-000000000003', 'wireless'), ('p0000000-0000-0000-0000-000000000003', 'anc'),
  ('p0000000-0000-0000-0000-000000000004', 'denim'), ('p0000000-0000-0000-0000-000000000004', 'jacket'), ('p0000000-0000-0000-0000-000000000004', 'cotton'),
  ('p0000000-0000-0000-0000-000000000005', 'dress'), ('p0000000-0000-0000-0000-000000000005', 'linen'), ('p0000000-0000-0000-0000-000000000005', 'summer'),
  ('p0000000-0000-0000-0000-000000000010', 'yoga'), ('p0000000-0000-0000-0000-000000000010', 'fitness'), ('p0000000-0000-0000-0000-000000000010', 'eco');

-- ======================================================================
-- PRODUCT IMAGES (using SVG placeholder generator service)
-- ======================================================================
insert into public.product_images (product_id, url, alt_text, sort_order, is_featured) values
  ('p0000000-0000-0000-0000-000000000001', 'https://placehold.co/800x800/1e3a8a/white?text=UltraPhone+15+Pro', 'UltraPhone 15 Pro front', 0, true),
  ('p0000000-0000-0000-0000-000000000001', 'https://placehold.co/800x800/1e3a8a/white?text=UltraPhone+15+Pro+Back', 'UltraPhone 15 Pro back', 1, false),
  ('p0000000-0000-0000-0000-000000000002', 'https://placehold.co/800x800/0f172a/white?text=ProBook+Air+14', 'ProBook Air 14', 0, true),
  ('p0000000-0000-0000-0000-000000000002', 'https://placehold.co/800x800/0f172a/white?text=ProBook+Air+14+Side', 'ProBook Air 14 side', 1, false),
  ('p0000000-0000-0000-0000-000000000003', 'https://placehold.co/800x800/5c7cfa/white?text=SoundMax+Pro', 'SoundMax Pro headphones', 0, true),
  ('p0000000-0000-0000-0000-000000000003', 'https://placehold.co/800x800/5c7cfa/white?text=SoundMax+Pro+Box', 'SoundMax Pro in case', 1, false),
  ('p0000000-0000-0000-0000-000000000004', 'https://placehold.co/800x800/3b5bdb/white?text=Denim+Jacket', 'Classic denim jacket', 0, true),
  ('p0000000-0000-0000-0000-000000000005', 'https://placehold.co/800x800/f59f00/white?text=Summer+Maxi+Dress', 'Summer maxi dress', 0, true),
  ('p0000000-0000-0000-0000-000000000006', 'https://placehold.co/800x800/20c997/white?text=Kids+Adventure+Set', 'Kids adventure set', 0, true),
  ('p0000000-0000-0000-0000-000000000007', 'https://placehold.co/800x800/495057/white?text=Modern+Sofa+Set', 'Modern sofa set', 0, true),
  ('p0000000-0000-0000-0000-000000000008', 'https://placehold.co/800x800/868e96/white?text=Smart+Coffee+Maker', 'Smart coffee maker', 0, true),
  ('p0000000-0000-0000-0000-000000000009', 'https://placehold.co/800x800/ccb5b5/white?text=Ceramic+Vase+Set', 'Ceramic vase set', 0, true),
  ('p0000000-0000-0000-0000-000000000010', 'https://placehold.co/800x800/12b886/white?text=Pro+Yoga+Mat', 'Pro yoga mat', 0, true),
  ('p0000000-0000-0000-0000-000000000011', 'https://placehold.co/800x800/099268/white?text=Resistance+Bands', 'Resistance band set', 0, true),
  ('p0000000-0000-0000-0000-000000000012', 'https://placehold.co/800x800/7048e8/white?text=The+Art+of+Code', 'The Art of Code', 0, true);

-- ======================================================================
-- PRODUCT VARIANTS
-- ======================================================================
-- UltraPhone 15 Pro colors
insert into public.product_variants (product_id, sku, price, sale_price, cost_price, stock_quantity, color) values
  ('p0000000-0000-0000-0000-000000000001', 'TP-UP15P-BLK', 999.00, 899.00, 650.00, 45, 'Black'),
  ('p0000000-0000-0000-0000-000000000001', 'TP-UP15P-WHT', 999.00, 899.00, 650.00, 40, 'White'),
  ('p0000000-0000-0000-0000-000000000001', 'TP-UP15P-NVY', 999.00, 899.00, 650.00, 35, 'Navy');

-- ProBook Air 14
insert into public.product_variants (product_id, sku, price, cost_price, stock_quantity, color) values
  ('p0000000-0000-0000-0000-000000000002', 'TP-PBA14-GRY', 1299.00, 850.00, 35, 'Gray'),
  ('p0000000-0000-0000-0000-000000000002', 'TP-PBA14-SLV', 1299.00, 850.00, 30, 'Silver');

-- Denim Jacket sizes
insert into public.product_variants (product_id, sku, price, cost_price, stock_quantity, size) values
  ('p0000000-0000-0000-0000-000000000004', 'SH-CDJ-S', 129.00, 45.00, 20, 'S'),
  ('p0000000-0000-0000-0000-000000000004', 'SH-CDJ-M', 129.00, 45.00, 25, 'M'),
  ('p0000000-0000-0000-0000-000000000004', 'SH-CDJ-L', 129.00, 45.00, 25, 'L'),
  ('p0000000-0000-0000-0000-000000000004', 'SH-CDJ-XL', 129.00, 45.00, 15, 'XL');

-- Summer Maxi Dress
insert into public.product_variants (product_id, sku, price, cost_price, stock_quantity, size, color) values
  ('p0000000-0000-0000-0000-000000000005', 'SH-SMD-S-BLK', 89.00, 32.00, 15, 'S', 'Black'),
  ('p0000000-0000-0000-0000-000000000005', 'SH-SMD-M-BLK', 89.00, 32.00, 20, 'M', 'Black'),
  ('p0000000-0000-0000-0000-000000000005', 'SH-SMD-L-RED', 89.00, 32.00, 15, 'L', 'Red'),
  ('p0000000-0000-0000-0000-000000000005', 'SH-SMD-M-RED', 89.00, 32.00, 10, 'M', 'Red');

-- ======================================================================
-- COUPONS
-- ======================================================================
insert into public.coupons (code, type, value, min_purchase, max_uses, expires_at, is_active) values
  ('WELCOME10', 'percentage',   10.00, 50.00,  1000, now() + interval '90 days', true),
  ('FLAT25',    'fixed',        25.00, 150.00, 500,  now() + interval '60 days', true),
  ('FREESHIP',  'free_shipping', 0.00, 75.00,  null, now() + interval '120 days', true);

-- ======================================================================
-- REVIEWS (status approved so they are publicly visible)
-- NOTE: uses a placeholder profile id — replace with a real auth user id
--       in production, or run after creating your first customer.
-- ======================================================================
-- For seed purposes we create a synthetic profile row so the FK holds.
insert into public.profiles (id, first_name, last_name, role) values
  ('d0000000-0000-0000-0000-000000000001', 'Alex',  'Reviewer', 'customer'),
  ('d0000000-0000-0000-0000-000000000002', 'Sam',   'Shopper',  'customer'),
  ('d0000000-0000-0000-0000-000000000003', 'Jordan','Buyer',    'customer'),
  ('d0000000-0000-0000-0000-000000000004', 'Taylor','Fan',      'customer')
on conflict (id) do nothing;

insert into public.reviews (product_id, user_id, rating, title, comment, status) values
  ('p0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 5,
   'Best phone I have owned',
   'Camera is incredible and battery lasts all day. The titanium frame feels premium.',
   'approved'),
  ('p0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000002', 5,
   'Perfect travel laptop',
   'So light I forget it is in my bag. Performance is snappy for development work.',
   'approved'),
  ('p0000000-0000-0000-0000-000000000005', 'd0000000-0000-0000-0000-000000000003', 4,
   'Lovely summer dress',
   'Fabric is breathable and the fit is true to size. Wish it came in more colors.',
   'approved'),
  ('p0000000-0000-0000-0000-000000000008', 'd0000000-0000-0000-0000-000000000004', 5,
   'Coffee ready when I wake up',
   'Scheduling from my phone is a game changer. Brews a great pot fast.',
   'approved');

-- Recompute product ratings
update public.products p set
  average_rating = r.avg_rating,
  review_count   = r.cnt
from (
  select product_id, avg(rating)::numeric(3,2) avg_rating, count(*)::int cnt
  from public.reviews where status = 'approved'
  group by product_id
) r
where r.product_id = p.id;

-- ======================================================================
-- SETTINGS
-- ======================================================================
insert into public.settings (key, value, type) values
  ('site_name',               'Joe''s Shop',                          'string'),
  ('site_tagline',            'Premium Products for Modern Living',   'string'),
  ('site_description',        'Discover premium products curated for modern living. Quality you can trust, delivered fast.', 'string'),
  ('contact_email',           'hello@joes-shop.com',                  'string'),
  ('contact_phone',           '+1 (555) 123-4567',                    'string'),
  ('contact_address',         '123 Main Street, New York, NY 10001',  'string'),
  ('currency',                'USD',                                  'string'),
  ('currency_symbol',         '$',                                    'string'),
  ('tax_rate',                '0.10',                                 'number'),
  ('free_shipping_threshold', '100',                                  'number'),
  ('standard_shipping_rate',  '9.99',                                 'number'),
  ('social_facebook',         'https://facebook.com/joesshop',        'string'),
  ('social_twitter',          'https://twitter.com/joesshop',         'string'),
  ('social_instagram',        'https://instagram.com/joesshop',       'string'),
  ('social_youtube',          'https://youtube.com/@joesshop',        'string'),
  ('hero_title',              'Premium Products for Modern Living',   'string'),
  ('hero_subtitle',           'Shop handpicked essentials from the world''s best brands. Fast shipping, easy returns.', 'string'),
  ('hero_cta_text',           'Shop Now',                             'string'),
  ('hero_cta_link',           '/shop',                                'string'),
  ('newsletter_enabled',      'true',                                 'boolean'),
  ('announcement_bar',        'Free shipping on orders over $100',    'string'),
  ('footer_about',            'Joe''s Shop brings you premium products curated for modern living.', 'string');
