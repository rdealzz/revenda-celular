import { useEffect, useState, type ReactNode } from 'react'
import { motion } from 'framer-motion'
import {
  BellDot,
  ChartPie,
  LayoutDashboard,
  Moon,
  Plus,
  Settings,
  Smartphone,
  Sun,
} from 'lucide-react'
import { cn } from '../../lib/cn'
import { useTheme } from '../../store/theme'
import { Button, IconButton } from '../ui/Button'
import type { Route } from '../../hooks/useRoute'

interface NavItem {
  key: Route['name']
  label: string
  path: string
  icon: ReactNode
  badge?: number
}

export function AppShell({
  route,
  navigate,
  alertCount,
  stockCount,
  onCreate,
  children,
}: {
  route: Route
  navigate: (path: string) => void
  alertCount: number
  stockCount: number
  onCreate: () => void
  children: ReactNode
}) {
  const { theme, toggle } = useTheme()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const items: NavItem[] = [
    { key: 'dashboard', label: 'Painel', path: 'dashboard', icon: <LayoutDashboard className="size-[18px]" /> },
    { key: 'estoque', label: 'Aparelhos', path: 'estoque', icon: <Smartphone className="size-[18px]" />, badge: stockCount },
    { key: 'estatisticas', label: 'Estatísticas', path: 'estatisticas', icon: <ChartPie className="size-[18px]" /> },
    { key: 'alertas', label: 'Alertas', path: 'alertas', icon: <BellDot className="size-[18px]" />, badge: alertCount },
    { key: 'ajustes', label: 'Ajustes', path: 'ajustes', icon: <Settings className="size-[18px]" /> },
  ]

  const activeKey = route.name === 'aparelho' ? 'estoque' : route.name

  return (
    <div className="min-h-dvh">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 opacity-70"
        style={{
          background:
            'radial-gradient(900px 520px at 12% -8%, rgb(var(--glow)), transparent 62%),' +
            'radial-gradient(760px 480px at 92% 6%, rgb(122 90 248 / 0.09), transparent 60%)',
        }}
      />

      <aside className="print-hide fixed inset-y-0 left-0 z-40 hidden w-[248px] flex-col border-r border-[rgb(var(--hairline))] bg-[rgb(var(--surface-veil))] px-4 py-6 backdrop-blur-xl lg:flex">
        <div className="mb-8 flex items-center gap-3 px-2">
          <div className="grid size-9 place-items-center rounded-[11px] bg-[linear-gradient(160deg,#4aa3ff,#0071e3)] shadow-[0_6px_16px_-6px_rgba(0,113,227,0.8)]">
            <Smartphone className="size-[18px] text-white" />
          </div>
          <div className="leading-tight">
            <p className="text-[14px] font-semibold tracking-[-0.01em] text-1">Revenda</p>
            <p className="text-[11.5px] text-3">Painel pessoal</p>
          </div>
        </div>

        <nav className="flex flex-col gap-1">
          {items.map((item) => (
            <NavButton
              key={item.key}
              item={item}
              active={activeKey === item.key}
              onClick={() => navigate(item.path)}
            />
          ))}
        </nav>

        <div className="mt-auto flex flex-col gap-2 px-1">
          <Button variant="primary" block icon={<Plus className="size-4" />} onClick={onCreate}>
            Novo aparelho
          </Button>
          <Button
            variant="ghost"
            block
            icon={theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
            onClick={toggle}
          >
            {theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
          </Button>
        </div>
      </aside>

      <header
        className={cn(
          'print-hide sticky top-0 z-30 flex items-center justify-between gap-3 px-4 py-3 transition-colors duration-300 lg:hidden',
          scrolled && 'surface border-x-0 border-t-0',
        )}
      >
        <div className="flex items-center gap-2.5">
          <div className="grid size-8 place-items-center rounded-[10px] bg-[linear-gradient(160deg,#4aa3ff,#0071e3)]">
            <Smartphone className="size-4 text-white" />
          </div>
          <span className="text-[15px] font-semibold tracking-[-0.01em] text-1">Revenda</span>
        </div>
        <div className="flex items-center gap-2">
          <IconButton
            label="Alternar tema"
            variant="ghost"
            size="sm"
            onClick={toggle}
            icon={theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
          />
          <Button variant="primary" size="sm" icon={<Plus className="size-4" />} onClick={onCreate}>
            Novo
          </Button>
        </div>
      </header>

      <main className="px-4 pb-28 pt-2 sm:px-6 lg:ml-[248px] lg:px-10 lg:pb-16 lg:pt-10">
        <div className="mx-auto w-full max-w-[1180px]">{children}</div>
      </main>

      <nav className="print-hide surface fixed inset-x-3 bottom-3 z-40 flex items-center justify-between rounded-[20px] px-2 py-2 shadow-lift lg:hidden">
        {items.map((item) => {
          const active = activeKey === item.key
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => navigate(item.path)}
              className={cn(
                'relative flex flex-1 flex-col items-center gap-1 rounded-2xl py-1.5 text-[10.5px] font-medium transition-colors',
                active ? 'text-accent' : 'text-3',
              )}
            >
              {item.icon}
              {item.label}
              {!!item.badge && item.key === 'alertas' && (
                <span className="absolute right-[26%] top-1 size-1.5 rounded-full bg-negative" />
              )}
            </button>
          )
        })}
      </nav>
    </div>
  )
}

function NavButton({
  item,
  active,
  onClick,
}: {
  item: NavItem
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'relative flex items-center gap-3 rounded-[13px] px-3 py-2.5 text-[13.5px] font-medium transition-colors duration-200',
        active ? 'text-1' : 'text-2 hover:text-1',
      )}
    >
      {active && (
        <motion.span
          layoutId="nav-active"
          transition={{ type: 'spring', stiffness: 480, damping: 38 }}
          className="absolute inset-0 rounded-[13px] bg-[rgb(var(--surface))] shadow-[0_1px_3px_rgba(0,0,0,0.08)]"
        />
      )}
      <span className={cn('relative', active ? 'text-accent' : '')}>{item.icon}</span>
      <span className="relative flex-1 text-left">{item.label}</span>
      {item.badge !== undefined && item.badge > 0 && (
        <span
          className={cn(
            'tabular relative rounded-full px-1.5 py-0.5 text-[11px]',
            item.key === 'alertas' ? 'bg-negative/12 text-negative' : 'bg-[rgb(var(--hairline))] text-2',
          )}
        >
          {item.badge}
        </span>
      )}
    </button>
  )
}
