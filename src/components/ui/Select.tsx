import React, { useState, useRef, useCallback, useEffect, useMemo, useId, forwardRef } from 'react'
import { ChevronDown, X, Check, Search, Loader2 } from 'lucide-react'
import { clsx } from '@/lib/utils'

/**
 * A single option or option group in the select.
 */
export interface SelectOption {
  /** Display value */
  label: string
  /** Underlying value */
  value: string
  /** Whether this option is disabled */
  disabled?: boolean
  /** Optional icon */
  icon?: React.ReactNode
}

/**
 * A group of options with a label.
 */
export interface SelectOptionGroup {
  /** Group label */
  label: string
  /** Options in this group */
  options: SelectOption[]
}

/**
 * Type for either a flat option or a group.
 */
export type SelectItem = SelectOption | SelectOptionGroup

/**
 * Helper to check if an item is a group.
 */
function isGroup(item: SelectItem): item is SelectOptionGroup {
  return 'options' in item
}

/**
 * Props for the Select component.
 *
 * @example
 * ```tsx
 * <Select
 *   options={[
 *     { label: 'Group A', options: [
 *       { label: 'Option 1', value: '1' },
 *       { label: 'Option 2', value: '2' },
 *     ]},
 *     { label: 'Option 3', value: '3' },
 *   ]}
 *   value={selected}
 *   onChange={setSelected}
 *   placeholder="Select an option"
 *   searchable
 * />
 * ```
 */
export interface SelectProps {
  /** Options (flat or grouped) */
  options: SelectItem[]
  /** Current value (single select) */
  value?: string | string[] | null
  /** Default value */
  defaultValue?: string | string[]
  /** Callback when value changes */
  onChange?: (value: string | string[] | null) => void
  /** Whether to enable multi-select */
  multiple?: boolean
  /** Whether to enable search/filter in the dropdown */
  searchable?: boolean
  /** Placeholder text */
  placeholder?: string
  /** Error message */
  error?: string
  /** Whether the select is disabled */
  disabled?: boolean
  /** Whether the select is in a loading state */
  loading?: boolean
  /** Whether to show a clear button */
  clearable?: boolean
  /** Label text */
  label?: string
  /** Helper text */
  helperText?: string
  /** Size variant */
  size?: 'sm' | 'md' | 'lg'
  /** Additional class names */
  className?: string
}

/** Size styles */
const sizeStyles: Record<string, string> = {
  sm: 'h-8 text-sm rounded-lg px-3',
  md: 'h-10 text-sm rounded-xl px-4',
  lg: 'h-12 text-base rounded-xl px-4',
}

/** Menu animation variants */
const menuVariants = {
  hidden: { opacity: 0, y: -4 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.15 } },
  exit: { opacity: 0, y: -4, transition: { duration: 0.1 } },
}

/**
 * A custom select dropdown with search, groups, multi-select option,
 * placeholder, error state, and clear button.
 */
