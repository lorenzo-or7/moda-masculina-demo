import { AnimatePresence, motion } from 'motion/react'
import { ArrowRight, Check, Copy, Heart, MessageCircle, ShoppingBag, Trash2, X } from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
import { site } from '../../config/site'
import { productById } from '../../data/catalog'
import { useDialog } from '../../hooks/useDialog'
import { formatPrice } from '../../lib/format'
import { scrollToId } from '../../lib/scroll'
import { buildOrderMessage, whatsappLink } from '../../lib/whatsapp'
import { useShop, type DrawerMode } from '../../store/shop'
import { Button, IconButton, QtyStepper } from '../ui/controls'
import { Img } from '../ui/Img'
import { EASE } from '../ui/motion'

export default function BagDrawer() {
  const { drawer, closeDrawer } = useShop()
  return <AnimatePresence>{drawer && <Panel key="drawer" mode={drawer} onClose={closeDrawer} />}</AnimatePresence>
}

function Panel({ mode, onClose }: { mode: Exclude<DrawerMode, null>; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null)
  const { count, favorites, openDrawer } = useShop()
  useDialog(true, ref, onClose)

  const tabs = [
    { id: 'bag' as const, label: 'Sacola', n: count, Icon: ShoppingBag },
    { id: 'favorites' as const, label: 'Favoritos', n: favorites.length, Icon: Heart },
  ]

  return (
    <motion.div className="fixed inset-0 z-[70]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }}>
      <button type="button" tabIndex={-1} aria-label="Fechar painel" onClick={onClose} className="absolute inset-0 bg-[var(--scrim)] backdrop-blur-[2px]" />
      <motion.aside
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={mode === 'bag' ? 'Sacola' : 'Favoritos'}
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ duration: 0.6, ease: EASE }}
        className="absolute inset-y-0 right-0 flex w-full max-w-[30rem] flex-col bg-bg shadow-[-30px_0_80px_-30px_rgb(0_0_0/0.35)]"
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-3">
          <div role="tablist" aria-label="Painel" className="flex gap-1">
            {tabs.map((t) => {
              const active = mode === t.id
              return (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => openDrawer(t.id)}
                  className={`relative inline-flex h-11 items-center gap-2 rounded-full px-4 text-sm font-semibold transition-colors ${active ? 'text-bg' : 'text-muted hover:text-ink'}`}
                >
                  {active && <motion.span layoutId="drawer-tab" className="absolute inset-0 rounded-full bg-ink" transition={{ type: 'spring', stiffness: 420, damping: 34 }} />}
                  <span className="relative">{t.label}</span>
                  <span className="relative text-xs tabular-nums opacity-70">{t.n}</span>
                </button>
              )
            })}
          </div>
          <IconButton label="Fechar" onClick={onClose}>
            <X size={20} strokeWidth={1.6} />
          </IconButton>
        </div>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={mode}
            role="tabpanel"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="flex min-h-0 flex-1 flex-col"
          >
            {mode === 'bag' ? <BagView onClose={onClose} /> : <FavoritesView onClose={onClose} />}
          </motion.div>
        </AnimatePresence>
      </motion.aside>
    </motion.div>
  )
}

function EmptyState({ title, text, onClose }: { title: string; text: string; onClose: () => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
      <p className="display text-4xl italic">{title}</p>
      <p className="mt-4 max-w-xs text-[0.9375rem] text-muted">{text}</p>
      <Button
        className="mt-8"
        onClick={() => {
          onClose()
          scrollToId('produtos', 120)
        }}
      >
        Explorar produtos <ArrowRight size={16} aria-hidden />
      </Button>
    </div>
  )
}

