import { motion, type HTMLMotionProps } from 'framer-motion'
import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

interface CardProps extends HTMLMotionProps<'div'> {
  interactive?: boolean
  padded?: boolean
  children?: ReactNode
}

export function Card({ interactive, padded = true, className, children, ...rest }: CardProps) {
  return (
    <motion.div
      whileHover={interactive ? { y: -3 } : undefined}
      transition={{ type: 'spring', stiffness: 380, damping: 32 }}
      className={cn(
        'surface rounded-[22px] shadow-soft will-change-transform',
        interactive &&
          'cursor-pointer transition-shadow duration-300 ease-[var(--ease-out-soft)] hover:shadow-lift',
        padded && 'p-5',
        className,
      )}
      {...rest}
    >
      {children}
    </motion.div>
  )
}

export function SectionTitle({
  title,
  subtitle,
  action,
}: {
  title: string
  subtitle?: string
  action?: ReactNode
}) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <div>
        <h2 className="text-[17px] font-semibold tracking-[-0.02em] text-1">{title}</h2>
        {subtitle && <p className="mt-0.5 text-[13px] text-2">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}
