import React, { forwardRef } from 'react'
import { motion, type HTMLMotionProps } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { clsx } from '@/lib/utils'

/**
 * Available button variants for different visual styles.
 */
export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'

/**
 * Available button sizes.
 */
export type ButtonSize = 'sm' | 'md' | 'lg'

/**
 * Props for the Button component.
 *
 * @example
 * ```tsx
 * <Button variant="primary" size="md" loading={false}>
 *   Save Changes
 * </Button>
 * ```
 */
export interface ButtonProps
  extends Omit<HTMLMotionProps<'button'>, 'ref'> {
  /** Visual variant of the button */
  variant?: ButtonVariant
  /** Size of the button */
  size?: ButtonSize
  /** Shows a loading spinner and disables interaction */
  loading?: boolean
  /** Stretches the button to full width */
  fullWidth?: boolean
  /** Renders the button with only the icon, no padding */
  iconOnly?: boolean
  /** Icon to render on the left side of the label */
  leftIcon?: React.ReactNode
  /** Icon to render on the right side of the label */
  rightIcon?: React.ReactNode
}

/** Variant style maps */
const variantStyles: Record<ButtonVariant, string> = {
  primary: `
    bg-primary-600 text-white
    hover:bg-primary-700 active:bg-primary-800
    dark:bg-primary-500 dark:hover:bg-primary-600 dark:active:bg-primary-700
    shadow-sm hover:shadow-md
  `,
  secondary: `
    bg-surface-100 text-surface-800 border border-surface-300
    hover:bg-surface-200 active:bg-surface-300
    dark:bg-surface-800 dark:text-surface-100 dark:border-surface-700
    dark:hover:bg-surface-700 dark:active:bg-surface-600
  `,
  ghost: `
    bg-transparent text-surface-700
    hover:bg-surface-100 active:bg-surface-200
    dark:text-surface-300 dark:hover:bg-surface-800 dark:active:bg-surface-700
  `,
  danger: `
    bg-danger-600 text-white
    hover:bg-danger-700 active:bg-danger-800
    dark:bg-danger-500 dark:hover:bg-danger-600 dark:active:bg-danger-700
    shadow-sm hover:shadow-md
  `,
}

/** Size style maps */
const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-sm gap-1.5 rounded-lg',
  md: 'h-10 px-4 text-sm gap-2 rounded-xl',
  lg: 'h-12 px-6 text-base gap-2.5 rounded-xl',
}

/** Icon-only size adjustments */
const iconOnlyStyles: Record<ButtonSize, string> = {
  sm: 'p-1.5',
  md: 'p-2',
  lg: 'p-3',
}

/**
 * A versatile button component with multiple variants, sizes, loading state,
 * icon support, and press animation via framer-motion.
 *
 * Supports all native `<button>` attributes via forwardRef.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      fullWidth = false,
      iconOnly = false,
      leftIcon,
      rightIcon,
      disabled,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading

    return (
      <motion.button
        ref={ref}
        whileHover={isDisabled ? undefined : { scale: 1.02 }}
        whileTap={isDisabled ? undefined : { scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        className={clsx(
          // Base
          'inline-flex items-center justify-center font-medium transition-colors duration-200',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
          'dark:focus-visible:ring-offset-surface-900',
          'disabled:pointer-events-none disabled:opacity-50',
          // Variant
          variantStyles[variant],
          // Size
          sizeStyles[size],
          // Modifiers
          fullWidth && 'w-full',
          iconOnly && iconOnlyStyles[size],
          className
        )}
        disabled={isDisabled}
        aria-busy={loading}
        {...props}
      >
        {loading ? (
          <Loader2 className="animate-spin" size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} aria-hidden="true" />
        ) : (
          leftIcon && (
            <span className="flex-shrink-0" aria-hidden="true">
              {leftIcon}
            </span>
          )
        )}

        {!iconOnly && (children as React.ReactNode)}

        {!loading && rightIcon && (
          <span className="flex-shrink-0" aria-hidden="true">
            {rightIcon}
          </span>
        )}
      </motion.button>
    )
  }
)

Button.displayName = 'Button'