function BagView({ onClose }: { onClose: () => void }) {
  const { lines, subtotal, setQty, removeLine, openQuickView, notify } = useShop()
  const [demo, setDemo] = useState(false)
  const [copied, setCopied] = useState(false)
  const message = useMemo(() => buildOrderMessage(lines, subtotal), [lines, subtotal])

  if (!lines.length) return <EmptyState title="Sacola vazia." text="As peças que você escolher aparecem aqui, com cor, tamanho e quantidade." onClose={onClose} />

  const consult = () => {
    const link = whatsappLink(message)
    if (link) {
      window.open(link, '_blank', 'noopener,noreferrer')
    } else {
      setDemo(true)
    }
  }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(message)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      notify('Não foi possível copiar. Selecione o texto manualmente.', 'error')
    }
  }

  return (
    <>
      <ul className="min-h-0 flex-1 divide-y divide-line overflow-y-auto px-5">
        <AnimatePresence initial={false}>
          {lines.map((l) => {
            const color = l.product.colors.find((c) => c.id === l.colorId)
            return (
              <motion.li
                key={l.key}
                layout
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.4, ease: EASE }}
                className="overflow-hidden"
              >
                <div className="flex gap-4 py-5">
                  <button
                    type="button"
                    onClick={() => openQuickView(l.productId, l.colorId)}
                    className="relative aspect-[3/4] w-20 shrink-0 overflow-hidden bg-line/40"
                    aria-label={`Ver ${l.product.name}`}
                  >
                    <Img image={color?.image ?? l.product.image} ratio={4 / 3} widths={[160, 240]} sizes="80px" decorative />
                  </button>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-3">
                      <p className="font-semibold leading-snug">{l.product.name}</p>
                      <p className="shrink-0 text-sm tabular-nums">{formatPrice(l.lineTotal)}</p>
                    </div>
                    <p className="mt-1 text-xs text-muted">
                      {l.colorName} · {l.size === 'Único' ? 'Tamanho único' : `Tam. ${l.size}`} · {formatPrice(l.product.price)} un.
                    </p>
                    <div className="mt-auto flex items-center justify-between pt-3">
                      <QtyStepper value={l.qty} onChange={(n) => setQty(l.key, n)} label={l.product.name} />
                      <button
                        type="button"
                        onClick={() => removeLine(l.key)}
                        className="inline-flex h-10 items-center gap-1.5 rounded-full px-3 text-xs font-semibold text-muted transition-colors hover:bg-ink/5 hover:text-ink"
                      >
                        <Trash2 size={14} aria-hidden /> Remover<span className="sr-only"> {l.product.name}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </motion.li>
            )
          })}
        </AnimatePresence>
      </ul>

      <div className="border-t border-line px-5 pt-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
        <div className="flex items-baseline justify-between">
          <span className="text-sm text-muted">Subtotal</span>
          <motion.span key={subtotal} initial={{ opacity: 0.4, y: -4 }} animate={{ opacity: 1, y: 0 }} className="display text-3xl tabular-nums" aria-live="polite">
            {formatPrice(subtotal)}
          </motion.span>
        </div>
        <p className="mt-1 text-xs text-muted">Frete e pagamento combinados no atendimento.</p>

        <AnimatePresence initial={false}>
          {demo && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4, ease: EASE }}
              className="overflow-hidden"
            >
              <div className="mt-4 rounded-lg border border-accent/50 bg-surface p-4" role="status">
                <p className="eyebrow text-accent">Modo demonstração</p>
                <p className="mt-2 text-[0.8125rem] leading-relaxed text-muted">
                  Nenhum número comercial está configurado, então nenhum contato foi aberto. Na loja real, este botão abre o WhatsApp com a mensagem abaixo já pronta.
                </p>
                <pre className="mt-3 max-h-40 overflow-y-auto rounded bg-bg p-3 font-sans text-xs leading-relaxed whitespace-pre-wrap text-ink">{message}</pre>
                <div className="mt-3 flex items-center gap-2">
                  <Button variant="outline" onClick={copy} className="h-10">
                    {copied ? <Check size={15} aria-hidden /> : <Copy size={15} aria-hidden />}
                    {copied ? 'Copiado' : 'Copiar mensagem'}
                  </Button>
                  <button type="button" onClick={() => setDemo(false)} className="h-10 px-3 text-xs font-semibold text-muted hover:text-ink">
                    Fechar prévia
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <Button size="lg" className="mt-5 w-full" onClick={consult}>
          <MessageCircle size={18} aria-hidden /> Consultar pelo WhatsApp
        </Button>
        <p className="mt-3 text-center text-[0.6875rem] leading-relaxed text-muted">{site.demoNotice}</p>
      </div>
    </>
  )
}

function FavoritesView({ onClose }: { onClose: () => void }) {
  const { favorites, toggleFavorite, openQuickView } = useShop()
  const items = favorites.map(productById).filter((p) => !!p)

  if (!items.length) return <EmptyState title="Nenhum favorito." text="Toque no coração de qualquer peça para guardá-la aqui e decidir depois." onClose={onClose} />

  return (
    <ul className="min-h-0 flex-1 divide-y divide-line overflow-y-auto px-5">
      {items.map((p) => (
        <li key={p.id} className="flex items-center gap-4 py-4">
          <div className="relative aspect-[3/4] w-16 shrink-0 overflow-hidden bg-line/40">
            <Img image={p.image} ratio={4 / 3} widths={[160]} sizes="64px" decorative />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold">{p.name}</p>
            <p className="text-sm text-muted tabular-nums">{formatPrice(p.price)}</p>
          </div>
          <Button variant="outline" className="h-10 px-4" onClick={() => openQuickView(p.id)}>
            Ver<span className="sr-only"> {p.name}</span>
          </Button>
          <IconButton label={`Remover ${p.name} dos favoritos`} onClick={() => toggleFavorite(p.id)}>
            <X size={17} />
          </IconButton>
        </li>
      ))}
    </ul>
  )
}
