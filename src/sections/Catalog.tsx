import { AnimatePresence, motion } from 'motion/react'
import { ChevronDown, Search, X } from 'lucide-react'
import { useId, useMemo, useRef } from 'react'
import { categories, collectionName, products, sortOptions } from '../data/catalog'
import type { SortId } from '../data/types'
import { pad2, sanitizeQuery } from '../lib/format'
import { filterProducts } from '../lib/search'
import { useShop } from '../store/shop'
import { ProductCard } from '../components/ProductCard'
import { Button } from '../components/ui/controls'
import { FadeUp, LineReveal } from '../components/ui/motion'

export function Catalog() {
  const { filters, setFilters, resetFilters } = useShop()
  const list = useMemo(() => filterProducts(filters), [filters])
  const searchId = useId()
  const sortId = useId()
  const gridRef = useRef<HTMLDivElement>(null)
  // Ao filtrar com a lista já rolada, volta ao início da grade para mostrar o resultado.
  const update = (patch: Parameters<typeof setFilters>[0]) => {
    setFilters(patch)
    const top = gridRef.current?.getBoundingClientRect().top ?? 0
    if (top < 0) window.scrollTo({ top: window.scrollY + top - 220, behavior: 'smooth' })
  }
  const dirty = filters.category !== 'todos' || !!filters.collection || !!filters.query

  const chips = [{ id: 'todos' as const, label: 'Todos' }, ...categories]

  return (
    <section id="produtos" aria-labelledby="produtos-title" className="relative border-t border-line bg-surface py-24 md:py-32">
      <div className="container-x">
        <header className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="eyebrow mb-6 text-muted">(02) — Produtos</p>
            <h2 id="produtos-title" className="display text-[clamp(2.9rem,8vw,7.5rem)]">
              <LineReveal>
                O <em className="italic">acervo</em>
              </LineReveal>
            </h2>
          </div>
          <FadeUp className="max-w-sm text-[0.9375rem] leading-relaxed text-muted">
            {products.length} peças demonstrativas. Filtre por categoria, busque por tecido ou cor, e monte a sacola para consultar pelo WhatsApp.
          </FadeUp>
        </header>

        {/* Barra de filtros — fixa ao rolar o catálogo */}
        <div className="sticky top-[4.75rem] z-30 -mx-5 mt-12 border-y border-line bg-surface/92 px-5 py-3 backdrop-blur-xl md:-mx-10 md:px-10">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div role="group" aria-label="Filtrar por categoria" className="no-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-1 py-0.5">
              {chips.map((c) => {
                const active = filters.category === c.id
                const n = c.id === 'todos' ? products.length : products.filter((p) => p.category === c.id).length
                return (
                  <button
                    key={c.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => update({ category: c.id })}
                    className={`relative inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full px-4 text-[0.8125rem] font-semibold transition-colors duration-300 ${
                      active ? 'text-bg' : 'text-muted hover:text-ink'
                    }`}
                  >
                    {active && <motion.span layoutId="chip-bg" className="absolute inset-0 rounded-full bg-ink" transition={{ type: 'spring', stiffness: 400, damping: 34 }} />}
                    <span className="relative">{c.label}</span>
                    <span className={`relative text-[0.6875rem] tabular-nums ${active ? 'text-bg/70' : 'text-muted/80'}`}>{pad2(n)}</span>
                  </button>
                )
              })}
            </div>

            <div className="flex gap-2">
              <div className="relative min-w-0 flex-1 lg:w-64 lg:flex-none">
                <label htmlFor={searchId} className="sr-only">
                  Pesquisar produtos
                </label>
                <Search size={16} aria-hidden className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-muted" />
                <input
                  id={searchId}
                  type="search"
                  inputMode="search"
                  autoComplete="off"
                  maxLength={60}
                  value={filters.query}
                  onChange={(e) => setFilters({ query: sanitizeQuery(e.target.value) })}
                  placeholder="Pesquisar peças"
                  className="h-10 w-full rounded-full border border-line bg-bg pr-9 pl-10 text-sm transition-colors outline-none placeholder:text-muted/80 focus:border-ink [&::-webkit-search-cancel-button]:hidden"
                />
                {filters.query && (
                  <button
                    type="button"
                    aria-label="Limpar pesquisa"
                    onClick={() => setFilters({ query: '' })}
                    className="absolute top-1/2 right-1 grid size-8 -translate-y-1/2 place-items-center rounded-full text-muted hover:text-ink"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
              <div className="relative shrink-0">
                <label htmlFor={sortId} className="sr-only">
                  Ordenar por
                </label>
                <select
                  id={sortId}
                  value={filters.sort}
                  onChange={(e) => update({ sort: e.target.value as SortId })}
                  className="h-10 appearance-none rounded-full border border-line bg-bg pr-9 pl-4 text-sm font-semibold outline-none transition-colors hover:border-ink focus:border-ink"
                >
                  {sortOptions.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.label}
                    </option>
                  ))}
                </select>
                <ChevronDown size={15} aria-hidden className="pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2 text-muted" />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex min-h-8 flex-wrap items-center gap-3 text-sm" aria-live="polite">
          <span className="text-muted">
            <strong className="font-semibold text-ink tabular-nums">{list.length}</strong> {list.length === 1 ? 'peça' : 'peças'}
            {filters.query && <> para “{filters.query}”</>}
          </span>
          {filters.collection && (
            <button
              type="button"
              onClick={() => setFilters({ collection: null })}
              className="inline-flex h-8 items-center gap-1.5 rounded-full border border-accent/60 pr-2 pl-3 text-xs font-semibold text-accent transition-colors hover:bg-accent hover:text-on-accent"
            >
              Coleção {collectionName(filters.collection)}
              <X size={13} aria-hidden />
              <span className="sr-only">— remover filtro de coleção</span>
            </button>
          )}
          {dirty && (
            <button type="button" onClick={resetFilters} className="link-underline text-xs font-semibold text-muted hover:text-ink">
              Limpar filtros
            </button>
          )}
        </div>

        <motion.div ref={gridRef} layout className="mt-8 grid grid-cols-2 gap-x-3 gap-y-10 md:grid-cols-3 md:gap-x-5 md:gap-y-14 xl:grid-cols-4">
          <AnimatePresence mode="popLayout">
            {list.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </AnimatePresence>
        </motion.div>

        {list.length === 0 && (
          <div className="mx-auto max-w-md py-20 text-center">
            <p className="display text-4xl italic">Nada por aqui.</p>
            <p className="mt-4 text-muted">Nenhuma peça corresponde aos filtros escolhidos. Ajuste a busca ou veja o acervo completo.</p>
            <Button className="mt-8" onClick={resetFilters}>
              Ver todas as peças
            </Button>
          </div>
        )}
      </div>
    </section>
  )
}
