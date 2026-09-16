import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowDownUp, FileDown, FileText, Plus, Search, Star, X } from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Segmented, Select } from '../../components/ui/Field'
import { EmptyState } from '../../components/ui/EmptyState'
import { DeviceListItem, type DeviceActions } from './DeviceListItem'
import type { DeviceWithFinance } from '../../lib/metrics'
import { cn } from '../../lib/cn'

type Filter = 'todos' | 'estoque' | 'reservado' | 'vendido' | 'favoritos'
type Sort = 'recentes' | 'lucro' | 'investimento' | 'tempo' | 'alfabetica'

const SORTERS: Record<Sort, (a: DeviceWithFinance, b: DeviceWithFinance) => number> = {
  recentes: (a, b) => b.device.createdAt.localeCompare(a.device.createdAt),
  lucro: (a, b) => resultOf(b) - resultOf(a),
  investimento: (a, b) => b.finance.totalInvested - a.finance.totalInvested,
  tempo: (a, b) => (b.finance.daysInStock ?? -1) - (a.finance.daysInStock ?? -1),
  alfabetica: (a, b) =>
    `${a.device.brand} ${a.device.model}`.localeCompare(`${b.device.brand} ${b.device.model}`),
}

const resultOf = (row: DeviceWithFinance) =>
  row.finance.isSold ? (row.finance.netProfit ?? 0) : (row.finance.potentialProfit ?? 0)

function matches(row: DeviceWithFinance, query: string): boolean {
  if (!query) return true
  const { device } = row
  const haystack = [
    device.brand,
    device.model,
    device.color,
    device.storage,
    device.imei,
    device.purchase.seller,
    device.purchase.city,
    device.sale.customer,
    device.sale.city,
    device.notes,
    ...device.tags,
  ]
    .join(' ')
    .toLowerCase()

  return query
    .toLowerCase()
    .split(/\s+/)
    .every((term) => haystack.includes(term))
}

export function DeviceList({
  rows,
  actions,
  onCreate,
  onExportExcel,
  onExportPdf,
}: {
  rows: DeviceWithFinance[]
  actions: DeviceActions
  onCreate: () => void
  onExportExcel: (rows: DeviceWithFinance[]) => void
  onExportPdf: (rows: DeviceWithFinance[]) => void
}) {
  const [filter, setFilter] = useState<Filter>('todos')
  const [sort, setSort] = useState<Sort>('recentes')
  const [query, setQuery] = useState('')

  const counts = useMemo(
    () => ({
      todos: rows.length,
      estoque: rows.filter((row) => row.device.status === 'estoque').length,
      reservado: rows.filter((row) => row.device.status === 'reservado').length,
      vendido: rows.filter((row) => row.device.status === 'vendido').length,
      favoritos: rows.filter((row) => row.device.favorite).length,
    }),
    [rows],
  )

  const visible = useMemo(() => {
    const filtered = rows.filter((row) => {
      if (filter === 'favoritos') return row.device.favorite
      if (filter !== 'todos' && row.device.status !== filter) return false
      return true
    })
    return filtered.filter((row) => matches(row, query.trim())).sort(SORTERS[sort])
  }, [rows, filter, sort, query])

  return (
    <div className="flex flex-col gap-6 pt-4">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[30px] font-semibold tracking-[-0.035em] text-1 sm:text-[34px]">Aparelhos</h1>
          <p className="mt-1 text-[13.5px] text-2">
            {counts.estoque} em estoque · {counts.vendido} vendidos · {counts.reservado} reservados
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" icon={<FileDown className="size-4" />} onClick={() => onExportExcel(visible)}>
            Excel
          </Button>
          <Button variant="secondary" icon={<FileText className="size-4" />} onClick={() => onExportPdf(visible)}>
            PDF
          </Button>
          <Button variant="primary" icon={<Plus className="size-4" />} onClick={onCreate}>
            Novo aparelho
          </Button>
        </div>
      </header>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-3" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por marca, modelo, cliente, cidade, tag…"
            className={cn(
              'h-11 w-full rounded-[14px] border border-[rgb(var(--hairline-strong))] bg-[rgb(var(--surface))]',
              'pl-10 pr-10 text-[14px] text-1 placeholder:text-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)_inset]',
              'transition-[border-color,box-shadow] duration-200 focus:border-accent/70 focus:outline-none focus:ring-4 focus:ring-accent/12',
            )}
          />
          <AnimatePresence>
            {query && (
              <motion.button
                type="button"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-3 transition-colors hover:text-1"
              >
                <X className="size-4" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        <Segmented
          layoutId="stock-filter"
          value={filter}
          onChange={setFilter}
          options={[
            { value: 'todos', label: 'Todos', badge: counts.todos },
            { value: 'estoque', label: 'Em estoque', badge: counts.estoque },
            { value: 'reservado', label: 'Reservados', badge: counts.reservado },
            { value: 'vendido', label: 'Vendidos', badge: counts.vendido },
            { value: 'favoritos', label: 'Favoritos', badge: counts.favoritos },
          ]}
        />

        <div className="relative w-full lg:w-[190px]">
          <ArrowDownUp className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-3" />
          <Select
            value={sort}
            onChange={(event) => setSort(event.target.value as Sort)}
            className="h-11 pl-10"
          >
            <option value="recentes">Mais recentes</option>
            <option value="lucro">Maior lucro</option>
            <option value="investimento">Maior investimento</option>
            <option value="tempo">Mais tempo em estoque</option>
            <option value="alfabetica">Ordem alfabética</option>
          </Select>
        </div>
      </div>

      <Card padded={false} className="overflow-hidden">
        <div className="hidden grid-cols-[48px_minmax(0,1.6fr)_repeat(4,minmax(0,1fr))_120px_112px] gap-4 border-b border-[rgb(var(--hairline))] px-5 py-3 text-[11px] font-medium uppercase tracking-[0.06em] text-3 lg:grid">
          <span />
          <span>Aparelho</span>
          <span>Investido</span>
          <span>Anunciado</span>
          <span>Lucro</span>
          <span>Tempo</span>
          <span>Status</span>
          <span className="text-right">Ações</span>
        </div>

        {visible.length ? (
          <motion.ul layout className="divide-y divide-[rgb(var(--hairline))] p-2">
            <AnimatePresence initial={false}>
              {visible.map((row, index) => (
                <DeviceListItem key={row.device.id} row={row} actions={actions} index={index} />
              ))}
            </AnimatePresence>
          </motion.ul>
        ) : (
          <EmptyState
            icon={query ? <Search className="size-6" /> : <Star className="size-6" />}
            title={query ? 'Nenhum resultado' : 'Nada por aqui ainda'}
            description={
              query
                ? 'Tente outro termo ou limpe a busca para ver todos os aparelhos.'
                : 'Nenhum aparelho neste filtro. Cadastre um novo para começar.'
            }
            action={
              query ? (
                <Button variant="secondary" onClick={() => setQuery('')}>
                  Limpar busca
                </Button>
              ) : (
                <Button variant="primary" icon={<Plus className="size-4" />} onClick={onCreate}>
                  Novo aparelho
                </Button>
              )
            }
          />
        )}
      </Card>
    </div>
  )
}
