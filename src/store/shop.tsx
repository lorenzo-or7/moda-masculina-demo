import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react'
import { productById } from '../data/catalog'
import type { CategoryId, CollectionId, Product, SortId } from '../data/types'
import { usePersistentState } from '../hooks/usePersistentState'

export const MAX_QTY = 10

export interface CartLine {
  key: string
  productId: string
  colorId: string
  size: string
  qty: number
}

export interface ResolvedLine extends CartLine {
  product: Product
  colorName: string
  lineTotal: number
}

export interface Toast {
  id: number
  message: string
  tone?: 'default' | 'error'
}

export type DrawerMode = 'bag' | 'favorites' | null

export interface Filters {
  category: CategoryId | 'todos'
  collection: CollectionId | null
  query: string
  sort: SortId
}

const isCartLines = (v: unknown): v is CartLine[] =>
  Array.isArray(v) &&
  v.every(
    (l) =>
      l &&
      typeof l === 'object' &&
      typeof (l as CartLine).productId === 'string' &&
      typeof (l as CartLine).colorId === 'string' &&
      typeof (l as CartLine).size === 'string' &&
      Number.isInteger((l as CartLine).qty),
  )

const isStringArray = (v: unknown): v is string[] => Array.isArray(v) && v.every((s) => typeof s === 'string')

const lineKey = (productId: string, colorId: string, size: string) => `${productId}|${colorId}|${size}`

interface ShopValue {
  lines: ResolvedLine[]
  count: number
  subtotal: number
  addToBag: (productId: string, colorId: string, size: string, qty?: number) => boolean
  setQty: (key: string, qty: number) => void
  removeLine: (key: string) => void
  clearBag: () => void
  favorites: string[]
  isFavorite: (id: string) => boolean
  toggleFavorite: (id: string) => void
  drawer: DrawerMode
  openDrawer: (mode: Exclude<DrawerMode, null>) => void
  closeDrawer: () => void
  quickView: { productId: string; colorId?: string } | null
  openQuickView: (productId: string, colorId?: string) => void
  closeQuickView: () => void
  searchOpen: boolean
  setSearchOpen: (v: boolean) => void
  filters: Filters
  setFilters: (patch: Partial<Filters>) => void
  resetFilters: () => void
  toasts: Toast[]
  notify: (message: string, tone?: Toast['tone']) => void
  dismissToast: (id: number) => void
}

const ShopContext = createContext<ShopValue | null>(null)

const defaultFilters: Filters = { category: 'todos', collection: null, query: '', sort: 'relevancia' }

