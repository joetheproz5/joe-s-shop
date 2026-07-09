import React, { useEffect, useCallback, useRef, useId } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { clsx } from '@/lib/utils'

/**
 * Props for the Modal component.
 *
 * @example
 * ```tsx
 * <Modal isOpen={true} onClose={() => setOpen(false)} title="Confirm Action">
 *   <Modal.Body>Are you sure?</Modal.Body>
 *   <Modal.Footer>
 *     <Button onClick={handleConfirm}>Confirm</Button>
 *   </Modal.Footer>
 * </Modal>
 * ```
 */
export interface ModalProps {
  /** Whether the modal is currently visible */
  isOpen: boolean
  /** Callback fired when the modal should close */
  onClose: () => void
  /** Title displayed in the modal header */
  title?: string
  /** Additional class names for the modal panel */
  className?: string
  /** Content of the modal */
  children: React.ReactNode
  /** Size variant */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  /** Whether clicking the overlay closes the modal */
  closeOnOverlayClick?: boolean
  /** Whether the close button is shown in the header */
  showCloseButton?: boolean
  /** Accessible label for the close button */
  closeLabel?: string
}

/** Size styles */
const sizeStyles: Record<string, string> = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-[calc(100vw-2rem)] max-h-[calc(100vh-2rem)]',
}

/** Panel variants */
const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
}

const panelVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 10 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 25 },
  },
  exit: { opacity: 0, scale: 0.97, y: 5 },
}

/**
 * Modal.Body - renders the main content area of the modal.
 */
export function ModalBody({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={clsx('px-6 py-4', className)}>{children}</div>
}

/**
 * Modal.Footer - renders the footer area with actions.
 */
export function ModalFooter({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={clsx(
        'flex items-center justify-end gap-3 border-t border-surface-200 dark:border-surface-700 px-6 py-4'
      )}
    >
      <div className={clsx('flex items-center gap-3 w-full', className)}>{children}</div>
    </div>
  )
}

/**
 * An accessible modal dialog with overlay, enter/exit animations via framer-motion,
 * focus trapping, and click-outside-to-close behavior.
 *
 * Renders via a React portal into document.body.
 */
export function Modal({
  isOpen,
  onClose,
  title,
  className,
  children,
  size = 'md',
  closeOnOverlayClick = true,
  showCloseButton = true,
  closeLabel = 'Close',
}: ModalProps) {
  const titleId = useId()
  const panelRef = useRef<HTMLDivElement>(null)

  // Focus trap: keep focus inside the modal
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
        return
      }

      if (e.key !== 'Tab' || !panelRef.current) return

      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
      )
      if (focusable.length === 0) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault()
          last.focus()
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    },
    [onClose]
  )

  useEffect(() => {
    if (!isOpen) return

    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'

    // Focus the panel on open
    const timer = setTimeout(() => {
      if (panelRef.current) {
        const firstFocusable = panelRef.current.querySelector<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        firstFocusable?.focus()
      }
    }, 50)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
      clearTimeout(timer)
    }
  }, [isOpen, handleKeyDown])

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (closeOnOverlayClick && e.target === e.currentTarget) {
        onClose()
      }
    },
    [closeOnOverlayClick, onClose]
  )

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? titleId : undefined}
        >
          {/* Overlay */}
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={handleOverlayClick}
            aria-hidden="true"
          />

          {/* Panel */}
          <motion.div
            ref={panelRef}
            className={clsx(
              'relative z-10 w-full rounded-2xl bg-white dark:bg-surface-900',
              'shadow-xl dark:shadow-2xl border border-surface-200 dark:border-surface-800',
              'flex flex-col max-h-[85vh]',
              sizeStyles[size],
              className
            )}
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            {(title || showCloseButton) && (
              <div className="flex items-center justify-between border-b border-surface-200 dark:border-surface-700 px-6 py-4">
                {title && (
                  <h2
                    id={titleId}
                    className="text-lg font-semibold text-surface-900 dark:text-surface-50"
                  >
                    {title}
                  </h2>
                )}
                {showCloseButton && (
                  <button
                    onClick={onClose}
                    className={clsx(
                      'ml-auto rounded-lg p-1.5 text-surface-400 transition-colors',
                      'hover:bg-surface-100 hover:text-surface-600',
                      'dark:hover:bg-surface-800 dark:hover:text-surface-300',
                      !title && 'ml-0'
                    )}
                    aria-label={closeLabel}
                  >
                    <X size={20} />
                  </button>
                )}
              </div>
            )}

            {/* Scrollable body */}
            <div className="overflow-y-auto">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  )
}

Modal.Body = ModalBody
Modal.Footer = ModalFooter
