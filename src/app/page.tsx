'use client'

import Link from 'next/link'
import { useState } from 'react'
import { BrandLogo } from '@/components/brand-logo'
import {
  ArrowRight,
  Bot,
  Check,
  ChevronRight,
  Inbox,
  MessageCircle,
  Megaphone,
  Play,
  Sparkles,
  Zap,
} from 'lucide-react'

type Feature = {
  icon: typeof Inbox
  title: string
  description: string
}

type Plan = {
  name: string
  price: string
  subtitle: string
  items: string[]
}

type WorkflowStep = {
  number: string
  title: string
  description: string
}

type Faq = {
  question: string
  answer: string
}

type Conversation = {
  name: string
  message: string
  time: string
}

const features: Feature[] = [
  {
    icon: Inbox,
    title: 'WhatsApp CRM',
    description:
      'Keep every customer conversation, contact and follow-up in one organized workspace.',
  },
  {
    icon: Bot,
    title: 'AI Replies',
    description:
      'Draft fast, helpful replies and let AI handle repetitive customer questions.',
  },
  {
    icon: Zap,
    title: 'Automation',
    description:
      'Trigger replies, follow-ups and actions automatically so leads do not get missed.',
  },
  {
    icon: Megaphone,
    title: 'Broadcasts',
    description:
      'Reach the right customers with campaigns from the same workspace you use every day.',
  },
  {
    icon: MessageCircle,
    title: 'Team Inbox',
    description:
      'Give your team one shared place to manage incoming WhatsApp conversations.',
  },
]

const businesses: string[] = [
  'Boutiques',
  'Ecommerce',
  'Restaurants',
  'Clinics',
  'Education',
  'D2C Brands',
  'Local Businesses',
  'Service Businesses',
]

const faqs: Faq[] = [
  {
    question: 'What is RedANT?',
    answer:
      'RedANT is a WhatsApp-focused CRM and automation platform that helps businesses organize conversations, automate replies, follow up with leads and manage customer communication from one place.',
  },
  {
    question: 'Do I need coding?',
    answer:
      'No. RedANT is designed for business teams, not just developers. You can manage conversations, contacts, broadcasts and automations from the application.',
  },
  {
    question: 'Can my team use RedANT?',
    answer:
      'Yes. RedANT is built around a shared workspace so teams can manage customer conversations together.',
  },
  {
    question: 'Can I use AI?',
    answer:
      'Yes. RedANT includes AI-assisted replies and automation capabilities to help your team respond faster.',
  },
  {
    question: 'How do I get started?',
    answer:
      'Create your account, connect your WhatsApp setup and start managing your customer conversations from RedANT.',
  },
]

const plans: Plan[] = [
  {
    name: 'Standard',
    price: '₹999',
    subtitle: 'For businesses getting started',
    items: ['WhatsApp CRM', 'Shared inbox', 'Basic automation'],
  },
  {
    name: 'Stable',
    price: '₹2,999',
    subtitle: 'For growing teams',
    items: [
      'Everything in Standard',
      'Advanced automation',
      'AI-assisted workflows',
    ],
  },
  {
    name: 'Ecommerce',
    price: '₹3,999',
    subtitle: 'For ecommerce operations',
    items: [
      'Everything in Stable',
      'Ecommerce workflows',
      'Higher-volume operations',
    ],
  },
]

const workflowSteps: WorkflowStep[] = [
  {
    number: '01',
    title: 'Connect',
    description: 'Connect your WhatsApp business setup.',
  },
  {
    number: '02',
    title: 'Organize',
    description: 'Bring conversations and contacts into one inbox.',
  },
  {
    number: '03',
    title: 'Automate',
    description: 'Create replies, follow-ups and workflows.',
  },
  {
    number: '04',
    title: 'Sell',
    description: 'Respond faster and keep leads moving.',
  },
]

const conversations: Conversation[] = [
  {
    name: 'Priya Boutique',
    message: 'Do you have this in red?',
    time: '2m',
  },
  {
    name: 'Arun Stores',
    message: 'I would like to place an order',
    time: '8m',
  },
  {
    name: 'Kaviya',
    message: 'Thank you! 🙏',
    time: '14m',
  },
]

