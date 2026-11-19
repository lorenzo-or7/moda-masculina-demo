/** Referência a uma fotografia (Unsplash License) com recorte opcional. */
export interface ImageRef {
  id: string
  alt: string
  /** Ponto focal 0–1 usado no recorte. */
  focal?: [number, number]
  /** Zoom do recorte focal (>1 gera um detalhe da peça). */
  zoom?: number
}

const BASE = 'https://images.unsplash.com/'

interface UrlOpts {
  w: number
  h?: number
  q?: number
}

export function imgUrl(ref: ImageRef, { w, h, q = 70 }: UrlOpts): string {
  const p = new URLSearchParams({ auto: 'format', fit: 'crop', w: String(Math.round(w)), q: String(q) })
  if (h) p.set('h', String(Math.round(h)))
  if (ref.focal || ref.zoom) {
    const [x, y] = ref.focal ?? [0.5, 0.5]
    p.set('crop', 'focalpoint')
    p.set('fp-x', String(x))
    p.set('fp-y', String(y))
    if (ref.zoom) p.set('fp-z', String(ref.zoom))
  }
  return `${BASE}${ref.id}?${p.toString()}`
}

/** srcset para uma proporção fixa (ratio = altura / largura). */
export function imgSrcSet(ref: ImageRef, widths: number[], ratio?: number, q?: number): string {
  return widths.map((w) => `${imgUrl(ref, { w, h: ratio ? w * ratio : undefined, q })} ${w}w`).join(', ')
}

export function detailOf(ref: ImageRef, focal: [number, number] = [0.5, 0.4], zoom = 2.2): ImageRef {
  return { ...ref, focal, zoom, alt: `Detalhe — ${ref.alt}` }
}