export const Select = forwardRef<HTMLButtonElement, SelectProps>(
  (
    {
      options,
      value: controlledValue,
      defaultValue,
      onChange,
      multiple = false,
      searchable = false,
      placeholder = 'Select...',
      error,
      disabled = false,
      loading = false,
      clearable = true,
      label,
      helperText,
      size = 'md',
      className,
    },
    ref
  ) => {
    const selectId = useId()
    const menuId = useId()
    const containerRef = useRef<HTMLDivElement>(null)
    const searchInputRef = useRef<HTMLInputElement>(null)

    const [internalValue, setInternalValue] = useState<string | string[] | null>(
      defaultValue ?? null
    )
    const [isOpen, setIsOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [focusedIndex, setFocusedIndex] = useState(-1)

    const currentValue = controlledValue !== undefined ? controlledValue : internalValue
    const isControlled = controlledValue !== undefined

    // Flatten all options for easy lookup
    const allOptions = useMemo(() => {
      const flat: SelectOption[] = []
      for (const item of options) {
        if (isGroup(item)) {
          flat.push(...item.options)
        } else {
          flat.push(item)
        }
      }
      return flat
    }, [options])

    // Filter options by search query
    const filteredOptions = useMemo(() => {
      if (!searchQuery) return options
      const lowerQuery = searchQuery.toLowerCase()
      return options
        .map((item) => {
          if (isGroup(item)) {
            const filtered = item.options.filter((opt) =>
              opt.label.toLowerCase().includes(lowerQuery)
            )
            return filtered.length > 0 ? { ...item, options: filtered } : null
          }
          return item.label.toLowerCase().includes(lowerQuery) ? item : null
        })
        .filter(Boolean) as SelectItem[]
    }, [options, searchQuery])

    // Filtered flat options for index tracking
    const filteredFlatOptions = useMemo(() => {
      const flat: SelectOption[] = []
      for (const item of filteredOptions) {
        if (isGroup(item)) {
          flat.push(...item.options)
        } else {
          flat.push(item)
        }
      }
      return flat
    }, [filteredOptions])

    const updateValue = useCallback(
      (newValue: string | string[] | null) => {
        if (!isControlled) setInternalValue(newValue)
        onChange?.(newValue)
      },
      [isControlled, onChange]
    )

    const isSelected = useCallback(
      (optValue: string) => {
        if (multiple) {
          return Array.isArray(currentValue) && currentValue.includes(optValue)
        }
        return currentValue === optValue
      },
      [multiple, currentValue]
    )

    const handleSelect = useCallback(
      (optValue: string) => {
        if (multiple) {
          const current = Array.isArray(currentValue) ? [...currentValue] : []
          const index = current.indexOf(optValue)
          if (index >= 0) {
            current.splice(index, 1)
          } else {
            current.push(optValue)
          }
          updateValue(current.length > 0 ? current : null)
        } else {
          updateValue(optValue)
          setIsOpen(false)
          setSearchQuery('')
        }
      },
      [multiple, currentValue, updateValue]
    )

    const handleClear = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation()
        updateValue(null)
        onChange?.(null)
      },
      [updateValue, onChange]
    )

    // Click outside to close
    useEffect(() => {
      if (!isOpen) return
      const handleClick = (e: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
          setIsOpen(false)
          setSearchQuery('')
        }
      }
      document.addEventListener('mousedown', handleClick)
      return () => document.removeEventListener('mousedown', handleClick)
    }, [isOpen])

    // Focus search input when opened
    useEffect(() => {
      if (isOpen && searchable) {
        setTimeout(() => searchInputRef.current?.focus(), 50)
      }
    }, [isOpen, searchable])

    // Keyboard navigation
    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if (!isOpen) {
          if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
            e.preventDefault()
            setIsOpen(true)
          }
          return
        }

        switch (e.key) {
          case 'ArrowDown':
            e.preventDefault()
            setFocusedIndex((prev) =>
              prev < filteredFlatOptions.length - 1 ? prev + 1 : 0
            )
            break
          case 'ArrowUp':
            e.preventDefault()
            setFocusedIndex((prev) =>
              prev > 0 ? prev - 1 : filteredFlatOptions.length - 1
            )
            break
          case 'Enter':
            e.preventDefault()
            if (focusedIndex >= 0 && focusedIndex < filteredFlatOptions.length) {
              const option = filteredFlatOptions[focusedIndex]
              if (!option.disabled) {
                handleSelect(option.value)
              }
            }
            break
          case 'Escape':
            e.preventDefault()
            setIsOpen(false)
            setSearchQuery('')
            break
          case 'Backspace':
            if (!searchable && multiple && Array.isArray(currentValue) && currentValue.length > 0) {
              updateValue(currentValue.slice(0, -1))
            }
            break
        }
      },
      [isOpen, focusedIndex, filteredFlatOptions, searchable, multiple, currentValue, handleSelect, updateValue]
    )

    // Get display text for selected value
    const getDisplayText = useCallback(() => {
      if (multiple) {
        if (!Array.isArray(currentValue) || currentValue.length === 0) return null
        if (currentValue.length === 1) {
          const opt = allOptions.find((o) => o.value === currentValue[0])
          return opt?.label || currentValue[0]
        }
        return `${currentValue.length} items selected`
      }
      if (!currentValue) return null
      const opt = allOptions.find((o) => o.value === currentValue)
      return opt?.label || currentValue
    }, [multiple, currentValue, allOptions])

    const displayText = getDisplayText()
    const hasError = !!error

    return (
      <div ref={containerRef} className={clsx('relative w-full', className)} onKeyDown={handleKeyDown}>
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-medium text-surface-800 dark:text-surface-200 mb-1.5"
          >
            {label}
            {/* Required could be handled here */}
          </label>
        )}

        {/* Trigger */}
        <button
          ref={ref}
          id={selectId}
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled || loading}
          className={clsx(
            'flex w-full items-center justify-between gap-2 border bg-white dark:bg-surface-900',
            'transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-offset-1',
            'focus:ring-primary-500 dark:focus:ring-primary-400 dark:focus:ring-offset-surface-950',
            hasError
              ? 'border-danger-500 dark:border-danger-400'
              : isOpen
                ? 'border-primary-500 dark:border-primary-400'
                : 'border-surface-300 dark:border-surface-700 hover:border-surface-400 dark:hover:border-surface-600',
            'disabled:cursor-not-allowed disabled:opacity-50',
            sizeStyles[size]
          )}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-controls={menuId}
        >
          {/* Selected text / placeholder */}
          <span className={clsx('truncate text-left', !displayText && 'text-surface-400 dark:text-surface-500')}>
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 size={16} className="animate-spin" />
                Loading...
              </span>
            ) : displayText ? (
              multiple && Array.isArray(currentValue) ? (
                <span className="flex flex-wrap gap-1">
                  {currentValue.map((v) => {
                    const opt = allOptions.find((o) => o.value === v)
                    return (
                      <span
                        key={v}
                        className="inline-flex items-center gap-1 rounded-md bg-primary-100 dark:bg-primary-900/40 px-2 py-0.5 text-xs font-medium text-primary-800 dark:text-primary-300"
                      >
                        {opt?.label || v}
                      </span>
                    )
                  })}
                </span>
              ) : (
                displayText
              )
            ) : (
              placeholder
            )}
          </span>

          {/* Right icons */}
          <span className="flex items-center gap-1 flex-shrink-0">
            {clearable && currentValue && !disabled && (
              <span
                onClick={handleClear}
                className="p-0.5 rounded text-surface-400 hover:text-surface-600 dark:hover:text-surface-300 transition-colors"
                role="button"
                aria-label="Clear selection"
              >
                <X size={14} />
              </span>
            )}
            <ChevronDown
              size={16}
              className={clsx(
                'text-surface-400 transition-transform duration-200',
                isOpen && 'rotate-180'
              )}
            />
          </span>
        </button>

        {/* Dropdown menu */}
        {isOpen && (
          <div
            id={menuId}
            role="listbox"
            aria-multiselectable={multiple || undefined}
            className={clsx(
              'absolute z-50 mt-1 w-full overflow-hidden rounded-xl',
              'bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-700',
              'shadow-lg dark:shadow-xl',
              'py-1 animate-fade-in'
            )}
          >
            {/* Search input */}
            {searchable && (
              <div className="border-b border-surface-200 dark:border-surface-700 px-2 py-1.5">
                <div className="flex items-center gap-2 rounded-lg bg-surface-50 dark:bg-surface-800 px-2">
                  <Search size={14} className="text-surface-400" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value)
                      setFocusedIndex(-1)
                    }}
                    className="flex-1 bg-transparent py-1 text-sm outline-none text-surface-800 dark:text-surface-200 placeholder:text-surface-400"
                    placeholder="Search..."
                    aria-label="Search options"
                  />
                </div>
              </div>
            )}

            {/* Options */}
            <div className="max-h-60 overflow-y-auto">
              {filteredFlatOptions.length === 0 ? (
                <p className="px-3 py-4 text-center text-sm text-surface-400 dark:text-surface-500">
                  No options found
                </p>
              ) : (
                filteredOptions.map((item, groupIdx) => {
                  if (isGroup(item)) {
                    return (
                      <div key={`group-${groupIdx}`}>
                        <p className="px-3 py-1.5 text-xs font-medium text-surface-400 dark:text-surface-500 uppercase tracking-wider">
                          {item.label}
                        </p>
                        {item.options.map((option) => {
                          const flatIdx = filteredFlatOptions.findIndex((o) => o.value === option.value)
                          return (
                            <button
                              key={option.value}
                              type="button"
                              role="option"
                              aria-selected={isSelected(option.value)}
                              onClick={() => handleSelect(option.value)}
                              disabled={option.disabled}
                              className={clsx(
                                'flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors text-left',
                                option.disabled
                                  ? 'opacity-40 cursor-not-allowed'
                                  : 'hover:bg-surface-100 dark:hover:bg-surface-800',
                                isSelected(option.value) &&
                                  'bg-primary-50 dark:bg-primary-950/30 text-primary-700 dark:text-primary-300',
                                focusedIndex === flatIdx && 'bg-surface-100 dark:bg-surface-800'
                              )}
                            >
                              {multiple && (
                                <span
                                  className={clsx(
                                    'flex items-center justify-center w-4 h-4 rounded border flex-shrink-0',
                                    isSelected(option.value)
                                      ? 'bg-primary-600 border-primary-600'
                                      : 'border-surface-300 dark:border-surface-600'
                                  )}
                                >
                                  {isSelected(option.value) && <Check size={12} className="text-white" />}
                                </span>
                              )}
                              {option.icon && <span className="flex-shrink-0" aria-hidden="true">{option.icon}</span>}
                              <span className="flex-1 truncate">{option.label}</span>
                              {!multiple && isSelected(option.value) && (
                                <Check size={14} className="text-primary-600 dark:text-primary-400 flex-shrink-0" />
                              )}
                            </button>
                          )
                        })}
                      </div>
                    )
                  }

                  const option = item
                  const flatIdx = filteredFlatOptions.findIndex((o) => o.value === option.value)
                  return (
                    <button
                      key={option.value}
                      type="button"
                      role="option"
                      aria-selected={isSelected(option.value)}
                      onClick={() => handleSelect(option.value)}
                      disabled={option.disabled}
                      className={clsx(
                        'flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors text-left',
                        option.disabled
                          ? 'opacity-40 cursor-not-allowed'
                          : 'hover:bg-surface-100 dark:hover:bg-surface-800',
                        isSelected(option.value) &&
                          'bg-primary-50 dark:bg-primary-950/30 text-primary-700 dark:text-primary-300',
                        focusedIndex === flatIdx && 'bg-surface-100 dark:bg-surface-800'
                      )}
                    >
                      {multiple && (
                        <span
                          className={clsx(
                            'flex items-center justify-center w-4 h-4 rounded border flex-shrink-0',
                            isSelected(option.value)
                              ? 'bg-primary-600 border-primary-600'
                              : 'border-surface-300 dark:border-surface-600'
                          )}
                        >
                          {isSelected(option.value) && <Check size={12} className="text-white" />}
                        </span>
                      )}
                      {option.icon && <span className="flex-shrink-0" aria-hidden="true">{option.icon}</span>}
                      <span className="flex-1 truncate">{option.label}</span>
                      {!multiple && isSelected(option.value) && (
                        <Check size={14} className="text-primary-600 dark:text-primary-400 flex-shrink-0" />
                      )}
                    </button>
                  )
                })
              )}
            </div>
          </div>
        )}

        {/* Error / Helper */}
        {hasError && (
          <p className="mt-1.5 text-sm text-danger-600 dark:text-danger-400" role="alert">
            {error}
          </p>
        )}
        {!hasError && helperText && (
          <p className="mt-1.5 text-sm text-surface-500 dark:text-surface-400">{helperText}</p>
        )}
      </div>
    )
  }
)

Select.displayName = 'Select'
