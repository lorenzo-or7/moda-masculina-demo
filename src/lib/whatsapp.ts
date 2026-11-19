import { getWhatsappNumber, site } from '../config/site'
import type { ResolvedLine } from '../store/shop'
import { formatPrice } from './format'

export function buildOrderMessage(lines: ResolvedLine[], subtotal: number): string {
  const items = lines.map(
    (l, i) => `${i + 1}. ${l.product.name} (${l.product.sku})\n   Cor: ${l.colorName} · Tamanho: ${l.size} · Qtd: ${l.qty}\n   ${formatPrice(l.lineTotal)}`,
  )
  return [
    `Olá, ${site.brand}! Gostaria de consultar disponibilidade destas peças:`,
    '',
    ...items,
    '',
    `Subtotal: ${formatPrice(subtotal)}`,
    '',
    'Pode me ajudar com prazos e formas de pagamento?',
  ].join('\n')
}

/** Retorna o link do WhatsApp ou null quando nenhum número válido está configurado. */
export function whatsappLink(message: string): string | null {
  const number = getWhatsappNumber()
  if (!number) return null
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`
}
