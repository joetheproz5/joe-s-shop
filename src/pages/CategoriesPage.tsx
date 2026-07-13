import { Link } from 'react-router-dom'
import { ArrowRight, Cable, Headphones, Laptop, Smartphone, Sparkles, Watch } from 'lucide-react'
import { useCategories } from '@/hooks/useCategories'

const defaultCategories = [
  { id: 'smartphones', name: 'Smartphones', product_count: 0, parent_id: null, href: '/shop?search=smartphones' },
  { id: 'laptops', name: 'Laptops', product_count: 0, parent_id: null, href: '/shop?search=laptops' },
  { id: 'audio', name: 'Audio', product_count: 0, parent_id: null, href: '/shop?search=audio' },
  { id: 'smartwatches', name: 'Smartwatches', product_count: 0, parent_id: null, href: '/shop?search=smartwatches' },
  { id: 'charging', name: 'Charging & Cables', product_count: 0, parent_id: null, href: '/shop?search=charging+cables' },
]

const categoryIcon = (name: string) => {
  const value = name.toLowerCase()
  if (value.includes('phone') || value.includes('elect')) return Smartphone
  if (value.includes('laptop') || value.includes('computer')) return Laptop
  if (value.includes('audio') || value.includes('headphone')) return Headphones
  if (value.includes('watch') || value.includes('wearable')) return Watch
  if (value.includes('charg') || value.includes('cable')) return Cable
  return Sparkles
}

export default function CategoriesPage() {
  const { data: categories } = useCategories()
  const loadedRoots = (categories || []).filter((category) => !category.parent_id)
  const roots = loadedRoots.length > 0 ? loadedRoots : defaultCategories

  return (
    <main className="min-h-screen bg-white dark:bg-surface-950">
      <section className="border-b border-[#e0e4e8] bg-[#f6f8fb] dark:border-surface-800 dark:bg-surface-900/50">
        <div className="section-container py-12 sm:py-16">
          <p className="text-sm font-semibold text-[#0b57d0] dark:text-blue-400">Departments</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-normal sm:text-5xl">Browse every category</h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-surface-500 dark:text-surface-400">
            Find the right department and get straight to the products you need.
          </p>
        </div>
      </section>

      <section className="section-container py-12 sm:py-16">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {roots.map((category) => {
              const Icon = categoryIcon(category.name)
              const children = (categories || []).filter((item) => item.parent_id === category.id)
              return (
                <article key={category.id} className="rounded-lg border border-[#e0e4e8] bg-white p-6 transition-shadow hover:shadow-md dark:border-surface-800 dark:bg-surface-900">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#eaf2ff] text-[#0b57d0] dark:bg-blue-950/40 dark:text-blue-300">
                    <Icon size={23} />
                  </div>
                  <h2 className="mt-5 text-xl font-semibold">{category.name}</h2>
                  <p className="mt-2 text-sm text-surface-500 dark:text-surface-400">{category.product_count || 0} products</p>
                  {children.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {children.slice(0, 4).map((child) => (
                        <Link key={child.id} to={`/shop?category_id=${child.id}`} className="rounded-full bg-surface-100 px-3 py-1.5 text-xs font-medium text-surface-600 hover:bg-[#eaf2ff] hover:text-[#0b57d0] dark:bg-surface-800 dark:text-surface-300">
                          {child.name}
                        </Link>
                      ))}
                    </div>
                  )}
                  <Link to={'href' in category ? category.href : `/shop?category_id=${category.id}`} className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#0b57d0] hover:text-[#0842a0] dark:text-blue-400">
                    Shop {category.name} <ArrowRight size={16} />
                  </Link>
                </article>
              )
            })}
        </div>
      </section>
    </main>
  )
}
