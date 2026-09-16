import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { cn } from '../../lib/cn'
import { AnimatedNumber } from '../../components/ui/AnimatedNumber'

export type StatTone = 'neutral' | 'accent' | 'positive' | 'negative' | 'violet' | 'caution'

const TONE_TEXT: Record<StatTone, string> = {
  neutral: 'text-1',
  accent: 'text-accent',
  positive: 'text-positive',
  negative: 'text-negative',
  violet: 'text-violet',
  caution: 'text-caution',
}

const TONE_ICON: Record<StatTone, string> = {
  neutral: 'bg-[rgb(var(--hairline))] text-2',
  accent: 'bg-accent/12 text-accent',
  positive: 'bg-positive/12 text-positive',
  negative: 'bg-negative/12 text-negative',
  violet: 'bg-violet/12 text-violet',
  caution: 'bg-caution/16 text-caution',
}

export interface StatCardProps {
  label: string
  value: number
  format: (value: number) => string
  icon: ReactNode
  tone?: StatTone
  caption?: string
  index?: number
}

export function StatCard({
  label,
  value,
  format,
  icon,
  tone = 'neutral',
  caption,
  index = 0,
}: StatCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.035, 0.28), duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -3 }}
      className="surface group rounded-[20px] p-4 shadow-soft transition-shadow duration-300 hover:shadow-lift"
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-[12px] font-medium leading-tight text-2">{label}</p>
        <span
          className={cn(
            'grid size-8 shrink-0 place-items-center rounded-[10px] transition-transform duration-300 group-hover:scale-105',
            TONE_ICON[tone],
          )}
        >
          {icon}
        </span>
      </div>

      <AnimatedNumber
        value={value}
        format={format}
        className={cn(
          'tabular mt-3 block text-[22px] font-semibold tracking-[-0.03em]',
          TONE_TEXT[tone],
        )}
      />

      {caption && <p className="mt-1 text-[11.5px] text-3">{caption}</p>}
    </motion.article>
  )
}
