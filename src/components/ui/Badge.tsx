import React from 'react'
import { X } from 'lucide-react'
import { clsx } from '@/lib/utils'

/**
 * Available badge color variants.
 */
export type BadgeVariant = 'primary' | 'success' | 'warning' | 'danger' | 'neutral'

/**
 * Available badge sizes.
 */
export type BadgeSize = 'sm' | 'md'

/**
 * Props for the Badge component.
 *
 * @example
 * ```tsx
 * <Badge variant="success" dot>Active</Badge>
 * <Badge variant="danger" size="sm" removable onRemove={() => {}}>Error</Badge>
 * ```
 */
export interface BadgeProps {
  /** Color variant */
  variant?: BadgeVariant
  /** Size variant */
  size?: BadgeSize
  /** Shows a colored dot indicator before the label */
  dot?: boolean
  /** Makes the badge removable with an X button */
  removable?: boolean
  /** Callback when the remove button is clicked */
  onRemove?: () => void
  /** Badge content (text or elements) */
  children: React.ReactNode
  /** Additional class names */
  className?: string
}

/** Variant styles */
const variantStyles: Record<BadgeVariant, string> = {
  primary: 'bg-primary-100 text-primary-800 dark:bg-primary-900/40 dark:text-primary-300',
  success: 'bg-success-100 text-success-800 dark:bg-success-900/40 dark:text-success-300',
  warning: 'bg-warning-100 text-warning-800 dark:bg-warning-900/40 dark:text-warning-300',
  danger: 'bg-danger-100 text-danger-800 dark:bg-danger-900/40 dark:text-danger-300',
  neutral: 'bg-surface-100 text-surface-700 dark:bg-surface-800 dark:text-surface-300',
}

/** Dot color styles */
const dotStyles: Record<BadgeVariant, string> = {
  primary: 'bg-primary-500',
  success: 'bg-success-500',
  warning: 'bg-warning-500',
  danger: 'bg-danger-500',
  neutral: 'bg-surface-500',
}

/** Size styles */
const sizeStyles: Record<BadgeSize, string> = {
  sm: 'text-xs px-2 py-0.5 gap-1',
  md: 'text-sm px-2.5 py-0.5 gap-1.5',
}

/**
 * A badge/tag component with color variants, sizes, optional dot indicator,
 * and removable X button.
 */
export function Badge({
  variant = 'neutral',
  size = 'md',
  dot = false,
  removable = false,
  onRemove,
  children,
  className,
}: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center font-medium rounded-full whitespace-nowrap',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {dot && (
        <span
          className={clsx('rounded-full flex-shrink-0', dotStyles[variant], size === 'sm' ? 'h-1.5 w-1.5' : 'h-2 w-2')}
          aria-hidden="true"
        />
      )}
      {children}
      {removable && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onRemove?.()
          }}
          className="ml-0.5 inline-flex items-center justify-center rounded-full p-0.5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
          aria-label="Remove badge"
        >
          <X size={size === 'sm' ? 12 : 14} className="current" />
        </button>
      )}
    </span>
  )
}
