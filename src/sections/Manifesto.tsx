import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from 'motion/react'
import { useRef } from 'react'
import { images } from '../data/catalog'
import { Img } from '../components/ui/Img'
import { FadeUp, MaskReveal } from '../components/ui/motion'

const STATEMENT = 'Não vestimos tendências. Vestimos decisões — tecidos honestos, cortes precisos e a liberdade de ser reconhecido pelo que se escolhe.'

function Word({ children, progress, range }: { children: string; progress: MotionValue<number>; range: [number, number] }) {
  const opacity = useTransform(progress, range, [0.16, 1])
  return (
    <motion.span style={{ opacity }} className="inline-block pr-[0.28em]">
      {children}
    </motion.span>
  )
}

export function Manifesto() {
  const ref = useRef<HTMLElement>(null)
  const textRef = useRef<HTMLParagraphElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const { scrollYProgress: textProgress } = useScroll({ target: textRef, offset: ['start 85%', 'end 45%'] })
  const imgY = useTransform(scrollYProgress, [0, 1], reduce ? ['0%', '0%'] : ['-10%', '10%'])
  const headX = useTransform(scrollYProgress, [0, 1], reduce ? ['0%', '0%'] : ['-4%', '4%'])
  const words = STATEMENT.split(' ')

  return (
    <section id="sobre" ref={ref} aria-labelledby="sobre-title" className="relative overflow-hidden py-24 md:py-40">
      <div className="container-x">
        <p className="eyebrow mb-6 text-muted">(05) — Manifesto</p>
        <motion.h2 id="sobre-title" style={{ x: headX }} className="display text-[clamp(3.4rem,11vw,11.5rem)] leading-[0.98] md:leading-[0.86]">
          Estilo não segue.
          <span className="mt-[0.12em] block pl-[12%] italic text-accent md:mt-[0.06em]">Expressa.</span>
        </motion.h2>

        <div className="mt-16 grid gap-10 md:mt-24 lg:grid-cols-12 lg:gap-6">
          <div className="lg:col-span-7">
            <MaskReveal className="relative aspect-[4/3] overflow-hidden bg-line/40 md:aspect-[16/10]">
              <motion.div className="absolute -inset-y-[12%] inset-x-0" style={{ y: imgY }}>
                <Img image={images.manifesto} ratio={10 / 16} widths={[640, 960, 1400, 1800]} sizes="(min-width: 1024px) 58vw, 100vw" />
              </motion.div>
            </MaskReveal>
            <p className="eyebrow mt-4 text-muted">Campanha — {new Date().getFullYear() + 1}</p>
          </div>

          <div className="flex flex-col justify-between gap-12 lg:col-span-4 lg:col-start-9">
            <p ref={textRef} className="display text-[clamp(1.6rem,2.6vw,2.35rem)] leading-[1.18] tracking-[-0.01em]">
              {reduce ? STATEMENT : words.map((w, i) => <Word key={i} progress={textProgress} range={[i / words.length, (i + 1) / words.length]}>{w}</Word>)}
            </p>

            <FadeUp className="grid grid-cols-2 gap-4 border-t border-line pt-6 text-sm">
              <div className="relative col-span-2 hidden aspect-[4/3] overflow-hidden bg-line/40 grayscale lg:block">
                <Img image={images.manifestoAlt} ratio={3 / 4} widths={[480, 720]} sizes="28vw" />
              </div>
              <div>
                <p className="display text-4xl">03</p>
                <p className="mt-1 text-muted">coleções por ano. Nem uma a mais.</p>
              </div>
              <div>
                <p className="display text-4xl">12</p>
                <p className="mt-1 text-muted">ateliês parceiros em São Paulo</p>
              </div>
            </FadeUp>
          </div>
        </div>
      </div>
    </section>
  )
}
