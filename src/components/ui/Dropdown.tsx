import React, { useState, useRef, useEffect, useCallback, useId } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { clsx } from '@/lib/utils'

/**
 * A single dropdown menu item.
 */
export interface DropdownItem {
  /** Unique key */
  key: string
  /** Display label */
  label: string
  /** Optional icon rendered on the left */
  icon?: React.ReactNode
  /** Callback when this item is clicked */
  onClick?: () => void
  /** Whether this item is a divider instead of a clickable item */
  divider?: boolean
  /** Whether this item is disabled */
  disabled?: boolean
  /** Whether this item is a danger/destructive action */
  danger?: boolean
}

/**
 * Props for the Dropdown component.
 *
 * @example
 * ```tsx
 * <Dropdown trigger={<Button>Actions</Button>} items={[
 *   { key: 'edit', label: 'Edit', icon: <Pencil size={16} />, onClick: handleEdit },
 *   { key: 'divider', divider: true },
 *   { key: 'delete', label: 'Delete', danger: true, onClick: handleDelete },
 * ]} />
 * ```
 */
export interface DropdownProps {
  /** Trigger element that opens the dropdown */
  trigger: React.ReactNode
  /** Menu items */
  items: DropdownItem[]
  /** Placement of the dropdown relative to the trigger */
  placement?: 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end'
  /** Width of the dropdown menu */
  width?: number | 'auto' | 'trigger'
  /** Whether the dropdown is open (controlled) */
  isOpen?: boolean
  /** Callback when the open state changes */
  onOpenChange?: (isOpen: boolean) => void
  /** Additional class names for the menu */
  className?: string
}

/** Placement styles */
const placementStyles: Record<string, string> = {
  'bottom-start': 'top-full left-0 mt-1',
  'bottom-end': 'top-full right-0 mt-1',
  'top-start': 'bottom-full left-0 mb-1',
  'top-end': 'bottom-full right-0 mb-1',
}

/** Menu animation variants */
const menuVariants = {
  hidden: { opacity: 0, scale: 0.95, y: -4 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 400, damping: 25 },
  },
  exit: { opacity: 0, scale: 0.97, y: -2, transition: { duration: 0.1 } },
}

/**
 * A dropdown menu with trigger, items, dividers, icons per item,
 * keyboard navigation, click-outside-to-close, and framer-motion animations.
 */
export function Dropdown({
  trigger,
  items,
  placement = 'bottom-start',
  width = 200,
  isOpen: controlledOpen,
  onOpenChange,
  className,
}: DropdownProps) {
  const menuId = useId()
  const [internalOpen, setInternalOpen] = useState(false)
  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen
  const containerRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const [focusedIndex, setFocusedIndex] = useState(-1)

  const openMenu = useCallback(() => {
    setInternalOpen(true)
    onOpenChange?.(true)
  }, [onOpenChange])

  const closeMenu = useCallback(() => {
    setInternalOpen(false)
    setFocusedIndex(-1)
    onOpenChange?.(false)
  }, [onOpenChange])

  const toggleMenu = useCallback(() => {
    if (isOpen) {
      closeMenu()
    } else {
      openMenu()
    }
  }, [isOpen, openMenu, closeMenu])

  // Click outside to close
  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        closeMenu()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, closeMenu])

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isOpen) {
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
          e.preventDefault()
          openMenu()
        }
        return
      }

      const actionableItems = items.filter((item) => !item.divider && !item.disabled)

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setFocusedIndex((prev) =>
            prev < actionableItems.length - 1 ? prev + 1 : 0
          )
          break
        case 'ArrowUp':
          e.preventDefault()
          setFocusedIndex((prev) =>
            prev > 0 ? prev - 1 : actionableItems.length - 1
          )
          break
        case 'Enter':
        case ' ':
          e.preventDefault()
          if (focusedIndex >= 0 && focusedIndex < actionableItems.length) {
            actionableItems[focusedIndex].onClick?.()
            closeMenu()
          }
          break
        case 'Escape':
          e.preventDefault()
          closeMenu()
          break
        case 'Tab':
          closeMenu()
          break
      }
    },
    [isOpen, items, focusedIndex, openMenu, closeMenu]
  )

  // Focus the focused item
  useEffect(() => {
    if (focusedIndex >= 0 && menuRef.current) {
      const focusable = menuRef.current.querySelectorAll<HTMLButtonElement>(
        '[role="menuitem"]:not(:disabled)'
      )
      focusable[focusedIndex]?.focus()
    }
  }, [focusedIndex])

  let actionableIndex = -1

  return (
    <div ref={containerRef} className="relative inline-flex" onKeyDown={handleKeyDown}>
      {/* Trigger */}
      <div
        onClick={toggleMenu}
        className="cursor-pointer"
        role="button"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={menuId}
        tabIndex={0}
      >
        {trigger}
      </div>

      {/* Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={menuRef}
            id={menuId}
            role="menu"
            className={clsx(
              'absolute z-50 overflow-hidden rounded-xl',
              'bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-700',
              'shadow-lg dark:shadow-xl py-1',
              placementStyles[placement],
              className
            )}
            style={{
              minWidth: width === 'auto' ? undefined : width === 'trigger' ? containerRef.current?.offsetWidth : width,
              ...(width === 'auto' ? {} : { width: width === 'trigger' ? containerRef.current?.offsetWidth : width }),
            }}
            variants={menuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {items.map((item) => {
              if (item.divider) {
                return (
                  <div
                    key={item.key}
                    className="my-1 h-px bg-surface-200 dark:bg-surface-700"
                    role="separator"
                  />
                )
              }

              actionableIndex++
              const currentIndex = actionableIndex

              return (
                <button
                  key={item.key}
                  role="menuitem"
                  tabIndex={-1}
                  onClick={() => {
                    if (item.disabled) return
                    item.onClick?.()
                    closeMenu()
                  }}
                  disabled={item.disabled}
                  className={clsx(
                    'flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors text-left',
                    'focus:outline-none',
                    item.disabled
                      ? 'opacity-40 cursor-not-allowed'
                      : item.danger
                        ? 'text-danger-600 dark:text-danger-400 hover:bg-danger-50 dark:hover:bg-danger-950/30'
                        : 'text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800',
                    focusedIndex === currentIndex && !item.disabled && 'bg-surface-100 dark:bg-surface-800'
                  )}
                >
                  {item.icon && <span className="flex-shrink-0" aria-hidden="true">{item.icon}</span>}
                  <span className="flex-1">{item.label}</span>
                </button>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
