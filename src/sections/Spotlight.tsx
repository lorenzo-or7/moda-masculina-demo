import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { Check, ShoppingBag } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'
import { featuredProductId, productById } from '../data/catalog'
import { formatPrice } from '../lib/format'
import { useShop } from '../store/shop'
import { Img } from '../components/ui/Img'
import { SizePicker } from '../components/ui/controls'
import { EASE, FadeUp, LineReveal, MaskReveal } from '../components/ui/motion'

const product = productById(featuredProductId)!

export function Spotlight() {
  const ref = useRef<HTMLElement>(null)
  const reduce = useReducedMotion()
  const { addToBag, openDrawer } = useShop()
  const [colorId, setColorId] = useState(product.colors[0].id)
  const [size, setSize] = useState<string | null>(null)
  const [error, setError] = useState(false)
  const [added, setAdded] = useState(false)
  const errId = useId()
  const color = product.colors.find((c) => c.id === colorId) ?? product.colors[0]

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const macroY = useTransform(scrollYProgress, [0, 1], reduce ? ['0%', '0%'] : ['8%', '-8%'])
  const wordX = useTransform(scrollYProgress, [0, 1], reduce ? ['0%', '0%'] : ['6%', '-10%'])

  useEffect(() => {
    if (!added) return
    const t = window.setTimeout(() => setAdded(false), 2400)
    return () => window.clearTimeout(t)
  }, [added])

  const onAdd = () => {
    if (!size) {
      setError(true)
      return
    }
    if (addToBag(product.id, colorId, size)) setAdded(true)
  }

  return (
    <section id="destaque" ref={ref} aria-labelledby="destaque-title" className="relative overflow-hidden border-y border-line bg-surface py-24 md:py-36">
      {/* Palavra gigante em movimento lateral — fundo tipográfico da campanha */}
      <motion.p
        aria-hidden
        style={{ x: wordX }}
        className="display pointer-events-none absolute top-10 left-0 text-[clamp(7rem,24vw,24rem)] leading-none whitespace-nowrap text-ink/[0.045] italic select-none md:top-16"
      >
        Meridian Meridian
      </motion.p>

      <div className="container-x relative">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-6">
          {/* Macro da textura */}
          <div className="order-2 lg:order-1 lg:col-span-3 lg:pt-56">
            <MaskReveal from="top" className="relative aspect-[3/4] overflow-hidden bg-line/40 lg:aspect-[3/5]">
              <motion.div className="absolute -inset-y-[8%] inset-x-0" style={{ y: macroY }}>
                <AnimatePresence mode="sync" initial={false}>
                  <motion.div
                    key={color.id}
                    className="absolute inset-0"
                    initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 1.08 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.9, ease: EASE }}
                  >
                    <Img image={color.detail ?? product.detail} ratio={5 / 3} widths={[400, 640, 900]} sizes="(min-width: 1024px) 24vw, 50vw" />
                  </motion.div>
                </AnimatePresence>
              </motion.div>
            </MaskReveal>
            <p className="eyebrow mt-4 text-muted">Fig. 01 — Lã fria, {color.name.toLowerCase()}, em macro</p>
          </div>

          {/* Fotografia completa */}
          <div className="order-1 lg:order-2 lg:col-span-5">
            <MaskReveal className="relative aspect-[4/5] overflow-hidden bg-line/40" delay={0.1}>
              <AnimatePresence mode="sync" initial={false}>
                <motion.div
                  key={color.id}
                  className="absolute inset-0"
                  initial={reduce ? { opacity: 0 } : { clipPath: 'inset(0% 0% 0% 100%)' }}
                  animate={reduce ? { opacity: 1 } : { clipPath: 'inset(0% 0% 0% 0%)' }}
                  exit={{ opacity: 1 }}
                  transition={{ duration: 1, ease: EASE }}
                >
                  <Img image={color.image ?? product.image} ratio={5 / 4} widths={[640, 960, 1280]} sizes="(min-width: 1024px) 42vw, 100vw" />
                </motion.div>
              </AnimatePresence>
              <span className="eyebrow absolute top-4 left-4 rounded-full bg-bg/85 px-3 py-1.5 text-ink backdrop-blur">Peça em destaque</span>
            </MaskReveal>
          </div>

          {/* Texto e compra */}
          <div className="order-3 flex flex-col lg:col-span-4 lg:pt-24 lg:pl-6">
            <p className="eyebrow text-muted">(04) — {product.sku}</p>
            <h2 id="destaque-title" className="display mt-5 text-[clamp(3rem,6vw,5.5rem)]">
              <LineReveal>Sobretudo</LineReveal>
              <LineReveal delay={0.08}>
                <em className="italic">Meridian</em>
              </LineReveal>
            </h2>
            <FadeUp delay={0.1}>
              <p className="mt-6 max-w-sm text-[0.9375rem] leading-relaxed text-muted">{product.description}</p>
              <p className="display mt-8 text-3xl tabular-nums">{formatPrice(product.price)}</p>
              <p className="mt-1 text-xs text-muted">ou 6× de {formatPrice(product.price / 6)} · valores demonstrativos</p>
            </FadeUp>

            <FadeUp delay={0.15} className="mt-8 space-y-6">
              <fieldset>
                <legend className="eyebrow flex w-full justify-between text-muted">
                  Cor <span className="text-ink normal-case tracking-normal">{color.name}</span>
                </legend>
                <div role="radiogroup" aria-label="Cor do Sobretudo Meridian" className="mt-3 flex gap-2">
                  {product.colors.map((c) => {
                    const active = c.id === colorId
                    return (
                      <button
                        key={c.id}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        onClick={() => setColorId(c.id)}
                        className={`flex h-11 items-center gap-2 rounded-full border pr-4 pl-1.5 text-[0.8125rem] font-semibold transition-colors duration-300 ${
                          active ? 'border-ink' : 'border-line hover:border-ink/60'
                        }`}
                      >
                        <span className="size-8 rounded-full ring-1 ring-black/10 ring-inset" style={{ backgroundColor: c.hex }} aria-hidden />
                        {c.name}
                      </button>
                    )
                  })}
                </div>
              </fieldset>

              <fieldset>
                <legend className="eyebrow flex w-full justify-between text-muted">
                  Tamanho <span className="text-ink normal-case tracking-normal">{size ?? '—'}</span>
                </legend>
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
                </div>
                {error && (
                  <p id={errId} role="alert" className="mt-2 text-xs font-semibold text-red-700 dark:text-red-400">
                    Selecione um tamanho para adicionar à sacola.
                  </p>
                )}
              </fieldset>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={onAdd}
                  className={`relative inline-flex h-14 min-w-[15rem] items-center justify-center gap-2.5 overflow-hidden rounded-full px-7 text-sm font-semibold transition-colors duration-500 active:scale-[0.97] ${
                    added ? 'bg-accent text-on-accent' : 'bg-ink text-bg hover:bg-accent hover:text-on-accent'
                  }`}
                >
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.span
                      key={added ? 'ok' : 'add'}
                      initial={{ y: 18, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      exit={{ y: -18, opacity: 0 }}
                      transition={{ duration: 0.3, ease: EASE }}
                      className="flex items-center gap-2.5"
                    >
                      {added ? <Check size={17} aria-hidden /> : <ShoppingBag size={17} aria-hidden />}
                      {added ? 'Adicionado à sacola' : 'Adicionar à sacola'}
                    </motion.span>
                  </AnimatePresence>
                </button>
                {added && (
                  <button type="button" onClick={() => openDrawer('bag')} className="link-underline text-[0.8125rem] font-semibold">
                    Ver sacola
                  </button>
                )}
              </div>

              <ul className="grid grid-cols-2 gap-x-6 gap-y-2 border-t border-line pt-6 text-[0.8125rem] text-muted">
                {product.details.map((d) => (
                  <li key={d} className="flex gap-2">
                    <span aria-hidden className="mt-2 size-1 shrink-0 rounded-full bg-accent" />
                    {d}
                  </li>
                ))}
              </ul>
            </FadeUp>
          </div>
        </div>
      </div>
    </section>
  )
}
