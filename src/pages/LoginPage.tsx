import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Mail, Lock, ArrowRight, ShoppingBag, Star, Truck } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { Button, Input } from '@/components/ui'
import { validateEmail } from '@/lib/utils'
import { SITE_NAME } from '@/lib/constants'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { signIn, user, isAdmin } = useAuth()
  const from = (location.state as { from?: string })?.from || '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(true)
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})
  const [loading, setLoading] = useState(false)

  if (user) {
    navigate(isAdmin ? '/admin' : from, { replace: true })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: typeof errors = {}
    if (!validateEmail(email)) newErrors.email = 'Enter a valid email'
    if (password.length < 6) newErrors.password = 'Password must be at least 6 characters'
    setErrors(newErrors)
    if (Object.keys(newErrors).length) return

    setLoading(true)
    const { error } = await signIn(email, password)
    setLoading(false)

    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Welcome back!')
      navigate(from, { replace: true })
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left brand panel */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900"
      >
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-primary-300 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 flex flex-col justify-between p-12 text-white">
          <Link to="/" className="text-2xl font-bold tracking-tight">
            {SITE_NAME}
          </Link>
          <div>
            <h1 className="text-4xl font-bold mb-4 leading-tight">
              Premium products.<br />Beautifully simple.
            </h1>
            <p className="text-primary-100 text-lg mb-8 max-w-md">
              Sign in to track orders, manage your wishlist, and check out faster.
            </p>
            <div className="space-y-3">
              {[
                { icon: Truck, text: 'Free shipping on orders over $100' },
                { icon: ShoppingBag, text: '30-day hassle-free returns' },
                { icon: Star, text: 'Loved by 50,000+ customers' },
              ].map((f) => (
                <div key={f.text} className="flex items-center gap-3 text-primary-100">
                  <f.icon size={20} />
                  <span>{f.text}</span>
                </div>
              ))}
            </div>
          </div>
          <p className="text-primary-200 text-sm">© {new Date().getFullYear()} {SITE_NAME}. All rights reserved.</p>
        </div>
      </motion.div>

      {/* Right form panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden mb-8 text-center">
            <Link to="/" className="text-2xl font-bold gradient-text">{SITE_NAME}</Link>
          </div>

          <h2 className="text-3xl font-bold mb-2">Welcome back</h2>
          <p className="text-surface-600 dark:text-surface-400 mb-8">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-600 dark:text-primary-400 font-semibold hover:underline">
              Sign up free
            </Link>
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email address"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              leftIcon={<Mail size={18} />}
            />

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium">Password</label>
                <Link to="/forgot-password" className="text-xs text-primary-600 dark:text-primary-400 hover:underline">
                  Forgot password?
                </Link>
              </div>
              <Input
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={errors.password}
                leftIcon={<Lock size={18} />}
                rightIcon={
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-surface-400 hover:text-surface-600">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                }
              />
            </div>

            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="w-4 h-4 rounded border-surface-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-surface-600 dark:text-surface-400">Keep me signed in</span>
            </label>

            <Button type="submit" fullWidth size="lg" loading={loading} rightIcon={<ArrowRight size={18} />}>
              Sign In
            </Button>
          </form>

          <div className="mt-6 text-center">
            <span className="text-xs text-surface-500">Secure login • Your data is protected</span>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
