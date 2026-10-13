'use client'

import { Bug } from 'lucide-react'

type BrandLogoProps = {
  compact?: boolean
  className?: string
}

/**
 * Shared RedANT brand mark used by the public site and signed-in app.
 * Keep the red ant mark and wordmark identical across both surfaces.
 */
export function BrandLogo({ compact = false, className = '' }: BrandLogoProps) {
  return (
    <span className={`inline-flex min-w-0 items-center gap-2.5 ${className}`}>
      <span
        aria-hidden="true"
        className="grid size-9 shrink-0 place-items-center rounded-xl bg-red-600 text-white shadow-md shadow-red-600/20"
      >
        <Bug className="size-5" strokeWidth={2.4} />
      </span>
      {!compact && (
        <span className="whitespace-nowrap text-xl font-extrabold tracking-tight text-foreground">
          Red<span className="text-red-600">ANT</span>
        </span>
      )}
    </span>
  )
}
