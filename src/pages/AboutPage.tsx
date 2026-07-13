import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Heart, PackageCheck, ShieldCheck, Sparkles } from 'lucide-react'

const values = [
  {
    icon: Sparkles,
    number: '01',
    title: 'Choose with intention',
    text: 'We look for products that solve a real need, feel good to use, and deserve a place in your everyday life.',
  },
  {
    icon: PackageCheck,
    number: '02',
    title: 'Make quality clear',
    text: 'Straightforward details, honest pricing, and thoughtful curation help you decide without the noise.',
  },
  {
    icon: Heart,
    number: '03',
    title: 'Care after checkout',
    text: 'From delivery to returns, we design every step to feel simple, responsive, and genuinely human.',
  },
]

export default function AboutPage() {
  return (
    <div className="bg-white text-surface-950 dark:bg-surface-950 dark:text-white">
      <Hero />
      <Story />
      <Values />
      <Promise />
      <CallToAction />
    </div>
  )
}

function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#efefec] dark:bg-[#171717]">
      <div className="absolute inset-0 opacity-80 [background:radial-gradient(circle_at_82%_20%,rgba(255,255,255,.95),transparent_34%),radial-gradient(circle_at_18%_85%,rgba(188,213,255,.45),transparent_32%)] dark:opacity-10" />
      <div className="section-container relative flex min-h-[640px] flex-col justify-between py-16 sm:py-20 lg:min-h-[720px]">
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="eyebrow">Our story</motion.p>
        <div className="max-w-5xl pb-6">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: .7 }}
            className="text-balance text-5xl font-semibold leading-[.96] tracking-[-.06em] sm:text-7xl lg:text-[6.8rem]"
          >
            Better things.<br />Fewer compromises.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: .7, delay: .1 }}
            className="mt-8 max-w-2xl text-lg leading-8 text-surface-600 sm:text-xl dark:text-surface-300"
          >
            The Tech Shelf is a modern shop built around one simple belief: finding something good should feel good, too.
          </motion.p>
        </div>
      </div>
    </section>
  )
}

function Story() {
  return (
    <section className="section-container grid gap-12 py-24 sm:py-32 lg:grid-cols-[.7fr_1.3fr] lg:gap-24">
      <div>
        <p className="eyebrow">Why we started</p>
        <div className="mt-5 h-px w-16 bg-surface-950 dark:bg-white" />
      </div>
      <div className="max-w-3xl">
        <h2 className="text-balance text-3xl font-semibold leading-tight tracking-[-.04em] sm:text-5xl">
          Shopping became crowded. We wanted to make it considered again.
        </h2>
        <div className="mt-8 grid gap-6 text-base leading-8 text-surface-500 sm:grid-cols-2 dark:text-surface-400">
          <p>The Tech Shelf began with a frustration we knew well: endless choices, unclear value, and too much time spent searching for products that simply work.</p>
          <p>So we built the kind of store we wanted to visit—one with a point of view, useful information, and a calm experience from first look to front door.</p>
        </div>
      </div>
    </section>
  )
}

function Values() {
  return (
    <section className="bg-surface-950 py-24 text-white sm:py-32 dark:bg-[#0a0a0a]">
      <div className="section-container">
        <div className="max-w-2xl">
          <p className="eyebrow !text-white/45">How we work</p>
          <h2 className="mt-4 text-4xl font-semibold tracking-[-.045em] sm:text-6xl">Thoughtful at every step.</h2>
        </div>
        <div className="mt-16 grid gap-px overflow-hidden rounded-[2rem] bg-white/15 lg:grid-cols-3">
          {values.map((value, index) => (
            <motion.article
              key={value.title}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * .08 }}
              className="flex min-h-[350px] flex-col bg-surface-950 p-8 sm:p-10 dark:bg-[#0a0a0a]"
            >
              <div className="flex items-center justify-between text-white/45"><span className="text-xs font-semibold tracking-[.2em]">{value.number}</span><value.icon size={22} strokeWidth={1.5} /></div>
              <div className="mt-auto"><h3 className="text-2xl font-semibold tracking-tight">{value.title}</h3><p className="mt-4 leading-7 text-white/55">{value.text}</p></div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}

function Promise() {
  return (
    <section className="section-container py-24 sm:py-32">
      <div className="grid items-center gap-12 overflow-hidden rounded-[2rem] bg-[#dce9ff] p-8 sm:p-12 lg:grid-cols-2 lg:p-16 dark:bg-blue-950/35">
        <div className="max-w-xl">
          <div className="grid h-12 w-12 place-items-center rounded-full bg-white text-blue-600 shadow-sm dark:bg-surface-900"><ShieldCheck size={22} /></div>
          <p className="eyebrow mt-8">The Tech Shelf promise</p>
          <h2 className="mt-3 text-4xl font-semibold tracking-[-.045em] sm:text-5xl">Confidence comes standard.</h2>
        </div>
        <div className="space-y-6 text-base leading-8 text-surface-600 dark:text-surface-300">
          <p>Every order is backed by secure checkout, clear tracking, and a straightforward 30-day return window.</p>
          <p>If something is not right, our support team is here to solve it—not send you in circles. That is not an extra. It is part of what you bought.</p>
        </div>
      </div>
    </section>
  )
}

function CallToAction() {
  return (
    <section className="border-t border-surface-200 dark:border-surface-800">
      <div className="section-container flex flex-col items-start justify-between gap-8 py-20 sm:flex-row sm:items-center sm:py-24">
        <div><p className="eyebrow">Come take a look</p><h2 className="mt-3 text-3xl font-semibold tracking-[-.04em] sm:text-5xl">Find your next favorite thing.</h2></div>
        <Link to="/shop" className="btn-primary shrink-0 rounded-full px-7 py-3.5">Explore the collection <ArrowRight size={17} /></Link>
      </div>
    </section>
  )
}
