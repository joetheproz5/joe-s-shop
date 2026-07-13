import type { Product } from '@/types'

const FALLBACK_IMAGES: Record<string, string> = {
  'techpro-ultraphone-15-pro': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1200&q=88',
  'techpro-probook-air-14': 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1200&q=88',
  'techpro-soundmax-pro-headphones': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=88',
  'stylehouse-classic-denim-jacket': 'https://images.unsplash.com/photo-1551537482-f2075a1d41f2?auto=format&fit=crop&w=1200&q=88',
  'stylehouse-summer-maxi-dress': 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=1200&q=88',
  'stylehouse-kids-adventure-set': 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=1200&q=88',
  'homeessentials-modern-sofa-set': 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=88',
  'homeessentials-smart-coffee-maker': 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?auto=format&fit=crop&w=1200&q=88',
  'homeessentials-ceramic-vase-collection': 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1200&q=88',
  'activegear-pro-yoga-mat': 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?auto=format&fit=crop&w=1200&q=88',
  'activegear-resistance-band-set': 'https://images.unsplash.com/photo-1598289431512-b97b0917affc?auto=format&fit=crop&w=1200&q=88',
  'bookworm-the-art-of-code-hardcover': 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=1200&q=88',
}

const INVALID_IMAGE_PATHS = [
  '/a0000000-0000-0000-0000-000000000002/1783803068204-0.jpg',
]

function isPlaceholder(url?: string) {
  return !url
    || url.includes('placehold.co')
    || url.includes('placeholder.com')
    || INVALID_IMAGE_PATHS.some((path) => url.includes(path))
}

export function getProductImage(product: Pick<Product, 'slug' | 'images'>, index = 0) {
  const images = product.images || []
  const selected = index === 0
    ? images.find((image) => image.is_featured) || images[0]
    : images[index]

  if (!isPlaceholder(selected?.url)) return selected!.url
  return FALLBACK_IMAGES[product.slug] || selected?.url || ''
}
