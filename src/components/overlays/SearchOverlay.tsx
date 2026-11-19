import { AnimatePresence, motion } from 'motion/react'
import { ArrowUpRight, Search, X } from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
import { categories, categoryLabel, products } from '../../data/catalog'
import { useDialog } from '../../hooks/useDialog'
import { formatPrice, sanitizeQuery } from '../../lib/format'
import { matchesQuery } from '../../lib/search'
import { scrollToId } from '../../lib/scroll'
import { useShop } from '../../store/shop'
import { IconButton } from '../ui/controls'
import { Img } from '../ui/Img'
import { EASE } from '../ui/motion'

export function SearchOverlay() {
  const { searchOpen, setSearchOpen } = useShop()
  return <AnimatePresence>{searchOpen && <SearchPanel onClose={() => setSearchOpen(false)} />}</AnimatePresence>
}

function SearchPanel({ onClose }: { onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null)
  const { openQuickView, setFilters } = useShop()
  const [q, setQ] = useState('')
  useDialog(true, ref, onClose)

  const results = useMemo(() => (q.trim() ? products.filter((p) => matchesQuery(p, q)).slice(0, 6) : []), [q])

  const seeAll = (query: string, category?: (typeof categories)[number]['id']) => {
    setFilters({ query, category: category ?? 'todos', collection: null })
    onClose()
    scrollToId('produtos', 60)
  }

  return (
    <motion.div className="fixed inset-0 z-[70]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
      <button type="button" aria-label="Fechar busca" tabIndex={-1} onClick={onClose} className="absolute inset-0 bg-[var(--scrim)] backdrop-blur-[2px]" />
      <motion.div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label="Buscar produtos"
        initial={{ y: '-100%' }}
        animate={{ y: 0 }}
        exit={{ y: '-100%' }}
        transition={{ duration: 0.6, ease: EASE }}
        className="relative max-h-[100dvh] overflow-y-auto border-b border-line bg-bg"
      >
        <div className="container-x py-5 md:py-8">
          <div className="flex items-center justify-between">
            <span className="eyebrow text-muted">Buscar no catálogo</span>
            <IconButton label="Fechar busca" onClick={onClose}>
              <X size={20} strokeWidth={1.6} />
            </IconButton>
          </div>
          <form
            role="search"
            onSubmit={(e) => {
              e.preventDefault()
              seeAll(q.trim())
            }}
            className="mt-3 flex items-center gap-3 border-b border-ink pb-3"
          >
            <Search size={22} strokeWidth={1.5} aria-hidden className="shrink-0 text-muted" />
            <label htmlFor="busca-global" className="sr-only">
              Termo de busca
            </label>
            <input
              id="busca-global"
              data-autofocus
              type="search"
              autoComplete="off"
              enterKeyHint="search"
              maxLength={60}
              value={q}
              onChange={(e) => setQ(sanitizeQuery(e.target.value))}
              placeholder="Linho, sobretudo, couro…"
              className="display w-full min-w-0 bg-transparent text-3xl outline-none placeholder:text-muted/50 md:text-5xl"
            />
          </form>

          {!q.trim() && (
            <div className="mt-6">
              <p className="eyebrow text-muted">Categorias</p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {categories.map((c) => (
                  <li key={c.id}>
                    <button type="button" onClick={() => seeAll('', c.id)} className="h-10 rounded-full border border-line px-4 text-sm font-semibold transition-colors hover:border-ink">
                      {c.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {q.trim() && (
            <div className="mt-6" aria-live="polite">
              {results.length ? (
                <>
                  <p className="eyebrow text-muted">{results.length === 1 ? '1 resultado' : `${results.length} resultados`}</p>
                  <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {results.map((p) => (
                      <li key={p.id}>
                        <button
                          type="button"
                          onClick={() => openQuickView(p.id)}
                          className="group flex w-full items-center gap-4 rounded-lg p-2 text-left transition-colors hover:bg-surface"
                        >
                          <span className="relative block aspect-[3/4] w-16 shrink-0 overflow-hidden rounded bg-line/40">
                            <Img image={p.image} ratio={4 / 3} widths={[160]} sizes="64px" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate font-semibold">{p.name}</span>
                            <span className="block text-sm text-muted">
                              {categoryLabel(p.category)} · {formatPrice(p.price)}
                            </span>
                          </span>
                          <ArrowUpRight size={16} className="text-muted transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden />
                        </button>
                      </li>
                    ))}
                  </ul>
                  <button type="submit" onClick={() => seeAll(q.trim())} className="link-underline mt-5 text-sm font-semibold">
                    Ver todos os resultados no catálogo
                  </button>
                </>
              ) : (
                <p className="text-muted">
                  Nenhuma peça encontrada para “{q}”. Tente “linho”, “lã” ou “couro”.
                </p>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}
