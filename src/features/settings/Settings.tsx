import { useRef, useState } from 'react'
import { Database, Download, FileDown, FileText, Trash2, Upload } from 'lucide-react'
import { Card, SectionTitle } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Switch } from '../../components/ui/Field'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { useTheme } from '../../store/theme'
import { isIndexedDbAvailable } from '../../data/indexedDb'
import { formatCurrency } from '../../lib/format'
import type { DeviceWithFinance, Overview } from '../../lib/metrics'

export function Settings({
  rows,
  overview,
  onExportExcel,
  onExportPdf,
  onExportBackup,
  onImportBackup,
  onClearAll,
}: {
  rows: DeviceWithFinance[]
  overview: Overview
  onExportExcel: () => void
  onExportPdf: () => void
  onExportBackup: () => void
  onImportBackup: (file: File) => void
  onClearAll: () => void
}) {
  const { theme, toggle } = useTheme()
  const [confirmImport, setConfirmImport] = useState<File | null>(null)
  const [confirmClear, setConfirmClear] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  return (
    <div className="flex flex-col gap-6 pt-4">
      <header>
        <h1 className="text-[30px] font-semibold tracking-[-0.035em] text-1 sm:text-[34px]">Ajustes</h1>
        <p className="mt-1 text-[13.5px] text-2">Aparência, backup e exportações do seu painel</p>
      </header>

      <Card>
        <SectionTitle title="Aparência" subtitle="O tema fica salvo neste navegador" />
        <Switch checked={theme === 'dark'} onChange={toggle} label="Modo escuro" />
      </Card>

      <Card>
        <SectionTitle title="Exportar" subtitle="Leve seus números para onde precisar" />
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" icon={<FileDown className="size-4" />} onClick={onExportExcel}>
            Planilha (Excel)
          </Button>
          <Button variant="secondary" icon={<FileText className="size-4" />} onClick={onExportPdf}>
            Relatório em PDF
          </Button>
          <Button variant="secondary" icon={<Download className="size-4" />} onClick={onExportBackup}>
            Backup em JSON
          </Button>
        </div>
        <p className="mt-3 text-[12.5px] leading-relaxed text-3">
          A planilha sai em CSV com separador <code>;</code> e acentuação UTF-8 — abre direto no Excel.
          O relatório em PDF abre a janela de impressão: escolha “Salvar como PDF”.
        </p>
      </Card>

      <Card>
        <SectionTitle title="Importar backup" subtitle="Substitui todos os dados atuais pelo arquivo" />
        <input
          ref={fileRef}
          type="file"
          accept="application/json"
          hidden
          onChange={(event) => {
            const file = event.target.files?.[0]
            if (file) setConfirmImport(file)
            event.target.value = ''
          }}
        />
        <Button variant="secondary" icon={<Upload className="size-4" />} onClick={() => fileRef.current?.click()}>
          Escolher arquivo JSON
        </Button>
      </Card>

      <Card>
        <SectionTitle title="Armazenamento" subtitle="Tudo fica apenas neste computador" />
        <div className="flex flex-col gap-2.5 text-[13.5px]">
          <Row label="Tecnologia" value={isIndexedDbAvailable() ? 'IndexedDB' : 'LocalStorage'} icon={<Database className="size-4 text-accent" />} />
          <Row label="Aparelhos cadastrados" value={String(rows.length)} />
          <Row label="Investimento acumulado" value={formatCurrency(overview.totalInvestedAllTime)} />
          <Row label="Receita acumulada" value={formatCurrency(overview.totalRevenue)} />
        </div>
        <p className="mt-4 text-[12.5px] leading-relaxed text-3">
          Nenhum dado sai do seu navegador. Faça backups em JSON com frequência — limpar os dados de
          navegação apaga o banco local.
        </p>
      </Card>

      <Card className="border-negative/30">
        <SectionTitle title="Zona de risco" subtitle="Ação irreversível" />
        <Button variant="danger" icon={<Trash2 className="size-4" />} onClick={() => setConfirmClear(true)}>
          Apagar todos os dados
        </Button>
      </Card>

      <ConfirmDialog
        open={confirmImport !== null}
        title="Importar backup?"
        description="Todos os aparelhos atuais serão substituídos pelo conteúdo do arquivo. Faça um backup antes se ainda não fez."
        confirmLabel="Importar e substituir"
        onConfirm={() => confirmImport && onImportBackup(confirmImport)}
        onClose={() => setConfirmImport(null)}
      />

      <ConfirmDialog
        open={confirmClear}
        title="Apagar todos os dados?"
        description="Todos os aparelhos, gastos e vendas serão removidos deste navegador. Não há como desfazer."
        confirmLabel="Apagar tudo"
        destructive
        onConfirm={onClearAll}
        onClose={() => setConfirmClear(false)}
      />
    </div>
  )
}

function Row({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-[rgb(var(--hairline))] pb-2.5 last:border-0 last:pb-0">
      <span className="flex items-center gap-2 text-2">
        {icon}
        {label}
      </span>
      <span className="tabular font-medium text-1">{value}</span>
    </div>
  )
}
