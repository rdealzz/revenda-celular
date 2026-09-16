import { useId, useState, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react'
import { motion } from 'framer-motion'
import { cn } from '../../lib/cn'

const CONTROL =
  'w-full rounded-[13px] border border-[rgb(var(--hairline-strong))] bg-[rgb(var(--surface))] ' +
  'px-3.5 text-[14px] text-1 placeholder:text-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)_inset] ' +
  'transition-[border-color,box-shadow,background-color] duration-200 ease-[var(--ease-out-soft)] ' +
  'focus:border-accent/70 focus:outline-none focus:ring-4 focus:ring-accent/12 disabled:opacity-50'

export function Field({
  label,
  hint,
  children,
  className,
}: {
  label: string
  hint?: string
  children: ReactNode
  className?: string
}) {
  return (
    <label className={cn('block', className)}>
      <span className="mb-1.5 block text-[12px] font-medium tracking-[0.01em] text-2">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[11px] text-3">{hint}</span>}
    </label>
  )
}

export function Input({ className, ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(CONTROL, 'h-10', className)} {...rest} />
}

export function Textarea({ className, ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(CONTROL, 'py-2.5 leading-relaxed', className)} rows={3} {...rest} />
}

export function Select({ className, children, ...rest }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(CONTROL, 'h-10 appearance-none bg-no-repeat pr-9', className)}
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 12' fill='none' stroke='%236e6e73' stroke-width='1.6' stroke-linecap='round'%3E%3Cpath d='M3 4.5 6 7.5l3-3'/%3E%3C/svg%3E\")",
        backgroundPosition: 'right 12px center',
        backgroundSize: '12px',
      }}
      {...rest}
    >
      {children}
    </select>
  )
}

interface MoneyInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  value: number | null
  onValueChange: (value: number | null) => void
}

const toText = (value: number | null) =>
  value === null || Number.isNaN(value) ? '' : String(value).replace('.', ',')

export function MoneyInput({ value, onValueChange, className, ...rest }: MoneyInputProps) {
  /** Enquanto o campo está em edição o texto cru manda; fora dela, o valor do estado. */
  const [editing, setEditing] = useState<string | null>(null)
  const text = editing ?? toText(value)

  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[13px] text-3">
        R$
      </span>
      <input
        inputMode="decimal"
        value={text}
        onBlur={() => setEditing(null)}
        onChange={(event) => {
          const raw = event.target.value.replace(/[^\d,.-]/g, '')
          setEditing(raw)
          const parsed = Number.parseFloat(raw.replace(/\./g, '').replace(',', '.'))
          onValueChange(raw.trim() === '' ? null : Number.isNaN(parsed) ? null : parsed)
        }}
        placeholder="0,00"
        className={cn(CONTROL, 'tabular h-10 pl-9', className)}
        {...rest}
      />
    </div>
  )
}

export function Switch({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: (value: boolean) => void
  label: string
}) {
  const id = useId()
  return (
    <div className="flex items-center justify-between gap-4">
      <label htmlFor={id} className="text-[14px] text-1">
        {label}
      </label>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative h-[30px] w-[51px] shrink-0 rounded-full transition-colors duration-300 ease-[var(--ease-out-soft)]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[rgb(var(--page))]',
          checked ? 'bg-positive' : 'bg-[rgb(var(--hairline-strong))]',
        )}
      >
        <motion.span
          layout
          transition={{ type: 'spring', stiffness: 700, damping: 40 }}
          className="absolute top-[3px] size-6 rounded-full bg-white shadow-[0_2px_6px_rgba(0,0,0,0.25)]"
          style={{ left: checked ? 24 : 3 }}
        />
      </button>
    </div>
  )
}

export interface SegmentedOption<T extends string> {
  value: T
  label: string
  badge?: number
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  layoutId,
}: {
  options: SegmentedOption<T>[]
  value: T
  onChange: (value: T) => void
  layoutId: string
}) {
  return (
    <div className="no-scrollbar flex gap-1 overflow-x-auto rounded-[14px] bg-[rgb(var(--hairline))] p-1">
      {options.map((option) => {
        const active = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              'relative shrink-0 rounded-[11px] px-3.5 py-1.5 text-[13px] font-medium transition-colors duration-200',
              active ? 'text-1' : 'text-2 hover:text-1',
            )}
          >
            {active && (
              <motion.span
                layoutId={layoutId}
                transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                className="absolute inset-0 rounded-[11px] bg-[rgb(var(--surface))] shadow-[0_1px_3px_rgba(0,0,0,0.12)]"
              />
            )}
            <span className="relative flex items-center gap-1.5">
              {option.label}
              {option.badge !== undefined && (
                <span className={cn('tabular text-[11px]', active ? 'text-2' : 'text-3')}>
                  {option.badge}
                </span>
              )}
            </span>
          </button>
        )
      })}
    </div>
  )
}
