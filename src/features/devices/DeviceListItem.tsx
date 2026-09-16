import { motion } from 'framer-motion'
import { BadgeDollarSign, Copy, Pencil, Star, Trash2 } from 'lucide-react'
import { DevicePhoto } from './DevicePhoto'
import { StatusBadge } from '../../components/ui/Badge'
import { IconButton } from '../../components/ui/Button'
import { deviceSubtitle, deviceTitle } from '../../lib/calc'
import { formatCurrency, formatDays } from '../../lib/format'
import type { DeviceWithFinance } from '../../lib/metrics'
import { cn } from '../../lib/cn'

export interface DeviceActions {
  onOpen: (id: string) => void
  onSell: (id: string) => void
  onEdit: (id: string) => void
  onDuplicate: (id: string) => void
  onDelete: (id: string) => void
  onToggleFavorite: (id: string) => void
}

/** Ações secundárias só aparecem no hover em telas grandes. */
const HOVER_ONLY =
  'transition-opacity duration-200 lg:opacity-0 lg:group-hover:opacity-100 lg:group-focus-within:opacity-100'

export function DeviceListItem({
  row,
  actions,
  index,
}: {
  row: DeviceWithFinance
  actions: DeviceActions
  index: number
}) {
  const { device, finance } = row
  const result = finance.isSold ? finance.netProfit : finance.potentialProfit
  const asking = device.sale.askingPrice

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ delay: Math.min(index * 0.02, 0.2), duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="group relative"
    >
      <div
        role="button"
        tabIndex={0}
        onClick={() => actions.onOpen(device.id)}
        onKeyDown={(event) => event.key === 'Enter' && actions.onOpen(device.id)}
        className={cn(
          'grid cursor-pointer grid-cols-[auto_1fr_auto] items-center gap-3 rounded-[18px] px-3 py-3',
          'transition-colors duration-200 hover:bg-[rgb(var(--hairline))] focus-visible:outline-none',
          'focus-visible:ring-2 focus-visible:ring-accent/50',
          'lg:grid-cols-[48px_minmax(0,1.6fr)_repeat(4,minmax(0,1fr))_120px_148px] lg:gap-4',
        )}
      >
        <DevicePhoto device={device} />

        <div className="min-w-0">
          <p className="flex items-center gap-1.5 truncate text-[14.5px] font-medium text-1">
            {deviceTitle(device)}
            {device.favorite && <Star className="size-3.5 shrink-0 fill-caution text-caution" />}
          </p>
          <p className="truncate text-[12.5px] text-3">{deviceSubtitle(device) || 'Sem ficha técnica'}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2 lg:hidden">
            <StatusBadge status={device.status} />
            <span className="tabular text-[12px] text-2">
              <span className="text-3">Investido </span>
              {formatCurrency(finance.totalInvested)}
            </span>
            {result !== null && (
              <span
                className={cn(
                  'tabular text-[12px] font-medium',
                  result >= 0 ? 'text-positive' : 'text-negative',
                )}
              >
                <span className="text-3">{finance.isSold ? 'Lucro ' : 'Potencial '}</span>
                {formatCurrency(result)}
              </span>
            )}
          </div>
        </div>

        <Cell className="hidden lg:block">{formatCurrency(finance.totalInvested)}</Cell>
        <Cell className="hidden lg:block" muted={!asking}>
          {asking ? formatCurrency(asking) : '—'}
        </Cell>
        <Cell
          className={cn(
            'hidden lg:block font-medium',
            result === null ? 'text-3' : result >= 0 ? 'text-positive' : 'text-negative',
          )}
        >
          {result === null ? '—' : formatCurrency(result)}
        </Cell>
        <Cell className="hidden lg:block">
          {finance.isSold ? formatDays(finance.daysToSell) : formatDays(finance.daysInStock)}
        </Cell>

        <div className="hidden lg:block">
          <StatusBadge status={device.status} />
        </div>

        <div
          className="flex items-center justify-end gap-0.5 self-start lg:self-center"
          onClick={(event) => event.stopPropagation()}
        >
          {device.status !== 'vendido' && (
            <IconButton
              label="Registrar venda"
              size="sm"
              variant="ghost"
              onClick={() => actions.onSell(device.id)}
              icon={<BadgeDollarSign className="size-4 text-positive" />}
            />
          )}
          <IconButton
            label={device.favorite ? 'Remover dos favoritos' : 'Marcar como favorito'}
            size="sm"
            variant="ghost"
            className={HOVER_ONLY}
            onClick={() => actions.onToggleFavorite(device.id)}
            icon={<Star className={cn('size-4', device.favorite && 'fill-caution text-caution')} />}
          />
          <IconButton
            label="Editar"
            size="sm"
            variant="ghost"
            className={HOVER_ONLY}
            onClick={() => actions.onEdit(device.id)}
            icon={<Pencil className="size-4" />}
          />
          <IconButton
            label="Duplicar"
            size="sm"
            variant="ghost"
            className={cn(HOVER_ONLY, 'hidden sm:inline-flex')}
            onClick={() => actions.onDuplicate(device.id)}
            icon={<Copy className="size-4" />}
          />
          <IconButton
            label="Excluir"
            size="sm"
            variant="ghost"
            className={HOVER_ONLY}
            onClick={() => actions.onDelete(device.id)}
            icon={<Trash2 className="size-4 text-negative" />}
          />
        </div>
      </div>
    </motion.li>
  )
}

function Cell({
  children,
  className,
  muted,
}: {
  children: React.ReactNode
  className?: string
  muted?: boolean
}) {
  return (
    <span className={cn('tabular text-[13.5px]', muted ? 'text-3' : 'text-1', className)}>
      {children}
    </span>
  )
}
