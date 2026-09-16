import { motion } from 'framer-motion'
import { ChartPie, ChevronRight } from 'lucide-react'
import { Card, SectionTitle } from '../../components/ui/Card'
import { EmptyState } from '../../components/ui/EmptyState'
import { Badge } from '../../components/ui/Badge'
import { MonthlyProfitChart, ProfitTrendChart } from '../../components/charts/Charts'
import { deviceTitle } from '../../lib/calc'
import { formatCurrency, formatDays, formatNumber, formatPercent } from '../../lib/format'
import { pickExtreme, type BrandStat, type DeviceWithFinance, type MonthPoint, type Overview } from '../../lib/metrics'
import { cn } from '../../lib/cn'

export function Statistics({
  rows,
  overview,
  months,
  brands,
  onOpenDevice,
}: {
  rows: DeviceWithFinance[]
  overview: Overview
  months: MonthPoint[]
  brands: BrandStat[]
  onOpenDevice: (id: string) => void
}) {
  const sold = rows.filter((row) => row.finance.isSold)

  if (!rows.length) {
    return (
      <Card className="mt-6">
        <EmptyState
          icon={<ChartPie className="size-6" />}
          title="Sem dados para analisar"
          description="Assim que você cadastrar e vender aparelhos, as análises inteligentes aparecem aqui."
        />
      </Card>
    )
  }

  const bestBrand = brands[0]
  const fastest = pickExtreme(sold, (row) => row.finance.daysToSell, 'min')
  const slowest = pickExtreme(sold, (row) => row.finance.daysToSell, 'max')
  const biggestProfit = pickExtreme(sold, (row) => row.finance.netProfit, 'max')
  const biggestLoss = pickExtreme(sold, (row) => row.finance.netProfit, 'min')
  const biggestInvestment = pickExtreme(rows, (row) => row.finance.totalInvested, 'max')
  const bestRoi = pickExtreme(sold, (row) => row.finance.roi, 'max')

  const averageProfit = sold.length ? overview.netProfitTotal / sold.length : 0

  const highlights: Array<{
    label: string
    value: string
    detail: string
    deviceId?: string
    tone?: 'positive' | 'negative'
  }> = [
    {
      label: 'Marca que mais dá lucro',
      value: bestBrand?.brand ?? '—',
      detail: bestBrand ? `${formatCurrency(bestBrand.profit)} em ${bestBrand.sold} venda(s)` : 'Sem vendas ainda',
      tone: 'positive',
    },
    {
      label: 'Vendeu mais rápido',
      value: fastest ? deviceTitle(fastest.device) : '—',
      detail: fastest ? formatDays(fastest.finance.daysToSell) : 'Sem vendas ainda',
      deviceId: fastest?.device.id,
    },
    {
      label: 'Demorou mais para vender',
      value: slowest ? deviceTitle(slowest.device) : '—',
      detail: slowest ? formatDays(slowest.finance.daysToSell) : 'Sem vendas ainda',
      deviceId: slowest?.device.id,
    },
    {
      label: 'Lucro médio por aparelho',
      value: formatCurrency(averageProfit),
      detail: `${sold.length} aparelho(s) vendido(s)`,
      tone: averageProfit >= 0 ? 'positive' : 'negative',
    },
    {
      label: 'Maior lucro',
      value: biggestProfit ? formatCurrency(biggestProfit.finance.netProfit ?? 0) : '—',
      detail: biggestProfit ? deviceTitle(biggestProfit.device) : 'Sem vendas ainda',
      deviceId: biggestProfit?.device.id,
      tone: 'positive',
    },
    {
      label: 'Maior prejuízo',
      value:
        biggestLoss && (biggestLoss.finance.netProfit ?? 0) < 0
          ? formatCurrency(biggestLoss.finance.netProfit ?? 0)
          : 'Nenhum',
      detail:
        biggestLoss && (biggestLoss.finance.netProfit ?? 0) < 0
          ? deviceTitle(biggestLoss.device)
          : 'Nenhuma venda no prejuízo',
      deviceId: biggestLoss && (biggestLoss.finance.netProfit ?? 0) < 0 ? biggestLoss.device.id : undefined,
      tone: biggestLoss && (biggestLoss.finance.netProfit ?? 0) < 0 ? 'negative' : undefined,
    },
    {
      label: 'Maior investimento',
      value: biggestInvestment ? formatCurrency(biggestInvestment.finance.totalInvested) : '—',
      detail: biggestInvestment ? deviceTitle(biggestInvestment.device) : '—',
      deviceId: biggestInvestment?.device.id,
    },
    {
      label: 'Melhor ROI',
      value: bestRoi ? formatPercent(bestRoi.finance.roi ?? 0) : '—',
      detail: bestRoi ? deviceTitle(bestRoi.device) : 'Sem vendas ainda',
      deviceId: bestRoi?.device.id,
      tone: 'positive',
    },
  ]

  return (
    <div className="flex flex-col gap-8 pt-4">
      <header>
        <h1 className="text-[30px] font-semibold tracking-[-0.035em] text-1 sm:text-[34px]">Estatísticas</h1>
        <p className="mt-1 text-[13.5px] text-2">
          {rows.length} aparelhos cadastrados · {overview.soldCount} vendidos · tempo médio de{' '}
          {formatDays(overview.averageDaysToSell)}
        </p>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {highlights.map((item, index) => (
          <motion.button
            key={item.label}
            type="button"
            disabled={!item.deviceId}
            onClick={() => item.deviceId && onOpenDevice(item.deviceId)}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            whileHover={item.deviceId ? { y: -3 } : undefined}
            className={cn(
              'surface rounded-[20px] p-4 text-left shadow-soft transition-shadow duration-300',
              item.deviceId && 'hover:shadow-lift',
            )}
          >
            <p className="flex items-center gap-1 text-[12px] font-medium text-2">
              {item.label}
              {item.deviceId && <ChevronRight className="size-3.5 text-3" />}
            </p>
            <p
              className={cn(
                'mt-2 truncate text-[19px] font-semibold tracking-[-0.025em]',
                item.tone === 'positive' ? 'text-positive' : item.tone === 'negative' ? 'text-negative' : 'text-1',
              )}
            >
              {item.value}
            </p>
            <p className="mt-0.5 truncate text-[12px] text-3">{item.detail}</p>
          </motion.button>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <SectionTitle title="Evolução do lucro" subtitle="Acumulado mês a mês" />
          <ProfitTrendChart data={months} />
        </Card>
        <Card>
          <SectionTitle title="Lucro por mês" />
          <MonthlyProfitChart data={months} />
        </Card>
      </section>

      <Card padded={false}>
        <div className="px-5 pt-5">
          <SectionTitle title="Desempenho por marca" subtitle="Ordenado pelo lucro líquido gerado" />
        </div>
        <div className="overflow-x-auto px-2 pb-4">
          <table className="w-full min-w-[620px] border-collapse">
            <thead>
              <tr className="text-[11px] uppercase tracking-[0.06em] text-3">
                <th className="px-3 py-2 text-left font-medium">Marca</th>
                <th className="px-3 py-2 text-right font-medium">Aparelhos</th>
                <th className="px-3 py-2 text-right font-medium">Vendidos</th>
                <th className="px-3 py-2 text-right font-medium">Investido</th>
                <th className="px-3 py-2 text-right font-medium">Lucro líquido</th>
                <th className="px-3 py-2 text-right font-medium">ROI médio</th>
                <th className="px-3 py-2 text-right font-medium">Tempo médio</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgb(var(--hairline))]">
              {brands.map((brand) => (
                <tr key={brand.brand} className="transition-colors hover:bg-[rgb(var(--hairline))]">
                  <td className="px-3 py-3 text-[13.5px] font-medium text-1">
                    <Badge tone="neutral">{brand.brand}</Badge>
                  </td>
                  <td className="tabular px-3 py-3 text-right text-[13.5px] text-2">{formatNumber(brand.count)}</td>
                  <td className="tabular px-3 py-3 text-right text-[13.5px] text-2">{formatNumber(brand.sold)}</td>
                  <td className="tabular px-3 py-3 text-right text-[13.5px] text-2">{formatCurrency(brand.invested)}</td>
                  <td
                    className={cn(
                      'tabular px-3 py-3 text-right text-[13.5px] font-medium',
                      brand.profit >= 0 ? 'text-positive' : 'text-negative',
                    )}
                  >
                    {formatCurrency(brand.profit)}
                  </td>
                  <td className="tabular px-3 py-3 text-right text-[13.5px] text-2">
                    {brand.averageRoi === null ? '—' : formatPercent(brand.averageRoi)}
                  </td>
                  <td className="tabular px-3 py-3 text-right text-[13.5px] text-2">
                    {formatDays(brand.averageDaysToSell)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card padded={false}>
        <div className="px-5 pt-5">
          <SectionTitle title="Resumo mensal" subtitle="Compras, vendas e resultado de cada mês" />
        </div>
        <div className="overflow-x-auto px-2 pb-4">
          <table className="w-full min-w-[560px] border-collapse">
            <thead>
              <tr className="text-[11px] uppercase tracking-[0.06em] text-3">
                <th className="px-3 py-2 text-left font-medium">Mês</th>
                <th className="px-3 py-2 text-right font-medium">Compras</th>
                <th className="px-3 py-2 text-right font-medium">Investido</th>
                <th className="px-3 py-2 text-right font-medium">Vendas</th>
                <th className="px-3 py-2 text-right font-medium">Receita</th>
                <th className="px-3 py-2 text-right font-medium">Lucro líquido</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgb(var(--hairline))]">
              {[...months].reverse().map((month) => (
                <tr key={month.key} className="transition-colors hover:bg-[rgb(var(--hairline))]">
                  <td className="px-3 py-3 text-[13.5px] font-medium capitalize text-1">{month.label}</td>
                  <td className="tabular px-3 py-3 text-right text-[13.5px] text-2">{month.purchases}</td>
                  <td className="tabular px-3 py-3 text-right text-[13.5px] text-2">{formatCurrency(month.purchaseValue)}</td>
                  <td className="tabular px-3 py-3 text-right text-[13.5px] text-2">{month.sales}</td>
                  <td className="tabular px-3 py-3 text-right text-[13.5px] text-2">{formatCurrency(month.salesValue)}</td>
                  <td
                    className={cn(
                      'tabular px-3 py-3 text-right text-[13.5px] font-medium',
                      month.profit >= 0 ? 'text-positive' : 'text-negative',
                    )}
                  >
                    {formatCurrency(month.profit)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
