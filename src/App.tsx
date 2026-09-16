import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { AppShell } from './components/layout/AppShell'
import { ConfirmDialog } from './components/ui/ConfirmDialog'
import { Dashboard } from './features/dashboard/Dashboard'
import { DeviceDetail } from './features/devices/DeviceDetail'
import { DeviceForm } from './features/devices/DeviceForm'
import { DeviceList } from './features/devices/DeviceList'
import { Statistics } from './features/stats/Statistics'
import { Alerts } from './features/alerts/Alerts'
import { Settings } from './features/settings/Settings'
import { useRoute } from './hooks/useRoute'
import { useDevices } from './store/devices'
import { useToast } from './store/toast'
import { buildAlerts } from './lib/alerts'
import { buildBrandStats, buildMonthlySeries, buildOverview, withFinance, type DeviceWithFinance } from './lib/metrics'
import { createDevice } from './lib/device'
import { exportBackup, exportExcel, exportPdf, readBackup } from './lib/exporters'
import type { Device } from './types'
import type { DeviceActions } from './features/devices/DeviceListItem'

export default function App() {
  const { devices, ready, save, remove, duplicate, toggleFavorite, replaceAll } = useDevices()
  const { route, navigate } = useRoute()
  const { notify } = useToast()

  const [editing, setEditing] = useState<Device | null>(null)
  const [deleting, setDeleting] = useState<Device | null>(null)

  const rows = useMemo(() => withFinance(devices), [devices])
  const overview = useMemo(() => buildOverview(rows), [rows])
  const months = useMemo(() => buildMonthlySeries(rows), [rows])
  const brands = useMemo(() => buildBrandStats(rows), [rows])
  const alerts = useMemo(() => buildAlerts(rows), [rows])

  const find = (id: string) => devices.find((device) => device.id === id)

  const actions: DeviceActions = {
    onOpen: (id) => navigate(`aparelho/${id}`),
    onEdit: (id) => {
      const device = find(id)
      if (device) setEditing(device)
    },
    onDuplicate: async (id) => {
      const copy = await duplicate(id)
      if (copy) notify('Cadastro duplicado')
    },
    onDelete: (id) => {
      const device = find(id)
      if (device) setDeleting(device)
    },
    onToggleFavorite: (id) => void toggleFavorite(id),
  }

  const handleExportExcel = (selection: DeviceWithFinance[] = rows) => {
    if (!selection.length) return notify('Nada para exportar', 'info')
    exportExcel(selection)
    notify('Planilha gerada')
  }

  const handleExportPdf = (selection: DeviceWithFinance[] = rows) => {
    if (!selection.length) return notify('Nada para exportar', 'info')
    try {
      exportPdf(selection, overview)
    } catch {
      notify('Libere os pop-ups para gerar o PDF', 'error')
    }
  }

  const handleImport = async (file: File) => {
    try {
      const imported = await readBackup(file)
      await replaceAll(imported)
      notify(`${imported.length} aparelho(s) importado(s)`)
      navigate('estoque')
    } catch {
      notify('Não foi possível ler este backup', 'error')
    }
  }

  if (!ready) return <Splash />

  const detailRow = route.name === 'aparelho' ? rows.find((row) => row.device.id === route.id) : undefined

  return (
    <AppShell
      route={route}
      navigate={navigate}
      alertCount={alerts.length}
      stockCount={overview.inStockCount + overview.reservedCount}
      onCreate={() => setEditing(createDevice())}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={route.name === 'aparelho' ? `aparelho-${route.id}` : route.name}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        >
          {route.name === 'dashboard' && (
            <Dashboard
              rows={rows}
              overview={overview}
              months={months}
              brands={brands}
              alerts={alerts}
              onOpenDevice={actions.onOpen}
              onCreate={() => setEditing(createDevice())}
              navigate={navigate}
            />
          )}

          {route.name === 'estoque' && (
            <DeviceList
              rows={rows}
              actions={actions}
              onCreate={() => setEditing(createDevice())}
              onExportExcel={handleExportExcel}
              onExportPdf={handleExportPdf}
            />
          )}

          {route.name === 'aparelho' &&
            (detailRow ? (
              <DeviceDetail row={detailRow} actions={actions} onBack={() => navigate('estoque')} />
            ) : (
              <NotFound onBack={() => navigate('estoque')} />
            ))}

          {route.name === 'estatisticas' && (
            <Statistics
              rows={rows}
              overview={overview}
              months={months}
              brands={brands}
              onOpenDevice={actions.onOpen}
            />
          )}

          {route.name === 'alertas' && <Alerts alerts={alerts} onOpenDevice={actions.onOpen} />}

          {route.name === 'ajustes' && (
            <Settings
              rows={rows}
              overview={overview}
              onExportExcel={() => handleExportExcel()}
              onExportPdf={() => handleExportPdf()}
              onExportBackup={() => {
                exportBackup(devices)
                notify('Backup salvo')
              }}
              onImportBackup={(file) => void handleImport(file)}
              onClearAll={() => {
                void replaceAll([])
                notify('Todos os dados foram apagados', 'info')
              }}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {editing && (
        <DeviceForm
          open
          initial={editing}
          onClose={() => setEditing(null)}
          onSubmit={async (device) => {
            await save(device)
            setEditing(null)
            notify('Aparelho salvo')
          }}
        />
      )}

      <ConfirmDialog
        open={deleting !== null}
        title="Excluir aparelho?"
        description={`“${deleting?.brand ?? ''} ${deleting?.model ?? ''}” e todos os seus gastos serão removidos permanentemente.`}
        confirmLabel="Excluir"
        destructive
        onConfirm={async () => {
          if (!deleting) return
          await remove(deleting.id)
          notify('Aparelho excluído', 'info')
          if (route.name === 'aparelho') navigate('estoque')
        }}
        onClose={() => setDeleting(null)}
      />
    </AppShell>
  )
}

function Splash() {
  return (
    <div className="grid min-h-dvh place-items-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col items-center gap-4"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.1, repeat: Infinity, ease: 'linear' }}
          className="size-7 rounded-full border-2 border-[rgb(var(--hairline-strong))] border-t-accent"
        />
        <p className="text-[13px] text-2">Carregando seus dados…</p>
      </motion.div>
    </div>
  )
}

function NotFound({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex flex-col items-center gap-4 py-24 text-center">
      <h2 className="text-[20px] font-semibold text-1">Aparelho não encontrado</h2>
      <p className="text-[13.5px] text-2">Ele pode ter sido excluído.</p>
      <button type="button" onClick={onBack} className="text-[13.5px] font-medium text-accent hover:underline">
        Voltar para a lista
      </button>
    </div>
  )
}
