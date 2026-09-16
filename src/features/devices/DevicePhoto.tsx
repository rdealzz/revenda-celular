import { Smartphone } from 'lucide-react'
import { cn } from '../../lib/cn'
import type { Device } from '../../types'

export function DevicePhoto({
  device,
  size = 'md',
  className,
}: {
  device: Device
  size?: 'sm' | 'md' | 'lg'
  className?: string
}) {
  const dimensions = { sm: 'size-10 rounded-[11px]', md: 'size-12 rounded-[13px]', lg: 'size-full rounded-[20px]' }[size]

  return (
    <div
      className={cn(
        'grid shrink-0 place-items-center overflow-hidden border border-[rgb(var(--hairline))] bg-[rgb(var(--surface-sunken))]',
        dimensions,
        className,
      )}
    >
      {device.photo ? (
        <img src={device.photo} alt="" className="size-full object-cover" loading="lazy" />
      ) : (
        <Smartphone className={cn('text-3', size === 'lg' ? 'size-10' : 'size-[18px]')} />
      )}
    </div>
  )
}
