import { supabase, getPublicUrl } from '@/lib/supabase'
import { STORAGE_BUCKETS } from '@/lib/constants'
import type { Media, MediaType } from '@/types'

// ─────────────────────────────────────────────
// Upload
// ─────────────────────────────────────────────

export interface UploadResult {
  name: string
  url: string
  size: number
  type: MediaType
}

export async function uploadMedia(
  file: File,
  folder?: string
): Promise<UploadResult> {
  const bucket = STORAGE_BUCKETS.media
  const ext = file.name.split('.').pop() || ''
  const mediaType = getMediaType(ext)
  const timestamp = Date.now()
  const path = folder
    ? `${folder}/${timestamp}-${file.name}`
    : `${timestamp}-${file.name}`

  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, file, { cacheControl: '3600', upsert: false })

  if (error) throw new Error(error.message)

  const url = getPublicUrl(bucket, path)

  return {
    name: file.name,
    url,
    size: file.size,
    type: mediaType,
  }
}

export async function uploadMultipleMedia(
  files: File[],
  folder?: string
): Promise<UploadResult[]> {
  const uploads = files.map((file) => uploadMedia(file, folder))
  const results = await Promise.allSettled(uploads)

  return results
    .filter((r): r is PromiseFulfilledResult<UploadResult> => r.status === 'fulfilled')
    .map((r) => r.value)
}

// ─────────────────────────────────────────────
// List
// ─────────────────────────────────────────────

export async function listMedia(
  folder?: string,
  limit: number = 50,
  offset: number = 0
): Promise<Media[]> {
  const bucket = STORAGE_BUCKETS.media
  const path = folder || ''

  const { data, error } = await supabase.storage
    .from(bucket)
    .list(path, {
      limit,
      offset,
      sortBy: { column: 'created_at', order: 'desc' },
    })

  if (error) throw new Error(error.message)

  return (data || []).map((item) => ({
    id: item.id || '',
    name: item.name,
    url: getPublicUrl(bucket, `${path}/${item.name}`),
    type: getMediaType(item.name.split('.').pop() || ''),
    size: item.metadata?.size || 0,
    folder: path || undefined,
    metadata: item.metadata ?? undefined,
    created_at: item.created_at || '',
  }))
}

// ─────────────────────────────────────────────
// Delete
// ─────────────────────────────────────────────

export async function deleteMedia(paths: string[]): Promise<void> {
  const bucket = STORAGE_BUCKETS.media
  const { error } = await supabase.storage
    .from(bucket)
    .remove(paths)

  if (error) throw new Error(error.message)
}

export async function deleteMediaFile(path: string): Promise<void> {
  await deleteMedia([path])
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function getMediaType(ext: string): MediaType {
  const lower = ext.toLowerCase()
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico'].includes(lower)) {
    return 'image'
  }
  if (['mp4', 'webm', 'mov', 'avi'].includes(lower)) {
    return 'video'
  }
  if (['pdf'].includes(lower)) {
    return 'pdf'
  }
  return 'document'
}