export function ShopProvider({ children }: { children: ReactNode }) {
  const [rawLines, setRawLines] = usePersistentState<CartLine[]>('alvar:bag', [], isCartLines)
  const [favorites, setFavorites] = usePersistentState<string[]>('alvar:favorites', [], isStringArray)
  const [drawer, setDrawer] = useState<DrawerMode>(null)
  const [quickView, setQuickView] = useState<ShopValue['quickView']>(null)
  const [searchOpen, setSearchOpen] = useState(false)
  const [filters, setFiltersState] = useState<Filters>(defaultFilters)
  const [toasts, setToasts] = useState<Toast[]>([])
  const toastId = useRef(0)

  const notify = useCallback((message: string, tone: Toast['tone'] = 'default') => {
    const id = ++toastId.current
    setToasts((t) => [...t.slice(-2), { id, message, tone }])
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200)
  }, [])
  const dismissToast = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), [])

  // Resolve linhas contra o catálogo atual, descartando itens que não existem mais.
  const lines = useMemo<ResolvedLine[]>(() => {
    const out: ResolvedLine[] = []
    for (const l of rawLines) {
      const product = productById(l.productId)
      if (!product) continue
      const color = product.colors.find((c) => c.id === l.colorId)
      if (!color || !product.sizes.includes(l.size)) continue
      const qty = Math.min(MAX_QTY, Math.max(1, l.qty))
      out.push({ ...l, key: lineKey(l.productId, l.colorId, l.size), qty, product, colorName: color.name, lineTotal: qty * product.price })
    }
    return out
  }, [rawLines])

  const count = lines.reduce((n, l) => n + l.qty, 0)
  const subtotal = lines.reduce((n, l) => n + l.lineTotal, 0)

  const addToBag = useCallback(
    (productId: string, colorId: string, size: string, qty = 1) => {
      const product = productById(productId)
      if (!product || !product.colors.some((c) => c.id === colorId) || !product.sizes.includes(size)) {
        notify('Não foi possível adicionar. Escolha cor e tamanho válidos.', 'error')
        return false
      }
      if (product.soldOut?.includes(size)) {
        notify(`Tamanho ${size} esgotado no momento.`, 'error')
        return false
      }
      const key = lineKey(productId, colorId, size)
      const current = rawLines.find((l) => lineKey(l.productId, l.colorId, l.size) === key)
      const capped = !!current && current.qty + qty > MAX_QTY
      setRawLines((prev) => {
        const existing = prev.find((l) => lineKey(l.productId, l.colorId, l.size) === key)
        if (existing) {
          const next = Math.min(MAX_QTY, existing.qty + qty)
          return prev.map((l) => (l === existing ? { ...l, qty: next } : l))
        }
        return [...prev, { key, productId, colorId, size, qty: Math.min(MAX_QTY, Math.max(1, qty)) }]
      })
      notify(capped ? `Limite de ${MAX_QTY} unidades por item.` : `${product.name} · ${size} adicionado à sacola`)
      return true
    },
    [notify, rawLines, setRawLines],
  )

  const setQty = useCallback(
    (key: string, qty: number) => {
      if (!Number.isFinite(qty)) return
      const q = Math.min(MAX_QTY, Math.max(1, Math.round(qty)))
      setRawLines((prev) => prev.map((l) => (lineKey(l.productId, l.colorId, l.size) === key ? { ...l, qty: q } : l)))
    },
    [setRawLines],
  )

  const removeLine = useCallback(
    (key: string) => setRawLines((prev) => prev.filter((l) => lineKey(l.productId, l.colorId, l.size) !== key)),
    [setRawLines],
  )
  const clearBag = useCallback(() => setRawLines([]), [setRawLines])

  const isFavorite = useCallback((id: string) => favorites.includes(id), [favorites])
  const toggleFavorite = useCallback(
    (id: string) => {
      const name = productById(id)?.name ?? 'Peça'
      setFavorites((prev) => {
        const has = prev.includes(id)
        return has ? prev.filter((x) => x !== id) : [...prev, id]
      })
      notify(favorites.includes(id) ? `${name} removido dos favoritos` : `${name} salvo nos favoritos`)
    },
    [favorites, notify, setFavorites],
  )

  const setFilters = useCallback((patch: Partial<Filters>) => setFiltersState((f) => ({ ...f, ...patch })), [])
  const resetFilters = useCallback(() => setFiltersState(defaultFilters), [])

  const value = useMemo<ShopValue>(
    () => ({
      lines,
      count,
      subtotal,
      addToBag,
      setQty,
      removeLine,
      clearBag,
      favorites,
      isFavorite,
      toggleFavorite,
      drawer,
      openDrawer: (m) => {
        setSearchOpen(false)
        setDrawer(m)
      },
      closeDrawer: () => setDrawer(null),
      quickView,
      openQuickView: (productId, colorId) => {
        setSearchOpen(false)
        setDrawer(null)
        setQuickView({ productId, colorId })
      },
      closeQuickView: () => setQuickView(null),
      searchOpen,
      setSearchOpen,
      filters,
      setFilters,
      resetFilters,
      toasts,
      notify,
      dismissToast,
    }),
    [lines, count, subtotal, addToBag, setQty, removeLine, clearBag, favorites, isFavorite, toggleFavorite, drawer, quickView, searchOpen, filters, setFilters, resetFilters, toasts, notify, dismissToast],
  )

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useShop() {
  const ctx = useContext(ShopContext)
  if (!ctx) throw new Error('useShop precisa estar dentro de <ShopProvider>')
  return ctx
}
