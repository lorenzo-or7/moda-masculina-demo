import { AnimatePresence, motion } from 'motion/react'
import { Heart, ShoppingBag, X } from 'lucide-react'
import { useId, useRef, useState } from 'react'
import { categoryLabel, collectionName, productById } from '../../data/catalog'
import type { Product } from '../../data/types'
import { useDialog } from '../../hooks/useDialog'
import { formatPrice } from '../../lib/format'
import { useShop } from '../../store/shop'
import { Button, IconButton, QtyStepper, SizePicker, Swatches } from '../ui/controls'
import { Img } from '../ui/Img'
import { EASE } from '../ui/motion'

export default function QuickView() {
  const { quickView, closeQuickView } = useShop()
  const product = quickView ? productById(quickView.productId) : undefined
  return (
    <AnimatePresence>
      {product && <Dialog key={product.id} product={product} initialColor={quickView?.colorId} onClose={closeQuickView} />}
    </AnimatePresence>
  )
}

function Dialog({ product, initialColor, onClose }: { product: Product; initialColor?: string; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null)
  const { addToBag, isFavorite, toggleFavorite, openDrawer } = useShop()
  const [colorId, setColorId] = useState(product.colors.some((c) => c.id === initialColor) ? initialColor! : product.colors[0].id)
  const [size, setSize] = useState<string | null>(product.sizes.length === 1 ? product.sizes[0] : null)
  const [qty, setQty] = useState(1)
  const [view, setView] = useState<'main' | 'detail'>('main')
  const [error, setError] = useState(false)
  const titleId = useId()
  const errId = useId()
  useDialog(true, ref, onClose)

  const color = product.colors.find((c) => c.id === colorId) ?? product.colors[0]
  const shots = { main: color.image ?? product.image, detail: color.detail ?? product.detail }
  const fav = isFavorite(product.id)

  const submit = () => {
    if (!size) return setError(true)
    if (addToBag(product.id, colorId, size, qty)) {
      onClose()
      window.setTimeout(() => openDrawer('bag'), 250)
    }
  }

  return (
    <motion.div className="fixed inset-0 z-[70] flex items-end justify-center md:items-center md:p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
      <button type="button" tabIndex={-1} aria-label="Fechar visualização" onClick={onClose} className="absolute inset-0 bg-[var(--scrim)] backdrop-blur-[2px]" />
      <motion.div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 30, opacity: 0 }}
        transition={{ duration: 0.55, ease: EASE }}
        className="relative grid max-h-[94dvh] w-full max-w-5xl overflow-y-auto rounded-t-2xl bg-bg md:max-h-[88vh] md:grid-cols-[1.05fr_1fr] md:overflow-hidden md:rounded-xl"
      >
        <IconButton label="Fechar" onClick={onClose} className="absolute top-3 right-3 z-20 bg-bg/80 backdrop-blur">
          <X size={20} strokeWidth={1.6} />
        </IconButton>

        {/* Galeria */}
        <div className="relative">
          <div className="relative aspect-[4/5] overflow-hidden bg-line/40 md:aspect-auto md:h-full md:min-h-[34rem]">
            <AnimatePresence initial={false} mode="sync">
              <motion.div
                key={`${color.id}-${view}`}
                className="absolute inset-0"
                initial={{ clipPath: 'inset(0% 0% 0% 100%)' }}
                animate={{ clipPath: 'inset(0% 0% 0% 0%)' }}
                exit={{ opacity: 1 }}
                transition={{ duration: 0.8, ease: EASE }}
              >
                <Img image={shots[view]} ratio={5 / 4} widths={[540, 800, 1100]} sizes="(min-width: 768px) 520px, 100vw" />
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="absolute bottom-3 left-3 flex gap-2" role="group" aria-label="Fotografias">
            {(['main', 'detail'] as const).map((v) => (
              <button
                key={v}
                type="button"
                aria-pressed={view === v}
                onClick={() => setView(v)}
                className={`relative h-16 w-12 overflow-hidden rounded border-2 transition-colors ${view === v ? 'border-bg' : 'border-transparent opacity-75 hover:opacity-100'}`}
              >
                <Img image={shots[v]} ratio={4 / 3} widths={[120]} sizes="48px" decorative />
                <span className="sr-only">{v === 'main' ? 'Foto principal' : 'Foto de detalhe'}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Detalhes */}
        <div className="flex flex-col p-6 md:overflow-y-auto md:p-10">
          <p className="eyebrow text-muted">
            {categoryLabel(product.category)} · {collectionName(product.collection)}
          </p>
          <h2 id={titleId} className="display mt-3 pr-10 text-[2.5rem] md:text-5xl">
            {product.name}
          </h2>
          <p className="mt-3 text-lg tabular-nums">{formatPrice(product.price)}</p>
          <p className="mt-5 text-[0.9375rem] leading-relaxed text-muted">{product.description}</p>

          <div className="mt-7 space-y-6">
            <div>
              <p className="eyebrow mb-2.5 text-muted">
                Cor — <span className="text-ink">{color.name}</span>
              </p>
              <Swatches colors={product.colors} value={colorId} onChange={setColorId} name={product.name} />
            </div>
            <div>
              <p className="eyebrow mb-2.5 text-muted">Tamanho</p>
              <SizePicker
                sizes={product.sizes}
                soldOut={product.soldOut}
                value={size}
                onChange={(s) => {
                  setSize(s)
                  setError(false)
                }}
                invalid={error}
                name={product.name}
                describedBy={error ? errId : undefined}
              />
              {error && (
                <p id={errId} role="alert" className="mt-2 text-xs font-semibold text-red-700 dark:text-red-400">
                  Selecione um tamanho para continuar.
                </p>
              )}
            </div>
            <div className="flex items-center gap-3">
              <QtyStepper value={qty} onChange={(n) => setQty(Math.min(10, Math.max(1, n)))} label={product.name} />
              <span className="text-xs text-muted">Máx. 10 por item</span>
            </div>
          </div>

          <div className="mt-8 flex gap-2">
            <Button size="lg" className="flex-1" onClick={submit}>
              <ShoppingBag size={17} aria-hidden /> Adicionar à sacola
            </Button>
            <button
              type="button"
              onClick={() => toggleFavorite(product.id)}
              aria-pressed={fav}
              aria-label={fav ? 'Remover dos favoritos' : 'Salvar nos favoritos'}
              className="grid size-14 shrink-0 place-items-center rounded-full border border-line transition-colors hover:border-ink"
            >
              <Heart size={19} strokeWidth={1.6} className={fav ? 'fill-accent text-accent' : ''} />
            </button>
          </div>

          <ul className="mt-8 space-y-1.5 border-t border-line pt-6 text-[0.8125rem] text-muted">
            {product.details.map((d) => (
              <li key={d}>— {d}</li>
            ))}
            <li className="pt-2 text-xs">Ref. {product.sku}</li>
          </ul>
        </div>
      </motion.div>
    </motion.div>
  )
}
