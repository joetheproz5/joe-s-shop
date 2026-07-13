import { SITE_NAME } from '@/lib/constants'
import { clsx } from '@/lib/utils'

const assetUrl = (filename: string) => `${import.meta.env.BASE_URL}brand/${filename}`

export function BrandLogo({ className }: { className?: string }) {
  return (
    <span
      role="img"
      aria-label={SITE_NAME}
      className={clsx('relative block shrink-0 overflow-hidden bg-white [aspect-ratio:960/460]', className)}
    >
      <img
        src={assetUrl('the-tech-shelf-logo.png')}
        alt=""
        className="pointer-events-none absolute max-w-none"
        style={{ width: '130.625%', left: '-15.625%', top: '-80.435%' }}
      />
    </span>
  )
}

export function BrandMark({ className, decorative = false }: { className?: string; decorative?: boolean }) {
  return (
    <span
      role={decorative ? undefined : 'img'}
      aria-hidden={decorative || undefined}
      aria-label={decorative ? undefined : SITE_NAME}
      className={clsx('relative block shrink-0 overflow-hidden bg-white [aspect-ratio:400/300]', className)}
    >
      <img
        src={assetUrl('the-tech-shelf-logo.png')}
        alt=""
        className="pointer-events-none absolute max-w-none"
        style={{ width: '313.5%', left: '-108.75%', top: '-123.333%' }}
      />
    </span>
  )
}
