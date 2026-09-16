import type { Backup, Device } from '../types'
import { deviceTitle } from './calc'
import { formatCurrency, formatDate, formatDays, formatPercent } from './format'
import type { DeviceWithFinance, Overview } from './metrics'
import { normalizeDevice } from './device'

const STATUS_LABEL: Record<Device['status'], string> = {
  estoque: 'Em estoque',
  reservado: 'Reservado',
  vendido: 'Vendido',
}

function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

const stamp = () => new Date().toISOString().slice(0, 10)

/* ------------------------------------------------------------------ Excel */

const CSV_COLUMNS: Array<{ header: string; value: (row: DeviceWithFinance) => string | number }> = [
  { header: 'Marca', value: ({ device }) => device.brand },
  { header: 'Modelo', value: ({ device }) => device.model },
  { header: 'Cor', value: ({ device }) => device.color },
  { header: 'Armazenamento', value: ({ device }) => device.storage },
  { header: 'RAM', value: ({ device }) => device.ram },
  { header: 'IMEI', value: ({ device }) => device.imei },
  { header: 'Estado', value: ({ device }) => device.condition },
  { header: 'Status', value: ({ device }) => STATUS_LABEL[device.status] },
  { header: 'Data da compra', value: ({ device }) => formatDate(device.purchase.date, 'short') },
  { header: 'Valor pago', value: ({ device }) => device.purchase.amount },
  { header: 'Quem vendeu', value: ({ device }) => device.purchase.seller },
  { header: 'Cidade da compra', value: ({ device }) => device.purchase.city },
  { header: 'Gastos', value: ({ finance }) => finance.expensesTotal },
  { header: 'Investimento total', value: ({ finance }) => finance.totalInvested },
  { header: 'Valor pretendido', value: ({ device }) => device.sale.askingPrice ?? '' },
  { header: 'Data da venda', value: ({ device }) => formatDate(device.sale.date, 'short') },
  { header: 'Valor vendido', value: ({ device }) => device.sale.amount ?? '' },
  { header: 'Cliente', value: ({ device }) => device.sale.customer },
  { header: 'Forma de pagamento', value: ({ device }) => device.sale.paymentMethod },
  { header: 'Lucro bruto', value: ({ finance }) => finance.grossProfit ?? '' },
  { header: 'Lucro líquido', value: ({ finance }) => finance.netProfit ?? '' },
  { header: 'Margem %', value: ({ finance }) => round(finance.margin) },
  { header: 'ROI %', value: ({ finance }) => round(finance.roi) },
  { header: 'Dias para vender', value: ({ finance }) => finance.daysToSell ?? '' },
  { header: 'Dias em estoque', value: ({ finance }) => finance.daysInStock ?? '' },
  { header: 'Tags', value: ({ device }) => device.tags.join(' | ') },
  { header: 'Observações', value: ({ device }) => device.notes.replace(/\s+/g, ' ') },
]

const round = (value: number | null) => (value === null ? '' : Math.round(value * 10) / 10)

