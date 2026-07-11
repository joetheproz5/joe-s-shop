import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import MobileMenu from '@/components/layout/MobileMenu'
import { QuickViewModal } from '@/components/shop/QuickViewModal'
import { useUIStore } from '@/stores/uiStore'
import { useAuth } from '@/context/AuthContext'
import { hasAdminPermission, STAFF_ROLES, type AdminModule } from '@/lib/permissions'

// Lazy-loaded pages
import { lazy, Suspense } from 'react'

const HomePage = lazy(() => import('@/pages/HomePage'))
const ShopPage = lazy(() => import('@/pages/ShopPage'))
const ProductPage = lazy(() => import('@/pages/ProductPage'))
const CartPage = lazy(() => import('@/pages/CartPage'))
const CheckoutPage = lazy(() => import('@/pages/CheckoutPage'))
const LoginPage = lazy(() => import('@/pages/LoginPage'))
const RegisterPage = lazy(() => import('@/pages/RegisterPage'))
const ForgotPasswordPage = lazy(() => import('@/pages/ForgotPasswordPage'))
const AboutPage = lazy(() => import('@/pages/AboutPage'))
const AccountLayout = lazy(() => import('@/pages/account/AccountLayout'))
const ProfilePage = lazy(() => import('@/pages/account/ProfilePage'))
const OrdersPage = lazy(() => import('@/pages/account/OrdersPage'))
const OrderDetailPage = lazy(() => import('@/pages/account/OrderDetailPage'))
const WishlistPage = lazy(() => import('@/pages/account/WishlistPage'))
const AddressesPage = lazy(() => import('@/pages/account/AddressesPage'))
const AdminLayout = lazy(() => import('@/components/layout/AdminLayout'))
const AdminDashboard = lazy(() => import('@/pages/admin/DashboardPage'))
const AdminProductsPage = lazy(() => import('@/pages/admin/ProductsPage'))
const AdminCategoriesPage = lazy(() => import('@/pages/admin/CategoriesPage'))
const AdminBrandsPage = lazy(() => import('@/pages/admin/BrandsPage'))
const AdminOrdersPage = lazy(() => import('@/pages/admin/AdminPhaseSix').then((m) => ({ default: m.OrdersPage })))
const AdminCustomersPage = lazy(() => import('@/pages/admin/AdminPhaseSix').then((m) => ({ default: m.CustomersPage })))
const AdminCouponsPage = lazy(() => import('@/pages/admin/AdminPhaseSix').then((m) => ({ default: m.CouponsPage })))
const AdminReviewsPage = lazy(() => import('@/pages/admin/AdminPhaseSix').then((m) => ({ default: m.ReviewsPage })))
const AdminAnalyticsPage = lazy(() => import('@/pages/admin/AdminPhaseSix').then((m) => ({ default: m.AnalyticsPage })))
const AdminInventoryPage = lazy(() => import('@/pages/admin/AdminPhaseSix').then((m) => ({ default: m.InventoryPage })))
const AdminMediaPage = lazy(() => import('@/pages/admin/AdminPhaseSix').then((m) => ({ default: m.MediaPage })))
const AdminSettingsPage = lazy(() => import('@/pages/admin/AdminPhaseSix').then((m) => ({ default: m.SettingsPage })))
const AdminRolesPage = lazy(() => import('@/pages/admin/AdminPhaseSix').then((m) => ({ default: m.RolesPage })))

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full" />
  </div>
)

function StorefrontLayout() {
  return (
    <>
      <Header />
      <MobileMenu />
      <main className="min-h-screen">
        <Suspense fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
      <QuickViewModal />
    </>
  )
}

function AdminModuleGuard({ module, children }: { module: AdminModule; children: React.ReactNode }) {
  const { profile } = useAuth()
  return hasAdminPermission(profile?.role, module) ? <>{children}</> : <Navigate to="/admin/dashboard" replace />
}

