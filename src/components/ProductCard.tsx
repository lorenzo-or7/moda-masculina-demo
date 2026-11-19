import { motion } from 'motion/react'
import { Eye, Heart } from 'lucide-react'
import { useState } from 'react'
import { categoryLabel } from '../data/catalog'
import type { Product } from '../data/types'
import { formatPrice } from '../lib/format'
import { useShop } from '../store/shop'
import { Swatches } from './ui/controls'
import { Img } from './ui/Img'

export function ProductCard({ product, index }: { product: Product; index: number }) {
  const { isFavorite, toggleFavorite, openQuickView, addToBag } = useShop()
  const [colorId, setColorId] = useState(product.colors[0].id)
  // A foto de detalhe só é carregada após a primeira intenção de hover/foco.
  const [wantDetail, setWantDetail] = useState(false)
  const color = product.colors.find((c) => c.id === colorId) ?? product.colors[0]
  const main = color.image ?? product.image
  const detail = color.detail ?? product.detail
  const fav = isFavorite(product.id)
  const oneSize = product.sizes.length === 1
  const titleId = `p-${product.id}-title`

  return (
    <motion.article
      layout="position"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.2 } }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: Math.min(index, 8) * 0.04 }}
      aria-labelledby={titleId}
      className="group/card relative flex flex-col"
      onPointerEnter={(e) => e.pointerType === 'mouse' && setWantDetail(true)}
      onFocus={() => setWantDetail(true)}
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-line/40">
        {/* Troca suave entre fotografia principal e detalhe, sem alterar o layout */}
        <div className="absolute inset-0 transition-[opacity,transform] duration-700 ease-[var(--ease-editorial)] group-hover/card:scale-[1.03] group-hover/card:opacity-0 [@media(hover:none)]:group-hover/card:opacity-100">
          <Img image={main} ratio={4 / 3} widths={[360, 540, 720, 960]} sizes="(min-width: 1280px) 24vw, (min-width: 768px) 32vw, 50vw" />
        </div>
        {wantDetail && (
          <div className="absolute inset-0 scale-[1.06] opacity-0 transition-[opacity,transform] duration-700 ease-[var(--ease-editorial)] group-hover/card:scale-100 group-hover/card:opacity-100 [@media(hover:none)]:hidden">
            <Img image={detail} ratio={4 / 3} widths={[360, 540, 720, 960]} sizes="(min-width: 1280px) 24vw, (min-width: 768px) 32vw, 50vw" />
          </div>
        )}

        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-2.5 md:p-3">
          <span className="eyebrow rounded-full bg-bg/85 px-2.5 py-1.5 text-[0.625rem] text-ink backdrop-blur">
            {product.isNew ? 'Novo' : <span className="tabular-nums">{product.sku.slice(-3)}</span>}
          </span>
          <button
            type="button"
            onClick={() => toggleFavorite(product.id)}
            aria-pressed={fav}
            aria-label={fav ? `Remover ${product.name} dos favoritos` : `Favoritar ${product.name}`}
            className="grid size-10 place-items-center rounded-full bg-bg/85 text-ink backdrop-blur transition-transform duration-300 hover:scale-105 active:scale-90"
          >
            <motion.span key={String(fav)} initial={{ scale: 0.6 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 500, damping: 15 }} className="grid">
              <Heart size={17} strokeWidth={1.7} className={fav ? 'fill-accent text-accent' : ''} />
            </motion.span>
          </button>
        </div>

        {/* Ações rápidas: visíveis no hover/foco em desktop, sempre acessíveis em toque */}
        <div className="absolute inset-x-2.5 bottom-2.5 flex gap-2 transition-all duration-500 ease-[var(--ease-editorial)] md:inset-x-3 md:bottom-3 md:translate-y-3 md:opacity-0 md:group-focus-within/card:translate-y-0 md:group-focus-within/card:opacity-100 md:group-hover/card:translate-y-0 md:group-hover/card:opacity-100 [@media(hover:none)]:translate-y-0 [@media(hover:none)]:opacity-100">
          <button
            type="button"
            onClick={() => openQuickView(product.id, colorId)}
            className="flex h-10 flex-1 items-center justify-center gap-2 rounded-full bg-bg/92 text-xs font-semibold text-ink backdrop-blur transition-colors hover:bg-ink hover:text-bg"
          >
            <Eye size={15} strokeWidth={1.7} aria-hidden />
            <span>
              Ver rápido<span className="sr-only"> — {product.name}</span>
            </span>
          </button>
          {oneSize && (
            <button
              type="button"
              onClick={() => addToBag(product.id, colorId, product.sizes[0])}
              className="hidden h-10 items-center justify-center rounded-full bg-ink px-4 text-xs font-semibold text-bg transition-colors hover:bg-accent hover:text-on-accent sm:flex"
            >
              Adicionar<span className="sr-only"> {product.name} à sacola</span>
            </button>
          )}
        </div>
      </div>

      <div className="mt-3.5 flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
        <div className="min-w-0">
          <p className="eyebrow text-[0.625rem] text-muted">{categoryLabel(product.category)}</p>
          <h3 id={titleId} className="mt-1 text-[0.9375rem] leading-snug font-semibold">
            <button type="button" onClick={() => openQuickView(product.id, colorId)} className="text-left hover:underline hover:underline-offset-4">
              {product.name}
            </button>
          </h3>
        </div>
        <p className="shrink-0 text-[0.9375rem] tabular-nums sm:pt-4">{formatPrice(product.price)}</p>
      </div>
      <div className="mt-2 flex items-center justify-between gap-2">
        <Swatches colors={product.colors} value={colorId} onChange={setColorId} size="sm" name={product.name} />
        <span className="truncate text-xs text-muted">
          {color.name} · {product.sizes.length === 1 ? 'Tamanho único' : `${product.sizes[0]}–${product.sizes[product.sizes.length - 1]}`}
        </span>
      </div>
    </motion.article>
  )
}
