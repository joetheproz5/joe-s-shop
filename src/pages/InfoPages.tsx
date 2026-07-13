import { useState } from 'react'
import { Clock3, Mail, MessageSquare, PackageCheck, RotateCcw, ShieldCheck, Truck } from 'lucide-react'
import toast from 'react-hot-toast'

export function AboutPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-surface-950">
      <section className="border-b border-[#e0e4e8] bg-[#f6f8fb] dark:border-surface-800 dark:bg-surface-900/50">
        <div className="section-container py-16 sm:py-20">
          <p className="text-sm font-semibold text-[#0b57d0] dark:text-blue-400">About Joe's Shop</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-semibold leading-tight tracking-normal sm:text-6xl">Shopping should feel straightforward.</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-surface-500 dark:text-surface-400">
            We bring useful products, clear information, and dependable service together in one easy place.
          </p>
        </div>
      </section>
      <section className="section-container grid gap-4 py-14 sm:grid-cols-3 sm:py-20">
        {[
          { icon: PackageCheck, title: 'Useful selection', text: 'Products chosen around real everyday needs.' },
          { icon: ShieldCheck, title: 'Clear and secure', text: 'Straightforward prices and protected checkout.' },
          { icon: MessageSquare, title: 'Human support', text: 'Helpful answers before and after your order.' },
        ].map((item) => (
          <article key={item.title} className="rounded-lg border border-[#e0e4e8] p-6 dark:border-surface-800">
            <item.icon className="text-[#0b57d0] dark:text-blue-400" size={24} />
            <h2 className="mt-5 text-lg font-semibold">{item.title}</h2>
            <p className="mt-2 text-sm leading-6 text-surface-500 dark:text-surface-400">{item.text}</p>
          </article>
        ))}
      </section>
    </main>
  )
}

export function ContactPage() {
  const [sending, setSending] = useState(false)
  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = event.currentTarget
    setSending(true)
    window.setTimeout(() => {
      setSending(false)
      toast.success('Message received. We will get back to you soon.')
      form.reset()
    }, 500)
  }

  return (
    <main className="min-h-screen bg-white dark:bg-surface-950">
      <section className="section-container grid gap-12 py-14 lg:grid-cols-[0.8fr_1.2fr] lg:py-20">
        <div>
          <p className="text-sm font-semibold text-[#0b57d0] dark:text-blue-400">Contact</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-normal sm:text-5xl">How can we help?</h1>
          <p className="mt-5 max-w-md text-lg leading-8 text-surface-500 dark:text-surface-400">Send us a message and our support team will point you in the right direction.</p>
          <div className="mt-9 space-y-5 text-sm">
            <p className="flex items-center gap-3"><Mail className="text-[#0b57d0]" size={19} /> hello@joesshop.com</p>
            <p className="flex items-center gap-3"><Clock3 className="text-[#0b57d0]" size={19} /> Monday-Friday, 9:00-18:00</p>
          </div>
        </div>
        <form onSubmit={submit} className="rounded-lg border border-[#e0e4e8] bg-[#f8fafd] p-6 sm:p-8 dark:border-surface-800 dark:bg-surface-900">
          <div className="grid gap-5 sm:grid-cols-2">
            <ContactField label="Name" name="name" type="text" />
            <ContactField label="Email" name="email" type="email" />
          </div>
          <div className="mt-5"><ContactField label="Subject" name="subject" type="text" /></div>
          <label className="mt-5 block text-sm font-medium">
            Message
            <textarea name="message" required rows={6} className="mt-2 w-full resize-none rounded-lg border border-[#c8cdd3] bg-white p-3 text-sm outline-none focus:border-[#0b57d0] focus:ring-2 focus:ring-[#0b57d0]/15 dark:border-surface-700 dark:bg-surface-950" />
          </label>
          <button disabled={sending} className="mt-5 h-11 rounded-lg bg-[#0b57d0] px-6 text-sm font-semibold text-white transition-colors hover:bg-[#0842a0] disabled:opacity-60">
            {sending ? 'Sending...' : 'Send message'}
          </button>
        </form>
      </section>
    </main>
  )
}

function ContactField({ label, name, type }: { label: string; name: string; type: string }) {
  return (
    <label className="block text-sm font-medium">
      {label}
      <input name={name} type={type} required className="mt-2 h-11 w-full rounded-lg border border-[#c8cdd3] bg-white px-3 text-sm outline-none focus:border-[#0b57d0] focus:ring-2 focus:ring-[#0b57d0]/15 dark:border-surface-700 dark:bg-surface-950" />
    </label>
  )
}

export function ShippingPage() {
  return <PolicyPage icon={Truck} eyebrow="Shipping" title="Delivery you can plan around." points={[
    ['Standard delivery', 'Most orders arrive within 3-5 business days.'],
    ['Free over $100', 'Standard shipping is free when your order total reaches $100.'],
    ['Track every order', 'We send tracking details as soon as your order leaves our warehouse.'],
  ]} />
}

export function ReturnsPage() {
  return <PolicyPage icon={RotateCcw} eyebrow="Returns" title="Changed your mind? No problem." points={[
    ['30-day window', 'Return eligible items within 30 days of delivery.'],
    ['Keep it original', 'Items should be unused and returned with their original packaging.'],
    ['Simple refunds', 'Approved refunds return to your original payment method.'],
  ]} />
}

function PolicyPage({ icon: Icon, eyebrow, title, points }: { icon: typeof Truck; eyebrow: string; title: string; points: string[][] }) {
  return (
    <main className="min-h-screen bg-white dark:bg-surface-950">
      <section className="section-container max-w-4xl py-16 sm:py-20">
        <Icon size={28} className="text-[#0b57d0]" />
        <p className="mt-5 text-sm font-semibold text-[#0b57d0]">{eyebrow}</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-normal sm:text-5xl">{title}</h1>
        <div className="mt-10 divide-y divide-[#e0e4e8] border-y border-[#e0e4e8] dark:divide-surface-800 dark:border-surface-800">
          {points.map(([heading, text]) => (
            <div key={heading} className="grid gap-2 py-6 sm:grid-cols-[220px_1fr]">
              <h2 className="font-semibold">{heading}</h2>
              <p className="text-sm leading-6 text-surface-500 dark:text-surface-400">{text}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
