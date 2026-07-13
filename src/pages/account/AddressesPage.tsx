import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Plus, Pencil, Trash2, Star, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import { Button, Input, Modal } from '@/components/ui'
import { LebanonAddressFields } from '@/components/checkout/LebanonAddressFields'
import { LebanesePhoneInput } from '@/components/checkout/LebanesePhoneInput'
import { isValidLebanesePhone, LEBANON_COUNTRY, normalizeLebanonLocation } from '@/lib/lebanon'
import type { Address } from '@/types'
import toast from 'react-hot-toast'

const EMPTY: Omit<Address, 'id' | 'user_id' | 'created_at' | 'updated_at'> = {
  label: 'Home', first_name: '', last_name: '', street_address_1: '', street_address_2: '',
  city: '', state: '', postal_code: '', country: LEBANON_COUNTRY, phone: '', is_default: false,
}

export default function AddressesPage() {
  const { user } = useAuth()
  const qc = useQueryClient()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<string | null>(null)
  const [form, setForm] = useState(EMPTY)

  const { data: addresses = [], isLoading } = useQuery({
    queryKey: ['addresses', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from('addresses').select('*').eq('user_id', user!.id).order('created_at')
      if (error) throw error
      return data as Address[]
    },
    enabled: !!user,
  })

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (editing) {
        const { error } = await supabase.from('addresses').update(form).eq('id', editing)
        if (error) throw error
      } else {
        const { error } = await supabase.from('addresses').insert({ ...form, user_id: user!.id })
        if (error) throw error
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['addresses'] })
      setOpen(false)
      toast.success(editing ? 'Address updated' : 'Address added')
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('addresses').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['addresses'] })
      toast.success('Address removed')
    },
  })

  const setDefault = async (id: string) => {
    await supabase.from('addresses').update({ is_default: false }).eq('user_id', user!.id)
    await supabase.from('addresses').update({ is_default: true }).eq('id', id)
    qc.invalidateQueries({ queryKey: ['addresses'] })
    toast.success('Default address set')
  }

  const openAdd = () => { setForm(EMPTY); setEditing(null); setOpen(true) }
  const openEdit = (a: Address) => {
    setForm(normalizeLebanonLocation({
      label: a.label, first_name: a.first_name, last_name: a.last_name,
      street_address_1: a.street_address_1, street_address_2: a.street_address_2 || '',
      city: a.city, state: a.state, postal_code: a.postal_code, country: LEBANON_COUNTRY,
      phone: a.phone || '', is_default: a.is_default,
    }))
    setEditing(a.id); setOpen(true)
  }

  const updateLocation = (field: 'city' | 'state' | 'postal_code' | 'country', value: string) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const submitAddress = (event: React.FormEvent) => {
    event.preventDefault()
    if (!form.state || !form.city) {
      toast.error('Select a governorate and city before saving.')
      return
    }
    if (form.phone && !isValidLebanesePhone(form.phone)) {
      toast.error('Enter a valid 7 or 8 digit Lebanese phone number.')
      return
    }
    saveMutation.mutate()
  }

  if (isLoading) return <div className="grid sm:grid-cols-2 gap-4">{[1, 2].map((i) => <div key={i} className="card p-6 h-48 animate-pulse bg-surface-100 dark:bg-surface-800" />)}</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Saved Addresses ({addresses.length})</h2>
        <Button onClick={openAdd} leftIcon={<Plus size={18} />}>Add Address</Button>
      </div>

      {addresses.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-surface-100 dark:bg-surface-800 flex items-center justify-center">
            <MapPin className="text-surface-400" size={28} />
          </div>
          <h3 className="text-lg font-semibold mb-2">No saved addresses</h3>
          <p className="text-surface-500 mb-6">Add an address for faster checkout.</p>
          <Button onClick={openAdd} leftIcon={<Plus size={18} />}>Add Address</Button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {addresses.map((a, i) => (
            <motion.div key={a.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="card p-5 relative">
              {a.is_default && <span className="absolute top-4 right-4 badge-primary">Default</span>}
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center">
                  <MapPin className="text-primary-600" size={18} />
                </div>
                <div>
                  <div className="font-semibold">{a.label}</div>
                  <div className="text-sm text-surface-500">{a.first_name} {a.last_name}</div>
                </div>
              </div>
              <p className="text-sm text-surface-600 dark:text-surface-400 mb-4">
                {a.street_address_1}{a.street_address_2 ? `, ${a.street_address_2}` : ''}<br />
                {a.city}, {a.state} {a.postal_code}<br />
                {a.country}{a.phone ? ` • ${a.phone}` : ''}
              </p>
              <div className="flex gap-2">
                <button onClick={() => openEdit(a)} className="btn-ghost text-sm py-1.5"><Pencil size={14} /> Edit</button>
                {!a.is_default && (
                  <button onClick={() => setDefault(a.id)} className="btn-ghost text-sm py-1.5"><Star size={14} /> Set Default</button>
                )}
                <button onClick={() => deleteMutation.mutate(a.id)} className="btn-ghost text-sm py-1.5 text-danger-500"><Trash2 size={14} /> Delete</button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <Modal isOpen={open} onClose={() => setOpen(false)} title={editing ? 'Edit Address' : 'Add Address'} size="md">
        <form onSubmit={submitAddress} className="space-y-4">
          <Input label="Label" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} placeholder="Home, Work, etc." />
          <div className="grid grid-cols-2 gap-3">
            <Input label="First name" value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} placeholder="Rami" required />
            <Input label="Last name" value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} placeholder="Haddad" required />
          </div>
          <Input label="Building, street, and area" value={form.street_address_1} onChange={(e) => setForm({ ...form, street_address_1: e.target.value })} placeholder="Building 12, Hamra Street" required />
          <Input label="Floor, apartment, or landmark (optional)" value={form.street_address_2} onChange={(e) => setForm({ ...form, street_address_2: e.target.value })} placeholder="3rd floor, near the pharmacy" />
          <LebanonAddressFields key={editing || 'new'} value={form} onChange={updateLocation} required />
          <LebanesePhoneInput
            value={form.phone}
            onChange={(phone) => setForm({ ...form, phone })}
            error={form.phone && !isValidLebanesePhone(form.phone) ? 'Enter a valid 7 or 8 digit Lebanese phone number.' : undefined}
          />
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={form.is_default} onChange={(e) => setForm({ ...form, is_default: e.target.checked })} className="w-4 h-4 rounded border-surface-300 text-primary-600" />
            Set as default address
          </label>
          <div className="flex gap-3 justify-end pt-2">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" loading={saveMutation.isPending}>{editing ? 'Save' : 'Add'} Address</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
