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

  return (
    <div className="relative mx-auto flex w-full max-w-md items-center justify-center px-3 py-4 sm:py-6">
      <div className="redant-orb pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-red-400/30 via-fuchsia-400/15 to-emerald-400/35 blur-3xl" style={{ animation: 'redant-glow 5s ease-in-out infinite' }} />
      <div className="pointer-events-none absolute inset-x-5 top-10 h-64 rounded-[3rem] border border-white/70 bg-gradient-to-br from-white/60 via-rose-50/40 to-emerald-50/50 shadow-[inset_0_1px_0_rgba(255,255,255,.8)] backdrop-blur-sm" />
      <div className="redant-device relative w-full max-w-[17rem] rounded-[2.7rem] border-[7px] border-[#24262b] bg-[#24262b] p-[5px] shadow-[0_35px_90px_-24px_rgba(15,23,42,0.65),0_0_0_1px_rgba(255,255,255,.7)] sm:max-w-[18rem]" style={{ animation: 'redant-float 6s ease-in-out infinite' }}>
        <span className="pointer-events-none absolute -left-[9px] top-24 h-9 w-[3px] rounded-l bg-slate-500" aria-hidden="true" />
        <span className="pointer-events-none absolute -left-[9px] top-36 h-12 w-[3px] rounded-l bg-slate-500" aria-hidden="true" />
        <span className="pointer-events-none absolute -right-[9px] top-32 h-14 w-[3px] rounded-r bg-slate-500" aria-hidden="true" />
        <div className="relative overflow-hidden rounded-[2.15rem] bg-[#efeae2] text-slate-950">
          <div className="relative z-10 flex h-8 items-center justify-between bg-[#f8f8f8] px-5 text-[10px] font-semibold">
            <span>9:41</span>
            <span className="absolute left-1/2 top-1.5 h-[19px] w-[76px] -translate-x-1/2 rounded-full bg-black" aria-label="iPhone Dynamic Island" />
            <span aria-hidden="true">● ▰</span>
          </div>
          <div className="flex items-center gap-2.5 bg-[#075e54] px-3 py-3 text-white">
            <span className="text-lg leading-none" aria-hidden="true">‹</span>
            <div className="grid h-9 w-9 place-items-center rounded-full bg-white text-[11px] font-black text-emerald-800"><BrandLogo compact /></div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[12px] font-bold">Born Ruler Store</p>
              <p className="text-[9px] text-emerald-100">business account</p>
            </div>
            <span className="text-sm" aria-hidden="true">⌕</span><span className="text-sm" aria-hidden="true">⋮</span>
          </div>
          <div className="relative min-h-[23rem] space-y-3 overflow-hidden px-3 py-4">
            <div className="pointer-events-none absolute inset-0 opacity-[0.13]" style={{backgroundImage:"radial-gradient(#8f9b8d 0.7px, transparent 0.7px)",backgroundSize:"9px 9px"}} />
            <div className="relative mx-auto w-fit rounded-md bg-[#fff4c7] px-3 py-1 text-[9px] font-medium text-slate-600 shadow-sm">TODAY</div>
            <div className="relative mr-8 rounded-xl rounded-tl-sm bg-white px-3 py-2.5 text-[11px] leading-[1.55] shadow-sm">
              Hi! Is this red dress available in size 6?
              <div className="mt-1 text-right text-[8px] text-slate-400">10:41 AM</div>
            </div>
            <div className="relative ml-8 rounded-xl rounded-tr-sm bg-[#d9fdd3] px-3 py-2.5 text-[11px] leading-[1.55] shadow-sm">
              Hi there! 😊 Yes, it’s available in size 6.
              <div className="mt-1 flex items-center justify-end gap-1 text-[8px] text-slate-500">10:41 AM <span className="text-blue-500">✓✓</span></div>
            </div>
            <div className="relative mr-8 rounded-xl rounded-tl-sm bg-white px-3 py-2.5 text-[11px] leading-[1.55] shadow-sm">
              Great! Can I order with cash on delivery?
              <div className="mt-1 text-right text-[8px] text-slate-400">10:42 AM</div>
            </div>
            <div className="relative ml-8 rounded-xl rounded-tr-sm bg-[#d9fdd3] px-3 py-2.5 text-[11px] leading-[1.55] shadow-sm">
              {replyUsed ? "Absolutely! Cash on delivery is available. Want me to help you place your order?" : "Absolutely! Cash on delivery is available. Would you like me to help you place your order?"}
              <div className="mt-1 flex items-center justify-end gap-1 text-[8px] text-slate-500">10:42 AM <span className="text-blue-500">✓✓</span></div>
            </div>
            <div className="relative rounded-xl border border-emerald-200 bg-white/95 p-2.5 shadow-sm">
              <div className="flex items-center gap-1.5 text-[9px] font-bold text-emerald-700"><Sparkles className="h-3.5 w-3.5" /> RedANT AI suggestion</div>
              <p className="mt-1 text-[9px] leading-4 text-slate-600">Reply in seconds, keep the conversation natural, and let your team take over when needed.</p>
              <button type="button" onClick={() => setReplyUsed((used) => !used)} className="mt-2 w-full rounded-lg bg-emerald-600 px-3 py-2 text-[10px] font-bold text-white transition hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500">{replyUsed ? "✓ Reply preview added" : "Preview AI reply"}</button>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-[#f7f7f7] px-2.5 py-2.5">
            <span className="text-lg text-slate-500" aria-hidden="true">＋</span>
            <div className="flex h-9 flex-1 items-center rounded-full bg-white px-3 text-[10px] text-slate-400 shadow-sm">Message</div>
            <span className="text-sm text-slate-500" aria-hidden="true">⌁</span>
            <span className="grid h-8 w-8 place-items-center rounded-full bg-[#075e54] text-white" aria-hidden="true">➤</span>
          </div>
          <div className="flex justify-center bg-[#f7f7f7] pb-2 pt-1"><span className="h-1 w-24 rounded-full bg-slate-900" aria-hidden="true" /></div>
        </div>
      </div>
    </div>
  )
}

