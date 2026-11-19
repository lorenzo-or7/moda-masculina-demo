/**
 * Configuração substituível do protótipo.
 * Para adaptar a um cliente real, troque os dados aqui — nenhum outro arquivo
 * precisa conhecer número de contato, nome de marca ou textos institucionais.
 */
export const site = {
  brand: 'Alvar',
  tagline: 'Atelier masculino contemporâneo',
  season: 'Coleção 27 · Capítulo I',
  city: 'São Paulo',
  /**
   * Número do WhatsApp comercial no formato internacional, só dígitos
   * (ex.: "5511999999999"). Vazio = modo demonstração: a mensagem é gerada
   * e exibida, mas nenhum contato é aberto.
   */
  whatsappNumber: '',
  instagramHandle: '',
  credits: {
    studio: 'Or7.dev',
    url: 'https://lorenzo-or7.github.io/',
  },
  demoNotice: 'Protótipo demonstrativo. Marca, produtos e preços fictícios — nenhum pedido ou pagamento é processado.',
} as const

/** Valida o número configurado: 10 a 15 dígitos, sem outros caracteres. */
export function getWhatsappNumber(): string | null {
  const raw = String(site.whatsappNumber ?? '').trim()
  return /^\d{10,15}$/.test(raw) ? raw : null
}
