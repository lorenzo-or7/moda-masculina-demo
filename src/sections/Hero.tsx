import { motion, useReducedMotion, useScroll, useTransform, type TargetAndTransition } from 'motion/react'
import { ArrowRight, Plus } from 'lucide-react'
import { useRef } from 'react'
import { site } from '../config/site'
import { images, productById } from '../data/catalog'
import { formatPrice } from '../lib/format'
import { scrollToId } from '../lib/scroll'
import { useShop } from '../store/shop'
import { Img } from '../components/ui/Img'
import { EASE, LineReveal, Magnetic } from '../components/ui/motion'

const featured = productById('meridian')!

export function Hero() {
  const ref = useRef<HTMLElement>(null)
  const reduce = useReducedMotion()
  const { openQuickView } = useShop()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const imgY = useTransform(scrollYProgress, [0, 1], ['0%', reduce ? '0%' : '14%'])
  const imgScale = useTransform(scrollYProgress, [0, 1], [1, reduce ? 1 : 1.08])
  const copyY = useTransform(scrollYProgress, [0, 1], ['0%', reduce ? '0%' : '-18%'])
  const fade = useTransform(scrollYProgress, [0, 0.75], [1, reduce ? 1 : 0.15])

  const initial = (v: TargetAndTransition) => (reduce ? false : v)

  return (
    <section ref={ref} id="topo" aria-labelledby="hero-title" className="relative isolate overflow-hidden">
      <div className="relative mx-auto grid min-h-[100svh] max-w-[92rem] grid-cols-1 lg:grid-cols-12">
        {/* Fotografia de campanha — revelação por máscara + parallax controlado */}
        <motion.div
          className="relative order-1 h-[64svh] min-h-[420px] overflow-hidden lg:absolute lg:inset-y-0 lg:right-0 lg:h-auto lg:w-[56%]"
          initial={initial({ clipPath: 'inset(100% 0% 0% 0%)' })}
          animate={{ clipPath: 'inset(0% 0% 0% 0%)' }}
          transition={{ duration: 1.5, ease: EASE, delay: 0.1 }}
        >
          <motion.div
            className="absolute inset-0"
            style={{ y: imgY, scale: imgScale }}
            initial={initial({ scale: 1.22 })}
            animate={{ scale: 1 }}
            transition={{ duration: 2.2, ease: EASE, delay: 0.1 }}
          >
            <Img image={images.hero} priority widths={[640, 960, 1200, 1600, 2000]} sizes="(min-width: 1024px) 56vw, 100vw" quality={72} className="object-[50%_30%]" />
          </motion.div>

          <motion.button
            type="button"
            onClick={() => openQuickView(featured.id, 'camel')}
            initial={initial({ opacity: 0, y: 12 })}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: EASE, delay: 1.5 }}
            className="group absolute right-4 bottom-4 hidden items-center gap-3 rounded-full bg-bg/90 py-2 pr-2 pl-4 text-left backdrop-blur-md transition-colors hover:bg-bg sm:flex md:right-8 md:bottom-8"
          >
            <span>
              <span className="block text-[0.8125rem] font-semibold">{featured.name}</span>
              <span className="block text-xs text-muted">Camel · {formatPrice(featured.price)}</span>
            </span>
            <span className="grid size-9 place-items-center rounded-full bg-ink text-bg transition-transform duration-500 group-hover:rotate-90">
              <Plus size={16} aria-hidden />
            </span>
            <span className="sr-only">— ver peça</span>
          </motion.button>
        </motion.div>

        {/* Texto editorial */}
        <motion.div
          style={{ y: copyY, opacity: fade }}
          className="relative z-10 order-2 flex flex-col justify-end px-5 pt-9 pb-14 md:px-10 md:pt-12 lg:col-span-12 lg:row-start-1 lg:min-h-[100svh] lg:max-w-[46%] lg:pt-32 lg:pb-14"
        >
          <motion.p
            initial={initial({ opacity: 0 })}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.9 }}
            className="eyebrow mb-6 hidden items-center gap-3 text-muted lg:flex"
          >
            <span className="h-px w-10 bg-current" aria-hidden />
            {site.season}
          </motion.p>

          <h1 id="hero-title" className="display text-[clamp(3.4rem,15vw,5.5rem)] font-normal sm:text-[clamp(4.5rem,11vw,7rem)] lg:text-[clamp(5.5rem,8.4vw,10rem)]">
            <LineReveal inView={false} delay={0.45}>
              Vista sua
            </LineReveal>
            <LineReveal inView={false} delay={0.57} className="lg:pl-[1.1em]">
              <em className="font-normal italic">própria</em>
            </LineReveal>
            <LineReveal inView={false} delay={0.69}>
              direção<span className="text-accent">.</span>
            </LineReveal>
          </h1>

          <motion.div
            initial={initial({ opacity: 0, y: 18 })}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: EASE, delay: 1.15 }}
            className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between lg:mt-10 lg:flex-col lg:items-start xl:flex-row xl:items-end"
          >
            <p className="max-w-[22rem] text-[0.9375rem] leading-relaxed text-muted">
              Alfaiataria leve, lã fria e linho lavado. Peças feitas para quem já sabe o caminho — e prefere escolher o próprio.
            </p>
            <div className="flex items-center gap-5">
              <Magnetic>
                <a
                  href="#colecoes"
                  onClick={(e) => {
                    e.preventDefault()
                    scrollToId('colecoes')
                  }}
                  className="group inline-flex h-14 items-center gap-3 rounded-full bg-ink pr-2 pl-7 text-sm font-semibold text-bg transition-colors duration-300 hover:bg-accent hover:text-on-accent active:scale-[0.97]"
                >
                  Explorar coleção
                  <span className="grid size-10 place-items-center rounded-full bg-bg text-ink transition-transform duration-500 group-hover:translate-x-0.5">
                    <ArrowRight size={16} aria-hidden />
                  </span>
                </a>
              </Magnetic>
            </div>
          </motion.div>
        </motion.div>

      </div>
    </section>
  )
}
