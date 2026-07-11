import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { User, Mail, Lock, Eye, EyeOff, ArrowRight, Check, Shield, Gift, Sparkles } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { Button, Input } from '@/components/ui'
import { validateEmail, validatePassword } from '@/lib/utils'
import { SITE_NAME } from '@/lib/constants'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { signUp } = useAuth()

  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    terms: false,
  })
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  const set = (key: string, value: string | boolean) => {
    setForm((f) => ({ ...f, [key]: value }))
    setErrors((e) => ({ ...e, [key]: '' }))
  }

  const passwordStrength = useMemo(() => {
    const checks = [
      form.password.length >= 8,
      /[A-Z]/.test(form.password),
      /[a-z]/.test(form.password),
      /[0-9]/.test(form.password),
    ].filter(Boolean).length
    if (form.password.length === 0) return { score: 0, label: '', color: '' }
    if (checks <= 2) return { score: 1, label: 'Weak', color: 'bg-danger-500' }
    if (checks === 3) return { score: 2, label: 'Medium', color: 'bg-warning-500' }
    return { score: 3, label: 'Strong', color: 'bg-success-500' }
  }, [form.password])

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.first_name.trim()) e.first_name = 'Required'
    if (!form.last_name.trim()) e.last_name = 'Required'
    if (!validateEmail(form.email)) e.email = 'Enter a valid email'
    const pw = validatePassword(form.password)
    if (!pw.isValid) e.password = pw.errors[0]
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match'
    if (!form.terms) e.terms = 'Please accept the terms'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault()
    if (!validate()) return
    setLoading(true)
    const { error } = await signUp(form.email, form.password, {
      first_name: form.first_name,
      last_name: form.last_name,
    })
    setLoading(false)
    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Account created! Check your email to confirm.')
      navigate('/login')
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left form panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 order-2 lg:order-1">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden mb-8 text-center">
            <Link to="/" className="text-2xl font-bold gradient-text">{SITE_NAME}</Link>
          </div>

          <h2 className="text-3xl font-bold mb-2">Create your account</h2>
          <p className="text-surface-600 dark:text-surface-400 mb-8">
            Already have one?{' '}
            <Link to="/login" className="text-primary-600 dark:text-primary-400 font-semibold hover:underline">
              Sign in
            </Link>
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="First name"
                placeholder="Jane"
                value={form.first_name}
                onChange={(e) => set('first_name', e.target.value)}
                error={errors.first_name}
                leftIcon={<User size={18} />}
              />
              <Input
                label="Last name"
                placeholder="Doe"
                value={form.last_name}
                onChange={(e) => set('last_name', e.target.value)}
                error={errors.last_name}
              />
            </div>

            <Input
              label="Email address"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
              error={errors.email}
              leftIcon={<Mail size={18} />}
            />

            <div>
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => set('password', e.target.value)}
                error={errors.password}
                leftIcon={<Lock size={18} />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword((visible) => !visible)}
                    className="rounded-md p-1 text-surface-400 transition-colors hover:text-surface-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:hover:text-surface-200"
                    aria-label={showPassword ? 'Hide passwords' : 'Show passwords'}
                    aria-pressed={showPassword}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                }
              />
              {form.password && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 flex gap-1">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-colors ${
                          i <= passwordStrength.score ? passwordStrength.color : 'bg-surface-200 dark:bg-surface-700'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-surface-500 w-12">{passwordStrength.label}</span>
                </div>
              )}
            </div>

            <Input
              label="Confirm password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={form.confirmPassword}
              onChange={(e) => set('confirmPassword', e.target.value)}
              error={errors.confirmPassword}
              leftIcon={<Lock size={18} />}
            />

            <label className="flex items-start gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={form.terms}
                onChange={(e) => set('terms', e.target.checked)}
                className="w-4 h-4 mt-0.5 rounded border-surface-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-surface-600 dark:text-surface-400">
                I agree to the{' '}
                <Link to="/terms" className="text-primary-600 dark:text-primary-400 hover:underline">Terms</Link> and{' '}
                <Link to="/privacy" className="text-primary-600 dark:text-primary-400 hover:underline">Privacy Policy</Link>
              </span>
            </label>
            {errors.terms && <p className="text-xs text-danger-500 -mt-2">{errors.terms}</p>}

            <Button type="submit" fullWidth size="lg" loading={loading} rightIcon={<ArrowRight size={18} />}>
              Create Account
            </Button>
          </form>
        </motion.div>
      </div>

      {/* Right brand panel */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-surface-900 via-primary-900 to-primary-800 order-1 lg:order-2"
      >
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 right-20 w-72 h-72 bg-primary-500 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-primary-400 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 flex flex-col justify-between p-12 text-white">
          <Link to="/" className="text-2xl font-bold tracking-tight">{SITE_NAME}</Link>
          <div>
            <h1 className="text-4xl font-bold mb-4 leading-tight">
              Join the {SITE_NAME} family today.
            </h1>
            <div className="space-y-4 mt-8">
              {[
                { icon: Sparkles, title: 'Exclusive member deals', desc: 'Get early access to sales and member-only pricing' },
                { icon: Gift, title: 'Earn rewards', desc: 'Collect points on every purchase and redeem for discounts' },
                { icon: Shield, title: 'Secure & private', desc: 'Bank-grade encryption keeps your data safe' },
              ].map((f) => (
                <div key={f.title} className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                    <f.icon size={20} />
                  </div>
                  <div>
                    <div className="font-semibold">{f.title}</div>
                    <div className="text-primary-200 text-sm">{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2 text-primary-200">
            <Check size={16} />
            <span className="text-sm">No credit card required to join</span>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
