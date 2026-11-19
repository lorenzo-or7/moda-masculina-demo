import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { Plus, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { looks, productById } from '../data/catalog'
import type { Look } from '../data/types'
import { formatPrice } from '../lib/format'
import { QuickAdd } from '../components/QuickAdd'
import { Img } from '../components/ui/Img'
import { EASE, FadeUp, LineReveal, MaskReveal } from '../components/ui/motion'

export function Lookbook() {
  return (
    <section id="editorial" aria-labelledby="editorial-title" className="relative overflow-x-clip py-24 md:py-36">
      <div className="container-x">
        <header className="relative">
          <p className="eyebrow mb-6 text-muted">(03) — Lookbook</p>
          <h2 id="editorial-title" className="display display-xl text-[clamp(4rem,17vw,17rem)] leading-[0.82] tracking-[-0.04em]">
            <LineReveal>The</LineReveal>
            <LineReveal delay={0.08} className="pl-[0.9em]">
              <em className="italic">Editorial</em>
            </LineReveal>
          </h2>
          <FadeUp className="mt-8 max-w-sm text-[0.9375rem] leading-relaxed text-muted lg:absolute lg:top-28 lg:right-0 lg:mt-0" delay={0.2}>
            Três composições para três estados de espírito. Toque nos pontos sobre as fotografias para ver cada peça e levá-la para a sacola.
          </FadeUp>
        </header>

        <div className="mt-20 space-y-28 md:mt-32 md:space-y-44">
          {looks.map((look, i) => (
            <LookItem key={look.id} look={look} flip={i % 2 === 1} />
          ))}
        </div>
      </div>
    </section>
  )
}

function LookItem({ look, flip }: { look: Look; flip: boolean }) {
  const ref = useRef<HTMLElement>(null)
  const reduce = useReducedMotion()
  const [open, setOpen] = useState<string | null>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const imgY = useTransform(scrollYProgress, [0, 1], reduce ? ['0%', '0%'] : ['-6%', '6%'])
  const numY = useTransform(scrollYProgress, [0, 1], reduce ? ['0%', '0%'] : ['30%', '-30%'])
  const product = open ? productById(open) : undefined

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(null)
    document.addEventListener('keydown', onKey)
    requestAnimationFrame(() => panelRef.current?.querySelector<HTMLElement>('button')?.focus({ preventScroll: true }))
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  const toggle = (id: string) => setOpen((cur) => (cur === id ? null : id))

  return (
    <article ref={ref} aria-labelledby={`look-${look.id}`} className="grid items-start gap-10 lg:grid-cols-12 lg:gap-6">
      <div className={`relative lg:col-span-7 ${flip ? 'lg:col-start-6' : ''}`}>
        <MaskReveal from={flip ? 'right' : 'left'} className="relative overflow-hidden bg-line/40" style={{ aspectRatio: `1 / ${look.ratio}` }}>
          <motion.div className="absolute -inset-y-[7%] inset-x-0" style={{ y: imgY }}>
            <Img image={look.image} ratio={look.ratio} widths={[640, 960, 1280, 1600]} sizes="(min-width: 1024px) 58vw, 100vw" />
          </motion.div>

          {look.hotspots.map((h, i) => {
            const active = open === h.productId
            return (
              <motion.button
                key={h.productId}
                type="button"
                onClick={() => toggle(h.productId)}
                aria-expanded={active}
                aria-controls={`look-panel-${look.id}`}
                aria-label={`${active ? 'Fechar' : 'Ver'} ${h.label}`}
                initial={reduce ? false : { scale: 0, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.9 + i * 0.15 }}
                className="group absolute z-10 -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${h.x}%`, top: `${h.y}%` }}
              >
                <span className="relative grid size-11 place-items-center">
                  {!active && <span aria-hidden className="hotspot-ring absolute inset-1.5 rounded-full bg-white/70" />}
                  <span
                    className={`relative grid size-8 place-items-center rounded-full shadow-[0_4px_20px_rgb(0_0_0/0.25)] transition-[background-color,color,transform] duration-300 group-hover:scale-110 ${
                      active ? 'rotate-45 bg-ink text-bg' : 'bg-white text-[#191919]'
                    }`}
                  >
                    <Plus size={15} strokeWidth={2} aria-hidden />
                  </span>
                </span>
                <span className="pointer-events-none absolute top-1/2 left-12 hidden -translate-y-1/2 rounded-full bg-white px-3 py-1.5 text-xs font-semibold whitespace-nowrap text-[#191919] opacity-0 shadow-sm transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100 md:block">
                  {h.label}
                </span>
              </motion.button>
            )
          })}

          <AnimatePresence>
            {product && (
              <motion.div
                ref={panelRef}
                id={`look-panel-${look.id}`}
                role="region"
                aria-label={`Peça selecionada: ${product.name}`}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 16 }}
                transition={{ duration: 0.45, ease: EASE }}
                className="absolute inset-x-2 bottom-2 z-20 hidden rounded-lg bg-bg p-4 pr-12 shadow-[0_24px_60px_-20px_rgb(0_0_0/0.45)] sm:block md:inset-x-auto md:bottom-5 md:left-5 md:w-[26rem]"
              >
                <button type="button" onClick={() => setOpen(null)} aria-label="Fechar peça" className="absolute top-2 right-2 grid size-10 place-items-center rounded-full hover:bg-ink/5">
                  <X size={16} />
                </button>
                <QuickAdd product={product} onDone={() => setOpen(null)} />
              </motion.div>
            )}
          </AnimatePresence>
        </MaskReveal>

        {/* Mobile: painel abaixo da imagem para não cobrir a fotografia */}
        <AnimatePresence>
          {product && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4, ease: EASE }}
              className="overflow-hidden sm:hidden"
            >
              <div className="relative mt-3 rounded-lg border border-line bg-surface p-4 pr-12">
                <button type="button" onClick={() => setOpen(null)} aria-label="Fechar peça" className="absolute top-2 right-2 grid size-10 place-items-center rounded-full hover:bg-ink/5">
                  <X size={16} />
                </button>
                <QuickAdd product={product} onDone={() => setOpen(null)} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className={`relative lg:sticky lg:top-32 lg:col-span-4 lg:row-start-1 ${flip ? 'lg:col-start-1' : 'lg:col-start-9'} lg:pt-16`}>
        <motion.span aria-hidden style={{ y: numY }} className="display pointer-events-none absolute -top-16 right-0 text-[9rem] leading-none text-ink/[0.06] select-none lg:-top-4 lg:text-[13rem]">
          {look.number}
        </motion.span>
        <p className="eyebrow text-accent">Look {look.number}</p>
        <h3 id={`look-${look.id}`} className="display mt-4 text-[clamp(2.75rem,5vw,4.5rem)]">
          <LineReveal>{look.title}</LineReveal>
        </h3>
        <FadeUp>
          <p className="mt-5 max-w-sm text-[0.9375rem] leading-relaxed text-muted">{look.text}</p>
        </FadeUp>
        <FadeUp delay={0.1}>
          <p className="eyebrow mt-10 text-muted">Peças do look</p>
          <ul className="mt-3 divide-y divide-line border-y border-line">
            {look.hotspots.map((h) => {
              const p = productById(h.productId)
              if (!p) return null
              const active = open === h.productId
              return (
                <li key={h.productId}>
                  <button
                    type="button"
                    onClick={() => toggle(h.productId)}
                    aria-expanded={active}
                    aria-controls={`look-panel-${look.id}`}
                    className="group flex min-h-14 w-full items-center justify-between gap-4 py-3 text-left"
                  >
                    <span className={`font-semibold transition-colors ${active ? 'text-accent' : 'group-hover:text-accent'}`}>{p.name}</span>
                    <span className="flex items-center gap-3 text-sm text-muted tabular-nums">
                      {formatPrice(p.price)}
                      <Plus size={15} aria-hidden className={`transition-transform duration-300 ${active ? 'rotate-45' : ''}`} />
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        </FadeUp>
      </div>
    </article>
  )
}
