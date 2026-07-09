import React from 'react'
import { clsx } from '@/lib/utils'

/**
 * Available skeleton variants for different content shapes.
 */
export type SkeletonVariant = 'text' | 'circle' | 'rectangle' | 'card' | 'table-row'

/**
 * Props for the Skeleton component.
 *
 * @example
 * ```tsx
 * <Skeleton variant="text" className="h-4 w-3/4" />
 * <Skeleton variant="circle" className="h-12 w-12" />
 * <Skeleton variant="card" />
 * ```
 */
export interface SkeletonProps {
  /** Shape variant */
  variant?: SkeletonVariant
  /** Width of the skeleton (CSS value or Tailwind class) */
  width?: string | number
  /** Height of the skeleton (CSS value or Tailwind class) */
  height?: string | number
  /** Number of text lines to render (only for 'text' variant) */
  lines?: number
  /** Number of columns for table-row variant */
  columns?: number
  /** Additional class names */
  className?: string
}

/** Variant base styles */
const variantBase: Record<SkeletonVariant, string> = {
  text: 'h-4 rounded',
  circle: 'rounded-full',
  rectangle: 'rounded-xl',
  card: '',
  'table-row': '',
}

/**
 * A loading skeleton component with shimmer animation and multiple shape
 * variants: text, circle, rectangle, card, and table-row.
 */
export function Skeleton({
  variant = 'text',
  width,
  height,
  lines = 1,
  columns = 5,
  className,
}: SkeletonProps) {
  const baseClasses = 'animate-pulse bg-surface-200 dark:bg-surface-700'

  // Custom shimmer override - uses bg-gradient for a polished effect
  const shimmerClasses = `
    relative overflow-hidden
    bg-surface-200 dark:bg-surface-700
    after:absolute after:inset-0 after:translate-x-[-100%]
    after:bg-gradient-to-r after:from-transparent after:via-white/20 after:to-transparent
    after:animate-[shimmer_2s_infinite]
  `

  const dimensionStyles: React.CSSProperties = {
    ...(width !== undefined ? { width: typeof width === 'number' ? `${width}px` : width } : {}),
    ...(height !== undefined ? { height: typeof height === 'number' ? `${height}px` : height } : {}),
  }

  if (variant === 'card') {
    return (
      <div
        className={clsx('rounded-2xl border border-surface-200 dark:border-surface-700 overflow-hidden', className)}
        aria-hidden="true"
        role="status"
      >
        <div className={clsx(shimmerClasses, 'w-full h-40')} />
        <div className="p-5 space-y-3">
          <div className={clsx(shimmerClasses, 'h-5 w-3/4 rounded-lg')} />
          <div className={clsx(shimmerClasses, 'h-4 w-full rounded-lg')} />
          <div className={clsx(shimmerClasses, 'h-4 w-2/3 rounded-lg')} />
          <div className="flex gap-2 pt-2">
            <div className={clsx(shimmerClasses, 'h-9 w-20 rounded-xl')} />
            <div className={clsx(shimmerClasses, 'h-9 w-20 rounded-xl')} />
          </div>
        </div>
      </div>
    )
  }

  if (variant === 'table-row') {
    return (
      <tr className={className} aria-hidden="true" role="status">
        {Array.from({ length: columns }).map((_, i) => (
          <td key={i} className="px-4 py-3">
            <div className={clsx(shimmerClasses, 'h-4 rounded', i === 0 ? 'w-12' : i === columns - 1 ? 'w-20' : 'w-full')} />
          </td>
        ))}
      </tr>
    )
  }

  if (variant === 'text' && lines > 1) {
    return (
      <div className={clsx('space-y-2', className)} aria-hidden="true" role="status">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={clsx(
              shimmerClasses,
              variantBase.text,
              i === lines - 1 && 'w-2/3'
            )}
            style={dimensionStyles}
          />
        ))}
      </div>
    )
  }

  return (
    <div
      className={clsx(shimmerClasses, variantBase[variant], variant === 'circle' && 'aspect-square', className)}
      style={{
        ...dimensionStyles,
        ...(variant === 'circle' && !width && !height ? { width: 48, height: 48 } : {}),
        ...(variant === 'rectangle' && !height ? { height: 100 } : {}),
        ...(variant === 'text' && !height ? {} : {}),
      }}
      aria-hidden="true"
      role="status"
    />
  )
}
