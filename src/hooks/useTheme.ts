import { useCallback, useEffect, useState } from 'react'

export type Theme = 'light' | 'dark'

const read = (): Theme => (document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light')

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(read)

  useEffect(() => {
    const meta = document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]')
    meta.forEach((m) => (m.content = theme === 'dark' ? '#111110' : '#F4F1EB'))
  }, [theme])

  const toggle = useCallback(() => {
    const next: Theme = read() === 'dark' ? 'light' : 'dark'
    const root = document.documentElement
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
    const apply = () => {
      root.dataset.theme = next
      setTheme(next)
      try {
        localStorage.setItem('alvar:theme', next)
      } catch {
        /* ignore */
      }
    }
    if (reduce) return apply()
    // Transição apenas de cores — nunca layout.
    root.classList.add('theme-anim')
    apply()
    window.setTimeout(() => root.classList.remove('theme-anim'), 600)
  }, [])

  return { theme, toggle }
}
