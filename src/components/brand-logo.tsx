'use client'

import Image from 'next/image'

type BrandLogoProps = {
  compact?: boolean
  className?: string
}

/**
 * Shared RedANT brand mark used by the public site and signed-in app.
 * Uses the official mascot asset from /public/redant_logo_crop.png.
 */
export function BrandLogo({ compact = false, className = '' }: BrandLogoProps) {
  return (
    <span className={`inline-flex min-w-0 items-center gap-2.5 ${className}`}>
      <span
        aria-hidden={compact ? undefined : true}
        className="relative grid size-9 shrink-0 place-items-center overflow-hidden rounded-xl bg-white"
      >
        <Image
          src="/redant_logo_crop.png"
          alt={compact ? 'RedANT logo' : ''}
          width={36}
          height={36}
          priority
          className="size-9 object-contain"
        />
      </span>
      {!compact && (
        <span className="whitespace-nowrap text-xl font-extrabold tracking-tight text-foreground">
          Red<span className="text-red-600">ANT</span>
        </span>
      )}
    </span>
  )
}
