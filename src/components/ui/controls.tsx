import { Minus, Plus } from 'lucide-react'
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import type { ColorVariant } from '../../data/types'
import { MAX_QTY } from '../../store/shop'

type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'solid' | 'outline' | 'ghost'; size?: 'md' | 'lg'; children: ReactNode }

/** Botão base com estados hover, active, focus e disabled. */
export function Button({ variant = 'solid', size = 'md', className = '', children, type = 'button', ...rest }: BtnProps) {
  const base =
    'group/btn relative inline-flex items-center justify-center gap-2.5 overflow-hidden rounded-full font-semibold tracking-[0.02em] transition-[background-color,color,border-color,transform,box-shadow] duration-300 ease-[var(--ease-editorial)] active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-45 disabled:active:scale-100'
  const sizes = { md: 'h-11 px-5 text-[0.8125rem]', lg: 'h-14 px-7 text-sm' }
  const variants = {
    solid: 'bg-ink text-bg hover:bg-accent hover:text-on-accent',
    outline: 'border border-ink/80 text-ink hover:bg-ink hover:text-bg',
    ghost: 'text-ink hover:bg-ink/5',
  }
  return (
    <button type={type} className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} {...rest}>
      {children}
    </button>
  )
}

export function IconButton({ label, className = '', children, ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & { label: string; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={`relative inline-grid size-11 place-items-center rounded-full text-ink transition-[background-color,transform] duration-300 hover:bg-ink/[0.07] active:scale-90 disabled:opacity-40 ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
}

export function Swatches({
  colors,
  value,
  onChange,
  size = 'md',
  name,
}: {
  colors: ColorVariant[]
  value: string
  onChange: (id: string) => void
  size?: 'sm' | 'md'
  name: string
}) {
  const dim = size === 'sm' ? 'size-6' : 'size-9'
  const dot = size === 'sm' ? 'size-3.5' : 'size-6'
  return (
    <div role="radiogroup" aria-label={`Cor de ${name}`} className="flex flex-wrap items-center gap-1">
      {colors.map((c) => {
        const active = c.id === value
        return (
          <button
            key={c.id}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={c.name}
            title={c.name}
            onClick={() => onChange(c.id)}
            className={`${dim} grid place-items-center rounded-full border transition-colors duration-300 ${active ? 'border-ink' : 'border-transparent hover:border-line'}`}
          >
            <span className={`${dot} rounded-full ring-1 ring-black/10 ring-inset`} style={{ backgroundColor: c.hex }} />
          </button>
        )
      })}
    </div>
  )
}

export function SizePicker({
  sizes,
  soldOut = [],
  value,
  onChange,
  invalid,
  name,
  describedBy,
}: {
  sizes: string[]
  soldOut?: string[]
  value: string | null
  onChange: (s: string) => void
  invalid?: boolean
  name: string
  describedBy?: string
}) {
  return (
    <div role="radiogroup" aria-label={`Tamanho de ${name}`} aria-invalid={invalid || undefined} aria-describedby={describedBy} className="flex flex-wrap gap-2">
      {sizes.map((s) => {
        const out = soldOut.includes(s)
        const active = value === s
        return (
          <button
            key={s}
            type="button"
            role="radio"
            aria-checked={active}
            disabled={out}
            aria-label={out ? `${s} — esgotado` : s}
            onClick={() => onChange(s)}
            className={`relative h-11 min-w-11 rounded-full border px-3.5 text-[0.8125rem] font-semibold tabular-nums transition-colors duration-300 disabled:cursor-not-allowed disabled:text-muted/60 ${
              active ? 'border-ink bg-ink text-bg' : invalid ? 'border-red-700/70 dark:border-red-400/70' : 'border-line hover:border-ink'
            } ${out ? 'line-through decoration-1' : ''}`}
          >
            {s}
          </button>
        )
      })}
    </div>
  )
}

export function QtyStepper({ value, onChange, label }: { value: number; onChange: (n: number) => void; label: string }) {
  return (
    <div className="inline-flex h-10 items-center rounded-full border border-line" role="group" aria-label={`Quantidade de ${label}`}>
      <button
        type="button"
        className="grid size-10 place-items-center rounded-full transition-colors hover:bg-ink/5 disabled:opacity-35"
        onClick={() => onChange(value - 1)}
        disabled={value <= 1}
        aria-label="Diminuir quantidade"
      >
        <Minus size={14} strokeWidth={1.75} />
      </button>
      <output aria-live="polite" className="w-6 text-center text-sm font-semibold tabular-nums">
        {value}
      </output>
      <button
        type="button"
        className="grid size-10 place-items-center rounded-full transition-colors hover:bg-ink/5 disabled:opacity-35"
        onClick={() => onChange(value + 1)}
        disabled={value >= MAX_QTY}
        aria-label="Aumentar quantidade"
      >
        <Plus size={14} strokeWidth={1.75} />
      </button>
    </div>
  )
}
