import React, { useState, useRef, useCallback, useId } from 'react'
import { Upload, X, File, Image as ImageIcon, FileText, Film, Music, Loader2 } from 'lucide-react'
import { clsx } from '@/lib/utils'
import { formatFileSize } from '@/lib/utils'

/**
 * A file that has been added to the upload area.
 */
export interface UploadedFile {
  /** File object */
  file: File
  /** Unique id */
  id: string
  /** Upload progress (0-100) */
  progress?: number
  /** Error message if upload failed */
  error?: string
  /** Preview URL for images */
  preview?: string
}

/**
 * Props for the FileUpload component.
 *
 * @example
 * ```tsx
 * <FileUpload
 *   onFilesChange={handleFiles}
 *   accept={{ 'image/*': [] }}
 *   maxFiles={5}
 *   maxSize={10 * 1024 * 1024}
 *   label="Upload Images"
 * />
 * ```
 */
export interface FileUploadProps {
  /** Callback when the file list changes */
  onFilesChange?: (files: UploadedFile[]) => void
  /** Accepted file types as { [mime]: [] } object */
  accept?: Record<string, string[]>
  /** Maximum number of files */
  maxFiles?: number
  /** Maximum file size in bytes */
  maxSize?: number
  /** Whether to allow multiple files */
  multiple?: boolean
  /** Label text */
  label?: string
  /** Helper text */
  helperText?: string
  /** Whether the upload is disabled */
  disabled?: boolean
  /** Whether the component is in a loading/processing state */
  loading?: boolean
  /** Additional class names */
  className?: string
}

/** Get icon for file type */
function getFileIcon(file: File, size = 20) {
  if (file.type.startsWith('image/')) return <ImageIcon size={size} />
  if (file.type.startsWith('video/')) return <Film size={size} />
  if (file.type.startsWith('audio/')) return <Music size={size} />
  if (file.type.includes('pdf') || file.type.includes('document') || file.type.includes('text'))
    return <FileText size={size} />
  return <File size={size} />
}

/** Generate a unique id */
let fileIdCounter = 0
function nextFileId(): string {
  return `file-${++fileIdCounter}-${Date.now()}`
}

/**
 * A drag-and-drop file upload area with progress indication, multiple file
 * support, image previews, file type validation, and dashed border design.
 */
