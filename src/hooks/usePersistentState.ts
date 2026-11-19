import { useEffect, useRef, useState } from 'react'

/**
 * Estado persistido em localStorage com validação do formato lido.
 * Falhas de acesso (modo privado, cota) são ignoradas — o app segue funcionando em memória.
 */
export function usePersistentState<T>(key: string, initial: T, validate: (v: unknown) => v is T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key)
      if (raw == null) return initial
      const parsed: unknown = JSON.parse(raw)
      return validate(parsed) ? parsed : initial
    } catch {
      return initial
    }
  })

  const first = useRef(true)
  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      /* armazenamento indisponível */
    }
  }, [key, value])

  return [value, setValue] as const
}
