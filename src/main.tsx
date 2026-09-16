import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { DevicesProvider } from './store/devices'
import { ThemeProvider } from './store/theme'
import { ToastProvider } from './store/toast'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <ToastProvider>
        <DevicesProvider>
          <App />
        </DevicesProvider>
      </ToastProvider>
    </ThemeProvider>
  </StrictMode>,
)