export function FileUpload({
  onFilesChange,
  accept,
  maxFiles = 10,
  maxSize = 50 * 1024 * 1024, // 50MB default
  multiple = true,
  label,
  helperText,
  disabled = false,
  loading = false,
  className,
}: FileUploadProps) {
  const inputId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [isDragging, setIsDragging] = useState(false)

  const updateFiles = useCallback(
    (newFiles: UploadedFile[]) => {
      setFiles(newFiles)
      onFilesChange?.(newFiles)
    },
    [onFilesChange]
  )

  const validateFile = useCallback(
    (file: File): string | null => {
      if (maxSize && file.size > maxSize) {
        return `File "${file.name}" exceeds maximum size of ${formatFileSize(maxSize)}`
      }
      if (accept) {
        const acceptedTypes = Object.keys(accept).flat()
        const matchesType = acceptedTypes.some((type) => {
          if (type.endsWith('/*')) {
            return file.type.startsWith(type.replace('/*', '/'))
          }
          return file.type === type || file.name.endsWith(`.${type.replace('.', '')}`)
        })
        if (!matchesType) {
          return `File type not supported: ${file.name}`
        }
      }
      return null
    },
    [accept, maxSize]
  )

  const addFiles = useCallback(
    (fileList: FileList | File[]) => {
      const newFiles: UploadedFile[] = [...files]

      for (const file of Array.from(fileList)) {
        if (newFiles.length >= maxFiles) break

        const error = validateFile(file)
        const preview = file.type.startsWith('image/')
          ? URL.createObjectURL(file)
          : undefined

        newFiles.push({
          file,
          id: nextFileId(),
          progress: 0,
          error: error || undefined,
          preview,
        })
      }

      updateFiles(newFiles)
    },
    [files, maxFiles, validateFile, updateFiles]
  )

  const removeFile = useCallback(
    (id: string) => {
      const fileToRemove = files.find((f) => f.id === id)
      if (fileToRemove?.preview) {
        URL.revokeObjectURL(fileToRemove.preview)
      }
      updateFiles(files.filter((f) => f.id !== id))
    },
    [files, updateFiles]
  )

  // Drag events
  const handleDragEnter = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      if (!disabled) setIsDragging(true)
    },
    [disabled]
  )

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)
      if (disabled || loading) return
      if (e.dataTransfer.files.length > 0) {
        addFiles(e.dataTransfer.files)
      }
    },
    [disabled, loading, addFiles]
  )

  const handleClick = useCallback(() => {
    if (!disabled && !loading) {
      inputRef.current?.click()
    }
  }, [disabled, loading])

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        addFiles(e.target.files)
        e.target.value = ''
      }
    },
    [addFiles]
  )

  return (
    <div className={clsx('w-full', className)}>
      {label && (
        <label className="block text-sm font-medium text-surface-800 dark:text-surface-200 mb-1.5">
          {label}
        </label>
      )}

      {/* Drop zone */}
      <div
        onClick={handleClick}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={clsx(
          'relative flex flex-col items-center justify-center gap-3 rounded-2xl p-8 border-2 border-dashed transition-all duration-200 cursor-pointer',
          isDragging
            ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/30'
            : 'border-surface-300 dark:border-surface-600 hover:border-primary-400 hover:bg-surface-50 dark:hover:bg-surface-800/50',
          disabled && 'opacity-50 cursor-not-allowed hover:border-surface-300 dark:hover:border-surface-600 hover:bg-transparent'
        )}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label="Upload files"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            handleClick()
          }
        }}
      >
        <div
          className={clsx(
            'flex items-center justify-center w-12 h-12 rounded-full',
            isDragging
              ? 'bg-primary-100 dark:bg-primary-900/50 text-primary-600 dark:text-primary-400'
              : 'bg-surface-100 dark:bg-surface-800 text-surface-400 dark:text-surface-500'
          )}
        >
          {loading ? (
            <Loader2 size={24} className="animate-spin" />
          ) : (
            <Upload size={24} />
          )}
        </div>

        <div className="text-center">
          <p className="text-sm font-medium text-surface-700 dark:text-surface-300">
            {loading ? 'Processing...' : 'Drag and drop files here, or click to browse'}
          </p>
          {helperText && (
            <p className="mt-1 text-xs text-surface-400 dark:text-surface-500">{helperText}</p>
          )}
        </div>

        <input
          ref={inputRef}
          id={inputId}
          type="file"
          multiple={multiple}
          accept={accept ? Object.keys(accept).join(',') : undefined}
          onChange={handleInputChange}
          className="sr-only"
          disabled={disabled}
          aria-hidden="true"
        />
      </div>

      {/* File list */}
      {files.length > 0 && (
        <ul className="mt-3 space-y-2">
          {files.map((uploadedFile) => (
            <li
              key={uploadedFile.id}
              className={clsx(
                'flex items-center gap-3 rounded-xl px-3 py-2 border',
                uploadedFile.error
                  ? 'border-danger-300 dark:border-danger-700 bg-danger-50 dark:bg-danger-950/20'
                  : 'border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-900'
              )}
            >
              {/* Preview or icon */}
              {uploadedFile.preview ? (
                <img
                  src={uploadedFile.preview}
                  alt={uploadedFile.file.name}
                  className="h-10 w-10 rounded-lg object-cover flex-shrink-0"
                />
              ) : (
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-surface-100 dark:bg-surface-800 text-surface-500 flex-shrink-0">
                  {getFileIcon(uploadedFile.file)}
                </div>
              )}

              {/* File info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-surface-800 dark:text-surface-200 truncate">
                  {uploadedFile.file.name}
                </p>
                <div className="flex items-center gap-2">
                  <p className="text-xs text-surface-400 dark:text-surface-500">
                    {formatFileSize(uploadedFile.file.size)}
                  </p>
                  {uploadedFile.error && (
                    <p className="text-xs text-danger-500 dark:text-danger-400">
                      {uploadedFile.error}
                    </p>
                  )}
                </div>

                {/* Progress bar */}
                {uploadedFile.progress !== undefined && uploadedFile.progress < 100 && (
                  <div className="mt-1 h-1 w-full rounded-full bg-surface-200 dark:bg-surface-700 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary-500 transition-all duration-300"
                      style={{ width: `${uploadedFile.progress}%` }}
                    />
                  </div>
                )}
              </div>

              {/* Remove button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  removeFile(uploadedFile.id)
                }}
                className="flex-shrink-0 rounded-lg p-1 text-surface-400 hover:text-danger-500 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
                aria-label={`Remove ${uploadedFile.file.name}`}
              >
                <X size={16} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
