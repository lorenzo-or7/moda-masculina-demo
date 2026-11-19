import type { ImageRef } from '../lib/img'

export type CategoryId = 'camisetas' | 'camisas' | 'calcas' | 'jaquetas' | 'acessorios'
export type CollectionId = 'essentials' | 'contemporary' | 'after-hours'
export type SortId = 'relevancia' | 'novidades' | 'preco-asc' | 'preco-desc'

export interface ColorVariant {
  id: string
  name: string
  hex: string
  /** Quando presente, a variante troca a fotografia principal. */
  image?: ImageRef
  detail?: ImageRef
}

export interface Product {
  id: string
  sku: string
  name: string
  category: CategoryId
  collection: CollectionId
  price: number
  description: string
  details: string[]
  colors: ColorVariant[]
  sizes: string[]
  /** Tamanhos esgotados (demonstração de estado indisponível). */
  soldOut?: string[]
  image: ImageRef
  detail: ImageRef
  isNew?: boolean
  /** Data de entrada no catálogo (ISO) — usada na ordenação por novidades. */
  addedAt: string
}

export interface Collection {
  id: CollectionId
  index: string
  name: string
  title: string
  description: string
  image: ImageRef
}

export interface Hotspot {
  productId: string
  /** Posição em % sobre a fotografia. */
  x: number
  y: number
  label: string
}

export interface Look {
  id: string
  number: string
  title: string
  text: string
  image: ImageRef
  ratio: number
  hotspots: Hotspot[]
}
