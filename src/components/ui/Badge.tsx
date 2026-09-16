import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'
import type { DeviceStatus } from '../../types'

const TONES = {
  neutral: 'bg-[rgb(var(--hairline))] text-2',
  accent: 'bg-accent/12 text-accent',
  positive: 'bg-positive/12 text-positive',
  negative: 'bg-negative/12 text-negative',
  caution: 'bg-caution/16 text-caution',
  violet: 'bg-violet/12 text-violet',
} as const

export type Tone = keyof typeof TONES

export function Badge({
  tone = 'neutral',
  children,
  className,
}: {
  tone?: Tone
  children: ReactNode
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[12px] font-medium',
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}

const STATUS_META: Record<DeviceStatus, { label: string; tone: Tone }> = {
  estoque: { label: 'Em estoque', tone: 'accent' },
  reservado: { label: 'Reservado', tone: 'caution' },
  vendido: { label: 'Vendido', tone: 'positive' },
}

export function StatusBadge({ status }: { status: DeviceStatus }) {
  const meta = STATUS_META[status]
  return (
    <Badge tone={meta.tone}>
      <span className="size-1.5 rounded-full bg-current" />
      {meta.label}
    </Badge>
  )
}
