import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { clsx } from '@/lib/utils'

interface AdminPageHeaderProps {
  title: string
  description: string
  eyebrow?: string
  actions?: ReactNode
}

export function AdminPageHeader({ title, description, eyebrow, actions }: AdminPageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && (
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-primary-600 dark:text-primary-400">
            {eyebrow}
          </p>
        )}
        <h1 className="text-2xl font-bold tracking-tight text-surface-950 dark:text-white">{title}</h1>
        <p className="mt-1 max-w-2xl text-sm text-surface-500 dark:text-surface-400">{description}</p>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}

interface AdminMetricCardProps {
  label: string
  value: string | number
  helper?: string
  icon: ReactNode
  tone?: 'primary' | 'success' | 'warning' | 'danger' | 'surface'
}

const metricTone: Record<NonNullable<AdminMetricCardProps['tone']>, string> = {
  primary: 'bg-primary-50 text-primary-700 dark:bg-primary-950/40 dark:text-primary-300',
  success: 'bg-success-50 text-success-700 dark:bg-success-900/20 dark:text-success-300',
  warning: 'bg-warning-50 text-warning-800 dark:bg-warning-900/20 dark:text-warning-300',
  danger: 'bg-danger-50 text-danger-700 dark:bg-danger-900/20 dark:text-danger-300',
  surface: 'bg-surface-100 text-surface-700 dark:bg-surface-800 dark:text-surface-300',
}

export function AdminMetricCard({ label, value, helper, icon, tone = 'surface' }: AdminMetricCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-surface-500 dark:text-surface-400">{label}</p>
          <p className="mt-1 text-2xl font-bold text-surface-950 dark:text-white">{value}</p>
          {helper && <p className="mt-1 text-xs text-surface-500 dark:text-surface-400">{helper}</p>}
        </div>
        <div className={clsx('flex h-10 w-10 items-center justify-center rounded-xl', metricTone[tone])}>
          {icon}
        </div>
      </div>
    </motion.div>
  )
}

export function AdminToolbar({ children }: { children: ReactNode }) {
  return (
    <div className="card p-4">
      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">{children}</div>
    </div>
  )
}

export function EmptyAdminState({ icon, title, description }: { icon: ReactNode; title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-surface-300 bg-white px-6 py-12 text-center dark:border-surface-700 dark:bg-surface-900">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-surface-100 text-surface-500 dark:bg-surface-800 dark:text-surface-400">
        {icon}
      </div>
      <h3 className="font-semibold text-surface-900 dark:text-white">{title}</h3>
      <p className="mt-1 max-w-md text-sm text-surface-500 dark:text-surface-400">{description}</p>
    </div>
  )
}

export function StatusPill({ children, tone = 'surface' }: { children: ReactNode; tone?: AdminMetricCardProps['tone'] }) {
  return (
    <span className={clsx('inline-flex rounded-full px-2.5 py-1 text-xs font-semibold', metricTone[tone ?? 'surface'])}>
      {children}
    </span>
  )
}
