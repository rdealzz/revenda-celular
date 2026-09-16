import { motion } from 'framer-motion'
import {
  ArrowUpRight,
  BadgePercent,
  Car,
  ChevronRight,
  PackageCheck,
  PiggyBank,
  Receipt,
  Smartphone,
  Sparkles,
  Tag,
  Timer,
  TrendingUp,
  Wallet,
  Wrench,
} from 'lucide-react'
import { Card, SectionTitle } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { EmptyState } from '../../components/ui/EmptyState'
import { StatCard } from './StatCard'
import {
  BrandDonutChart,
  FlowChart,
  InvestedVsReturnChart,
  MonthlyProfitChart,
  ProfitTrendChart,
  SellingTimeChart,
} from '../../components/charts/Charts'
import { DeviceRowCompact } from '../devices/DeviceRowCompact'
import { AlertRow } from '../alerts/AlertRow'
import type { Alert } from '../../lib/alerts'
import type { BrandStat, DeviceWithFinance, MonthPoint, Overview } from '../../lib/metrics'
import { formatCurrency, formatDays, formatNumber, formatPercent } from '../../lib/format'

const identity = (value: number) => formatNumber(Math.round(value))

export function Dashboard({
  rows,
  overview,
  months,
  brands,
  alerts,
  onOpenDevice,
  onCreate,
  navigate,
}: {
  rows: DeviceWithFinance[]
  overview: Overview
  months: MonthPoint[]
  brands: BrandStat[]
  alerts: Alert[]
  onOpenDevice: (id: string) => void
  onCreate: () => void
  navigate: (path: string) => void
}) {
  if (!rows.length) {
    return (
      <Card className="mt-6">
        <EmptyState
          icon={<Smartphone className="size-6" />}
          title="Sua revenda começa aqui"
          description="Cadastre o primeiro aparelho para acompanhar investimento, gastos, lucro real e tempo de venda em tempo real."
          action={
            <Button variant="primary" size="lg" onClick={onCreate} iconRight={<ArrowUpRight className="size-4" />}>
              Cadastrar aparelho
            </Button>
          }
        />
      </Card>
    )
  }

  const recent = rows.slice(0, 5)
  const hasCharts = months.length > 0

  return (
    <div className="flex flex-col gap-10">
      <header className="pt-4">
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-[13px] font-medium text-2"
        >
          {new Intl.DateTimeFormat('pt-BR', { dateStyle: 'full' }).format(new Date())}
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="mt-1 text-[30px] font-semibold tracking-[-0.035em] text-1 sm:text-[34px]"
        >
          Visão geral
        </motion.h1>
      </header>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <StatCard index={0} label="Investido em estoque" value={overview.investedInStock} format={formatCurrency} icon={<Wallet className="size-4" />} tone="accent" caption={`${overview.inStockCount + overview.reservedCount} aparelhos parados`} />
        <StatCard index={1} label="Valor potencial de venda" value={overview.potentialSaleValue} format={formatCurrency} icon={<Tag className="size-4" />} tone="violet" caption="Soma dos valores anunciados" />
        <StatCard index={2} label="Lucro potencial" value={overview.potentialProfit} format={formatCurrency} icon={<Sparkles className="size-4" />} tone="caution" caption="Se vender pelo preço anunciado" />
        <StatCard index={3} label="Lucro realizado (bruto)" value={overview.realizedProfit} format={formatCurrency} icon={<TrendingUp className="size-4" />} tone="positive" caption="Venda − compra" />
        <StatCard index={4} label="Lucro líquido total" value={overview.netProfitTotal} format={formatCurrency} icon={<PiggyBank className="size-4" />} tone={overview.netProfitTotal >= 0 ? 'positive' : 'negative'} caption="Já descontando todos os gastos" />
        <StatCard index={5} label="Aparelhos em estoque" value={overview.inStockCount} format={identity} icon={<Smartphone className="size-4" />} caption={overview.reservedCount ? `${overview.reservedCount} reservado(s)` : 'Nenhum reservado'} />
        <StatCard index={6} label="Aparelhos vendidos" value={overview.soldCount} format={identity} icon={<PackageCheck className="size-4" />} caption={`Receita de ${formatCurrency(overview.totalRevenue)}`} />
        <StatCard index={7} label="Ticket médio" value={overview.averageTicket} format={formatCurrency} icon={<Receipt className="size-4" />} caption="Média do valor de venda" />
        <StatCard index={8} label="Tempo médio de venda" value={overview.averageDaysToSell ?? 0} format={(value) => formatDays(Math.round(value))} icon={<Timer className="size-4" />} caption="Da compra até a venda" />
        <StatCard index={9} label="ROI médio" value={overview.averageRoi ?? 0} format={formatPercent} icon={<BadgePercent className="size-4" />} tone="violet" caption="Retorno sobre o investido" />
        <StatCard index={10} label="Margem média" value={overview.averageMargin ?? 0} format={formatPercent} icon={<BadgePercent className="size-4" />} tone="accent" caption="Lucro líquido sobre a venda" />
        <StatCard index={11} label="Gasto com deslocamento" value={overview.travelSpend} format={formatCurrency} icon={<Car className="size-4" />} caption="Combustível, Uber, pedágio…" />
        <StatCard index={12} label="Gasto com manutenção" value={overview.maintenanceSpend} format={formatCurrency} icon={<Wrench className="size-4" />} caption="Peças, reparos e acessórios" />
      </section>

      {hasCharts && (
        <section className="grid gap-4 lg:grid-cols-2">
          <Card className="lg:col-span-2">
            <SectionTitle title="Evolução do lucro" subtitle="Lucro líquido acumulado mês a mês" />
            <ProfitTrendChart data={months} />
          </Card>

          <Card>
            <SectionTitle title="Lucro por mês" subtitle="Resultado líquido de cada mês" />
            <MonthlyProfitChart data={months} />
          </Card>

          <Card>
            <SectionTitle title="Compras x vendas" subtitle="Quantidade de aparelhos por mês" />
            <FlowChart data={months} />
          </Card>

          <Card>
            <SectionTitle title="Investido x retorno" subtitle="Quanto saiu e quanto voltou" />
            <InvestedVsReturnChart data={months} />
          </Card>

          <Card>
            <SectionTitle title="Tempo médio de venda" subtitle="Dias entre comprar e vender" />
            <SellingTimeChart data={months} />
          </Card>

          <Card className="lg:col-span-2">
            <SectionTitle title="Distribuição por marcas" subtitle="Quantos aparelhos de cada marca passaram por aqui" />
            <BrandDonutChart data={brands} />
          </Card>
        </section>
      )}

      <section className="grid gap-4 lg:grid-cols-2">
        <Card padded={false}>
          <div className="px-5 pt-5">
            <SectionTitle
              title="Últimos cadastros"
              subtitle="Os aparelhos mais recentes"
              action={
                <Button size="sm" variant="ghost" onClick={() => navigate('estoque')} iconRight={<ChevronRight className="size-4" />}>
                  Ver todos
                </Button>
              }
            />
          </div>
          <ul className="px-2 pb-3">
            {recent.map((row) => (
              <DeviceRowCompact key={row.device.id} row={row} onClick={() => onOpenDevice(row.device.id)} />
            ))}
          </ul>
        </Card>

        <Card padded={false}>
          <div className="px-5 pt-5">
            <SectionTitle
              title="Alertas"
              subtitle={alerts.length ? `${alerts.length} ponto(s) de atenção` : 'Tudo em ordem por aqui'}
              action={
                alerts.length > 3 ? (
                  <Button size="sm" variant="ghost" onClick={() => navigate('alertas')} iconRight={<ChevronRight className="size-4" />}>
                    Ver todos
                  </Button>
                ) : undefined
              }
            />
          </div>
          <div className="px-2 pb-3">
            {alerts.length ? (
              alerts.slice(0, 4).map((alert) => (
                <AlertRow key={alert.id} alert={alert} onClick={() => onOpenDevice(alert.device.id)} />
              ))
            ) : (
              <p className="px-3 pb-6 pt-2 text-[13.5px] text-2">
                Nenhum aparelho parado, sem preço ou com dados faltando.
              </p>
            )}
          </div>
        </Card>
      </section>
    </div>
  )
}
