import React, { useState, useRef, useEffect, useCallback, useId, forwardRef } from 'react'
import { Search, X, Clock, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { clsx } from '@/lib/utils'

/**
 * A recent search item.
 */
export interface RecentSearch {
  /** Search query text */
  query: string
  /** Optional icon */
  icon?: React.ReactNode
}

/**
 * Props for the SearchBar component.
 *
 * @example
 * ```tsx
 * <SearchBar
 *   value={query}
 *   onChange={setQuery}
 *   onSearch={handleSearch}
 *   placeholder="Search products..."
 *   recentSearches={['shoes', 'jackets']}
 * />
 * ```
 */
export interface SearchBarProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'size'> {
  /** Current search value */
  value?: string
  /** Callback when value changes */
  onChange?: (value: string) => void
  /** Callback when a search is submitted */
  onSearch?: (value: string) => void
  /** Whether the search is in a loading state */
  loading?: boolean
  /** Placeholder text */
  placeholder?: string
  /** Recent searches to show in the dropdown */
  recentSearches?: RecentSearch[] | string[]
  /** Whether to show the keyboard shortcut hint */
  showShortcut?: boolean
  /** Size variant */
  size?: 'sm' | 'md' | 'lg'
  /** Additional class names */
  className?: string
}

/** Size styles */
const sizeStyles: Record<string, string> = {
  sm: 'h-8 text-sm rounded-lg pl-8 pr-8',
  md: 'h-10 text-sm rounded-xl pl-10 pr-10',
  lg: 'h-12 text-base rounded-xl pl-12 pr-12',
}

/** Dropdown animation */
const dropdownVariants = {
  hidden: { opacity: 0, y: -4 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.15 } },
  exit: { opacity: 0, y: -4, transition: { duration: 0.1 } },
}

/**
 * A search input with search icon, clear button, keyboard shortcut hint (Ctrl+K),
 * loading state, and dropdown with recent searches.
 */
export const SearchBar = forwardRef<HTMLInputElement, SearchBarProps>(
  (
    {
      value: controlledValue,
      onChange,
      onSearch,
      loading = false,
      placeholder = 'Search...',
      recentSearches = [],
      showShortcut = true,
      size = 'md',
      className,
      ...props
    },
    ref
  ) => {
    const inputId = useId()
    const [internalValue, setInternalValue] = useState('')
    const [isOpen, setIsOpen] = useState(false)
    const [isFocused, setIsFocused] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement | null>(null)

    const currentValue = controlledValue !== undefined ? controlledValue : internalValue
    const isControlled = controlledValue !== undefined

    const setValue = useCallback(
      (v: string) => {
        if (!isControlled) setInternalValue(v)
        onChange?.(v)
      },
      [isControlled, onChange]
    )

    const handleSubmit = useCallback(() => {
      onSearch?.(currentValue)
      setIsOpen(false)
    }, [currentValue, onSearch])

    // Ctrl+K shortcut to focus
    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
          e.preventDefault()
          inputRef.current?.focus()
        }
        if (e.key === 'Escape') {
          setIsOpen(false)
          inputRef.current?.blur()
        }
      }
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }, [])

    // Click outside to close
    useEffect(() => {
      if (!isOpen) return
      const handleClick = (e: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
          setIsOpen(false)
        }
      }
      document.addEventListener('mousedown', handleClick)
      return () => document.removeEventListener('mousedown', handleClick)
    }, [isOpen])

    const showDropdown = isFocused && isOpen && recentSearches.length > 0 && !currentValue

    const normalizedSearches: RecentSearch[] = recentSearches.map((s) =>
      typeof s === 'string' ? { query: s } : s
    )

    return (
      <div ref={containerRef} className={clsx('relative w-full', className)}>
        {/* Input */}
        <div className="relative">
          {/* Search icon */}
          <span
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-surface-400 dark:text-surface-500"
            aria-hidden="true"
          >
            {loading ? (
              <Loader2 size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} className="animate-spin" />
            ) : (
              <Search size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} />
            )}
          </span>

          <input
            ref={(node) => {
              inputRef.current = node
              if (typeof ref === 'function') ref(node)
              else if (ref) (ref as React.MutableRefObject<HTMLInputElement | null>).current = node
            }}
            id={inputId}
            type="text"
            value={currentValue}
            onChange={(e) => setValue(e.target.value)}
            onFocus={() => {
              setIsFocused(true)
              setIsOpen(true)
            }}
            onBlur={() => {
              setIsFocused(false)
              // Delay closing so click on dropdown item registers
              setTimeout(() => setIsOpen(false), 150)
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleSubmit()
              }
            }}
            placeholder={placeholder}
            className={clsx(
              'w-full border bg-white dark:bg-surface-900',
              'placeholder:text-surface-400 dark:placeholder:text-surface-500',
              'transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-offset-1',
              'focus:ring-primary-500 dark:focus:ring-primary-400 dark:focus:ring-offset-surface-950',
              'border-surface-300 dark:border-surface-700 hover:border-surface-400 dark:hover:border-surface-600',
              sizeStyles[size]
            )}
            role="searchbox"
            aria-label={placeholder}
            aria-expanded={showDropdown}
            {...props}
          />

          {/* Clear button */}
          {currentValue && (
            <button
              type="button"
              onClick={() => setValue('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600 dark:text-surface-500 dark:hover:text-surface-300 transition-colors"
              aria-label="Clear search"
            >
              <X size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} />
            </button>
          )}

          {/* Keyboard shortcut hint */}
          {showShortcut && !currentValue && !isFocused && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-0.5 pointer-events-none">
              <kbd className="rounded border border-surface-300 dark:border-surface-600 bg-surface-50 dark:bg-surface-800 px-1.5 py-0.5 text-[10px] font-medium text-surface-400 dark:text-surface-500">
                Ctrl
              </kbd>
              <kbd className="rounded border border-surface-300 dark:border-surface-600 bg-surface-50 dark:bg-surface-800 px-1.5 py-0.5 text-[10px] font-medium text-surface-400 dark:text-surface-500">
                K
              </kbd>
            </span>
          )}
        </div>

        {/* Recent searches dropdown */}
        <AnimatePresence>
          {showDropdown && (
            <motion.div
              className="absolute top-full left-0 right-0 mt-1 z-50"
              variants={dropdownVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <div className="overflow-hidden rounded-xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-900 shadow-lg dark:shadow-xl py-2">
                <p className="px-3 py-1.5 text-xs font-medium text-surface-400 dark:text-surface-500 uppercase tracking-wider">
                  Recent Searches
                </p>
                {normalizedSearches.map((search, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault()
                      setValue(search.query)
                      onSearch?.(search.query)
                      setIsOpen(false)
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
                  >
                    {search.icon || <Clock size={14} className="text-surface-400" />}
                    <span>{search.query}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }
)

SearchBar.displayName = 'SearchBar'
