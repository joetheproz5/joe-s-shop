import React, { forwardRef } from 'react'
import { clsx } from '@/lib/utils'

/**
 * Available card variants.
 */
export type CardVariant = 'default' | 'glass' | 'hover'

/**
 * Props for the Card component.
 *
 * @example
 * ```tsx
 * <Card variant="glass" image="/hero.jpg" title="Product" subtitle="$29.99">
 *   <Card.Body>Description here</Card.Body>
 *   <Card.Footer><Button>Buy</Button></Card.Footer>
 * </Card>
 * ```
 */
export interface CardProps {
  /** Visual variant */
  variant?: CardVariant
  /** Optional header image URL */
  image?: string
  /** Alt text for the image */
  imageAlt?: string
  /** Card title */
  title?: string
  /** Card subtitle */
  subtitle?: string
  /** Card description */
  description?: string
  /** Action buttons rendered below description */
  actions?: React.ReactNode
  /** Badge elements rendered below title */
  badges?: React.ReactNode
  /** Card content (body, footer, or custom content) */
  children?: React.ReactNode
  /** Additional class names */
  className?: string
  /** Click handler for the entire card */
  onClick?: () => void
}

/** Variant styles */
const variantStyles: Record<CardVariant, string> = {
  default: 'bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800',
  glass: 'bg-white/70 dark:bg-surface-900/50 backdrop-blur-md border border-white/20 dark:border-surface-700/50 shadow-glass dark:shadow-glass-dark',
  hover: 'bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer',
}

/**
 * Card.Body - renders the main body content of the card.
 */
export function CardBody({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={clsx('px-5 py-4', className)}>{children}</div>
}

/**
 * Card.Header - renders a custom header section for the card.
 */
export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={clsx('px-5 pt-5 pb-2', className)}>{children}</div>
}

/**
 * Card.Footer - renders a footer section at the bottom of the card.
 */
export function CardFooter({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={clsx('border-t border-surface-200 dark:border-surface-700 px-5 py-4', className)}>
      {children}
    </div>
  )
}

/**
 * A versatile card component with optional image, title, subtitle,
 * description, action buttons, and badges. Supports glass and hover variants.
 *
 * Composable sub-components: Card.Body, Card.Header, Card.Footer.
 */
export function Card({
  variant = 'default',
  image,
  imageAlt,
  title,
  subtitle,
  description,
  actions,
  badges,
  children,
  className,
  onClick,
}: CardProps) {
  // If children are provided, render as a simple wrapper card
  const hasStructuredContent = title || description || image || subtitle || badges || actions

  return (
    <div
      className={clsx(
        'rounded-2xl overflow-hidden',
        variantStyles[variant],
        className
      )}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e: React.KeyboardEvent) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onClick()
              }
            }
          : undefined
      }
    >
      {children ? (
        children
      ) : (
        hasStructuredContent && (
          <>
            {/* Image */}
            {image && (
              <div className="w-full aspect-video overflow-hidden">
                <img
                  src={image}
                  alt={imageAlt || ''}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
            )}

            {/* Content */}
            <div className="p-5">
              {/* Title area */}
              {(title || subtitle || badges) && (
                <div className="mb-3">
                  {title && (
                    <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-50 leading-tight">
                      {title}
                    </h3>
                  )}
                  {subtitle && (
                    <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">{subtitle}</p>
                  )}
                  {badges && <div className="mt-2 flex flex-wrap gap-1.5">{badges}</div>}
                </div>
              )}

              {/* Description */}
              {description && (
                <p className="text-sm text-surface-600 dark:text-surface-300 leading-relaxed">
                  {description}
                </p>
              )}

              {/* Actions */}
              {actions && <div className="mt-4 flex items-center gap-2">{actions}</div>}
            </div>
          </>
        )
      )}
    </div>
  )
}

Card.Body = CardBody
Card.Header = CardHeader
Card.Footer = CardFooter
