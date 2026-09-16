import { useCallback, useEffect, useState } from 'react'

export type Route =
  | { name: 'dashboard' }
  | { name: 'estoque' }
  | { name: 'aparelho'; id: string }
  | { name: 'estatisticas' }
  | { name: 'alertas' }
  | { name: 'ajustes' }

function parse(hash: string): Route {
  const path = hash.replace(/^#\/?/, '')
  const [segment, id] = path.split('/')

  switch (segment) {
    case 'estoque':
      return { name: 'estoque' }
    case 'aparelho':
      return id ? { name: 'aparelho', id } : { name: 'estoque' }
    case 'estatisticas':
      return { name: 'estatisticas' }
    case 'alertas':
      return { name: 'alertas' }
    case 'ajustes':
      return { name: 'ajustes' }
    default:
      return { name: 'dashboard' }
  }
}

export function useRoute() {
  const [route, setRoute] = useState<Route>(() => parse(window.location.hash))

  useEffect(() => {
    const onHashChange = () => setRoute(parse(window.location.hash))
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  const navigate = useCallback((path: string) => {
    window.location.hash = path.startsWith('#') ? path : `#/${path.replace(/^\//, '')}`
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  return { route, navigate }
}
