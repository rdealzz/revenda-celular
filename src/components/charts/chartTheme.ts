import { useTheme } from '../../store/theme'

export interface ChartTheme {
  grid: string
  axis: string
  tooltipSurface: string
  accent: string
  positive: string
  violet: string
  caution: string
  negative: string
  palette: string[]
}

export function useChartTheme(): ChartTheme {
  const { theme } = useTheme()
  const dark = theme === 'dark'

  return {
    grid: dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)',
    axis: dark ? '#8e8e93' : '#86868b',
    tooltipSurface: dark ? 'rgba(32,32,35,0.92)' : 'rgba(255,255,255,0.92)',
    accent: '#0071e3',
    positive: '#1d9e6b',
    violet: '#7a5af8',
    caution: '#f0a020',
    negative: '#e0443e',
    palette: ['#0071e3', '#7a5af8', '#1d9e6b', '#f0a020', '#e0443e', '#00b8c4', '#ff7a45', '#8e8e93'],
  }
}