export default function RootPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-white text-slate-950 dark:bg-slate-950 dark:text-white">
      <style jsx global>{`
        @keyframes redant-float { 0%, 100% { transform: translate3d(0, 0, 0); } 50% { transform: translate3d(0, -12px, 0); } }
        @keyframes redant-drift { 0%, 100% { transform: translate3d(0, 0, 0) scale(1); } 50% { transform: translate3d(14px, -10px, 0) scale(1.06); } }
        @keyframes redant-glow { 0%, 100% { opacity: .48; } 50% { opacity: .9; } }
        @keyframes redant-shimmer { 0% { transform: translateX(-150%) rotate(18deg); } 100% { transform: translateX(250%) rotate(18deg); } }
        @keyframes redant-rise { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @media (prefers-reduced-motion: reduce) { .redant-motion, .redant-device, .redant-orb, .redant-shimmer { animation: none !important; transition: none !important; } }
      `}</style>
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
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden bg-[radial-gradient(ellipse_at_10%_8%,rgba(248,113,113,0.23),transparent_34%),radial-gradient(ellipse_at_88%_22%,rgba(16,185,129,0.17),transparent_30%),radial-gradient(ellipse_at_50%_72%,rgba(196,181,253,0.13),transparent_35%)]" />
        <div className="pointer-events-none absolute inset-0 -z-10 opacity-40 [background-image:linear-gradient(rgba(148,163,184,0.10)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.10)_1px,transparent_1px)] [background-size:42px_42px] [mask-image:linear-gradient(to_bottom,black,transparent_78%)]" />
        <div className="redant-orb pointer-events-none absolute -right-20 top-28 -z-10 h-80 w-80 rounded-full bg-gradient-to-br from-rose-300/25 to-red-500/10 blur-3xl" style={{ animation: 'redant-drift 11s ease-in-out infinite' }} />
        <div className="redant-orb pointer-events-none absolute -left-24 top-72 -z-10 h-72 w-72 rounded-full bg-gradient-to-br from-emerald-300/25 to-cyan-300/10 blur-3xl" style={{ animation: 'redant-drift 13s ease-in-out infinite reverse' }} />
        <div className="pointer-events-none absolute right-8 top-28 -z-10 h-72 w-72 rounded-full border border-red-200/60 dark:border-red-900/30" />

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
              className="rounded-xl bg-[#16A34A] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-green-600/25 transition duration-300 hover:-translate-y-0.5 hover:bg-[#15803D] hover:shadow-xl hover:shadow-green-600/30"
            >
              Get started
            </Link>
          </div>
        </nav>

        <div className="mx-auto grid max-w-7xl items-center gap-8 px-6 pb-12 pt-8 lg:grid-cols-[0.94fr_1.06fr] lg:gap-8 lg:px-8 lg:pb-16 lg:pt-10">
          <div className="redant-motion text-center lg:text-left" style={{ animation: 'redant-rise .8s ease-out both' }}>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-red-100/80 bg-white/75 px-3 py-1.5 text-xs font-semibold text-red-700 shadow-sm shadow-red-100/60 backdrop-blur-md dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
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

          <div id="product" className="redant-motion min-w-0" style={{ animation: 'redant-rise .9s .12s ease-out both' }}>
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

      {/* Oversized brand footer inspired by the reference, using RedANT's own identity. */}
      <footer className="overflow-hidden border-t border-slate-800 bg-[#020b24] text-slate-300">
        <div className="mx-auto max-w-[1600px] px-6 pb-6 pt-10 sm:px-10 lg:px-12 lg:pt-12">
          <div className="flex flex-wrap items-center justify-between gap-5">
            <Link href="/" aria-label="RedANT home" className="inline-flex items-center gap-3">
              <BrandLogo />
              <span className="text-lg font-bold tracking-tight text-white">RedANT</span>
            </Link>
            <nav aria-label="Footer quick links" className="flex flex-wrap gap-x-6 gap-y-3 text-sm">
              <a className="transition hover:text-emerald-300" href="#features">Features</a>
              <a className="transition hover:text-emerald-300" href="#shopping-journey">How it works</a>
              <a className="transition hover:text-emerald-300" href="#pricing">Pricing</a>
              <a className="transition hover:text-emerald-300" href="#faq">FAQ</a>
              <Link className="transition hover:text-emerald-300" href="/login">Log in</Link>
              <Link className="transition hover:text-emerald-300" href="/signup">Get started</Link>
            </nav>
          </div>

          <div className="relative mt-8 select-none overflow-hidden" aria-label="RedANT brand wordmark">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-emerald-400/10 via-transparent to-red-500/10 blur-2xl" />
            <p className="relative whitespace-nowrap bg-gradient-to-b from-emerald-300 via-lime-400 to-emerald-500 bg-clip-text text-center text-[21vw] font-black leading-[0.78] tracking-[-0.075em] text-transparent sm:text-[18vw] lg:text-[16.5vw]">
              RedANT
            </p>
          </div>

          <div className="mt-8 flex flex-col gap-3 border-t border-white/10 pt-5 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
            <p>© {new Date().getFullYear()} RedANT. All rights reserved.</p>
            <div className="flex flex-wrap gap-x-5 gap-y-2">
              <Link href="/privacy-policy" className="transition hover:text-white">Privacy Policy</Link>
              <Link href="/terms" className="transition hover:text-white">Terms</Link>
              <Link href="/support" className="transition hover:text-white">Support</Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}
