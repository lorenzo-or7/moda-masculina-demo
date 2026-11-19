const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

export const formatPrice = (value: number) => brl.format(value)

export const pad2 = (n: number) => String(n).padStart(2, '0')

/** Normaliza texto para busca: minúsculas e sem acentos. */
export const normalize = (s: string) =>
  s
    .toLocaleLowerCase('pt-BR')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim()

/** Sanitiza o termo de busca digitado pelo usuário. */
export const sanitizeQuery = (s: string) => s.replace(/[<>{}\\]/g, '').slice(0, 60)
