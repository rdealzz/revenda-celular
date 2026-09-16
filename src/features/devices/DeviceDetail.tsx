import { motion } from 'framer-motion'
import {
  ArrowLeft,
  BadgeCheck,
  Banknote,
  Copy,
  ExternalLink,
  Pencil,
  Receipt,
  ShoppingBag,
  Star,
  Trash2,
  Wrench,
} from 'lucide-react'
import { Card, SectionTitle } from '../../components/ui/Card'
import { Button, IconButton } from '../../components/ui/Button'
import { Badge, StatusBadge } from '../../components/ui/Badge'
import { DevicePhoto } from './DevicePhoto'
import { deviceSubtitle, deviceTitle } from '../../lib/calc'
import { classifyExpense } from '../../lib/expenses'
import { formatCurrency, formatDate, formatDays, formatPercent } from '../../lib/format'
import { missingFields } from '../../lib/alerts'
import type { DeviceWithFinance } from '../../lib/metrics'
import { cn } from '../../lib/cn'
import type { DeviceActions } from './DeviceListItem'

const CONDITION_LABEL: Record<string, string> = {
  novo: 'Novo / lacrado',
  seminovo: 'Seminovo',
  usado: 'Usado',
  'com-marcas': 'Com marcas de uso',
  'com-defeito': 'Com defeito',
}

const EXPENSE_LABEL = {
  deslocamento: 'Deslocamento',
  manutencao: 'Manutenção',
  outros: 'Outros',
} as const

