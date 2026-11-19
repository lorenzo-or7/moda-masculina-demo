import { useId, useState } from 'react'
import { ArrowUpRight } from 'lucide-react'
import type { Product } from '../data/types'
import { formatPrice } from '../lib/format'
import { useShop } from '../store/shop'
import { Button, SizePicker, Swatches } from './ui/controls'
import { Img } from './ui/Img'

/** Painel compacto de compra usado pelos hotspots do editorial. */
export function QuickAdd({ product, onDone, initialColor }: { product: Product; onDone?: () => void; initialColor?: string }) {
  const { addToBag, openQuickView } = useShop()
  const [colorId, setColorId] = useState(initialColor ?? product.colors[0].id)
  const [size, setSize] = useState<string | null>(product.sizes.length === 1 ? product.sizes[0] : null)
  const [error, setError] = useState(false)
  const errId = useId()
  const color = product.colors.find((c) => c.id === colorId) ?? product.colors[0]

  return (
    <div className="flex gap-4">
      <div className="relative hidden aspect-[3/4] w-24 shrink-0 overflow-hidden bg-line/40 sm:block">
        <Img image={color.image ?? product.image} ratio={4 / 3} widths={[200]} sizes="96px" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-3">
          <p className="font-semibold">{product.name}</p>
          <p className="shrink-0 text-sm tabular-nums">{formatPrice(product.price)}</p>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <Swatches colors={product.colors} value={colorId} onChange={setColorId} size="sm" name={product.name} />
          <span className="text-xs text-muted">{color.name}</span>
        </div>
        <div className="mt-3">
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
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button
            onClick={() => {
              if (!size) return setError(true)
              if (addToBag(product.id, colorId, size)) onDone?.()
            }}
          >
            Adicionar à sacola
          </Button>
          <button type="button" onClick={() => openQuickView(product.id, colorId)} className="inline-flex h-11 items-center gap-1 text-[0.8125rem] font-semibold text-muted hover:text-ink">
            Detalhes <ArrowUpRight size={14} aria-hidden />
          </button>
        </div>
      </div>
    </div>
  )
}
