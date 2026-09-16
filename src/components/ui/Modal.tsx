import { useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { cn } from '../../lib/cn'
import { IconButton } from './Button'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  subtitle?: string
  children: ReactNode
  footer?: ReactNode
  size?: 'md' | 'lg'
}

export function Modal({ open, onClose, title, subtitle, children, footer, size = 'md' }: ModalProps) {
  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = previous
    }
  }, [open, onClose])

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/25 backdrop-blur-[3px]"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0, y: 28, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 380, damping: 34, mass: 0.7 }}
            className={cn(
              'surface relative flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-[28px] shadow-lift',
              'sm:rounded-[28px]',
              size === 'lg' ? 'sm:max-w-3xl' : 'sm:max-w-lg',
            )}
          >
            <header className="flex items-start justify-between gap-4 border-b border-[rgb(var(--hairline))] px-6 py-5">
              <div>
                <h2 className="text-[18px] font-semibold tracking-[-0.02em] text-1">{title}</h2>
                {subtitle && <p className="mt-0.5 text-[13px] text-2">{subtitle}</p>}
              </div>
              <IconButton
                label="Fechar"
                size="sm"
                variant="ghost"
                onClick={onClose}
                icon={<X className="size-4" />}
              />
            </header>

            <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>

            {footer && (
              <footer className="flex items-center justify-end gap-2 border-t border-[rgb(var(--hairline))] bg-[rgb(var(--surface-sunken))]/60 px-6 py-4">
                {footer}
              </footer>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
