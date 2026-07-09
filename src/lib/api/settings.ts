import { supabase } from '@/lib/supabase'
import type { Settings } from '@/types'

export async function fetchSettings(): Promise<Record<string, Settings>> {
  const { data, error } = await supabase
    .from('settings')
    .select('*')

  if (error) throw new Error(error.message)

  const map: Record<string, Settings> = {}
  for (const row of data || []) {
    map[row.key] = row as Settings
  }
  return map
}

export async function fetchSetting(key: string): Promise<Settings | null> {
  const { data, error } = await supabase
    .from('settings')
    .select('*')
    .eq('key', key)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw new Error(error.message)
  }

  return data as Settings
}

export async function getSettingValue<T = string>(key: string): Promise<T | null> {
  const setting = await fetchSetting(key)
  if (!setting) return null

  if (setting.type === 'json') {
    try {
      return JSON.parse(setting.value) as T
    } catch {
      return setting.value as unknown as T
    }
  }
  if (setting.type === 'number') {
    return Number(setting.value) as unknown as T
  }
  if (setting.type === 'boolean') {
    return (setting.value === 'true') as unknown as T
  }
  return setting.value as unknown as T
}

export async function updateSetting(
  key: string,
  value: unknown,
  type: Settings['type'] = 'string'
): Promise<Settings> {
  const serialized =
    typeof value === 'object' ? JSON.stringify(value) : String(value)

  // Upsert
  const { data, error } = await supabase
    .from('settings')
    .upsert(
      { key, value: serialized, type },
      { onConflict: 'key' }
    )
    .select()
    .single()

  if (error) throw new Error(error.message)

  return data as Settings
}

export async function updateSettings(
  settings: Array<{ key: string; value: unknown; type?: Settings['type'] }>
): Promise<void> {
  const upserts = settings.map((s) =>
    supabase
      .from('settings')
      .upsert(
        {
          key: s.key,
          value: typeof s.value === 'object' ? JSON.stringify(s.value) : String(s.value),
          type: s.type || 'string',
        },
        { onConflict: 'key' }
      )
  )

  const results = await Promise.all(upserts)
  const firstError = results.find((r) => r.error)
  if (firstError?.error) throw new Error(firstError.error.message)
}
