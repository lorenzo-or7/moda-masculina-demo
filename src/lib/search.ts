import { categoryLabel, collectionName, products } from '../data/catalog'
import type { Filters } from '../store/shop'
import type { Product } from '../data/types'
import { normalize } from './format'

const lower = (s: string) => s.toLocaleLowerCase('pt-BR').trim()
const toWords = (s: string) => s.split(/[^\p{L}\p{N}]+/u).filter(Boolean)

/** Índice de palavras por produto: nome, categoria, coleção, cores, composição e referência. */
const index = new Map<string, { accented: string[]; plain: string[] }>(
  products.map((p) => {
    const text = [p.name, categoryLabel(p.category), collectionName(p.collection), p.sku, ...p.colors.map((c) => c.name), ...p.details].join(' ')
    return [p.id, { accented: toWords(lower(text)), plain: toWords(normalize(text)) }]
  }),
)

/**
 * Cada termo precisa iniciar alguma palavra do produto.
 * Termo com acento compara com acento ("lã" ≠ "lapela"); sem acento, ignora acentos ("la" ⊃ "lã").
 */
export function matchesQuery(p: Product, query: string) {
  const terms = toWords(lower(query))
  if (!terms.length) return true
  const entry = index.get(p.id)
  if (!entry) return false
  return terms.every((t) => {
    const plain = normalize(t)
    return plain === t ? entry.plain.some((w) => w.startsWith(t)) : entry.accented.some((w) => w.startsWith(t))
  })
}

export function filterProducts(f: Filters): Product[] {
  const list = products.filter(
    (p) => (f.category === 'todos' || p.category === f.category) && (!f.collection || p.collection === f.collection) && matchesQuery(p, f.query),
  )
  switch (f.sort) {
    case 'novidades':
      return [...list].sort((a, b) => b.addedAt.localeCompare(a.addedAt))
    case 'preco-asc':
      return [...list].sort((a, b) => a.price - b.price)
    case 'preco-desc':
      return [...list].sort((a, b) => b.price - a.price)
    default:
      return list
  }
}
