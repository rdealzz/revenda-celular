import { useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ImagePlus, Plus, SlidersHorizontal, Star, Trash2, X } from 'lucide-react'
import { Modal } from '../../components/ui/Modal'
import { Button, IconButton } from '../../components/ui/Button'
import { Field, Input, MoneyInput, Segmented, Select, Textarea } from '../../components/ui/Field'
import { Badge } from '../../components/ui/Badge'
import { DevicePhoto } from './DevicePhoto'
import { calcDevice } from '../../lib/calc'
import { createId } from '../../lib/id'
import { fileToThumbnail } from '../../lib/image'
import { EXPENSE_SUGGESTIONS } from '../../lib/expenses'
import { formatCurrency, formatDays, formatPercent } from '../../lib/format'
import { cn } from '../../lib/cn'
import type { Device, DeviceCondition, DeviceStatus, Expense } from '../../types'

const CONDITIONS: Array<{ value: DeviceCondition; label: string }> = [
  { value: 'novo', label: 'Novo / lacrado' },
  { value: 'seminovo', label: 'Seminovo' },
  { value: 'usado', label: 'Usado' },
  { value: 'com-marcas', label: 'Com marcas de uso' },
  { value: 'com-defeito', label: 'Com defeito' },
]

const PAYMENTS = ['Pix', 'Dinheiro', 'Cartão de crédito', 'Cartão de débito', 'Transferência', 'Parcelado']

type Section = 'ficha' | 'compra' | 'gastos' | 'venda'

const isNewDevice = (device: Device) => !device.brand.trim() && !device.model.trim()

