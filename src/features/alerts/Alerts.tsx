import { motion } from 'framer-motion'
import { ShieldCheck } from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { EmptyState } from '../../components/ui/EmptyState'
import { AlertRow } from './AlertRow'
import type { Alert, AlertLevel } from '../../lib/alerts'

const GROUPS: Array<{ level: AlertLevel; title: string; subtitle: string }> = [
  { level: 'critical', title: 'Precisa de atenção agora', subtitle: 'Prejuízo ou aparelho parado há muito tempo' },
  { level: 'warning', title: 'Vale revisar', subtitle: 'Pontos que podem travar a sua margem' },
  { level: 'info', title: 'Sugestões', subtitle: 'Dados faltando e desempenho abaixo da média' },
]

export function Alerts({ alerts, onOpenDevice }: { alerts: Alert[]; onOpenDevice: (id: string) => void }) {
  return (
    <div className="flex flex-col gap-6 pt-4">
      <header>
        <h1 className="text-[30px] font-semibold tracking-[-0.035em] text-1 sm:text-[34px]">Alertas</h1>
        <p className="mt-1 text-[13.5px] text-2">
          {alerts.length ? `${alerts.length} ponto(s) de atenção na sua operação` : 'Nenhum ponto de atenção no momento'}
        </p>
      </header>

      {alerts.length ? (
        GROUPS.map((group) => {
          const items = alerts.filter((alert) => alert.level === group.level)
          if (!items.length) return null

          return (
            <motion.section
              key={group.level}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            >
              <Card padded={false}>
                <div className="border-b border-[rgb(var(--hairline))] px-5 py-4">
                  <h2 className="text-[15.5px] font-semibold tracking-[-0.01em] text-1">{group.title}</h2>
                  <p className="mt-0.5 text-[12.5px] text-2">{group.subtitle}</p>
                </div>
                <div className="p-2">
                  {items.map((alert) => (
                    <AlertRow key={alert.id} alert={alert} onClick={() => onOpenDevice(alert.device.id)} />
                  ))}
                </div>
              </Card>
            </motion.section>
          )
        })
      ) : (
        <Card>
          <EmptyState
            icon={<ShieldCheck className="size-6" />}
            title="Tudo sob controle"
            description="Nenhum aparelho parado há mais de 30 dias, sem preço anunciado ou com campos incompletos."
          />
        </Card>
      )}
    </div>
  )
}
