import { motion, useMotionValue, useReducedMotion, useSpring, type HTMLMotionProps } from 'motion/react'
import { useRef, type ReactNode } from 'react'

export const EASE = [0.22, 1, 0.36, 1] as const

/** Revelação editorial por máscara (clip-path) ao entrar na viewport. */
export function MaskReveal({
  children,
  className = '',
  delay = 0,
  from = 'bottom',
  ...rest
}: { children: ReactNode; className?: string; delay?: number; from?: 'bottom' | 'top' | 'left' | 'right' } & Omit<HTMLMotionProps<'div'>, 'children'>) {
  const reduce = useReducedMotion()
  const hidden = {
    bottom: 'inset(100% 0% 0% 0%)',
    top: 'inset(0% 0% 100% 0%)',
    left: 'inset(0% 100% 0% 0%)',
    right: 'inset(0% 0% 0% 100%)',
  }[from]
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { clipPath: hidden }}
      whileInView={{ clipPath: 'inset(0% 0% 0% 0%)' }}
      viewport={{ once: true, margin: '0px 0px -12% 0px' }}
      transition={{ duration: 1.25, ease: EASE, delay }}
      {...rest}
    >
      {children}
    </motion.div>
  )
}

/** Linha de texto que sobe de dentro de uma máscara (tipografia escalonada). */
export function LineReveal({
  children,
  delay = 0,
  className = '',
  inView = true,
}: {
  children: ReactNode
  delay?: number
  className?: string
  /** true = anima ao entrar na viewport; false = anima ao montar. */
  inView?: boolean
}) {
  const reduce = useReducedMotion()
  // O observador fica no contêiner (visível); a linha interna, deslocada e recortada, herda a variante.
  const variants = { hidden: { y: '110%' }, show: { y: 0, transition: { duration: 1.1, ease: EASE, delay } } }
  return (
    <motion.span
      className={`block overflow-hidden pb-[0.08em] ${className}`}
      initial={reduce ? false : 'hidden'}
      {...(inView ? { whileInView: 'show', viewport: { once: true, margin: '0px 0px -8% 0px' } } : { animate: 'show' })}
    >
      <motion.span className="block" variants={variants}>
        {children}
      </motion.span>
    </motion.span>
  )
}

export function FadeUp({ children, delay = 0, className = '', ...rest }: { children: ReactNode; delay?: number; className?: string } & Omit<HTMLMotionProps<'div'>, 'children'>) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -10% 0px' }}
      transition={{ duration: 0.9, ease: EASE, delay }}
      {...rest}
    >
      {children}
    </motion.div>
  )
}

/** Hover magnético sutil — só em ponteiros finos, desativado com movimento reduzido. */
export function Magnetic({ children, strength = 0.25, className = '' }: { children: ReactNode; strength?: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const reduce = useReducedMotion()
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 220, damping: 18, mass: 0.4 })
  const sy = useSpring(y, { stiffness: 220, damping: 18, mass: 0.4 })

  const onMove = (e: React.PointerEvent) => {
    if (reduce || e.pointerType !== 'mouse' || !ref.current) return
    const r = ref.current.getBoundingClientRect()
    x.set((e.clientX - (r.left + r.width / 2)) * strength)
    y.set((e.clientY - (r.top + r.height / 2)) * strength)
  }
  const reset = () => {
    x.set(0)
    y.set(0)
  }
  return (
    <motion.span ref={ref} className={`inline-block ${className}`} style={{ x: sx, y: sy }} onPointerMove={onMove} onPointerLeave={reset}>
      {children}
    </motion.span>
  )
}
