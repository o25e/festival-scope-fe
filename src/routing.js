import { useEffect, useState } from 'react'

export function readRoute() {
  const path = window.location.pathname.replace(/\/+$/, '') || '/'
  if (path === '/documents' || path === '/plans') return { name: 'documents' }
  if (path === '/plans/new') return { name: 'input' }

  const reportMatch = path.match(/^\/reports\/([^/]+)$/)
  if (reportMatch) return { name: 'report', planId: decodeURIComponent(reportMatch[1]) }

  return { name: 'landing' }
}

export function navigate(path, { replace = false } = {}) {
  const method = replace ? 'replaceState' : 'pushState'
  window.history[method]({}, '', path)
  window.dispatchEvent(new PopStateEvent('popstate'))
}

export function useRoute() {
  const [route, setRoute] = useState(readRoute)

  useEffect(() => {
    const sync = () => setRoute(readRoute())
    window.addEventListener('popstate', sync)
    return () => window.removeEventListener('popstate', sync)
  }, [])

  return route
}
