import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { Button, Input } from '@/components/ui'
import { validateEmail } from '@/lib/utils'
import { SITE_NAME } from '@/lib/constants'
import toast from 'react-hot-toast'

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateEmail(email)) {
      setError('Enter a valid email')
      return
    }
    setError('')
    setLoading(true)
    const { error } = await resetPassword(email)
    setLoading(false)
    if (error) {
      toast.error(error.message)
    } else {
      setSent(true)
      toast.success('Reset link sent!')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-surface-50 dark:bg-surface-950">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card w-full max-w-md"
      >
        <Link to="/login" className="inline-flex items-center gap-2 text-sm text-surface-500 hover:text-surface-700 dark:hover:text-surface-300 mb-6">
          <ArrowLeft size={16} /> Back to login
        </Link>

        <Link to="/" className="block text-2xl font-bold gradient-text mb-6">{SITE_NAME}</Link>

        {sent ? (
          <div className="text-center py-4">
            <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-success-100 dark:bg-success-900/30 flex items-center justify-center">
              <CheckCircle2 className="text-success-600 dark:text-success-400" size={32} />
            </div>
            <h1 className="text-2xl font-bold mb-2">Check your email</h1>
            <p className="text-surface-600 dark:text-surface-400 mb-6">
              We've sent a password reset link to <span className="font-semibold text-surface-900 dark:text-surface-50">{email}</span>.
              The link will expire in 1 hour.
            </p>
            <Link to="/login" className="btn-primary inline-flex">
              Back to Login
            </Link>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold mb-2">Forgot password?</h1>
            <p className="text-surface-600 dark:text-surface-400 mb-6">
              No worries — enter your email and we'll send you reset instructions.
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email address"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={error}
                leftIcon={<Mail size={18} />}
              />
              <Button type="submit" fullWidth size="lg" loading={loading}>
                Send Reset Link
              </Button>
            </form>
          </>
        )}
      </motion.div>
    </div>
  )
}
