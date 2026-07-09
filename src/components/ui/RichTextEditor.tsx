import React, { useCallback, useRef, useEffect, useState, useId, forwardRef } from 'react'
import {
  Bold,
  Italic,
  Underline,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Link2,
  Image,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Undo,
  Redo,
  Code,
  Quote,
  Minus,
} from 'lucide-react'
import { clsx } from '@/lib/utils'

/**
 * Props for the RichTextEditor component.
 *
 * @example
 * ```tsx
 * <RichTextEditor
 *   value={content}
 *   onChange={setContent}
 *   placeholder="Write something..."
 *   label="Description"
 * />
 * ```
 */
export interface RichTextEditorProps {
  /** HTML content (controlled) */
  value?: string
  /** Callback when content changes */
  onChange?: (html: string) => void
  /** Placeholder text */
  placeholder?: string
  /** Label text */
  label?: string
  /** Error message */
  error?: string
  /** Helper text */
  helperText?: string
  /** Whether the editor is read-only */
  readOnly?: boolean
  /** Minimum height in pixels */
  minHeight?: number
  /** Maximum height in pixels */
  maxHeight?: number
  /** Toolbar buttons to show (all shown if not provided) */
  toolbar?: string[]
  /** Additional class names for the wrapper */
  className?: string
}

/** All available toolbar actions */
const ALL_TOOLBAR_ITEMS = [
  'undo',
  'redo',
  '|',
  'heading1',
  'heading2',
  'heading3',
  '|',
  'bold',
  'italic',
  'underline',
  '|',
  'unorderedList',
  'orderedList',
  '|',
  'link',
  'image',
  '|',
  'alignLeft',
  'alignCenter',
  'alignRight',
  '|',
  'code',
  'blockquote',
  'hr',
] as const

/** Toolbar action definitions */
const TOOLBAR_ACTIONS: Record<
  string,
  { icon: React.ReactNode; label: string; command: string; argument?: string }
> = {
  heading1: { icon: <Heading1 size={16} />, label: 'Heading 1', command: 'formatBlock', argument: 'h1' },
  heading2: { icon: <Heading2 size={16} />, label: 'Heading 2', command: 'formatBlock', argument: 'h2' },
  heading3: { icon: <Heading3 size={16} />, label: 'Heading 3', command: 'formatBlock', argument: 'h3' },
  bold: { icon: <Bold size={16} />, label: 'Bold', command: 'bold' },
  italic: { icon: <Italic size={16} />, label: 'Italic', command: 'italic' },
  underline: { icon: <Underline size={16} />, label: 'Underline', command: 'underline' },
  unorderedList: { icon: <List size={16} />, label: 'Bullet List', command: 'insertUnorderedList' },
  orderedList: { icon: <ListOrdered size={16} />, label: 'Numbered List', command: 'insertOrderedList' },
  link: { icon: <Link2 size={16} />, label: 'Insert Link', command: 'createLink', argument: 'https://' },
  image: { icon: <Image size={16} />, label: 'Insert Image', command: 'insertImage', argument: 'https://' },
  alignLeft: { icon: <AlignLeft size={16} />, label: 'Align Left', command: 'justifyLeft' },
  alignCenter: { icon: <AlignCenter size={16} />, label: 'Align Center', command: 'justifyCenter' },
  alignRight: { icon: <AlignRight size={16} />, label: 'Align Right', command: 'justifyRight' },
  code: { icon: <Code size={16} />, label: 'Inline Code', command: 'formatBlock', argument: 'pre' },
  blockquote: { icon: <Quote size={16} />, label: 'Block Quote', command: 'formatBlock', argument: 'blockquote' },
  hr: { icon: <Minus size={16} />, label: 'Horizontal Rule', command: 'insertHorizontalRule' },
  undo: { icon: <Undo size={16} />, label: 'Undo', command: 'undo' },
  redo: { icon: <Redo size={16} />, label: 'Redo', command: 'redo' },
}

/**
 * A simple rich text editor with toolbar for basic formatting (bold, italic,
 * underline, headings, lists, links, images, alignment) using a contentEditable
 * div. No external dependency required.
 */
