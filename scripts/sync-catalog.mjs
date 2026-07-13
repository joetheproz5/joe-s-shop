import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const catalogPath = path.join(root, 'supabase', 'catalog.json')
const sqlPath = path.join(root, 'supabase', 'catalog.sql')
const seedPath = path.join(root, 'supabase', 'seed.sql')
const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'))
const args = new Set(process.argv.slice(2))

function fail(message) {
  throw new Error(message)
}

function absoluteImage(image) {
  return new URL(image.replace(/^\//, ''), `${catalog.site_url.replace(/\/$/, '')}/`).toString()
}

function assertUnique(items, key, label) {
  const values = items.map((item) => item[key])
  const duplicates = values.filter((value, index) => values.indexOf(value) !== index)
  if (duplicates.length) fail(`Duplicate ${label}: ${[...new Set(duplicates)].join(', ')}`)
}

function validateCatalog() {
  if (!catalog.site_url?.startsWith('https://')) fail('site_url must use HTTPS')
  if (!catalog.brands?.length || !catalog.categories?.length || !catalog.products?.length) {
    fail('Catalog must include brands, categories, and products')
  }

  for (const [items, label] of [
    [catalog.brands, 'brand'],
    [catalog.categories, 'category'],
    [catalog.products, 'product'],
  ]) {
    assertUnique(items, 'id', `${label} id`)
    assertUnique(items, 'slug', `${label} slug`)
  }
  assertUnique(catalog.products, 'sku', 'product SKU')

  const brandIds = new Set(catalog.brands.map((brand) => brand.id))
  const categoryIds = new Set(catalog.categories.map((category) => category.id))
  const images = new Set()

  for (const product of catalog.products) {
    if (!brandIds.has(product.brand_id)) fail(`${product.name} references an unknown brand`)
    if (!categoryIds.has(product.category_id)) fail(`${product.name} references an unknown category`)
    if (!(product.selling_price > 0)) fail(`${product.name} must have a positive price`)
    if (!Number.isInteger(product.stock_quantity) || product.stock_quantity < 0) {
      fail(`${product.name} has an invalid stock quantity`)
    }
    images.add(product.image)
  }
  for (const category of catalog.categories) images.add(category.image)

  for (const image of images) {
    const localPath = path.join(root, 'public', image.replace(/^\//, ''))
    if (!fs.existsSync(localPath)) fail(`Missing catalog image: ${localPath}`)
  }
}

function entities() {
  const brands = catalog.brands.map(({ id, name, slug, description }) => ({
    id,
    name,
    slug,
    description,
    is_active: true,
  }))

  const categories = catalog.categories.map(({ image, ...category }) => ({
    ...category,
    image_url: absoluteImage(image),
    is_active: true,
  }))

  const products = catalog.products.map((product) => ({
    id: product.id,
    name: product.name,
    slug: product.slug,
    short_description: product.short_description,
    description: product.description,
    sku: product.sku,
    brand_id: product.brand_id,
    cost_price: 0,
    selling_price: product.selling_price,
    stock_quantity: product.stock_quantity,
    low_stock_threshold: 5,
    status: 'active',
    is_featured: Boolean(product.is_featured),
    is_new_arrival: Boolean(product.is_new_arrival),
    is_best_seller: Boolean(product.is_best_seller),
    seo_title: `${product.name} | The Tech Shelf`,
    seo_description: product.short_description,
  }))

  const productCategories = catalog.products.map((product) => ({
    product_id: product.id,
    category_id: product.category_id,
  }))

  const productImages = catalog.products.map((product) => ({
    product_id: product.id,
    url: absoluteImage(product.image),
    alt_text: `${product.name} product image`,
    sort_order: 0,
    is_featured: true,
  }))

  const productTags = catalog.products.flatMap((product) => {
    const brand = catalog.brands.find((item) => item.id === product.brand_id)
    const category = catalog.categories.find((item) => item.id === product.category_id)
    return [brand.slug, category.slug].map((tag) => ({ product_id: product.id, tag }))
  })

  return { brands, categories, products, productCategories, productImages, productTags }
}

function sqlValue(value) {
  if (value === null || value === undefined) return 'null'
  if (typeof value === 'number') return String(value)
  if (typeof value === 'boolean') return value ? 'true' : 'false'
  return `'${String(value).replaceAll("'", "''")}'`
}

function insertSql(table, rows) {
  if (!rows.length) return ''
  const columns = Object.keys(rows[0])
  const values = rows
    .map((row) => `  (${columns.map((column) => sqlValue(row[column])).join(', ')})`)
    .join(',\n')
  return `insert into public.${table} (${columns.join(', ')}) values\n${values};\n`
}

function writeSql(data) {
  const sql = `-- The Tech Shelf real catalog\n-- Catalog-only reset: customer profiles, orders, order-item snapshots, coupons, and settings are preserved.\n\nbegin;\n\ndelete from public.products;\ndelete from public.categories;\ndelete from public.brands;\n\n${insertSql('brands', data.brands)}\n${insertSql('categories', data.categories)}\n${insertSql('products', data.products)}\n${insertSql('product_categories', data.productCategories)}\n${insertSql('product_images', data.productImages)}\n${insertSql('product_tags', data.productTags)}\ncommit;\n`
  fs.writeFileSync(sqlPath, sql, 'utf8')
  fs.writeFileSync(seedPath, sql, 'utf8')
  console.log(`Wrote ${path.relative(root, sqlPath)} and ${path.relative(root, seedPath)}`)
}

function loadEnv() {
  const values = { ...process.env }
  for (const filename of ['.env', '.env.local']) {
    const envPath = path.join(root, filename)
    if (!fs.existsSync(envPath)) continue
    for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
      const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/)
      if (!match || match[1].startsWith('#')) continue
      values[match[1]] = match[2].replace(/^(['"])(.*)\1$/, '$2')
    }
  }
  return values
}

async function rest(baseUrl, serviceKey, table, { method = 'GET', query = '', body } = {}) {
  const response = await fetch(`${baseUrl.replace(/\/$/, '')}/rest/v1/${table}${query}`, {
    method,
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      'Content-Type': 'application/json',
      Prefer: method === 'POST' ? 'resolution=merge-duplicates,return=minimal' : 'return=minimal',
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!response.ok) {
    const detail = await response.text()
    fail(`${method} ${table}${query} failed (${response.status}): ${detail}`)
  }
}

function inFilter(ids) {
  return `(${ids.join(',')})`
}

async function sync(data) {
  const env = loadEnv()
  const baseUrl = env.VITE_SUPABASE_URL || env.SUPABASE_URL
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY
  if (!baseUrl || !serviceKey) {
    fail('VITE_SUPABASE_URL (or SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY are required')
  }

  const productIds = data.products.map((product) => product.id)
  const categoryIds = data.categories.map((category) => category.id)
  const brandIds = data.brands.map((brand) => brand.id)

  console.log('Upserting brands, categories, and products...')
  await rest(baseUrl, serviceKey, 'brands', { method: 'POST', body: data.brands })
  await rest(baseUrl, serviceKey, 'categories', { method: 'POST', body: data.categories })
  await rest(baseUrl, serviceKey, 'products', { method: 'POST', body: data.products })

  console.log('Replacing product relationships...')
  const productFilter = `?product_id=in.${inFilter(productIds)}`
  for (const table of ['product_categories', 'product_images', 'product_tags', 'product_variants']) {
    await rest(baseUrl, serviceKey, table, { method: 'DELETE', query: productFilter })
  }
  await rest(baseUrl, serviceKey, 'product_categories', { method: 'POST', body: data.productCategories })
  await rest(baseUrl, serviceKey, 'product_images', { method: 'POST', body: data.productImages })
  await rest(baseUrl, serviceKey, 'product_tags', { method: 'POST', body: data.productTags })

  console.log('Removing products and taxonomy that are not in the manifest...')
  await rest(baseUrl, serviceKey, 'products', {
    method: 'DELETE',
    query: `?id=not.in.${inFilter(productIds)}`,
  })
  await rest(baseUrl, serviceKey, 'categories', {
    method: 'DELETE',
    query: `?id=not.in.${inFilter(categoryIds)}`,
  })
  await rest(baseUrl, serviceKey, 'brands', {
    method: 'DELETE',
    query: `?id=not.in.${inFilter(brandIds)}`,
  })

  console.log(`Synced ${data.products.length} products without modifying orders or customers.`)
}

validateCatalog()
const data = entities()

if (args.has('--write-sql')) writeSql(data)
if (args.has('--apply')) await sync(data)

if (!args.has('--write-sql') && !args.has('--apply')) {
  console.log(
    `Catalog is valid: ${data.brands.length} brands, ${data.categories.length} categories, ${data.products.length} products, and ${data.productImages.length} images.`,
  )
  console.log('Use --write-sql to regenerate supabase/catalog.sql or --apply to sync Supabase.')
}
