import { motion } from 'framer-motion'
import { Star } from 'lucide-react'
import { DevicePhoto } from './DevicePhoto'
import { StatusBadge } from '../../components/ui/Badge'
import { deviceSubtitle, deviceTitle } from '../../lib/calc'
import { formatCurrency, formatDays } from '../../lib/format'
import type { DeviceWithFinance } from '../../lib/metrics'
import { cn } from '../../lib/cn'

export function DeviceRowCompact({
  row,
  onClick,
}: {
  row: DeviceWithFinance
  onClick: () => void
}) {
  const { device, finance } = row
  const result = finance.isSold ? finance.netProfit : finance.potentialProfit

  return (
    <motion.li whileHover={{ x: 2 }} transition={{ type: 'spring', stiffness: 460, damping: 34 }}>
      <button
        type="button"
        onClick={onClick}
        className="flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition-colors duration-200 hover:bg-[rgb(var(--hairline))]"
      >
        <DevicePhoto device={device} size="sm" />

        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 truncate text-[14px] font-medium text-1">
            {deviceTitle(device)}
            {device.favorite && <Star className="size-3.5 fill-caution text-caution" />}
          </p>
          <p className="truncate text-[12px] text-3">
            {deviceSubtitle(device) || 'Sem ficha técnica'}
          </p>
        </div>

        <div className="hidden sm:block">
          <StatusBadge status={device.status} />
        </div>

        <div className="w-[104px] text-right">
          <p
            className={cn(
              'tabular text-[14px] font-medium',
              result === null ? 'text-3' : result >= 0 ? 'text-positive' : 'text-negative',
            )}
          >
            {result === null ? '—' : formatCurrency(result)}
          </p>
          <p className="tabular text-[11.5px] text-3">
            {finance.isSold ? formatDays(finance.daysToSell) : formatDays(finance.daysInStock)}
          </p>
        </div>
      </button>
    </motion.li>
  )
}
