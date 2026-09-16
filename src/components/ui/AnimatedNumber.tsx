import { useEffect, useRef } from 'react'
import { animate, useReducedMotion } from 'framer-motion'

export function AnimatedNumber({
  value,
  format,
  className,
}: {
  value: number
  format: (value: number) => string
  className?: string
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const previous = useRef(0)
  const reduced = useReducedMotion()

  useEffect(() => {
    const node = ref.current
    if (!node) return

    if (reduced) {
      node.textContent = format(value)
      previous.current = value
      return
    }

    const controls = animate(previous.current, value, {
      duration: 0.75,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (current) => {
        node.textContent = format(current)
      },
      onComplete: () => {
        previous.current = value
      },
    })

    return () => controls.stop()
  }, [value, format, reduced])

  return <span ref={ref} className={className}>{format(value)}</span>
}
