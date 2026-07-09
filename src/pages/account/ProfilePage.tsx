import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Phone, User as UserIcon, Save, Upload } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { Button, Input } from '@/components/ui'
import { supabase } from '@/lib/supabase'
import { STORAGE_BUCKETS } from '@/lib/constants'
import toast from 'react-hot-toast'

export default function ProfilePage() {
  const { profile, user, updateProfile } = useAuth()
  const [form, setForm] = useState({
    first_name: profile?.first_name || '',
    last_name: profile?.last_name || '',
    phone: profile?.phone || '',
    avatar_url: profile?.avatar_url || '',
  })
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  const handleAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return
    setUploading(true)
    try {
      const ext = file.name.split('.').pop()
      const path = `${user.id}/avatar-${Date.now()}.${ext}`
      const { error: upErr } = await supabase.storage.from(STORAGE_BUCKETS.avatars).upload(path, file)
      if (upErr) throw upErr
      const { data } = supabase.storage.from(STORAGE_BUCKETS.avatars).getPublicUrl(path)
      setForm((f) => ({ ...f, avatar_url: data.publicUrl }))
    } catch {
      toast.error('Failed to upload image')
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const { error } = await updateProfile({
      first_name: form.first_name,
      last_name: form.last_name,
      phone: form.phone,
      avatar_url: form.avatar_url,
    })
    setSaving(false)
    if (error) toast.error(error.message)
    else toast.success('Profile updated')
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="card p-6 sm:p-8">
        <h2 className="text-xl font-bold mb-6">Profile Information</h2>

        <div className="flex items-center gap-5 mb-8 pb-8 border-b border-surface-200 dark:border-surface-800">
          <div className="relative">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-surface-200 dark:bg-surface-700">
              {form.avatar_url ? (
                <img src={form.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-surface-500">
                  {(form.first_name[0] || 'U').toUpperCase()}
                </div>
              )}
            </div>
            <label className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center cursor-pointer shadow-lg hover:bg-primary-700">
              {uploading ? <span className="animate-spin text-xs">⏳</span> : <Upload size={14} />}
              <input type="file" accept="image/*" onChange={handleAvatar} className="hidden" />
            </label>
          </div>
          <div>
            <div className="font-semibold text-lg">{form.first_name} {form.last_name}</div>
            <div className="text-sm text-surface-500">Profile photo</div>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-5 max-w-lg">
          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              label="First name"
              value={form.first_name}
              onChange={(e) => setForm({ ...form, first_name: e.target.value })}
              leftIcon={<UserIcon size={18} />}
            />
            <Input
              label="Last name"
              value={form.last_name}
              onChange={(e) => setForm({ ...form, last_name: e.target.value })}
            />
          </div>
          <Input
            label="Email"
            value={user?.email || ''}
            disabled
            leftIcon={<Mail size={18} />}
            helperText="Email cannot be changed"
          />
          <Input
            label="Phone"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="+1 (555) 000-0000"
            leftIcon={<Phone size={18} />}
          />
          <Button type="submit" loading={saving} leftIcon={<Save size={18} />}>
            Save Changes
          </Button>
        </form>
      </div>
    </motion.div>
  )
}
