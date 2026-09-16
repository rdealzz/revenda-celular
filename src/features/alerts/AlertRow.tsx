import { motion } from 'framer-motion'
import { AlertTriangle, ChevronRight, CircleAlert, Info } from 'lucide-react'
import type { Alert, AlertLevel } from '../../lib/alerts'
import { cn } from '../../lib/cn'

const ICONS: Record<AlertLevel, typeof Info> = {
  critical: CircleAlert,
  warning: AlertTriangle,
  info: Info,
}

const TONES: Record<AlertLevel, string> = {
  critical: 'bg-negative/12 text-negative',
  warning: 'bg-caution/16 text-caution',
  info: 'bg-accent/12 text-accent',
}

export function AlertRow({ alert, onClick }: { alert: Alert; onClick: () => void }) {
  const Icon = ICONS[alert.level]

  return (
    <motion.div whileHover={{ x: 2 }} transition={{ type: 'spring', stiffness: 460, damping: 34 }}>
      <button
        type="button"
        onClick={onClick}
        className="flex w-full items-start gap-3 rounded-2xl px-3 py-2.5 text-left transition-colors duration-200 hover:bg-[rgb(var(--hairline))]"
      >
        <span className={cn('mt-0.5 grid size-8 shrink-0 place-items-center rounded-[10px]', TONES[alert.level])}>
          <Icon className="size-4" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[13.5px] font-medium text-1">{alert.title}</span>
          <span className="block text-[12.5px] leading-snug text-2">{alert.description}</span>
        </span>
        <ChevronRight className="mt-1.5 size-4 shrink-0 text-3" />
      </button>
    </motion.div>
  )
}
