import type { Device } from '../types'
import type { DeviceWithFinance } from './metrics'
import { deviceTitle } from './calc'

export type AlertLevel = 'critical' | 'warning' | 'info'

export interface Alert {
  id: string
  level: AlertLevel
  title: string
  description: string
  device: Device
}

const STOCK_LIMIT_DAYS = 30

export function buildAlerts(rows: DeviceWithFinance[]): Alert[] {
  const soldProfits = rows
    .filter((row) => row.finance.isSold)
    .map((row) => row.finance.netProfit ?? 0)

  const averageProfit = soldProfits.length
    ? soldProfits.reduce((sum, value) => sum + value, 0) / soldProfits.length
    : null

  const alerts: Alert[] = []

  for (const { device, finance } of rows) {
    const name = deviceTitle(device)

    if (!finance.isSold && (finance.daysInStock ?? 0) > STOCK_LIMIT_DAYS) {
      alerts.push({
        id: `${device.id}:parado`,
        level: (finance.daysInStock ?? 0) > 60 ? 'critical' : 'warning',
        title: `${name} está há ${finance.daysInStock} dias em estoque`,
        description: 'Considere revisar o preço anunciado ou ampliar a divulgação.',
        device,
      })
    }

    if (!finance.isSold && !device.sale.askingPrice) {
      alerts.push({
        id: `${device.id}:sem-preco`,
        level: 'warning',
        title: `${name} está sem valor pretendido`,
        description: 'Sem preço anunciado não é possível calcular o lucro potencial.',
        device,
      })
    }

    if (
      finance.isSold &&
      averageProfit !== null &&
      (finance.netProfit ?? 0) < averageProfit * 0.6
    ) {
      alerts.push({
        id: `${device.id}:lucro-baixo`,
        level: (finance.netProfit ?? 0) < 0 ? 'critical' : 'info',
        title: `${name} rendeu abaixo da média`,
        description:
          (finance.netProfit ?? 0) < 0
            ? 'Esta venda fechou no prejuízo.'
            : 'O lucro líquido ficou bem abaixo da sua média histórica.',
        device,
      })
    }

    const missing = missingFields(device)
    if (missing.length) {
      alerts.push({
        id: `${device.id}:incompleto`,
        level: 'info',
        title: `${name} tem campos incompletos`,
        description: `Faltando: ${missing.join(', ')}.`,
        device,
      })
    }
  }

  const weight: Record<AlertLevel, number> = { critical: 0, warning: 1, info: 2 }
  return alerts.sort((a, b) => weight[a.level] - weight[b.level])
}

export function missingFields(device: Device): string[] {
  const missing: string[] = []
  if (!device.brand.trim()) missing.push('marca')
  if (!device.model.trim()) missing.push('modelo')
  if (!device.purchase.date) missing.push('data da compra')
  if (!device.purchase.amount) missing.push('valor pago')
  if (!device.purchase.seller.trim()) missing.push('quem vendeu')
  if (!device.storage.trim()) missing.push('armazenamento')
  if (device.status === 'vendido') {
    if (!device.sale.amount) missing.push('valor vendido')
    if (!device.sale.date) missing.push('data da venda')
  }
  return missing
}
