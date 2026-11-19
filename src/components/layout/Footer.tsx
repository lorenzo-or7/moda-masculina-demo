import { ArrowRight, ArrowUpRight } from 'lucide-react'
import { useId, useState, type FormEvent } from 'react'
import { site } from '../../config/site'
import { categories, collections } from '../../data/catalog'
import { scrollToId } from '../../lib/scroll'
import { useShop } from '../../store/shop'
import { NAV_LINKS } from './Navbar'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

function Newsletter() {
  const id = useId()
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'error' | 'ok'>('idle')

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const v = email.trim()
    if (!EMAIL_RE.test(v) || v.length > 120) return setStatus('error')
    setStatus('ok')
    setEmail('')
  }

  return (
    <form onSubmit={submit} noValidate className="max-w-md">
      <label htmlFor={id} className="eyebrow text-muted">
        Cartas da {site.brand}
      </label>
      <p className="mt-3 text-[0.9375rem] text-muted">Lançamentos e editoriais, uma vez por mês. Sem excesso.</p>
      <div className={`mt-5 flex items-center border-b transition-colors ${status === 'error' ? 'border-red-700 dark:border-red-400' : 'border-ink'}`}>
        <input
          id={id}
          type="email"
          inputMode="email"
          autoComplete="email"
          maxLength={120}
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            if (status !== 'idle') setStatus('idle')
          }}
          placeholder="seu@email.com"
          aria-invalid={status === 'error' || undefined}
          aria-describedby={`${id}-msg`}
          className="h-12 w-full min-w-0 bg-transparent text-base outline-none placeholder:text-muted/70"
        />
        <button type="submit" aria-label="Inscrever-se" className="grid size-11 shrink-0 place-items-center rounded-full transition-colors hover:bg-ink hover:text-bg">
          <ArrowRight size={18} />
        </button>
      </div>
      <p id={`${id}-msg`} aria-live="polite" className={`mt-2 min-h-5 text-xs ${status === 'error' ? 'font-semibold text-red-700 dark:text-red-400' : 'text-muted'}`}>
        {status === 'error' && 'Informe um e-mail válido, como nome@dominio.com.'}
        {status === 'ok' && 'Inscrição simulada com sucesso — nenhum dado foi enviado (demonstração).'}
      </p>
    </form>
  )
}

export function Footer() {
  const { setFilters } = useShop()

  return (
    <footer className="relative border-t border-line bg-bg pt-20 pb-8 md:pt-28">
      <div className="container-x">
        <div className="grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Newsletter />
          </div>
          <nav aria-label="Rodapé" className="grid grid-cols-2 gap-10 sm:grid-cols-3 lg:col-span-7">
            <div>
              <p className="eyebrow text-muted">Navegar</p>
              <ul className="mt-4 space-y-2.5 text-[0.9375rem]">
                {NAV_LINKS.map((l) => (
                  <li key={l.id}>
                    <a href={`#${l.id}`} className="link-underline">
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="eyebrow text-muted">Coleções</p>
              <ul className="mt-4 space-y-2.5 text-[0.9375rem]">
                {collections.map((c) => (
                  <li key={c.id}>
                    <button
                      type="button"
                      className="link-underline"
                      onClick={() => {
                        setFilters({ collection: c.id, category: 'todos', query: '' })
                        scrollToId('produtos')
                      }}
                    >
                      {c.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="eyebrow text-muted">Categorias</p>
              <ul className="mt-4 space-y-2.5 text-[0.9375rem]">
                {categories.map((c) => (
                  <li key={c.id}>
                    <button
                      type="button"
                      className="link-underline"
                      onClick={() => {
                        setFilters({ category: c.id, collection: null, query: '' })
                        scrollToId('produtos')
                      }}
                    >
                      {c.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </nav>
        </div>

        <p aria-hidden className="display display-xl mt-20 text-[clamp(6rem,30vw,28rem)] leading-[0.78] tracking-[-0.05em] select-none md:mt-28">
          {site.brand}
          <span className="text-accent">.</span>
        </p>

        <div className="mt-10 flex flex-col gap-5 border-t border-line pt-6 text-xs text-muted md:flex-row md:items-center md:justify-between">
          <p className="max-w-xl leading-relaxed">
            <span className="mr-2 inline-block rounded-full border border-line px-2 py-0.5 font-semibold tracking-wide uppercase">Demo</span>
            {site.demoNotice} Fotografias:{' '}
            <a href="https://unsplash.com/license" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-ink">
              Unsplash License
            </a>
            .
          </p>
          <a
            href={site.credits.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex shrink-0 items-center gap-1.5 text-muted transition-colors hover:text-ink"
          >
            Experience crafted by <span className="display text-sm font-semibold text-ink italic">{site.credits.studio}</span>
            <ArrowUpRight size={13} aria-hidden className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            <span className="sr-only">(abre em nova aba)</span>
          </a>
        </div>
      </div>
    </footer>
  )
}
