import { useCallback, useRef, useState, type ReactNode } from 'react'
import { motion, type HTMLMotionProps } from 'framer-motion'
import { cn } from '../../lib/cn'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

interface Ripple {
  id: number
  x: number
  y: number
  size: number
}

const VARIANTS: Record<Variant, string> = {
  primary:
    'text-white bg-[linear-gradient(180deg,#3d9bff_0%,#0071e3_52%,#0062c7_100%)] ' +
    'shadow-[0_1px_0_rgba(255,255,255,0.32)_inset,0_-1px_0_rgba(0,0,0,0.18)_inset,0_6px_16px_-6px_rgba(0,113,227,0.65)] ' +
    'hover:shadow-[0_1px_0_rgba(255,255,255,0.4)_inset,0_-1px_0_rgba(0,0,0,0.2)_inset,0_12px_26px_-8px_rgba(0,113,227,0.75)]',
  secondary:
    'text-1 bg-[rgb(var(--surface))] border border-[rgb(var(--hairline-strong))] ' +
    'shadow-[0_1px_0_rgba(255,255,255,0.6)_inset,0_2px_8px_-4px_rgba(0,0,0,0.25)] ' +
    'hover:bg-[rgb(var(--surface-sunken))]',
  ghost: 'text-2 hover:text-1 hover:bg-[rgb(var(--hairline))]',
  danger:
    'text-white bg-[linear-gradient(180deg,#f4635e_0%,#e0443e_55%,#c9352f_100%)] ' +
    'shadow-[0_1px_0_rgba(255,255,255,0.28)_inset,0_6px_16px_-6px_rgba(224,68,62,0.6)]',
}

const SIZES: Record<Size, string> = {
  sm: 'h-8 px-3 text-[13px] rounded-[10px] gap-1.5',
  md: 'h-10 px-4 text-[14px] rounded-xl gap-2',
  lg: 'h-12 px-6 text-[15px] rounded-2xl gap-2.5',
}

export interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: Variant
  size?: Size
  icon?: ReactNode
  iconRight?: ReactNode
  children?: ReactNode
  block?: boolean
}

export function Button({
  variant = 'secondary',
  size = 'md',
  icon,
  iconRight,
  children,
  block,
  className,
  onPointerDown,
  disabled,
  ...rest
}: ButtonProps) {
  const [ripples, setRipples] = useState<Ripple[]>([])
  const counter = useRef(0)

  const spawnRipple = useCallback<NonNullable<ButtonProps['onPointerDown']>>(
    (event) => {
      onPointerDown?.(event)
      if (disabled) return

      const bounds = event.currentTarget.getBoundingClientRect()
      const size = Math.max(bounds.width, bounds.height) * 2
      const id = counter.current++

      setRipples((current) => [
        ...current,
        { id, size, x: event.clientX - bounds.left - size / 2, y: event.clientY - bounds.top - size / 2 },
      ])
      setTimeout(() => setRipples((current) => current.filter((item) => item.id !== id)), 620)
    },
    [disabled, onPointerDown],
  )

  return (
    <motion.button
      type="button"
      whileHover={disabled ? undefined : { y: -1 }}
      whileTap={disabled ? undefined : { scale: 0.972, y: 0 }}
      transition={{ type: 'spring', stiffness: 520, damping: 30, mass: 0.6 }}
      onPointerDown={spawnRipple}
      disabled={disabled}
      className={cn(
        'relative isolate inline-flex select-none items-center justify-center overflow-hidden',
        'font-medium tracking-[-0.01em] will-change-transform',
        'transition-[background-color,box-shadow,color] duration-200 ease-[var(--ease-out-soft)]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2',
        'focus-visible:ring-offset-[rgb(var(--page))] disabled:pointer-events-none disabled:opacity-40',
        VARIANTS[variant],
        SIZES[size],
        block && 'w-full',
        className,
      )}
      {...rest}
    >
      {ripples.map((ripple) => (
        <motion.span
          key={ripple.id}
          initial={{ opacity: 0.32, scale: 0 }}
          animate={{ opacity: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          style={{ left: ripple.x, top: ripple.y, width: ripple.size, height: ripple.size }}
          className={cn(
            'pointer-events-none absolute -z-10 rounded-full',
            variant === 'primary' || variant === 'danger' ? 'bg-white' : 'bg-current',
          )}
        />
      ))}
      {icon}
      {children}
      {iconRight}
    </motion.button>
  )
}

export interface IconButtonProps extends ButtonProps {
  label: string
}

export function IconButton({ label, className, size = 'md', ...rest }: IconButtonProps) {
  return (
    <Button
      aria-label={label}
      title={label}
      size={size}
      className={cn('!px-0', size === 'sm' ? 'w-8' : size === 'md' ? 'w-10' : 'w-12', className)}
      {...rest}
    />
  )
}
