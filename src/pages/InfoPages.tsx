import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, Clock3, Headphones, Mail, MapPin, MessageSquare, PackageCheck, RotateCcw, ShieldCheck, ShoppingBag, Truck } from 'lucide-react'
import toast from 'react-hot-toast'

export function AboutPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-surface-950">
      <section className="border-b border-[#e0e4e8] bg-[#f6f8fb] dark:border-surface-800 dark:bg-surface-900/50">
        <div className="section-container py-16 sm:py-24">
          <p className="text-sm font-semibold text-[#0b57d0] dark:text-blue-400">About The Tech Shelf</p>
          <h1 className="mt-3 max-w-4xl text-4xl font-semibold leading-tight tracking-normal sm:text-6xl">Technology shopping, without the guesswork.</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-surface-500 dark:text-surface-400">
            The Tech Shelf is built for people in Lebanon who want current devices, understandable choices, and dependable support from checkout through delivery.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/shop" className="inline-flex h-11 items-center rounded-lg bg-[#0b57d0] px-5 text-sm font-semibold text-white hover:bg-[#0842a0]">Browse products</Link>
            <Link to="/contact" className="inline-flex h-11 items-center rounded-lg border border-[#c8cdd3] bg-white px-5 text-sm font-semibold text-surface-800 hover:bg-surface-50 dark:border-surface-700 dark:bg-surface-900 dark:text-white">Talk to support</Link>
          </div>
        </div>
      </section>
      <section className="section-container grid gap-10 py-14 lg:grid-cols-[0.75fr_1.25fr] lg:items-start sm:py-20">
        <div>
          <p className="text-sm font-semibold text-[#0b57d0]">Why we exist</p>
          <h2 className="mt-2 text-3xl font-semibold leading-tight sm:text-4xl">A local store should make buying easier.</h2>
        </div>
        <div className="space-y-5 text-base leading-8 text-surface-600 dark:text-surface-300">
          <p>Product pages should show the device clearly, prices should be easy to understand, and checkout should ask only for information needed to deliver your order.</p>
          <p>That is the standard behind The Tech Shelf. We focus on Apple and Samsung products people genuinely compare and buy, pair them with clear specifications, and keep cash on delivery available for a familiar local checkout experience.</p>
          <p>When something changes after an order is placed, customers should not have to chase the store. Order details, status updates, and direct support remain available throughout the process.</p>
        </div>
      </section>
      <section className="border-y border-[#e0e4e8] bg-[#f8fafd] dark:border-surface-800 dark:bg-surface-900/40">
        <div className="section-container grid gap-4 py-14 sm:grid-cols-3 sm:py-20">
        {[
          { icon: PackageCheck, title: 'Focused selection', text: 'Current phones, computers, audio, watches, and essential accessories from brands customers know.' },
          { icon: ShieldCheck, title: 'Clear checkout', text: 'Lebanon-ready addresses, cash on delivery, transparent totals, and no surprise fields.' },
          { icon: MessageSquare, title: 'Reachable support', text: 'Useful answers before purchase and a clear path to help after an order is placed.' },
        ].map((item) => (
          <article key={item.title} className="rounded-lg border border-[#e0e4e8] bg-white p-6 dark:border-surface-800 dark:bg-surface-950">
            <item.icon className="text-[#0b57d0] dark:text-blue-400" size={24} />
            <h2 className="mt-5 text-lg font-semibold">{item.title}</h2>
            <p className="mt-2 text-sm leading-6 text-surface-500 dark:text-surface-400">{item.text}</p>
          </article>
        ))}
        </div>
      </section>
      <section className="section-container py-14 sm:py-20">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold text-[#0b57d0]">From cart to doorstep</p>
          <h2 className="mt-2 text-3xl font-semibold sm:text-4xl">A process you can follow.</h2>
        </div>
        <div className="mt-10 grid gap-8 border-t border-[#e0e4e8] pt-8 sm:grid-cols-2 lg:grid-cols-4 dark:border-surface-800">
          {[
            { icon: ShoppingBag, step: '01', title: 'Choose', text: 'Compare clear product photos, specifications, and prices.' },
            { icon: MapPin, step: '02', title: 'Confirm', text: 'Enter a Lebanon delivery address and choose your governorate and city.' },
            { icon: PackageCheck, step: '03', title: 'Prepare', text: 'Your order is reviewed and prepared, with status updates along the way.' },
            { icon: Truck, step: '04', title: 'Receive', text: 'Your order arrives at the address provided, ready for cash on delivery.' },
          ].map((item) => (
            <div key={item.step}>
              <div className="flex items-center justify-between"><item.icon size={21} className="text-[#0b57d0]" /><span className="text-xs font-semibold text-surface-400">{item.step}</span></div>
              <h3 className="mt-5 font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-surface-500 dark:text-surface-400">{item.text}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="border-t border-[#e0e4e8] bg-[#f6f8fb] dark:border-surface-800 dark:bg-surface-900/50">
        <div className="section-container flex flex-col gap-6 py-12 sm:flex-row sm:items-center sm:justify-between">
          <div><h2 className="text-2xl font-semibold">Need a hand choosing?</h2><p className="mt-2 text-sm text-surface-500">Tell us what matters to you and we will help narrow it down.</p></div>
          <Link to="/contact" className="inline-flex h-11 w-fit items-center gap-2 rounded-lg bg-[#0b57d0] px-5 text-sm font-semibold text-white hover:bg-[#0842a0]"><Headphones size={17} /> Contact support</Link>
        </div>
      </section>
    </main>
  )
}

const FAQS = [
  ['Where does Joe\'s Shop deliver?', 'We currently accept delivery addresses within Lebanon. At checkout, select your governorate and then choose your city, town, or village.'],
  ['How long does delivery take?', 'Most orders are prepared and delivered within 2-5 business days. Timing can vary by area, availability, and public holidays.'],
  ['Can I pay with cash on delivery?', 'Yes. Cash on delivery is currently the available payment method. Card and online payment options will only appear once they are fully supported.'],
  ['Do I need an account to place an order?', 'No. Guest checkout is available with a valid email address and Lebanese phone number. An account makes saved addresses and order history easier to access.'],
  ['Can I save my delivery address?', 'Signed-in customers can save a Lebanon delivery address during checkout or manage addresses from the account area.'],
  ['Can guests use coupon codes?', 'No. Coupons are reserved for signed-in customers. Create an account or sign in before applying an eligible coupon.'],
  ['How will I know when my order status changes?', 'We send an email when an order is received and whenever its fulfillment or payment status changes. Signed-in customers can also review orders from their account.'],
  ['Can I cancel or change an order?', 'Contact support as soon as possible. We can usually help before preparation or delivery begins, but changes are not guaranteed after an order has shipped.'],
  ['Are products covered by a warranty?', 'Warranty coverage depends on the product and manufacturer. Contact us with the product name before ordering if you need confirmation of the coverage included.'],
  ['What is the return policy?', 'Eligible unused items can be requested for return within 30 days of delivery when they are complete and in their original packaging. Some opened or hygiene-sensitive products may be excluded.'],
] as const

export function FAQPage() {
  return (
    <main className="min-h-screen overflow-x-clip bg-white dark:bg-surface-950">
      <section className="border-b border-[#e0e4e8] bg-[#f6f8fb] dark:border-surface-800 dark:bg-surface-900/50">
        <div className="section-container py-16 sm:py-20">
          <p className="text-sm font-semibold text-[#0b57d0]">Help center</p>
          <h1 className="mt-3 max-w-3xl break-words text-4xl font-semibold leading-tight tracking-normal sm:text-5xl">Questions, answered clearly.</h1>
          <p className="mt-5 max-w-2xl break-words text-lg leading-8 text-surface-500">Delivery, payment, accounts, order updates, and returns in one place.</p>
        </div>
      </section>
      <section className="section-container grid gap-10 py-14 lg:grid-cols-[280px_minmax(0,1fr)] sm:py-20">
        <aside className="min-w-0">
          <h2 className="text-xl font-semibold">Frequently asked questions</h2>
          <p className="mt-3 text-sm leading-6 text-surface-500">Still need help after reading these? Our support team can look at your specific order or product question.</p>
          <Link to="/contact" className="mt-5 inline-flex text-sm font-semibold text-[#0b57d0] hover:underline">Contact support</Link>
        </aside>
        <div className="min-w-0 divide-y divide-[#e0e4e8] border-y border-[#e0e4e8] dark:divide-surface-800 dark:border-surface-800">
          {FAQS.map(([question, answer]) => (
            <details key={question} className="group py-1">
              <summary className="flex min-w-0 cursor-pointer list-none items-center justify-between gap-5 py-5 text-base font-semibold marker:hidden">
                <span className="min-w-0 break-words">{question}</span>
                <ChevronDown className="h-5 w-5 shrink-0 text-surface-400 transition-transform group-open:rotate-180" />
              </summary>
              <p className="max-w-3xl pb-6 pr-10 text-sm leading-7 text-surface-500 dark:text-surface-400">{answer}</p>
            </details>
          ))}
        </div>
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
            <p className="flex items-center gap-3"><Mail className="text-[#0b57d0]" size={19} /> hello@thetechshelf.com</p>
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
