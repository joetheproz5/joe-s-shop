import React, { forwardRef, useId, useState, useCallback } from 'react'
import { X } from 'lucide-react'
import { clsx } from '@/lib/utils'

/**
 * Props for the Input component.
 *
 * @example
 * ```tsx
 * <Input
 *   label="Email"
 *   type="email"
 *   leftIcon={<Mail size={16} />}
 *   clearable
 *   error="Invalid email address"
 * />
 * ```
 */
export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Label displayed above the input */
  label?: string
  /** Error message shown below the input */
  error?: string
  /** Helper text shown below the input when no error */
  helperText?: string
  /** Icon rendered on the left side inside the input */
  leftIcon?: React.ReactNode
  /** Icon rendered on the right side inside the input */
  rightIcon?: React.ReactNode
  /** Shows a clear button to empty the value */
  clearable?: boolean
  /** Whether the input should render as a textarea */
  asTextarea?: boolean
  /** Rows to render when using textarea mode */
  rows?: number
  /** Size variant */
  size?: 'sm' | 'md' | 'lg'
}

/** Size styles */
const sizeStyles: Record<string, string> = {
  sm: 'text-sm rounded-lg px-3 py-1.5',
  md: 'text-sm rounded-xl px-4 py-2.5',
  lg: 'text-base rounded-xl px-4 py-3',
}

/** Label size styles */
const labelSizeStyles: Record<string, string> = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-sm',
}

/**
 * A form input component with label, error/helper text, icon slots,
 * clearable support, and textarea variant. Uses consistent focus ring
 * styling and dark mode support.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      clearable = false,
      asTextarea = false,
      rows,
      size = 'md',
      id,
      value,
      onChange,
      className,
      required,
      ...props
    },
    ref
  ) => {
    const autoId = useId()
    const inputId = id || autoId
    const errorId = `${inputId}-error`
    const helperId = `${inputId}-helper`
    const [internalValue, setInternalValue] = useState(
      value !== undefined ? String(value) : ''
    )

    const currentValue = value !== undefined ? String(value) : internalValue
    const isControlled = value !== undefined

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (!isControlled) {
          setInternalValue(e.target.value)
        }
        onChange?.(e as React.ChangeEvent<HTMLInputElement>)
      },
      [isControlled, onChange]
    )

    const handleClear = useCallback(() => {
      const syntheticEvent = {
        target: { value: '' },
      } as React.ChangeEvent<HTMLInputElement>
      if (!isControlled) {
        setInternalValue('')
      }
      onChange?.(syntheticEvent)
    }, [isControlled, onChange])

    const hasError = !!error
    const describedBy = [hasError ? errorId : null, !hasError && helperText ? helperId : null]
      .filter(Boolean)
      .join(' ') || undefined

    const sharedProps = {
      id: inputId,
      value: currentValue,
      onChange: handleChange,
      'aria-invalid': hasError || undefined,
      'aria-describedby': describedBy,
      'aria-required': required || undefined,
      required,
      ...props,
    }

    const inputClasses = clsx(
      // Base
      'w-full border transition-all duration-200 bg-white dark:bg-surface-900',
      'placeholder:text-surface-400 dark:placeholder:text-surface-500',
      // Focus
      'focus:outline-none focus:ring-2 focus:ring-offset-1',
      'focus:ring-primary-500 dark:focus:ring-primary-400 dark:focus:ring-offset-surface-950',
      // Borders
      hasError
        ? 'border-danger-500 dark:border-danger-400'
        : 'border-surface-300 dark:border-surface-700 hover:border-surface-400 dark:hover:border-surface-600',
      // Disabled
      'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-surface-50 dark:disabled:bg-surface-800',
      // Size
      sizeStyles[size],
      // Icon offsets
      leftIcon && 'pl-10',
      (rightIcon || (clearable && currentValue)) && 'pr-10',
      className
    )

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className={clsx(
              'mb-1.5 block font-medium text-surface-800 dark:text-surface-200',
              labelSizeStyles[size]
            )}
          >
            {label}
            {required && (
              <span className="ml-0.5 text-danger-500 dark:text-danger-400" aria-hidden="true">
                *
              </span>
            )}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <span
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-surface-400 dark:text-surface-500"
              aria-hidden="true"
            >
              {leftIcon}
            </span>
          )}

          {asTextarea ? (
            <textarea
              ref={ref as React.Ref<HTMLTextAreaElement>}
              className={clsx(inputClasses, 'resize-y min-h-[80px]')}
              rows={rows || 4}
              {...(sharedProps as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
            />
          ) : (
            <input ref={ref} className={inputClasses} {...sharedProps} />
          )}

          {clearable && currentValue && !props.disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600 dark:text-surface-500 dark:hover:text-surface-300 transition-colors"
              aria-label="Clear input"
            >
              <X size={16} />
            </button>
          )}
          {!clearable && rightIcon && (
            <span className="absolute right-3 top-1/2 z-10 flex -translate-y-1/2 items-center text-surface-400 dark:text-surface-500">
              {rightIcon}
            </span>
          )}
        </div>

        {hasError && (
          <p id={errorId} className="mt-1.5 text-sm text-danger-600 dark:text-danger-400" role="alert">
            {error}
          </p>
        )}

        {!hasError && helperText && (
          <p id={helperId} className="mt-1.5 text-sm text-surface-500 dark:text-surface-400">
            {helperText}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