function csvCell(value: string | number): string {
  if (typeof value === 'number') return String(value).replace('.', ',')
  const text = value ?? ''
  return /[";\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

/** CSV com BOM e separador `;` — abre direto no Excel em português. */
export function exportExcel(rows: DeviceWithFinance[]) {
  const lines = [
    CSV_COLUMNS.map((column) => column.header).join(';'),
    ...rows.map((row) => CSV_COLUMNS.map((column) => csvCell(column.value(row))).join(';')),
  ]
  download(
    new Blob(['﻿' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8;' }),
    `revenda-${stamp()}.csv`,
  )
}

/* -------------------------------------------------------------------- PDF */

const escapeHtml = (value: string) =>
  value.replace(/[&<>"]/g, (char) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[char] ?? char,
  )

export function exportPdf(rows: DeviceWithFinance[], overview: Overview) {
  const summary: Array<[string, string]> = [
    ['Investido em estoque', formatCurrency(overview.investedInStock)],
    ['Valor potencial de venda', formatCurrency(overview.potentialSaleValue)],
    ['Lucro potencial', formatCurrency(overview.potentialProfit)],
    ['Lucro líquido realizado', formatCurrency(overview.netProfitTotal)],
    ['Aparelhos em estoque', String(overview.inStockCount)],
    ['Aparelhos vendidos', String(overview.soldCount)],
    ['Ticket médio', formatCurrency(overview.averageTicket)],
    ['Tempo médio de venda', formatDays(overview.averageDaysToSell)],
    ['ROI médio', overview.averageRoi === null ? '—' : formatPercent(overview.averageRoi)],
    ['Margem média', overview.averageMargin === null ? '—' : formatPercent(overview.averageMargin)],
  ]

  const body = rows
    .map(({ device, finance }) => {
      const result = finance.netProfit
      return `<tr>
        <td><strong>${escapeHtml(deviceTitle(device))}</strong><br><span class="muted">${escapeHtml(
          [device.storage, device.color].filter(Boolean).join(' · '),
        )}</span></td>
        <td>${STATUS_LABEL[device.status]}</td>
        <td>${formatDate(device.purchase.date, 'short')}</td>
        <td class="num">${formatCurrency(finance.totalInvested)}</td>
        <td class="num">${device.sale.amount ? formatCurrency(device.sale.amount) : '—'}</td>
        <td class="num ${result === null ? '' : result >= 0 ? 'up' : 'down'}">${
          result === null ? '—' : formatCurrency(result)
        }</td>
        <td class="num">${finance.roi === null ? '—' : formatPercent(finance.roi)}</td>
        <td class="num">${
          finance.isSold ? formatDays(finance.daysToSell) : formatDays(finance.daysInStock)
        }</td>
      </tr>`
    })
    .join('')

  const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">
  <title>Relatório da revenda — ${new Date().toLocaleDateString('pt-BR')}</title>
  <style>
    @page { size: A4 landscape; margin: 14mm; }
    * { box-sizing: border-box; }
    body { font-family: -apple-system, "Segoe UI", Roboto, sans-serif; color: #1d1d1f; margin: 0; }
    h1 { font-size: 22px; margin: 0 0 4px; letter-spacing: -0.02em; }
    .muted { color: #86868b; font-size: 11px; }
    .grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; margin: 20px 0 26px; }
    .card { border: 1px solid #e5e5e7; border-radius: 12px; padding: 10px 12px; }
    .card span { display: block; font-size: 10px; color: #86868b; text-transform: uppercase; letter-spacing: .06em; }
    .card strong { font-size: 15px; }
    table { width: 100%; border-collapse: collapse; font-size: 11px; }
    th { text-align: left; font-size: 10px; text-transform: uppercase; letter-spacing: .06em; color: #86868b; border-bottom: 1px solid #d2d2d7; padding: 6px 8px; }
    td { padding: 8px; border-bottom: 1px solid #f0f0f2; vertical-align: top; }
    .num { text-align: right; font-variant-numeric: tabular-nums; white-space: nowrap; }
    .up { color: #1d9e6b; } .down { color: #e0443e; }
  </style></head><body>
  <h1>Relatório da revenda</h1>
  <p class="muted">Gerado em ${new Date().toLocaleString('pt-BR')} · ${rows.length} aparelhos</p>
  <div class="grid">${summary
    .map(([label, value]) => `<div class="card"><span>${label}</span><strong>${value}</strong></div>`)
    .join('')}</div>
  <table><thead><tr>
    <th>Aparelho</th><th>Status</th><th>Compra</th><th class="num">Investido</th>
    <th class="num">Vendido</th><th class="num">Lucro líquido</th><th class="num">ROI</th><th class="num">Tempo</th>
  </tr></thead><tbody>${body}</tbody></table>
  <script>window.onload = () => { window.focus(); window.print() }<\u002Fscript>
  </body></html>`

  const printWindow = window.open('', '_blank', 'width=1100,height=760')
  if (!printWindow) throw new Error('popup-bloqueado')
  printWindow.document.write(html)
  printWindow.document.close()
}

/* ----------------------------------------------------------------- Backup */

export function exportBackup(devices: Device[]) {
  const backup: Backup = {
    app: 'revenda-celular',
    version: 1,
    exportedAt: new Date().toISOString(),
    devices,
  }
  download(
    new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' }),
    `backup-revenda-${stamp()}.json`,
  )
}

export async function readBackup(file: File): Promise<Device[]> {
  const raw = JSON.parse(await file.text()) as Backup | Device[]
  const devices = Array.isArray(raw) ? raw : raw.devices
  if (!Array.isArray(devices)) throw new Error('Arquivo de backup inválido')
  return devices.map(normalizeDevice)
}
