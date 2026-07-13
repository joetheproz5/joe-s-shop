import { Link } from 'react-router-dom'
import { ArrowRight, BookOpen, Dumbbell, Home, Shirt, Smartphone, Sparkles } from 'lucide-react'
import { useCategories } from '@/hooks/useCategories'

const defaultCategories = [
  { id: 'electronics', name: 'Electronics', product_count: 3, parent_id: null, href: '/shop?search=TechPro' },
  { id: 'style', name: 'Clothing', product_count: 3, parent_id: null, href: '/shop?search=StyleHouse' },
  { id: 'home', name: 'Home & Garden', product_count: 3, parent_id: null, href: '/shop?search=HomeEssentials' },
  { id: 'fitness', name: 'Sports & Fitness', product_count: 2, parent_id: null, href: '/shop?search=ActiveGear' },
  { id: 'books', name: 'Books & Media', product_count: 1, parent_id: null, href: '/shop?search=BookWorm' },
]

const categoryIcon = (name: string) => {
  const value = name.toLowerCase()
  if (value.includes('elect')) return Smartphone
  if (value.includes('cloth') || value.includes('fashion')) return Shirt
  if (value.includes('home') || value.includes('garden')) return Home
  if (value.includes('sport') || value.includes('fitness')) return Dumbbell
  if (value.includes('book') || value.includes('media')) return BookOpen
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
