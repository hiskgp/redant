'use client'

import Link from 'next/link'
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
  return (
    <div className="relative mx-auto w-full max-w-5xl">
      <div className="absolute -inset-8 rounded-[3rem] bg-red-500/10 blur-3xl" />

      <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-950">
        <div className="flex items-center gap-2 border-b border-slate-200 px-5 py-4 dark:border-slate-800">
          <span className="h-3 w-3 rounded-full bg-red-400" />
          <span className="h-3 w-3 rounded-full bg-amber-400" />
          <span className="h-3 w-3 rounded-full bg-emerald-400" />
          <span className="ml-3 text-xs font-medium text-slate-400">
            RedANT Workspace
          </span>
        </div>

        <div className="grid min-h-[390px] grid-cols-[180px_1fr] sm:grid-cols-[220px_1fr]">
          <aside className="hidden border-r border-slate-200 p-4 sm:block dark:border-slate-800">
            <div className="mb-7 flex items-center gap-2 font-bold">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-red-600 text-sm text-white">
                R
              </span>
              RedANT
            </div>

            <div className="space-y-2 text-sm">
              {['Inbox', 'Contacts', 'Broadcasts', 'Automations'].map(
                (item, index) => (
                  <div
                    key={item}
                    className={`rounded-lg px-3 py-2 ${
                      index === 0
                        ? 'bg-red-50 font-semibold text-red-700 dark:bg-red-950/40 dark:text-red-300'
                        : 'text-slate-500'
                    }`}
                  >
                    {item}
                  </div>
                ),
              )}
            </div>
          </aside>

          <main className="grid grid-cols-1 md:grid-cols-[1fr_1.1fr]">
            <div className="border-b border-slate-200 p-5 md:border-b-0 md:border-r dark:border-slate-800">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400">Inbox</p>
                  <h3 className="font-semibold">Customer conversations</h3>
                </div>

                <span className="rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-semibold text-emerald-700">
                  Live
                </span>
              </div>

              <div className="space-y-3">
                {conversations.map((conversation, index) => (
                  <div
                    key={conversation.name}
                    className={`rounded-xl border p-3 ${
                      index === 0
                        ? 'border-red-200 bg-red-50/70 dark:border-red-900/60 dark:bg-red-950/20'
                        : 'border-slate-100 dark:border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold">
                        {conversation.name}
                      </span>

                      <span className="text-[10px] text-slate-400">
                        {conversation.time}
                      </span>
                    </div>

                    <p className="mt-1 truncate text-xs text-slate-500">
                      {conversation.message}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-5">
              <div className="mb-5">
                <p className="text-xs text-slate-400">Priya Boutique</p>
                <h3 className="font-semibold">Customer conversation</h3>
              </div>

              <div className="space-y-3 text-xs">
                <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-slate-100 px-4 py-3 text-slate-600 dark:bg-slate-900 dark:text-slate-300">
                  Hi! Do you have this dress in red?
                </div>

                <div className="ml-auto max-w-[85%] rounded-2xl rounded-tr-sm bg-emerald-600 px-4 py-3 text-white">
                  Yes! Red is available. I can share the size options with you.
                  😊
                </div>

                <div className="rounded-xl border border-dashed border-red-200 bg-red-50/50 p-3 dark:border-red-900/50 dark:bg-red-950/20">
                  <div className="mb-2 flex items-center gap-2 font-semibold text-red-700 dark:text-red-300">
                    <Sparkles className="h-3.5 w-3.5" />
                    AI suggestion
                  </div>

                  <p className="text-slate-500">
                    Reply generated from your configured business context.
                  </p>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
    </div>
  )
}

export default function RootPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-white text-slate-950 dark:bg-slate-950 dark:text-white">
      {/* Hero */}
      <section className="relative">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_0%,rgba(239,68,68,0.14),transparent_45%)]" />

        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8">
          <Link
            href="/"
            className="flex items-center gap-2.5 font-bold tracking-tight"
          >
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-red-600 text-white shadow-lg shadow-red-600/20">
              R
            </span>

            <span className="text-xl">
              Red<span className="text-red-600">ANT</span>
            </span>
          </Link>

          <div className="hidden items-center gap-8 text-sm font-medium text-slate-500 md:flex dark:text-slate-300">
            <a
              href="#features"
              className="transition hover:text-red-600"
            >
              Features
            </a>

            <a
              href="#how-it-works"
              className="transition hover:text-red-600"
            >
              How it works
            </a>

            <a
              href="#pricing"
              className="transition hover:text-red-600"
            >
              Pricing
            </a>

            <a
              href="#faq"
              className="transition hover:text-red-600"
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
              className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-red-600/20 transition hover:bg-red-700"
            >
              Start Free
            </Link>
          </div>
        </nav>

        <div className="mx-auto max-w-7xl px-6 pb-20 pt-16 text-center lg:px-8 lg:pb-28 lg:pt-24">
          <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-red-100 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
            <Sparkles className="h-3.5 w-3.5" />
            WhatsApp CRM + AI + Automation
          </div>

          <h1 className="mx-auto max-w-5xl text-5xl font-black tracking-tight sm:text-6xl lg:text-7xl">
            Turn WhatsApp conversations into{' '}
            <span className="text-red-600">sales.</span>
          </h1>

          <p className="mx-auto mt-7 max-w-2xl text-lg leading-8 text-slate-500 sm:text-xl dark:text-slate-300">
            RedANT helps businesses manage customer conversations, automate
            replies, follow up with leads and grow from one powerful WhatsApp
            workspace.
          </p>

          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-6 py-3.5 font-semibold text-white shadow-xl shadow-red-600/20 transition hover:bg-red-700"
            >
              Start Free
              <ArrowRight className="h-4 w-4" />
            </Link>

            <a
              href="#product"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-6 py-3.5 font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-900"
            >
              <Play className="h-4 w-4" />
              See how it works
            </a>
          </div>
        </div>

        <div
          id="product"
          className="mx-auto max-w-7xl px-6 pb-24 lg:px-8"
        >
          <ProductPreview />
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
            Stop switching between chats, spreadsheets and disconnected tools.
            Give your team one workspace for customer communication.
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon

            return (
              <div
                key={feature.title}
                className="rounded-2xl border border-slate-200 p-6 transition hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/50 dark:border-slate-800 dark:hover:shadow-black/20"
              >
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-300">
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
                className="rounded-2xl border border-white/10 bg-white/5 p-6"
              >
                <span className="text-sm font-bold text-red-400">
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
        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8 dark:border-slate-800 dark:bg-slate-900/50 sm:p-12">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-widest text-red-600">
              Made for growing businesses
            </p>

            <h2 className="mt-3 text-3xl font-black sm:text-4xl">
              Whether you sell products or services, your customers are already
              on WhatsApp.
            </h2>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            {businesses.map((business) => (
              <span
                key={business}
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium dark:border-slate-700 dark:bg-slate-950"
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
              Start small and move up as your customer conversations grow.
            </p>
          </div>

          <div className="mx-auto mt-12 grid max-w-5xl gap-5 md:grid-cols-3">
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
        <div className="mx-auto max-w-5xl overflow-hidden rounded-3xl bg-red-600 px-6 py-14 text-center text-white shadow-2xl shadow-red-600/20 sm:px-12">
          <h2 className="text-3xl font-black sm:text-4xl">
            Your customers are already on WhatsApp.
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-red-100">
            Start managing those conversations like a business with RedANT.
          </p>

          <Link
            href="/signup"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 font-semibold text-red-700 transition hover:bg-red-50"
          >
            Start with RedANT
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <div className="font-semibold text-slate-900 dark:text-white">
            Red<span className="text-red-600">ANT</span>
          </div>

          <div>WhatsApp CRM · AI · Automation</div>

          <div>© {new Date().getFullYear()} RedANT</div>
        </div>
      </footer>
    </main>
  )
}
