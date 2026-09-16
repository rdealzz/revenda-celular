import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Modal } from '../../components/ui/Modal'
import { Button } from '../../components/ui/Button'
import { Field, Input, MoneyInput, Select } from '../../components/ui/Field'
import { calcDevice, deviceSubtitle, deviceTitle } from '../../lib/calc'
import { formatCurrency, formatPercent, todayISO } from '../../lib/format'
import { cn } from '../../lib/cn'
import type { Device } from '../../types'

const PAYMENTS = ['Pix', 'Dinheiro', 'Cartão de crédito', 'Cartão de débito', 'Transferência', 'Parcelado']

/**
 * Caminho curto para o dia a dia: vendeu, registra em dois campos.
 * O cadastro completo continua disponível em "Editar".
 */
export function QuickSaleDialog({
  device,
  onClose,
  onConfirm,
}: {
  device: Device
  onClose: () => void
  onConfirm: (device: Device) => void
}) {
  const [amount, setAmount] = useState<number | null>(device.sale.amount ?? device.sale.askingPrice)
  const [date, setDate] = useState(device.sale.date || todayISO())
  const [customer, setCustomer] = useState(device.sale.customer)
  const [paymentMethod, setPaymentMethod] = useState(device.sale.paymentMethod)

  const preview = useMemo(
    () => calcDevice({ ...device, status: 'vendido', sale: { ...device.sale, amount, date } }),
    [device, amount, date],
  )

  const netProfit = preview.netProfit ?? 0
  const ready = amount !== null && amount > 0 && !!date

  const confirm = () =>
    onConfirm({
      ...device,
      status: 'vendido',
      sale: { ...device.sale, amount, date, customer, paymentMethod },
    })

  return (
    <Modal
      open
      onClose={onClose}
      title="Registrar venda"
      subtitle={`${deviceTitle(device)}${deviceSubtitle(device) ? ` · ${deviceSubtitle(device)}` : ''}`}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" disabled={!ready} onClick={confirm}>
            Registrar venda
          </Button>
        </>
      }
    >
      <form
        className="flex flex-col gap-4"
        onSubmit={(event) => {
          event.preventDefault()
          if (ready) confirm()
        }}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Valor vendido"
            hint={
              device.sale.askingPrice
                ? `Anunciado por ${formatCurrency(device.sale.askingPrice)}`
                : 'Quanto entrou na sua mão'
            }
          >
            <MoneyInput autoFocus value={amount} onValueChange={setAmount} />
          </Field>
          <Field label="Data da venda">
            <Input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
          </Field>
        </div>

        <motion.div
          layout
          className="grid grid-cols-3 gap-px overflow-hidden rounded-[18px] border border-[rgb(var(--hairline))] bg-[rgb(var(--hairline))]"
        >
          <Tile label="Investido" value={formatCurrency(preview.totalInvested)} />
          <Tile
            label="Lucro líquido"
            value={amount ? formatCurrency(netProfit) : '—'}
            tone={!amount ? undefined : netProfit >= 0 ? 'positive' : 'negative'}
          />
          <Tile
            label="Margem"
            value={preview.margin === null ? '—' : formatPercent(preview.margin)}
          />
        </motion.div>

        <details className="group">
          <summary className="cursor-pointer list-none text-[13px] font-medium text-accent transition-opacity hover:opacity-80">
            Adicionar cliente e forma de pagamento
          </summary>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <Field label="Cliente">
              <Input
                value={customer}
                onChange={(event) => setCustomer(event.target.value)}
                placeholder="Nome de quem comprou"
              />
            </Field>
            <Field label="Forma de pagamento">
              <Select value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value)}>
                <option value="">Selecionar…</option>
                {PAYMENTS.map((payment) => (
                  <option key={payment} value={payment}>
                    {payment}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
        </details>

        <button type="submit" hidden />
      </form>
    </Modal>
  )
}

function Tile({
  label,
  value,
  tone,
}: {
  label: string
  value: string
  tone?: 'positive' | 'negative'
}) {
  return (
    <div className="bg-[rgb(var(--surface))] px-3.5 py-3">
      <p className="text-[11px] font-medium uppercase tracking-[0.05em] text-3">{label}</p>
      <motion.p
        key={value}
        initial={{ opacity: 0.45, y: 3 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22 }}
        className={cn(
          'tabular mt-1 text-[15px] font-semibold',
          tone === 'positive' ? 'text-positive' : tone === 'negative' ? 'text-negative' : 'text-1',
        )}
      >
        {value}
      </motion.p>
    </div>
  )
}