export function DeviceDetail({
  row,
  actions,
  onBack,
}: {
  row: DeviceWithFinance
  actions: DeviceActions
  onBack: () => void
}) {
  const { device, finance } = row
  const pending = missingFields(device)

  const summary: Array<{ label: string; value: string; tone?: 'positive' | 'negative' }> = [
    { label: 'Valor da compra', value: formatCurrency(device.purchase.amount) },
    { label: 'Gastos', value: formatCurrency(finance.expensesTotal) },
    { label: 'Investimento total', value: formatCurrency(finance.totalInvested) },
    {
      label: 'Lucro bruto',
      value: finance.grossProfit === null ? '—' : formatCurrency(finance.grossProfit),
      tone: finance.grossProfit === null ? undefined : finance.grossProfit >= 0 ? 'positive' : 'negative',
    },
    {
      label: 'Lucro líquido',
      value: finance.netProfit === null ? '—' : formatCurrency(finance.netProfit),
      tone: finance.netProfit === null ? undefined : finance.netProfit >= 0 ? 'positive' : 'negative',
    },
    { label: 'Margem', value: finance.margin === null ? '—' : formatPercent(finance.margin) },
    { label: 'ROI', value: finance.roi === null ? '—' : formatPercent(finance.roi) },
    {
      label: finance.isSold ? 'Dias até vender' : 'Dias em estoque',
      value: formatDays(finance.isSold ? finance.daysToSell : finance.daysInStock),
    },
  ]

  const specs: Array<[string, string]> = [
    ['Marca', device.brand || '—'],
    ['Modelo', device.model || '—'],
    ['Cor', device.color || '—'],
    ['Armazenamento', device.storage || '—'],
    ['Memória RAM', device.ram || '—'],
    ['IMEI', device.imei || '—'],
    ['Estado', CONDITION_LABEL[device.condition] ?? device.condition],
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col gap-6 pt-4"
    >
      <Button variant="ghost" size="sm" className="self-start" icon={<ArrowLeft className="size-4" />} onClick={onBack}>
        Voltar para aparelhos
      </Button>

      <Card className="flex flex-col gap-5 sm:flex-row sm:items-center">
        <div className="size-24 shrink-0 sm:size-28">
          <DevicePhoto device={device} size="lg" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={device.status} />
            {device.favorite && (
              <Badge tone="caution">
                <Star className="size-3 fill-current" />
                Favorito
              </Badge>
            )}
            {device.tags.map((tag) => (
              <Badge key={tag} tone="violet">
                {tag}
              </Badge>
            ))}
          </div>
          <h1 className="mt-2 text-[26px] font-semibold tracking-[-0.03em] text-1 sm:text-[30px]">
            {deviceTitle(device)}
          </h1>
          <p className="mt-0.5 text-[13.5px] text-2">{deviceSubtitle(device) || 'Sem ficha técnica'}</p>
        </div>

        <div className="flex gap-1.5 sm:flex-col">
          <Button variant="primary" size="sm" icon={<Pencil className="size-4" />} onClick={() => actions.onEdit(device.id)}>
            Editar
          </Button>
          <div className="flex gap-1.5">
            <IconButton
              label="Duplicar"
              size="sm"
              variant="secondary"
              onClick={() => actions.onDuplicate(device.id)}
              icon={<Copy className="size-4" />}
            />
            <IconButton
              label={device.favorite ? 'Remover dos favoritos' : 'Favoritar'}
              size="sm"
              variant="secondary"
              onClick={() => actions.onToggleFavorite(device.id)}
              icon={<Star className={cn('size-4', device.favorite && 'fill-caution text-caution')} />}
            />
            <IconButton
              label="Excluir"
              size="sm"
              variant="secondary"
              onClick={() => actions.onDelete(device.id)}
              icon={<Trash2 className="size-4 text-negative" />}
            />
          </div>
        </div>
      </Card>

      {!!pending.length && (
        <Card className="border-caution/40 bg-caution/8">
          <p className="text-[13.5px] text-1">
            <strong className="font-semibold">Campos incompletos:</strong> {pending.join(', ')}.
          </p>
        </Card>
      )}

      <Card>
        <SectionTitle title="Resumo financeiro" subtitle="Tudo calculado automaticamente" />
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-[18px] border border-[rgb(var(--hairline))] bg-[rgb(var(--hairline))] sm:grid-cols-4">
          {summary.map((item) => (
            <div key={item.label} className="bg-[rgb(var(--surface))] px-4 py-3.5">
              <p className="text-[11px] font-medium uppercase tracking-[0.05em] text-3">{item.label}</p>
              <p
                className={cn(
                  'tabular mt-1 text-[16px] font-semibold',
                  item.tone === 'positive' ? 'text-positive' : item.tone === 'negative' ? 'text-negative' : 'text-1',
                )}
              >
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <Card>
          <SectionTitle title="Linha do tempo" subtitle="Da compra ao lucro" />
          <ol className="relative flex flex-col gap-6 pl-1">
            <span className="absolute bottom-3 left-[19px] top-3 w-px bg-[rgb(var(--hairline-strong))]" />

            <TimelineItem
              icon={<ShoppingBag className="size-4" />}
              tone="accent"
              title="Compra"
              meta={formatDate(device.purchase.date)}
              value={formatCurrency(device.purchase.amount)}
            >
              <dl className="grid gap-1 text-[13px] text-2">
                {device.purchase.seller && <Line label="Vendedor" value={device.purchase.seller} />}
                {device.purchase.city && <Line label="Cidade" value={device.purchase.city} />}
                {device.purchase.listingUrl && (
                  <a
                    href={device.purchase.listingUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 inline-flex w-fit items-center gap-1.5 text-[13px] text-accent hover:underline"
                  >
                    Ver anúncio original <ExternalLink className="size-3.5" />
                  </a>
                )}
              </dl>
            </TimelineItem>

            <TimelineItem
              icon={<Wrench className="size-4" />}
              tone="caution"
              title="Gastos"
              meta={`${device.expenses.length} lançamento(s)`}
              value={formatCurrency(finance.expensesTotal)}
            >
              {device.expenses.length ? (
                <ul className="flex flex-col gap-1.5">
                  {device.expenses.map((expense) => (
                    <li key={expense.id} className="flex items-center gap-2 text-[13px]">
                      <Receipt className="size-3.5 text-3" />
                      <span className="text-1">{expense.description || 'Gasto sem descrição'}</span>
                      <Badge tone="neutral" className="hidden sm:inline-flex">
                        {EXPENSE_LABEL[classifyExpense(expense.description)]}
                      </Badge>
                      <span className="tabular ml-auto text-2">{formatCurrency(expense.amount)}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-[13px] text-2">Nenhum gasto lançado neste aparelho.</p>
              )}
            </TimelineItem>

            <TimelineItem
              icon={<Banknote className="size-4" />}
              tone={finance.isSold ? 'positive' : 'neutral'}
              title="Venda"
              meta={finance.isSold ? formatDate(device.sale.date) : 'Ainda não vendido'}
              value={device.sale.amount ? formatCurrency(device.sale.amount) : '—'}
            >
              <dl className="grid gap-1 text-[13px] text-2">
                {device.sale.askingPrice !== null && (
                  <Line label="Valor pretendido" value={formatCurrency(device.sale.askingPrice)} />
                )}
                {device.sale.customer && <Line label="Cliente" value={device.sale.customer} />}
                {device.sale.city && <Line label="Cidade" value={device.sale.city} />}
                {device.sale.paymentMethod && <Line label="Pagamento" value={device.sale.paymentMethod} />}
                {device.sale.notes && <Line label="Observações" value={device.sale.notes} />}
              </dl>
            </TimelineItem>

            <TimelineItem
              icon={<BadgeCheck className="size-4" />}
              tone={(finance.netProfit ?? finance.potentialProfit ?? 0) >= 0 ? 'positive' : 'negative'}
              title={finance.isSold ? 'Lucro' : 'Lucro potencial'}
              meta={
                finance.isSold
                  ? `Margem ${finance.margin === null ? '—' : formatPercent(finance.margin)} · ROI ${
                      finance.roi === null ? '—' : formatPercent(finance.roi)
                    }`
                  : device.sale.askingPrice
                    ? `Se vender por ${formatCurrency(device.sale.askingPrice)}`
                    : 'Defina um valor pretendido'
              }
              value={
                finance.isSold
                  ? formatCurrency(finance.netProfit ?? 0)
                  : finance.potentialProfit === null
                    ? '—'
                    : formatCurrency(finance.potentialProfit)
              }
              last
            />
          </ol>
        </Card>

        <div className="flex flex-col gap-4">
          <Card>
            <SectionTitle title="Ficha técnica" />
            <dl className="flex flex-col divide-y divide-[rgb(var(--hairline))]">
              {specs.map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-4 py-2.5">
                  <dt className="text-[13px] text-2">{label}</dt>
                  <dd className="truncate text-[13.5px] font-medium text-1">{value}</dd>
                </div>
              ))}
            </dl>
          </Card>

          <Card>
            <SectionTitle title="Observações" />
            <p className="whitespace-pre-wrap text-[13.5px] leading-relaxed text-2">
              {device.notes || 'Nenhuma observação registrada para este aparelho.'}
            </p>
          </Card>
        </div>
      </div>
    </motion.div>
  )
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <dt className="shrink-0 text-3">{label}:</dt>
      <dd className="text-1">{value}</dd>
    </div>
  )
}

const TONES = {
  accent: 'bg-accent/12 text-accent',
  caution: 'bg-caution/16 text-caution',
  positive: 'bg-positive/12 text-positive',
  negative: 'bg-negative/12 text-negative',
  neutral: 'bg-[rgb(var(--hairline))] text-2',
} as const

function TimelineItem({
  icon,
  tone,
  title,
  meta,
  value,
  children,
  last,
}: {
  icon: React.ReactNode
  tone: keyof typeof TONES
  title: string
  meta: string
  value: string
  children?: React.ReactNode
  last?: boolean
}) {
  return (
    <motion.li
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="relative flex gap-4"
    >
      <span
        className={cn(
          'relative z-10 mt-0.5 grid size-[38px] shrink-0 place-items-center rounded-[12px] ring-4 ring-[rgb(var(--surface))]',
          TONES[tone],
        )}
      >
        {icon}
      </span>

      <div className={cn('min-w-0 flex-1', last ? '' : 'pb-1')}>
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className="text-[14.5px] font-semibold text-1">{title}</p>
          <p className="tabular text-[15px] font-semibold text-1">{value}</p>
        </div>
        <p className="mb-2 text-[12.5px] text-3">{meta}</p>
        {children}
      </div>
    </motion.li>
  )
}
