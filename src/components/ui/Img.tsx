import { useState, type CSSProperties } from 'react'
import { imgSrcSet, imgUrl, type ImageRef } from '../../lib/img'
import { site } from '../../config/site'

interface Props {
  image: ImageRef
  /** altura / largura do recorte entregue pelo CDN. */
  ratio?: number
  widths?: number[]
  sizes?: string
  className?: string
  style?: CSSProperties
  priority?: boolean
  quality?: number
  /** Decorativa: alt vazio. */
  decorative?: boolean
}

/**
 * Imagem responsiva com srcset, lazy loading, fade-in e fallback visual em caso de falha.
 * Deve ser usada dentro de um container com proporção definida (sem layout shift).
 */
export function Img({ image, ratio, widths = [480, 768, 1080, 1440], sizes = '100vw', className = '', style, priority, quality, decorative }: Props) {
  const [state, setState] = useState<'loading' | 'loaded' | 'error'>('loading')
  const fallbackW = widths[Math.min(1, widths.length - 1)]

  if (state === 'error') {
    return (
      <div
        role={decorative ? undefined : 'img'}
        aria-label={decorative ? undefined : image.alt}
        className={`absolute inset-0 grid place-items-center bg-line/60 text-muted ${className}`}
        style={style}
      >
        <span className="display text-3xl italic opacity-60">{site.brand}</span>
      </div>
    )
  }

  return (
    <>
      {state === 'loading' && <span aria-hidden className="img-skeleton absolute inset-0 bg-line/50" />}
      <img
        src={imgUrl(image, { w: fallbackW, h: ratio ? fallbackW * ratio : undefined, q: quality })}
        srcSet={imgSrcSet(image, widths, ratio, quality)}
        sizes={sizes}
        alt={decorative ? '' : image.alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        fetchPriority={priority ? 'high' : undefined}
        onLoad={() => setState('loaded')}
        onError={() => setState('error')}
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${state === 'loaded' ? 'opacity-100' : 'opacity-0'} ${className}`}
        style={style}
        draggable={false}
      />
    </>
  )
}