export const RichTextEditor = forwardRef<HTMLDivElement, RichTextEditorProps>(
  (
    {
      value: controlledValue,
      onChange,
      placeholder = 'Start writing...',
      label,
      error,
      helperText,
      readOnly = false,
      minHeight = 200,
      maxHeight,
      toolbar,
      className,
    },
    ref
  ) => {
    const editorId = useId()
    const editorRef = useRef<HTMLDivElement | null>(null)
    const [isFocused, setIsFocused] = useState(false)
    const isControlled = controlledValue !== undefined

    // Sync controlled value to editor
    useEffect(() => {
      if (isControlled && editorRef.current) {
        if (editorRef.current.innerHTML !== controlledValue) {
          editorRef.current.innerHTML = controlledValue
        }
      }
    }, [isControlled, controlledValue])

    const handleInput = useCallback(() => {
      if (editorRef.current && onChange) {
        onChange(editorRef.current.innerHTML)
      }
    }, [onChange])

    const execCommand = useCallback(
      (command: string, argument?: string) => {
        editorRef.current?.focus()
        document.execCommand(command, false, argument)
        handleInput()
      },
      [handleInput]
    )

    const handleToolbarClick = useCallback(
      (action: string) => {
        if (action === '|') return

        if (action === 'link' || action === 'image') {
          // For links and images, prompt the user for the URL
          const url = window.prompt(`Enter ${action === 'link' ? 'link' : 'image'} URL:`)
          if (url) {
            execCommand(TOOLBAR_ACTIONS[action].command, url)
          }
          return
        }

        const toolbarAction = TOOLBAR_ACTIONS[action]
        if (toolbarAction) {
          execCommand(toolbarAction.command, toolbarAction.argument)
        }
      },
      [execCommand]
    )

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
      // Allow Tab to insert a tab
      if (e.key === 'Tab') {
        e.preventDefault()
        document.execCommand('insertText', false, '  ')
      }
    }, [])

    const activeToolbar = toolbar || [...ALL_TOOLBAR_ITEMS]

    return (
      <div className={clsx('w-full', className)}>
        {label && (
          <label
            htmlFor={editorId}
            className="block text-sm font-medium text-surface-800 dark:text-surface-200 mb-1.5"
          >
            {label}
          </label>
        )}

        {/* Toolbar */}
        <div
          className={clsx(
            'flex flex-wrap items-center gap-0.5 p-1.5 rounded-t-xl border border-b-0',
            'bg-surface-50 dark:bg-surface-800/50',
            'border-surface-300 dark:border-surface-700',
            isFocused && 'border-primary-500 dark:border-primary-400'
          )}
          role="toolbar"
          aria-label="Text formatting"
        >
          {activeToolbar.map((action, idx) => {
            if (action === '|') {
              return (
                <div
                  key={`sep-${idx}`}
                  className="w-px h-5 mx-1 bg-surface-300 dark:bg-surface-600"
                  role="separator"
                  aria-hidden="true"
                />
              )
            }

            const toolbarAction = TOOLBAR_ACTIONS[action]
            if (!toolbarAction) return null

            return (
              <button
                key={action}
                type="button"
                onMouseDown={(e) => e.preventDefault()} // Prevent focus loss from contentEditable
                onClick={() => handleToolbarClick(action)}
                disabled={readOnly}
                className={clsx(
                  'rounded-lg p-1.5 text-surface-500 dark:text-surface-400 transition-colors',
                  'hover:bg-surface-200 dark:hover:bg-surface-700 hover:text-surface-700 dark:hover:text-surface-300',
                  'focus:outline-none focus:ring-2 focus:ring-primary-500',
                  'disabled:opacity-40 disabled:cursor-not-allowed'
                )}
                title={toolbarAction.label}
                aria-label={toolbarAction.label}
              >
                {toolbarAction.icon}
              </button>
            )
          })}
        </div>

        {/* Editor area */}
        <div
          ref={(node) => {
            editorRef.current = node
            if (typeof ref === 'function') ref(node)
            else if (ref) {
              ;(ref as React.MutableRefObject<HTMLDivElement | null>).current = node
            }
          }}
          id={editorId}
          contentEditable={!readOnly}
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          data-placeholder={placeholder}
          className={clsx(
            'w-full rounded-b-xl border px-4 py-3 text-sm leading-relaxed',
            'bg-white dark:bg-surface-900 text-surface-800 dark:text-surface-200',
            'outline-none transition-all duration-200',
            'overflow-y-auto',
            isFocused
              ? 'border-primary-500 dark:border-primary-400 ring-1 ring-primary-500 dark:ring-primary-400'
              : error
                ? 'border-danger-500 dark:border-danger-400'
                : 'border-surface-300 dark:border-surface-700 hover:border-surface-400 dark:hover:border-surface-600',
            readOnly && 'cursor-not-allowed opacity-60'
          )}
          style={{ minHeight, maxHeight: maxHeight ? maxHeight : undefined }}
          role="textbox"
          aria-multiline="true"
          aria-label={label || 'Rich text editor'}
          aria-placeholder={placeholder}
          aria-invalid={!!error}
          suppressContentEditableWarning
        />

        {/* Error / Helper */}
        {error && (
          <p className="mt-1.5 text-sm text-danger-600 dark:text-danger-400" role="alert">
            {error}
          </p>
        )}
        {!error && helperText && (
          <p className="mt-1.5 text-sm text-surface-500 dark:text-surface-400">{helperText}</p>
        )}
      </div>
    )
  }
)

RichTextEditor.displayName = 'RichTextEditor'