export default function App() {
  const mobileMenuOpen = useUIStore((s) => s.mobileMenuOpen)

  return (
    <ErrorBoundary>
      {/* Lock body scroll when mobile menu is open */}
      {mobileMenuOpen && (
        <style>{`body { overflow: hidden; }`}</style>
      )}

      <Routes>
        {/* ===== Storefront ===== */}
        <Route element={<StorefrontLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/product/:slug" element={<ProductPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/terms" element={<PlaceholderPage title="Terms of Service" />} />
          <Route path="/privacy" element={<PlaceholderPage title="Privacy Policy" />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<PlaceholderPage title="Contact Us" />} />
        </Route>

        {/* ===== Account (requires auth) ===== */}
        <Route element={
          <ProtectedRoute>
            <div className="min-h-screen">
              <Header />
              <MobileMenu />
              <main>
                <Suspense fallback={<PageLoader />}>
                  <Outlet />
                </Suspense>
              </main>
              <Footer />
            </div>
          </ProtectedRoute>
        }>
          <Route path="/account" element={<AccountLayout />}>
            <Route index element={<ProfilePage />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="orders/:id" element={<OrderDetailPage />} />
            <Route path="wishlist" element={<WishlistPage />} />
            <Route path="addresses" element={<AddressesPage />} />
          </Route>
        </Route>

        {/* ===== Staff dashboard (module access is role-based) ===== */}
        <Route element={
          <ProtectedRoute allowedRoles={STAFF_ROLES}>
            <Suspense fallback={<PageLoader />}>
              <AdminLayout />
            </Suspense>
          </ProtectedRoute>
        }>
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/dashboard" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/admin/dashboard" element={<AdminModuleGuard module="dashboard"><AdminDashboard /></AdminModuleGuard>} />
          <Route path="/admin/products" element={<AdminModuleGuard module="products"><AdminProductsPage /></AdminModuleGuard>} />
          <Route path="/admin/categories" element={<AdminModuleGuard module="categories"><AdminCategoriesPage /></AdminModuleGuard>} />
          <Route path="/admin/brands" element={<AdminModuleGuard module="brands"><AdminBrandsPage /></AdminModuleGuard>} />
          <Route path="/admin/orders" element={<AdminModuleGuard module="orders"><AdminOrdersPage /></AdminModuleGuard>} />
          <Route path="/admin/customers" element={<AdminModuleGuard module="customers"><AdminCustomersPage /></AdminModuleGuard>} />
          <Route path="/admin/coupons" element={<AdminModuleGuard module="coupons"><AdminCouponsPage /></AdminModuleGuard>} />
          <Route path="/admin/reviews" element={<AdminModuleGuard module="reviews"><AdminReviewsPage /></AdminModuleGuard>} />
          <Route path="/admin/analytics" element={<AdminModuleGuard module="analytics"><AdminAnalyticsPage /></AdminModuleGuard>} />
          <Route path="/admin/inventory" element={<AdminModuleGuard module="inventory"><AdminInventoryPage /></AdminModuleGuard>} />
          <Route path="/admin/media" element={<AdminModuleGuard module="media"><AdminMediaPage /></AdminModuleGuard>} />
          <Route path="/admin/settings" element={<AdminModuleGuard module="settings"><AdminSettingsPage /></AdminModuleGuard>} />
          <Route path="/admin/roles" element={<AdminModuleGuard module="roles"><AdminRolesPage /></AdminModuleGuard>} />
        </Route>

        {/* ===== 404 ===== */}
        <Route path="*" element={
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-6xl font-bold gradient-text mb-4">404</h1>
              <p className="text-surface-500 mb-6">The page you're looking for doesn't exist.</p>
              <a href="/" className="btn-primary inline-flex">Go Home</a>
            </div>
          </div>
        } />
      </Routes>
    </ErrorBoundary>
  )
}

function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="page-container py-16 text-center">
      <h1 className="text-3xl font-bold mb-4">{title}</h1>
      <p className="text-surface-500">This page is coming soon.</p>
    </div>
  )
}

function AdminPlaceholder({ title }: { title: string }) {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">{title}</h1>
      <p className="text-surface-500">This admin section is being built. Check back for the next update.</p>
    </div>
  )
}