function ProductPreview() {
  const [replyUsed, setReplyUsed] = useState(false)
  const [demoPlaying, setDemoPlaying] = useState(false)

  return (
    <div className="relative mx-auto flex w-full max-w-3xl items-center justify-center gap-3 sm:gap-5">
      <div className="absolute -inset-12 rounded-full bg-gradient-to-br from-red-400/25 via-rose-500/10 to-emerald-400/25 blur-3xl" />
      <div className="redant-device redant-device-inbox relative mx-auto w-full max-w-[16rem] shrink select-none rounded-[2.75rem] border-[8px] border-slate-900 bg-slate-900 p-1.5 shadow-2xl shadow-emerald-950/20 dark:border-slate-700">
        <div className="overflow-hidden rounded-[2.1rem] bg-white text-slate-950">
          <div className="flex items-center justify-between bg-white px-5 pb-3 pt-4 text-[10px] font-semibold">
            <span>9:41</span>
            <span className="h-4 w-20 rounded-full bg-slate-950" aria-hidden="true" />
            <span>●  ▰</span>
          </div>

          <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3">
            <BrandLogo compact />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold">RedANT</p>
              <p className="text-[10px] text-slate-500">Customer inbox</p>
            </div>
            <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-700">Preview</span>
          </div>

          <div className="bg-slate-50 px-3 pb-3 pt-3">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-red-600">Shared inbox</p>
                <h3 className="mt-1 text-lg font-black">Conversations</h3>
              </div>
              <span className="rounded-xl bg-white px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm">3 chats</span>
            </div>

            <div className="space-y-2">
              {conversations.map((conversation, index) => (
                <div
                  key={conversation.name}
                  className={`flex items-start gap-3 rounded-xl border bg-white p-2.5 shadow-sm ${
                    index === 0 ? 'border-red-200 ring-1 ring-red-100' : 'border-slate-100'
                  }`}
                >
                  <div className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-bold ${
                    index === 0 ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {conversation.name.split(' ').map((part) => part[0]).join('').slice(0, 2)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-xs font-bold">{conversation.name}</span>
                      <span className="shrink-0 text-[10px] text-slate-400">{conversation.time}</span>
                    </div>
                    <p className="mt-1 truncate text-[11px] text-slate-500">{conversation.message}</p>
                    {index === 0 && <span className="mt-2 inline-flex rounded-full bg-red-50 px-2 py-0.5 text-[9px] font-semibold text-red-700">Needs reply</span>}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-3 rounded-xl border border-red-100 bg-white p-3 shadow-sm">
              <div className="flex items-center gap-2 text-xs font-bold text-red-700">
                <Sparkles className="h-4 w-4" />
                AI reply suggestion
              </div>
              <p className="mt-1.5 text-[10px] leading-4 text-slate-600">
                {replyUsed ? "Reply added to the composer. Review it before sending." : "“Yes, the red dress is available! Would you like to see the size options?”"}
              </p>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-[9px] text-slate-400">Review before sending</span>
                <button type="button" onClick={() => setReplyUsed(true)} className="rounded-lg bg-red-600 px-3 py-1.5 text-[10px] font-semibold text-white transition hover:bg-emerald-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500">{replyUsed ? "Reply added ✓" : "Use reply"}</button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-4 border-t border-slate-100 bg-white px-2 py-2 text-center">
            {[
              { icon: Inbox, label: 'Inbox' },
              { icon: MessageCircle, label: 'Contacts' },
              { icon: Megaphone, label: 'Campaigns' },
              { icon: Zap, label: 'Flows' },
            ].map(({ icon: Icon, label }, index) => (
              <div key={label} className={`flex flex-col items-center gap-1 text-[9px] font-medium ${
                index === 0 ? 'text-red-600' : 'text-slate-400'
              }`}>
                <Icon className="h-4 w-4" />
                {label}
              </div>
            ))}
          </div>
          <div className="flex justify-center bg-white pb-2 pt-1">
            <span className="h-1 w-24 rounded-full bg-slate-900" aria-hidden="true" />
          </div>
        </div>
      </div>
      {/* Realistic secondary phone: titanium-style frame, side buttons, island and clipped screen. */}
      <div className="relative hidden h-[27rem] w-[13rem] shrink-0 -rotate-1 rounded-[2.45rem] border-[5px] border-slate-700 bg-gradient-to-br from-slate-500 via-slate-900 to-slate-600 p-[5px] shadow-[0_28px_60px_-20px_rgba(15,23,42,0.55)] lg:block">
        <span className="absolute -left-[7px] top-20 h-8 w-[3px] rounded-l bg-slate-500" aria-hidden="true" />
        <span className="absolute -left-[7px] top-32 h-12 w-[3px] rounded-l bg-slate-500" aria-hidden="true" />
        <span className="absolute -right-[7px] top-28 h-14 w-[3px] rounded-r bg-slate-500" aria-hidden="true" />
        <div className="relative h-full overflow-hidden rounded-[2rem] bg-white text-slate-950">
          <div className="absolute left-1/2 top-[7px] z-20 flex h-[22px] w-[76px] -translate-x-1/2 items-center justify-end rounded-full bg-black px-2">
            <span className="h-2 w-2 rounded-full bg-slate-800 ring-1 ring-slate-700" aria-hidden="true" />
          </div>
          <div className="flex items-center justify-between px-4 pb-2 pt-3 text-[9px] font-semibold"><span>9:41</span><span>● ▰</span></div>
          <div className="border-b border-slate-100 px-3 pb-3 pt-3">
            <div className="flex items-center justify-between"><BrandLogo compact /><span className="text-sm font-bold text-slate-700">☰</span></div>
            <p className="mt-5 text-[17px] font-black leading-[1.15] tracking-tight">WhatsApp chat to <span className="text-emerald-600">online store.</span></p>
            <p className="mt-2 text-[9px] leading-4 text-slate-500">Turn conversations into shopping experiences with AI replies and automation.</p>
            <span className="mt-3 block rounded-full bg-emerald-600 px-2 py-2.5 text-center text-[9px] font-bold text-white shadow-sm shadow-emerald-900/20">Get started free <span aria-hidden="true">→</span></span>
            <button type="button" onClick={() => setDemoPlaying((playing) => !playing)} className="mt-2 block w-full rounded-full border border-emerald-200 bg-white px-2 py-2 text-center text-[9px] font-semibold text-emerald-700 transition hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500">{demoPlaying ? "✓ Demo preview active" : "▷ Watch demo"}</button>
          </div>
          <div className="space-y-3 bg-gradient-to-b from-emerald-50 to-white p-3">
            <div className="rounded-2xl border border-emerald-100 bg-white p-3 shadow-sm">
              <div className="flex items-center gap-2"><span className="grid h-7 w-7 place-items-center rounded-xl bg-emerald-100 text-xs text-emerald-700">↗</span><div><p className="text-[10px] font-bold">How it works</p><p className="text-[8px] text-slate-500">From chat to checkout</p></div></div>
              <div className="mt-3 space-y-2"><div className="flex items-center gap-2 rounded-lg bg-slate-50 p-2"><span className="grid h-6 w-6 place-items-center rounded-full bg-emerald-600 text-[9px] font-bold text-white">1</span><span className="text-[9px] font-medium">Discover products</span></div><div className="flex items-center gap-2 rounded-lg bg-slate-50 p-2"><span className="grid h-6 w-6 place-items-center rounded-full bg-emerald-600 text-[9px] font-bold text-white">2</span><span className="text-[9px] font-medium">Answer questions</span></div><div className="flex items-center gap-2 rounded-lg bg-slate-50 p-2"><span className="grid h-6 w-6 place-items-center rounded-full bg-red-500 text-[9px] font-bold text-white">3</span><span className="text-[9px] font-medium">Help complete orders</span></div></div>
            </div>
            <div className="rounded-2xl bg-gradient-to-br from-emerald-950 via-emerald-800 to-red-700 p-3 text-white shadow-md">
              <p className="text-[10px] font-bold leading-4">Turn chats into sales.</p><p className="mt-1 text-[8px] leading-3 text-white/80">One conversation at a time.</p><span className="mt-3 block rounded-full bg-emerald-400 px-2 py-2 text-center text-[8px] font-bold text-emerald-950">Get started free →</span>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 flex justify-center bg-white/95 pb-2 pt-1"><span className="h-1 w-16 rounded-full bg-slate-900" aria-hidden="true" /></div>
        </div>
      </div>
    </div>
  )
}

export default function RootPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-white text-slate-950 dark:bg-slate-950 dark:text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "Organization",
                "@id": "https://redant.in/#organization",
                name: "RedANT",
                url: "https://redant.in/",
                description:
                  "RedANT helps businesses manage WhatsApp customer conversations, AI-assisted replies, follow-ups, and messaging automation.",
              },
              {
                "@type": "WebSite",
                "@id": "https://redant.in/#website",
                url: "https://redant.in/",
                name: "RedANT",
                publisher: { "@id": "https://redant.in/#organization" },
                inLanguage: "en-IN",
              },
              {
                "@type": "SoftwareApplication",
                "@id": "https://redant.in/#software",
                name: "RedANT",
                url: "https://redant.in/",
                applicationCategory: "BusinessApplication",
                operatingSystem: "Web",
                description:
                  "WhatsApp CRM and automation for businesses to organize customer conversations, use AI-assisted replies, follow up with leads, and manage messaging workflows.",
                publisher: { "@id": "https://redant.in/#organization" },
                offers: {
                  "@type": "Offer",
                  priceCurrency: "INR",
                  price: "999",
                  category: "subscription",
                  url: "https://redant.in/#pricing",
                },
              },
            ],
          }),
        }}
      />
      {/* Hero */}
      <section className="relative">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_12%_12%,rgba(248,113,113,0.18),transparent_35%),radial-gradient(ellipse_at_88%_30%,rgba(16,185,129,0.10),transparent_28%)]" />
        <div className="pointer-events-none absolute right-0 top-24 -z-10 h-72 w-72 rounded-full border border-red-100/70 dark:border-red-900/30" />

        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8">
          <Link href="/" aria-label="RedANT home" className="inline-flex items-center">
            <BrandLogo />
          </Link>

          <div className="hidden items-center gap-8 text-sm font-medium text-slate-500 md:flex dark:text-slate-300">
            <a
              href="#features"
              className="transition hover:text-emerald-600"
            >
              Features
            </a>

            <a
              href="#how-it-works"
              className="transition hover:text-emerald-600"
            >
              How it works
            </a>

            <a
              href="#pricing"
              className="transition hover:text-emerald-600"
            >
              Pricing
            </a>

            <a
              href="#faq"
              className="transition hover:text-emerald-600"
            >
              FAQ
            </a>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden px-3 py-2 text-sm font-semibold text-slate-600 sm:block dark:text-slate-200"
            >
              Log in
            </Link>

            <Link
              href="/signup"
              className="rounded-xl bg-[#16A34A] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-green-600/20 transition hover:bg-[#15803D]"
            >
              Get started
            </Link>
          </div>
        </nav>

        <div className="mx-auto grid max-w-7xl items-center gap-8 px-6 pb-12 pt-8 lg:grid-cols-[0.94fr_1.06fr] lg:gap-8 lg:px-8 lg:pb-16 lg:pt-10">
          <div className="text-center lg:text-left">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-red-100 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
              <Sparkles className="h-3.5 w-3.5" />
              WhatsApp CRM · Made for conversations that convert
            </div>

            <h1 className="text-4xl font-black leading-[1.04] tracking-tight sm:text-5xl lg:text-[3.75rem]">
              From WhatsApp chat to{' '}
              <span className="bg-gradient-to-r from-emerald-600 via-green-600 to-teal-500 bg-clip-text text-transparent">online store.</span>
            </h1>

            <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8 lg:mx-0 dark:text-slate-300">
              Turn customer conversations into shopping journeys. Answer product questions, organize leads, and connect WhatsApp conversations with your existing online store workflows—all from one workspace.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#16A34A] px-6 py-3.5 font-semibold text-white shadow-xl shadow-green-600/25 transition hover:-translate-y-0.5 hover:bg-[#15803D] hover:shadow-2xl hover:shadow-green-600/30"
              >
                Get started
                <ArrowRight className="h-4 w-4" />
              </Link>

              <a
                href="#product"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-6 py-3.5 font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-900"
              >
                <Play className="h-4 w-4" />
                Explore the product
              </a>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-slate-500 lg:justify-start dark:text-slate-400">
              <span className="inline-flex items-center gap-2"><Check className="h-4 w-4 text-emerald-600" /> Keep chats organized</span>
              <span className="inline-flex items-center gap-2"><Check className="h-4 w-4 text-emerald-600" /> Follow up with leads</span>
              <span className="inline-flex items-center gap-2"><Check className="h-4 w-4 text-emerald-600" /> Review AI reply drafts</span>
            </div>
          </div>

          <div id="product" className="min-w-0">
            <ProductPreview />
            <p className="mt-4 text-center text-xs text-slate-400">
              Product preview · Illustrative conversations, not customer data
            </p>
          </div>
        </div>
      </section>

      {/* Feature strip */}
      <section className="border-y border-slate-100 bg-slate-50/70 dark:border-slate-900 dark:bg-slate-900/30">
        <div className="mx-auto grid max-w-7xl gap-4 px-6 py-8 sm:grid-cols-5 lg:px-8">
          {['WhatsApp CRM', 'AI Replies', 'Automation', 'Broadcasts', 'Team Inbox'].map(
            (item) => (
              <div
                key={item}
                className="flex items-center justify-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300"
              >
                <Check className="h-4 w-4 text-emerald-600" />
                {item}
              </div>
            ),
          )}
        </div>
      </section>

      {/* WhatsApp to online store */}
      <section id="shopping-journey" className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-emerald-600">
            Conversations that move commerce forward
          </p>
          <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
            From WhatsApp chat to online store.
          </h2>
          <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-300 sm:text-lg">
            Help shoppers get answers, discover products, and continue to your store—with RedANT keeping customer conversations and follow-ups organized.
          </p>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {[
            { number: '01', title: 'Start a conversation', description: 'Customers ask about products, prices, sizes, delivery, and availability on WhatsApp.' },
            { number: '02', title: 'Guide product discovery', description: 'Give helpful answers and guide shoppers to relevant products in your existing catalogue or store.' },
            { number: '03', title: 'Continue to checkout', description: 'Direct customers to your online store and keep follow-ups connected to the conversation.' },
          ].map((step) => (
            <div key={step.number} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-emerald-200 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-100 text-sm font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">{step.number}</span>
              <h3 className="mt-5 text-lg font-bold">{step.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{step.description}</p>
            </div>
          ))}
        </div>
        <p className="mt-5 text-center text-xs text-slate-400">
          Store connections and checkout depend on your ecommerce platform and configured integrations.
        </p>
      </section>

      {/* Features */}
      <section
        id="features"
        className="mx-auto max-w-7xl px-6 py-24 lg:px-8"
      >
        <div className="max-w-2xl">
          <p className="text-sm font-bold uppercase tracking-widest text-red-600">
            Everything in one place
          </p>

          <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
            Build a better customer experience on WhatsApp.
          </h2>

          <p className="mt-4 text-lg leading-8 text-slate-500 dark:text-slate-300">
            From product questions to order enquiries, keep conversations,
            contacts and follow-ups together so your team can respond with more
            context and less confusion.
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon

            return (
              <div
                key={feature.title}
                className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-1.5 hover:border-red-200 hover:shadow-2xl hover:shadow-red-950/5 dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-red-900 dark:hover:shadow-black/20"
              >
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-red-50 to-rose-100 text-red-600 transition duration-300 group-hover:scale-110 dark:from-red-950/50 dark:to-rose-950/30 dark:text-red-300">
                  <Icon className="h-5 w-5" />
                </div>

                <h3 className="mt-5 font-bold">{feature.title}</h3>

                <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                  {feature.description}
                </p>
              </div>
            )
          })}
        </div>
      </section>

      {/* How it works */}
      <section
        id="how-it-works"
        className="bg-slate-950 py-24 text-white"
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-widest text-red-400">
              Simple workflow
            </p>

            <h2 className="mt-3 text-3xl font-black sm:text-4xl">
              From first message to follow-up.
            </h2>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-4">
            {workflowSteps.map((step) => (
              <div
                key={step.number}
                className="group rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.02] p-6 transition hover:-translate-y-1 hover:border-red-400/40 hover:bg-white/[0.08]"
              >
                <span className="grid h-10 w-10 place-items-center rounded-xl border border-red-400/30 bg-red-500/10 text-sm font-bold text-red-300">
                  {step.number}
                </span>

                <h3 className="mt-6 text-lg font-bold">
                  {step.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-400">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Businesses */}
      <section className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-rose-50 via-white to-emerald-50 p-8 dark:border-slate-800 dark:from-slate-900 dark:via-slate-950 dark:to-emerald-950/20 sm:p-12">
          <div className="pointer-events-none absolute -right-12 -top-16 h-56 w-56 rounded-full bg-red-200/40 blur-3xl dark:bg-red-900/20" />
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-widest text-red-600">
              Made for growing businesses
            </p>

            <h2 className="mt-3 text-3xl font-black sm:text-4xl">
              Built for the businesses customers message before they buy.
            </h2>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            {businesses.map((business) => (
              <span
                key={business}
                className="rounded-xl border border-white bg-white/85 px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-red-200 hover:text-red-700 dark:border-slate-700 dark:bg-slate-950/80 dark:text-slate-200"
              >
                {business}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section
        id="pricing"
        className="border-y border-slate-100 bg-slate-50/60 py-24 dark:border-slate-900 dark:bg-slate-900/20"
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-bold uppercase tracking-widest text-red-600">
              Simple plans
            </p>

            <h2 className="mt-3 text-3xl font-black sm:text-4xl">
              Choose the workspace that fits your business.
            </h2>

            <p className="mt-4 text-slate-500 dark:text-slate-300">
              Choose a plan based on how your team works today. Confirm setup
              requirements and any applicable WhatsApp or Meta messaging charges
              before launching campaigns.
            </p>
          </div>

          <p className="mx-auto mt-4 max-w-3xl text-center text-xs leading-5 text-slate-400">
            Plan features and messaging charges should be confirmed for your
            account before purchase. WhatsApp/Meta fees, where applicable, may
            be separate from the RedANT subscription.
          </p>

          <div className="mx-auto mt-8 grid max-w-5xl gap-5 md:grid-cols-3">
            {plans.map((plan, index) => (
              <div
                key={plan.name}
                className={`rounded-2xl border p-7 ${
                  index === 1
                    ? 'border-red-300 bg-white shadow-xl shadow-red-100 dark:border-red-800 dark:bg-slate-950 dark:shadow-black/20'
                    : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950'
                }`}
              >
                {index === 1 && (
                  <span className="rounded-full bg-red-600 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                    Popular
                  </span>
                )}

                <h3 className="mt-4 text-lg font-bold">
                  {plan.name}
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  {plan.subtitle}
                </p>

                <div className="mt-6 text-3xl font-black">
                  {plan.price}
                  <span className="text-sm font-medium text-slate-400">
                    {' '}
                    / month
                  </span>
                </div>

                <ul className="mt-6 space-y-3 text-sm text-slate-600 dark:text-slate-300">
                  {plan.items.map((item) => (
                    <li
                      key={item}
                      className="flex gap-2"
                    >
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                      {item}
                    </li>
                  ))}
                </ul>

                <Link
                  href="/signup"
                  className="mt-7 flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold transition hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-900"
                >
                  Get started
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section
        id="faq"
        className="mx-auto max-w-4xl px-6 py-24 lg:px-8"
      >
        <div className="text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-red-600">
            FAQ
          </p>

          <h2 className="mt-3 text-3xl font-black sm:text-4xl">
            Questions, answered.
          </h2>
        </div>

        <div className="mt-10 divide-y divide-slate-200 rounded-2xl border border-slate-200 dark:divide-slate-800 dark:border-slate-800">
          {faqs.map((faq) => (
            <details
              key={faq.question}
              className="group p-5"
            >
              <summary className="cursor-pointer list-none font-semibold">
                {faq.question}

                <span className="float-right text-slate-400 transition group-open:rotate-90">
                  ›
                </span>
              </summary>

              <p className="mt-3 max-w-3xl pr-8 text-sm leading-6 text-slate-500 dark:text-slate-400">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 pb-24 lg:px-8">
        <div className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-700 via-green-600 to-teal-600 px-6 py-14 text-center text-white shadow-2xl shadow-green-600/25 sm:px-12">
          <div className="pointer-events-none absolute -right-10 -top-20 h-64 w-64 rounded-full border border-white/15" />
          <div className="pointer-events-none absolute -bottom-36 -left-12 h-72 w-72 rounded-full border border-white/15" />
          <h2 className="text-3xl font-black sm:text-4xl">
            Your customers are already on WhatsApp.
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-green-50">
            Start managing those conversations like a business with RedANT.
          </p>

          <Link
            href="/signup"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 font-semibold text-green-700 transition hover:bg-green-50"
          >
            Start with RedANT
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 text-slate-300">
        <div className="mx-auto max-w-7xl px-6 pb-10 pt-14 lg:px-8 lg:pt-16">
          <div className="grid gap-10 lg:grid-cols-[1.4fr_2fr]">
            <div className="max-w-md">
              <Link href="/" aria-label="RedANT home" className="inline-flex items-center">
                <BrandLogo />
              </Link>
              <h2 className="mt-6 text-2xl font-black leading-tight text-white sm:text-3xl">
                From WhatsApp chat to online store.
              </h2>
              <p className="mt-4 text-sm leading-6 text-slate-400">
                Bring customer conversations, AI-assisted replies, and follow-ups into one workspace built for growing businesses.
              </p>
              <Link href="/signup" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#16A34A] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#15803D]">
                Get started <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-x-6 gap-y-9 sm:grid-cols-3">
              <div>
                <h3 className="text-sm font-bold text-white">Product</h3>
                <ul className="mt-4 space-y-3 text-sm">
                  <li><a className="transition hover:text-emerald-400" href="#features">WhatsApp CRM</a></li>
                  <li><a className="transition hover:text-emerald-400" href="#features">AI-assisted replies</a></li>
                  <li><a className="transition hover:text-emerald-400" href="#features">Automation</a></li>
                  <li><a className="transition hover:text-emerald-400" href="#features">Team inbox & broadcasts</a></li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Solutions</h3>
                <ul className="mt-4 space-y-3 text-sm">
                  <li><a className="transition hover:text-emerald-400" href="#shopping-journey">Online stores</a></li>
                  <li><a className="transition hover:text-emerald-400" href="#how-it-works">Lead follow-ups</a></li>
                  <li><a className="transition hover:text-emerald-400" href="#pricing">Plans for growing teams</a></li>
                  <li><a className="transition hover:text-emerald-400" href="#faq">Common questions</a></li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Explore</h3>
                <ul className="mt-4 space-y-3 text-sm">
                  <li><a className="transition hover:text-emerald-400" href="#how-it-works">How it works</a></li>
                  <li><a className="transition hover:text-emerald-400" href="#pricing">Pricing</a></li>
                  <li><Link className="transition hover:text-emerald-400" href="/login">Log in</Link></li>
                  <li><Link className="transition hover:text-emerald-400" href="/signup">Create account</Link></li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-12 border-t border-slate-800 pt-6">
            <div className="flex flex-col gap-3 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
              <p>© {new Date().getFullYear()} RedANT. All rights reserved.</p>
              <p>WhatsApp CRM · AI-assisted replies · Customer automation</p>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}
