import { useId } from 'react'
import { clsx } from '@/lib/utils'
import {
  getLebaneseSubscriberNumber,
  LEBANESE_PHONE_PLACEHOLDER,
  toLebanesePhoneNumber,
} from '@/lib/lebanon'

interface LebanesePhoneInputProps {
  value: string
  onChange: (value: string) => void
  label?: string
  required?: boolean
  error?: string
  autoComplete?: string
}

export function LebanesePhoneInput({
  value,
  onChange,
  label = 'Lebanese phone',
  required = false,
  error,
  autoComplete = 'tel',
}: LebanesePhoneInputProps) {
  const id = useId()
  const errorId = `${id}-error`
  const helperId = `${id}-helper`
  const subscriberNumber = getLebaneseSubscriberNumber(value)

  return (
    <div className="w-full">
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-surface-800 dark:text-surface-200">
        {label}
        {required && <span className="ml-0.5 text-danger-500" aria-hidden="true">*</span>}
      </label>
      <div
        className={clsx(
          'flex w-full overflow-hidden rounded-xl border bg-white transition-all duration-200 dark:bg-surface-900',
          'focus-within:ring-2 focus-within:ring-primary-500 focus-within:ring-offset-1 dark:focus-within:ring-primary-400 dark:focus-within:ring-offset-surface-950',
          error
            ? 'border-danger-500 dark:border-danger-400'
            : 'border-surface-300 hover:border-surface-400 dark:border-surface-700 dark:hover:border-surface-600'
        )}
      >
        <span className="flex shrink-0 items-center border-r border-surface-200 bg-surface-50 px-3 text-sm font-medium text-surface-600 dark:border-surface-700 dark:bg-surface-800 dark:text-surface-300">
          +961
        </span>
        <input
          id={id}
          type="tel"
          inputMode="numeric"
          autoComplete={autoComplete}
          value={subscriberNumber}
          onChange={(event) => onChange(toLebanesePhoneNumber(event.target.value))}
          onPaste={(event) => {
            event.preventDefault()
            onChange(toLebanesePhoneNumber(event.clipboardData.getData('text')))
          }}
          placeholder={LEBANESE_PHONE_PLACEHOLDER}
          maxLength={8}
          minLength={7}
          pattern="[0-9]{7,8}"
          required={required}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={error ? errorId : helperId}
          className="min-w-0 flex-1 bg-transparent px-4 py-2.5 text-sm text-surface-900 outline-none placeholder:text-surface-400 dark:text-surface-100 dark:placeholder:text-surface-500"
        />
      </div>
      {error ? (
        <p id={errorId} className="mt-1.5 text-sm text-danger-600 dark:text-danger-400" role="alert">{error}</p>
      ) : (
        <p id={helperId} className="mt-1.5 text-sm text-surface-500 dark:text-surface-400">
          Enter 7 or 8 digits without the leading zero.
        </p>
      )}
    </div>
  )
}
