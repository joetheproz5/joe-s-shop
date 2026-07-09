import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

export function useSettings() {
  return useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const { data, error } = await supabase.from('settings').select('*')
      if (error) throw error
      // Convert to key/value object
      const map: Record<string, string> = {}
      for (const row of data || []) {
        map[row.key] = row.value
      }
      return map
    },
    staleTime: 5 * 60 * 1000,
  })
}

export function useUpdateSetting() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (payload: { key: string; value: string }) => {
      const { error } = await supabase
        .from('settings')
        .upsert({ key: payload.key, value: payload.value, type: 'string' })
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['settings'] })
    },
  })
}

export function useUpdateSettings() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (entries: Record<string, string>) => {
      const rows = Object.entries(entries).map(([key, value]) => ({
        key,
        value,
        type: 'string' as const,
      }))
      const { error } = await supabase.from('settings').upsert(rows)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['settings'] })
    },
  })
}
