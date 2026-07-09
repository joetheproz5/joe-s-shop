import React, { useState, useCallback, useRef, useEffect, useId } from 'react'
import { clsx } from '@/lib/utils'

/**
 * Props for the PriceSlider component.
 *
 * @example
 * ```tsx
 * <PriceSlider
 *   min={0}
 *   max={1000}
 *   value={[100, 500]}
 *   onChange={setPriceRange}
 *   currency="USD"
 *   label="Price Range"
 * />
 * ```
 */
export interface PriceSliderProps {
  /** Minimum value of the range */
  min: number
  /** Maximum value of the range */
  max: number
  /** Current range values [minValue, maxValue] */
  value?: [number, number]
  /** Default range values */
  defaultValue?: [number, number]
  /** Callback when range changes */
  onChange?: (value: [number, number]) => void
  /** Step increment */
  step?: number
  /** Currency code for formatting */
  currency?: string
  /** Label text */
  label?: string
  /** Whether the slider is disabled */
  disabled?: boolean
  /** Additional class names */
  className?: string
}

/** Format a number as currency */
function formatPrice(value: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

/**
 * A dual-handle price range slider with min/max inputs and currency formatting.
 * Designed for shop filter use cases.
 */
export function PriceSlider({
  min,
  max,
  value: controlledValue,
  defaultValue,
  onChange,
  step = 1,
  currency = 'USD',
  label,
  disabled = false,
  className,
}: PriceSliderProps) {
  const sliderId = useId()
  const [internalValue, setInternalValue] = useState<[number, number]>(
    defaultValue || [min, max]
  )
  const [dragging, setDragging] = useState<'min' | 'max' | null>(null)
  const trackRef = useRef<HTMLDivElement>(null)

  const currentValue = controlledValue || internalValue
  const isControlled = !!controlledValue

  const updateValue = useCallback(
    (newValue: [number, number]) => {
      if (!isControlled) setInternalValue(newValue)
      onChange?.(newValue)
    },
    [isControlled, onChange]
  )

  const getPercentage = useCallback((value: number) => {
    return ((value - min) / (max - min)) * 100
  }, [min, max])

  const getValueFromPosition = useCallback(
    (clientX: number) => {
      if (!trackRef.current) return currentValue[0]
      const rect = trackRef.current.getBoundingClientRect()
      const percentage = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100))
      const rawValue = min + (percentage / 100) * (max - min)
      return Math.round(rawValue / step) * step
    },
    [min, max, step, currentValue]
  )

  // Drag handlers
  useEffect(() => {
    if (!dragging) return

    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault()
      const newValue = getValueFromPosition(e.clientX)
      updateValue(
        dragging === 'min'
          ? [Math.min(newValue, currentValue[1] - step), currentValue[1]]
          : [currentValue[0], Math.max(newValue, currentValue[0] + step)]
      )
    }

    const handleMouseUp = () => setDragging(null)

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [dragging, getValueFromPosition, updateValue, currentValue, step])

  const handleInputChange = useCallback(
    (handle: 'min' | 'max', inputValue: string) => {
      const parsed = Number(inputValue)
      if (isNaN(parsed)) return

      if (handle === 'min') {
        const clamped = Math.max(min, Math.min(parsed, currentValue[1] - step))
        updateValue([clamped, currentValue[1]])
      } else {
        const clamped = Math.min(max, Math.max(parsed, currentValue[0] + step))
        updateValue([currentValue[0], clamped])
      }
    },
    [min, max, step, currentValue, updateValue]
  )

  const minPercent = getPercentage(currentValue[0])
  const maxPercent = getPercentage(currentValue[1])

  return (
    <div className={clsx('w-full', className)}>
      {label && (
        <label id={sliderId} className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-3">
          {label}
        </label>
      )}

      {/* Slider track */}
      <div
        ref={trackRef}
        className={clsx(
          'relative h-2 rounded-full bg-surface-200 dark:bg-surface-700 select-none',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
        role="group"
        aria-labelledby={label ? sliderId : undefined}
      >
        {/* Active range */}
        <div
          className="absolute h-full rounded-full bg-primary-500 dark:bg-primary-400"
          style={{ left: `${minPercent}%`, right: `${100 - maxPercent}%` }}
          aria-hidden="true"
        />

        {/* Min handle */}
        <button
          type="button"
          disabled={disabled}
          className={clsx(
            'absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-5 rounded-full',
            'bg-white dark:bg-surface-100 border-2 border-primary-500 dark:border-primary-400',
            'shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1',
            'dark:focus:ring-offset-surface-900',
            'transition-shadow',
            disabled && 'cursor-not-allowed'
          )}
          style={{ left: `${minPercent}%` }}
          onMouseDown={() => !disabled && setDragging('min')}
          aria-label={`Minimum price: ${formatPrice(currentValue[0], currency)}`}
          aria-valuemin={min}
          aria-valuemax={currentValue[1]}
          aria-valuenow={currentValue[0]}
          role="slider"
          tabIndex={disabled ? -1 : 0}
        />

        {/* Max handle */}
        <button
          type="button"
          disabled={disabled}
          className={clsx(
            'absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-5 h-5 rounded-full',
            'bg-white dark:bg-surface-100 border-2 border-primary-500 dark:border-primary-400',
            'shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1',
            'dark:focus:ring-offset-surface-900',
            'transition-shadow',
            disabled && 'cursor-not-allowed'
          )}
          style={{ left: `${maxPercent}%` }}
          onMouseDown={() => !disabled && setDragging('max')}
          aria-label={`Maximum price: ${formatPrice(currentValue[1], currency)}`}
          aria-valuemin={currentValue[0]}
          aria-valuemax={max}
          aria-valuenow={currentValue[1]}
          role="slider"
          tabIndex={disabled ? -1 : 0}
        />
      </div>

      {/* Min/Max inputs */}
      <div className="flex items-center gap-3 mt-3">
        <div className="flex-1">
          <label className="sr-only" htmlFor={`${sliderId}-min`}>Minimum price</label>
          <div className="relative">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-surface-400 dark:text-surface-500">
              {currency}
            </span>
            <input
              id={`${sliderId}-min`}
              type="number"
              min={min}
              max={currentValue[1] - step}
              step={step}
              value={currentValue[0]}
              onChange={(e) => handleInputChange('min', e.target.value)}
              disabled={disabled}
              className={clsx(
                'w-full rounded-lg border border-surface-300 dark:border-surface-600',
                'bg-white dark:bg-surface-800 text-sm text-surface-800 dark:text-surface-200',
                'pl-8 pr-2 py-1.5',
                'focus:outline-none focus:ring-2 focus:ring-primary-500',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            />
          </div>
        </div>

        <span className="text-surface-400 dark:text-surface-500 text-sm">to</span>

        <div className="flex-1">
          <label className="sr-only" htmlFor={`${sliderId}-max`}>Maximum price</label>
          <div className="relative">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-surface-400 dark:text-surface-500">
              {currency}
            </span>
            <input
              id={`${sliderId}-max`}
              type="number"
              min={currentValue[0] + step}
              max={max}
              step={step}
              value={currentValue[1]}
              onChange={(e) => handleInputChange('max', e.target.value)}
              disabled={disabled}
              className={clsx(
                'w-full rounded-lg border border-surface-300 dark:border-surface-600',
                'bg-white dark:bg-surface-800 text-sm text-surface-800 dark:text-surface-200',
                'pl-8 pr-2 py-1.5',
                'focus:outline-none focus:ring-2 focus:ring-primary-500',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
