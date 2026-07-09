import React, { useState, useId } from 'react'
import { motion } from 'framer-motion'
import { clsx } from '@/lib/utils'

/**
 * Available tab style variants.
 */
export type TabsVariant = 'pills' | 'underline'

/**
 * A single tab item definition.
 */
export interface TabItem {
  /** Unique key for this tab */
  key: string
  /** Display label */
  label: string
  /** Optional icon rendered before the label */
  icon?: React.ReactNode
  /** Tab content */
  content: React.ReactNode
  /** Whether this tab is disabled */
  disabled?: boolean
}

/**
 * Props for the Tabs component.
 *
 * @example
 * ```tsx
 * <Tabs variant="pills" defaultTab="overview" items={[
 *   { key: 'overview', label: 'Overview', content: <OverviewPanel /> },
 *   { key: 'details', label: 'Details', content: <DetailsPanel /> },
 * ]} />
 * ```
 */
export interface TabsProps {
  /** Style variant */
  variant?: TabsVariant
  /** Initial active tab key */
  defaultTab?: string
  /** Currently active tab key (controlled) */
  activeTab?: string
  /** Callback when the active tab changes */
  onTabChange?: (key: string) => void
  /** Tab items */
  items: TabItem[]
  /** Additional class names for the wrapper */
  className?: string
}

/**
 * A tab component with horizontal tabs, animated active indicator via framer-motion,
 * pills and underline variants, and animated content panels.
 */
export function Tabs({
  variant = 'underline',
  defaultTab,
  activeTab: controlledTab,
  onTabChange,
  items,
  className,
}: TabsProps) {
  const instanceId = useId()
  const [internalTab, setInternalTab] = useState(defaultTab || items[0]?.key || '')

  const activeTab = controlledTab !== undefined ? controlledTab : internalTab

  const handleTabClick = (key: string) => {
    if (key === activeTab) return
    setInternalTab(key)
    onTabChange?.(key)
  }

  const handleKeyDown = (e: React.KeyboardEvent, key: string) => {
    const enabledItems = items.filter((item) => !item.disabled)
    const currentIndex = enabledItems.findIndex((item) => item.key === key)

    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault()
      const nextIndex = (currentIndex + 1) % enabledItems.length
      handleTabClick(enabledItems[nextIndex].key)
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault()
      const prevIndex = (currentIndex - 1 + enabledItems.length) % enabledItems.length
      handleTabClick(enabledItems[prevIndex].key)
    }
  }

  const activeItem = items.find((item) => item.key === activeTab)

  return (
    <div className={clsx('w-full', className)}>
      {/* Tab list */}
      <div
        role="tablist"
        aria-orientation="horizontal"
        className={clsx(
          'flex',
          variant === 'underline' && 'border-b border-surface-200 dark:border-surface-700',
          variant === 'pills' && 'gap-1 bg-surface-100 dark:bg-surface-800 p-1 rounded-xl w-fit'
        )}
      >
        {items.map((item) => {
          const isActive = item.key === activeTab

          return (
            <button
              key={item.key}
              role="tab"
              id={`${instanceId}-tab-${item.key}`}
              aria-selected={isActive}
              aria-controls={`${instanceId}-panel-${item.key}`}
              aria-disabled={item.disabled}
              tabIndex={isActive ? 0 : -1}
              disabled={item.disabled}
              onClick={() => handleTabClick(item.key)}
              onKeyDown={(e) => handleKeyDown(e, item.key)}
              className={clsx(
                'relative flex items-center gap-2 font-medium text-sm transition-colors whitespace-nowrap',
                item.disabled && 'opacity-40 cursor-not-allowed',
                !item.disabled && 'cursor-pointer',
                variant === 'underline' && [
                  'px-4 py-2.5 -mb-px',
                  isActive
                    ? 'text-primary-600 dark:text-primary-400'
                    : 'text-surface-500 dark:text-surface-400 hover:text-surface-700 dark:hover:text-surface-300',
                ],
                variant === 'pills' && [
                  'px-4 py-2 rounded-lg',
                  isActive
                    ? 'text-surface-900 dark:text-surface-50'
                    : 'text-surface-500 dark:text-surface-400 hover:text-surface-700 dark:hover:text-surface-300',
                ]
              )}
            >
              {isActive && variant === 'pills' && (
                <motion.div
                  layoutId={`tab-pill-${instanceId}`}
                  className="absolute inset-0 bg-white dark:bg-surface-900 rounded-lg shadow-sm"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              {isActive && variant === 'underline' && (
                <motion.div
                  layoutId={`tab-underline-${instanceId}`}
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 dark:bg-primary-400"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                {item.icon && <span aria-hidden="true">{item.icon}</span>}
                {item.label}
              </span>
            </button>
          )
        })}
      </div>

      {/* Tab panels */}
      <div className="mt-4">
        {items.map((item) => {
          if (item.key !== activeTab) return null

          return (
            <motion.div
              key={item.key}
              role="tabpanel"
              id={`${instanceId}-panel-${item.key}`}
              aria-labelledby={`${instanceId}-tab-${item.key}`}
              tabIndex={0}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
              {item.content}
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
