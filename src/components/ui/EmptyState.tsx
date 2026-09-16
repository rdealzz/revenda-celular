import type { ReactNode } from 'react'
import { motion } from 'framer-motion'

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: ReactNode
  title: string
  description: string
  action?: ReactNode
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col items-center justify-center px-6 py-20 text-center"
    >
      <div className="mb-5 grid size-14 place-items-center rounded-2xl bg-[rgb(var(--hairline))] text-2">
        {icon}
      </div>
      <h3 className="text-[16px] font-semibold tracking-[-0.01em] text-1">{title}</h3>
      <p className="mt-1.5 max-w-sm text-[13.5px] leading-relaxed text-2">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </motion.div>
  )
}