export function DeviceForm({
  open,
  initial,
  onClose,
  onSubmit,
}: {
  open: boolean
  initial: Device
  onClose: () => void
  onSubmit: (device: Device) => void
}) {
  const [draft, setDraft] = useState<Device>(initial)
  /** Cadastro novo abre no modo rápido: o essencial em um só lugar. */
  const [detailed, setDetailed] = useState(() => !isNewDevice(initial))
  const [section, setSection] = useState<Section>('ficha')
  const [tagInput, setTagInput] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const finance = useMemo(() => calcDevice(draft), [draft])
  const patch = (changes: Partial<Device>) => setDraft((current) => ({ ...current, ...changes }))

  const updateExpense = (id: string, changes: Partial<Expense>) =>
    patch({
      expenses: draft.expenses.map((expense) =>
        expense.id === id ? { ...expense, ...changes } : expense,
      ),
    })

  const addExpense = (description = '') =>
    patch({ expenses: [...draft.expenses, { id: createId(), description, amount: 0 }] })

  const addTag = () => {
    const tag = tagInput.trim()
    if (!tag || draft.tags.includes(tag)) return setTagInput('')
    patch({ tags: [...draft.tags, tag] })
    setTagInput('')
  }

  const handlePhoto = async (file: File | undefined) => {
    if (!file) return
    patch({ photo: await fileToThumbnail(file) })
  }

  const submit = () => {
    const status: DeviceStatus =
      draft.sale.amount && draft.sale.date ? 'vendido' : draft.status === 'vendido' ? 'estoque' : draft.status
    onSubmit({ ...draft, status })
  }

  if (!detailed) {
    return (
      <Modal
        open={open}
        onClose={onClose}
        title="Novo aparelho"
        subtitle="Só o essencial — o resto pode entrar depois"
        footer={
          <>
            <Button variant="ghost" onClick={onClose}>
              Cancelar
            </Button>
            <Button variant="primary" disabled={!draft.model.trim()} onClick={submit}>
              Salvar aparelho
            </Button>
          </>
        }
      >
        <form
          className="flex flex-col gap-4"
          onSubmit={(event) => {
            event.preventDefault()
            if (draft.model.trim()) submit()
          }}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Marca">
              <Input
                autoFocus
                value={draft.brand}
                onChange={(event) => patch({ brand: event.target.value })}
                placeholder="Apple, Samsung, Xiaomi…"
              />
            </Field>
            <Field label="Modelo">
              <Input
                value={draft.model}
                onChange={(event) => patch({ model: event.target.value })}
                placeholder="iPhone 13 Pro"
              />
            </Field>
            <Field label="Valor pago">
              <MoneyInput
                value={draft.purchase.amount || null}
                onValueChange={(value) => patch({ purchase: { ...draft.purchase, amount: value ?? 0 } })}
              />
            </Field>
            <Field label="Valor pretendido" hint="Quanto pretende anunciar">
              <MoneyInput
                value={draft.sale.askingPrice}
                onValueChange={(value) => patch({ sale: { ...draft.sale, askingPrice: value } })}
              />
            </Field>
            <Field label="Data da compra">
              <Input
                type="date"
                value={draft.purchase.date}
                onChange={(event) => patch({ purchase: { ...draft.purchase, date: event.target.value } })}
              />
            </Field>
            <Field label="Armazenamento" hint="Opcional">
              <Input
                value={draft.storage}
                onChange={(event) => patch({ storage: event.target.value })}
                placeholder="128 GB"
              />
            </Field>
          </div>

          <div className="flex items-center justify-between rounded-2xl bg-[rgb(var(--hairline))] px-4 py-3">
            <span className="text-[13px] text-2">Lucro potencial</span>
            <span
              className={cn(
                'tabular text-[15px] font-semibold',
                finance.potentialProfit === null
                  ? 'text-3'
                  : finance.potentialProfit >= 0
                    ? 'text-positive'
                    : 'text-negative',
              )}
            >
              {finance.potentialProfit === null ? '—' : formatCurrency(finance.potentialProfit)}
            </span>
          </div>

          <Button
            variant="ghost"
            className="self-start"
            icon={<SlidersHorizontal className="size-4" />}
            onClick={() => setDetailed(true)}
          >
            Foto, gastos, IMEI e mais detalhes
          </Button>

          <button type="submit" hidden />
        </form>
      </Modal>
    )
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={isNewDevice(initial) ? 'Novo aparelho' : 'Editar aparelho'}
      subtitle="Os cálculos são atualizados enquanto você digita"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={submit}>
            Salvar aparelho
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-6">
        <LiveSummary
          invested={finance.totalInvested}
          gross={finance.grossProfit}
          net={finance.netProfit}
          margin={finance.margin}
          roi={finance.roi}
          days={finance.isSold ? finance.daysToSell : finance.daysInStock}
          sold={finance.isSold}
        />

        <Segmented
          layoutId="device-form-section"
          value={section}
          onChange={setSection}
          options={[
            { value: 'ficha', label: 'Ficha' },
            { value: 'compra', label: 'Compra' },
            { value: 'gastos', label: 'Gastos', badge: draft.expenses.length },
            { value: 'venda', label: 'Venda' },
          ]}
        />

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={section}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col gap-4"
          >
            {section === 'ficha' && (
              <>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="group relative"
                    title="Adicionar foto"
                  >
                    <DevicePhoto device={draft} size="md" className="size-16 rounded-[16px]" />
                    <span className="absolute inset-0 grid place-items-center rounded-[16px] bg-black/45 opacity-0 transition-opacity group-hover:opacity-100">
                      <ImagePlus className="size-5 text-white" />
                    </span>
                  </button>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(event) => void handlePhoto(event.target.files?.[0])}
                  />
                  <div className="flex flex-col gap-2">
                    <p className="text-[13px] text-2">Foto do aparelho (opcional)</p>
                    {draft.photo && (
                      <Button size="sm" variant="ghost" onClick={() => patch({ photo: null })}>
                        Remover foto
                      </Button>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant={draft.favorite ? 'primary' : 'secondary'}
                    className="ml-auto"
                    icon={<Star className={cn('size-4', draft.favorite && 'fill-current')} />}
                    onClick={() => patch({ favorite: !draft.favorite })}
                  >
                    Favorito
                  </Button>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Marca">
                    <Input
                      value={draft.brand}
                      onChange={(event) => patch({ brand: event.target.value })}
                      placeholder="Apple, Samsung, Xiaomi…"
                    />
                  </Field>
                  <Field label="Modelo">
                    <Input
                      value={draft.model}
                      onChange={(event) => patch({ model: event.target.value })}
                      placeholder="iPhone 13 Pro"
                    />
                  </Field>
                  <Field label="Cor">
                    <Input value={draft.color} onChange={(event) => patch({ color: event.target.value })} placeholder="Grafite" />
                  </Field>
                  <Field label="Armazenamento">
                    <Input value={draft.storage} onChange={(event) => patch({ storage: event.target.value })} placeholder="128 GB" />
                  </Field>
                  <Field label="Memória RAM">
                    <Input value={draft.ram} onChange={(event) => patch({ ram: event.target.value })} placeholder="6 GB" />
                  </Field>
                  <Field label="IMEI" hint="Opcional">
                    <Input value={draft.imei} onChange={(event) => patch({ imei: event.target.value })} placeholder="000000000000000" />
                  </Field>
                  <Field label="Estado do aparelho">
                    <Select
                      value={draft.condition}
                      onChange={(event) => patch({ condition: event.target.value as DeviceCondition })}
                    >
                      {CONDITIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Select>
                  </Field>
                  <Field label="Situação">
                    <Select
                      value={draft.status}
                      onChange={(event) => patch({ status: event.target.value as DeviceStatus })}
                    >
                      <option value="estoque">Em estoque</option>
                      <option value="reservado">Reservado</option>
                      <option value="vendido">Vendido</option>
                    </Select>
                  </Field>
                </div>

                <Field label="Tags" hint="Enter para adicionar">
                  <Input
                    value={tagInput}
                    onChange={(event) => setTagInput(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault()
                        addTag()
                      }
                    }}
                    placeholder="promoção, troca, urgente…"
                  />
                </Field>
                {!!draft.tags.length && (
                  <div className="flex flex-wrap gap-2">
                    {draft.tags.map((tag) => (
                      <Badge key={tag} tone="violet">
                        {tag}
                        <button
                          type="button"
                          onClick={() => patch({ tags: draft.tags.filter((item) => item !== tag) })}
                          className="opacity-60 transition-opacity hover:opacity-100"
                        >
                          <X className="size-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}

                <Field label="Observações">
                  <Textarea
                    value={draft.notes}
                    onChange={(event) => patch({ notes: event.target.value })}
                    placeholder="Detalhes do aparelho, acessórios, histórico…"
                  />
                </Field>
              </>
            )}

            {section === 'compra' && (
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Data da compra">
                  <Input
                    type="date"
                    value={draft.purchase.date}
                    onChange={(event) => patch({ purchase: { ...draft.purchase, date: event.target.value } })}
                  />
                </Field>
                <Field label="Valor pago">
                  <MoneyInput
                    value={draft.purchase.amount || null}
                    onValueChange={(value) => patch({ purchase: { ...draft.purchase, amount: value ?? 0 } })}
                  />
                </Field>
                <Field label="Quem vendeu">
                  <Input
                    value={draft.purchase.seller}
                    onChange={(event) => patch({ purchase: { ...draft.purchase, seller: event.target.value } })}
                    placeholder="Nome ou perfil"
                  />
                </Field>
                <Field label="Cidade">
                  <Input
                    value={draft.purchase.city}
                    onChange={(event) => patch({ purchase: { ...draft.purchase, city: event.target.value } })}
                  />
                </Field>
                <Field label="Link do anúncio" hint="Opcional" className="sm:col-span-2">
                  <Input
                    value={draft.purchase.listingUrl}
                    onChange={(event) => patch({ purchase: { ...draft.purchase, listingUrl: event.target.value } })}
                    placeholder="https://"
                  />
                </Field>
              </div>
            )}

            {section === 'gastos' && (
              <div className="flex flex-col gap-3">
                <div className="flex flex-wrap gap-2">
                  {EXPENSE_SUGGESTIONS.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => addExpense(suggestion)}
                      className="rounded-full border border-[rgb(var(--hairline-strong))] px-3 py-1.5 text-[12.5px] text-2 transition-colors hover:border-accent/60 hover:text-accent"
                    >
                      + {suggestion}
                    </button>
                  ))}
                </div>

                <AnimatePresence initial={false}>
                  {draft.expenses.map((expense) => (
                    <motion.div
                      key={expense.id}
                      layout
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                      className="flex items-center gap-2 overflow-hidden"
                    >
                      <Input
                        value={expense.description}
                        onChange={(event) => updateExpense(expense.id, { description: event.target.value })}
                        placeholder="Descrição do gasto"
                        className="flex-1"
                      />
                      <div className="w-[140px]">
                        <MoneyInput
                          value={expense.amount || null}
                          onValueChange={(value) => updateExpense(expense.id, { amount: value ?? 0 })}
                        />
                      </div>
                      <IconButton
                        label="Remover gasto"
                        variant="ghost"
                        onClick={() => patch({ expenses: draft.expenses.filter((item) => item.id !== expense.id) })}
                        icon={<Trash2 className="size-4 text-negative" />}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>

                <Button variant="secondary" icon={<Plus className="size-4" />} onClick={() => addExpense()}>
                  Adicionar gasto
                </Button>

                <div className="flex items-center justify-between rounded-2xl bg-[rgb(var(--hairline))] px-4 py-3">
                  <span className="text-[13px] text-2">Total de gastos</span>
                  <span className="tabular text-[15px] font-semibold text-1">
                    {formatCurrency(finance.expensesTotal)}
                  </span>
                </div>
              </div>
            )}

            {section === 'venda' && (
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Valor pretendido" hint="Preço anunciado">
                  <MoneyInput
                    value={draft.sale.askingPrice}
                    onValueChange={(value) => patch({ sale: { ...draft.sale, askingPrice: value } })}
                  />
                </Field>
                <Field label="Valor vendido">
                  <MoneyInput
                    value={draft.sale.amount}
                    onValueChange={(value) => patch({ sale: { ...draft.sale, amount: value } })}
                  />
                </Field>
                <Field label="Data da venda">
                  <Input
                    type="date"
                    value={draft.sale.date}
                    onChange={(event) => patch({ sale: { ...draft.sale, date: event.target.value } })}
                  />
                </Field>
                <Field label="Cliente">
                  <Input
                    value={draft.sale.customer}
                    onChange={(event) => patch({ sale: { ...draft.sale, customer: event.target.value } })}
                  />
                </Field>
                <Field label="Cidade">
                  <Input
                    value={draft.sale.city}
                    onChange={(event) => patch({ sale: { ...draft.sale, city: event.target.value } })}
                  />
                </Field>
                <Field label="Forma de pagamento">
                  <Select
                    value={draft.sale.paymentMethod}
                    onChange={(event) => patch({ sale: { ...draft.sale, paymentMethod: event.target.value } })}
                  >
                    <option value="">Selecionar…</option>
                    {PAYMENTS.map((payment) => (
                      <option key={payment} value={payment}>
                        {payment}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Observações da venda" className="sm:col-span-2">
                  <Textarea
                    value={draft.sale.notes}
                    onChange={(event) => patch({ sale: { ...draft.sale, notes: event.target.value } })}
                    placeholder="Negociação, garantia combinada, troca…"
                  />
                </Field>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </Modal>
  )
}

function LiveSummary({
  invested,
  gross,
  net,
  margin,
  roi,
  days,
  sold,
}: {
  invested: number
  gross: number | null
  net: number | null
  margin: number | null
  roi: number | null
  days: number | null
  sold: boolean
}) {
  const items: Array<{ label: string; value: string; tone?: 'positive' | 'negative' }> = [
    { label: 'Investimento total', value: formatCurrency(invested) },
    {
      label: 'Lucro bruto',
      value: gross === null ? '—' : formatCurrency(gross),
      tone: gross === null ? undefined : gross >= 0 ? 'positive' : 'negative',
    },
    {
      label: 'Lucro líquido',
      value: net === null ? '—' : formatCurrency(net),
      tone: net === null ? undefined : net >= 0 ? 'positive' : 'negative',
    },
    { label: 'Margem', value: margin === null ? '—' : formatPercent(margin) },
    { label: 'ROI', value: roi === null ? '—' : formatPercent(roi) },
    { label: sold ? 'Dias até vender' : 'Dias em estoque', value: formatDays(days) },
  ]

  return (
    <div className="grid grid-cols-2 gap-px overflow-hidden rounded-[18px] border border-[rgb(var(--hairline))] bg-[rgb(var(--hairline))] sm:grid-cols-3">
      {items.map((item) => (
        <div key={item.label} className="bg-[rgb(var(--surface))] px-3.5 py-3">
          <p className="text-[11px] font-medium uppercase tracking-[0.05em] text-3">{item.label}</p>
          <motion.p
            key={item.value}
            initial={{ opacity: 0.4, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className={cn(
              'tabular mt-1 text-[15px] font-semibold',
              item.tone === 'positive' ? 'text-positive' : item.tone === 'negative' ? 'text-negative' : 'text-1',
            )}
          >
            {item.value}
          </motion.p>
        </div>
      ))}
    </div>
  )
}
