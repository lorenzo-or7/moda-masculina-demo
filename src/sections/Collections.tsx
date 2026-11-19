import { ArrowUpRight } from 'lucide-react'
import { site } from '../config/site'
import { collections, products } from '../data/catalog'
import type { Collection } from '../data/types'
import { scrollToId } from '../lib/scroll'
import { useShop } from '../store/shop'
import { Img } from '../components/ui/Img'
import { FadeUp, LineReveal, MaskReveal } from '../components/ui/motion'

/** Composição assimétrica: cada coleção tem posição, proporção e escala próprias. */
const layout: Record<Collection['id'], { wrap: string; frame: string; ratio: number; caption: string }> = {
  essentials: {
    wrap: 'lg:col-span-6 lg:col-start-1',
    frame: 'aspect-[4/5]',
    ratio: 5 / 4,
    caption: 'lg:pr-16',
  },
  contemporary: {
    wrap: 'ml-[12%] lg:ml-0 lg:col-span-5 lg:col-start-8 lg:mt-44',
    frame: 'aspect-[3/4]',
    ratio: 4 / 3,
    caption: '',
  },
  'after-hours': {
    wrap: 'mr-[8%] lg:mr-0 lg:col-span-6 lg:col-start-2 lg:-mt-6',
    frame: 'aspect-[4/5] lg:aspect-[16/11]',
    ratio: 11 / 16,
    caption: 'lg:pl-24',
  },
}

export function Collections() {
  const { setFilters } = useShop()

  const go = (id: Collection['id']) => {
    setFilters({ collection: id, category: 'todos', query: '' })
    scrollToId('produtos')
  }

  return (
    <section id="colecoes" aria-labelledby="colecoes-title" className="relative py-24 md:py-36">
      <div className="container-x">
        <header className="grid gap-8 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8">
            <p className="eyebrow mb-6 text-muted">(01) — Coleções</p>
            <h2 id="colecoes-title" className="display text-[clamp(2.9rem,8vw,7.5rem)]">
              <LineReveal>Três maneiras</LineReveal>
              <LineReveal delay={0.08}>
                de <em className="italic">chegar</em>.
              </LineReveal>
            </h2>
          </div>
          <FadeUp className="max-w-sm text-[0.9375rem] leading-relaxed text-muted lg:col-span-4 lg:pb-4" delay={0.2}>
            Cada coleção é um ponto de vista sobre o mesmo homem: o que ele veste no sol, na cidade e depois que as luzes baixam.
          </FadeUp>
        </header>

        <div className="mt-16 grid gap-16 md:mt-24 lg:grid-cols-12 lg:gap-x-6 lg:gap-y-0">
          {collections.map((c, i) => {
            const l = layout[c.id]
            const n = products.filter((p) => p.collection === c.id).length
            return (
              <article key={c.id} className={l.wrap}>
                <a
                  href="#produtos"
                  onClick={(e) => {
                    e.preventDefault()
                    go(c.id)
                  }}
                  className="group block"
                  aria-label={`${c.name}: ver ${n} peças da coleção`}
                >
                  <MaskReveal className={`relative overflow-hidden bg-line/40 ${l.frame}`} delay={i * 0.08}>
                    <div className="absolute inset-0 scale-[1.04] transition-transform duration-[1400ms] ease-[var(--ease-editorial)] group-hover:scale-[1.1] group-hover:-translate-y-[2%] group-focus-visible:scale-[1.1]">
                      <Img image={c.image} ratio={l.ratio} widths={[480, 720, 1080, 1400]} sizes="(min-width: 1024px) 50vw, 100vw" />
                    </div>
                    <span
                      aria-hidden
                      className="absolute inset-0 bg-black/0 transition-colors duration-700 group-hover:bg-black/15"
                    />
                    <span aria-hidden className="display absolute top-4 left-5 text-lg text-white mix-blend-difference md:top-6 md:left-7">
                      {c.index}
                    </span>
                    <span
                      aria-hidden
                      className="absolute right-4 bottom-4 grid size-12 translate-y-3 place-items-center rounded-full bg-bg text-ink opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100 md:right-6 md:bottom-6"
                    >
                      <ArrowUpRight size={18} />
                    </span>
                  </MaskReveal>

                  <div className={`mt-6 flex items-start justify-between gap-6 ${l.caption}`}>
                    <div className="min-w-0">
                      <h3 className="display text-[clamp(2.25rem,4.4vw,3.75rem)] transition-[letter-spacing,transform] duration-700 ease-[var(--ease-editorial)] group-hover:translate-x-2 group-hover:italic">
                        {c.name}
                      </h3>
                      <p className="mt-3 max-w-xs text-[0.9375rem] leading-relaxed text-muted">{c.description}</p>
                    </div>
                    <span className="eyebrow mt-3 shrink-0 text-muted">
                      <span className="link-underline pb-0.5 text-ink">{n} peças</span>
                    </span>
                  </div>
                </a>
              </article>
            )
          })}

          <FadeUp className="hidden self-end lg:col-span-4 lg:col-start-9 lg:block lg:pb-28">
            <blockquote className="display text-[2.4rem] leading-[1.05] italic">“Três coleções, {products.length} peças e um mesmo homem.”</blockquote>
            <p className="eyebrow mt-6 text-muted">Direção criativa — {site.brand}</p>
          </FadeUp>
        </div>
      </div>
    </section>
  )
}
