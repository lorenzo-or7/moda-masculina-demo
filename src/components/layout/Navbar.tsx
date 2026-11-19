import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { Heart, Menu, Moon, Search, ShoppingBag, Sun, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { site } from '../../config/site'
import { useActiveSection } from '../../hooks/useActiveSection'
import { useDialog } from '../../hooks/useDialog'
import { useTheme } from '../../hooks/useTheme'
import { scrollToId } from '../../lib/scroll'
import { useShop } from '../../store/shop'
import { IconButton } from '../ui/controls'
import { EASE } from '../ui/motion'

export const NAV_LINKS = [
  { id: 'colecoes', label: 'Coleções' },
  { id: 'produtos', label: 'Produtos' },
  { id: 'editorial', label: 'Editorial' },
  { id: 'sobre', label: 'Sobre' },
]
const SECTION_IDS = NAV_LINKS.map((l) => l.id)

function Badge({ n }: { n: number }) {
  return (
    <AnimatePresence>
      {n > 0 && (
        <motion.span
          key={n}
          initial={{ scale: 0.4, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.4, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 24 }}
          aria-hidden
          className="absolute top-1 right-0.5 grid h-[1.125rem] min-w-[1.125rem] place-items-center rounded-full bg-accent px-1 text-[0.625rem] font-bold text-on-accent tabular-nums"
        >
          {n > 99 ? '99+' : n}
        </motion.span>
      )}
    </AnimatePresence>
  )
}

export function Navbar() {
  const { count, favorites, openDrawer, setSearchOpen } = useShop()
  const { theme, toggle } = useTheme()
  const active = useActiveSection(SECTION_IDS)
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 48)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const ThemeIcon = theme === 'dark' ? Sun : Moon
  const themeLabel = theme === 'dark' ? 'Ativar tema claro' : 'Ativar tema escuro'

  return (
    <>
      <a href="#conteudo" className="sr-only z-[90] rounded-full bg-ink px-4 py-2 text-bg focus:not-sr-only focus:fixed focus:top-3 focus:left-3">
        Pular para o conteúdo
      </a>
      {/* Integrada à hero: modo "difference" mantém contraste sobre foto e fundo; vira cápsula ao rolar. */}
      <header className={`pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center px-3 sm:px-4 ${scrolled || menuOpen ? '' : 'nav-blend'}`}>
        <nav
          aria-label="Principal"
          className={`pointer-events-auto flex w-full items-center justify-between gap-2 transition-[max-width,margin,padding,background-color,border-color,box-shadow,border-radius] duration-700 ease-[var(--ease-editorial)] ${
            scrolled
              ? 'mt-3 max-w-[64rem] rounded-full border border-line bg-[var(--nav-glass)] py-1.5 pr-1.5 pl-5 shadow-[0_10px_40px_-18px_rgb(0_0_0/0.25)] backdrop-blur-xl'
              : 'mt-0 max-w-[92rem] rounded-none border border-transparent py-4 pr-1 pl-2 md:px-6 md:py-5'
          }`}
        >
          <a href="#topo" className="display shrink-0 text-[1.65rem] leading-none font-medium tracking-[-0.03em]" aria-label={`${site.brand} — início`}>
            {site.brand}
            <span className="text-accent">.</span>
          </a>

          <ul className="hidden items-center gap-1 lg:flex">
            {NAV_LINKS.map((l) => {
              const isActive = active === l.id
              return (
                <li key={l.id}>
                  <a
                    href={`#${l.id}`}
                    aria-current={isActive ? 'true' : undefined}
                    className={`relative inline-flex h-11 items-center px-3.5 text-[0.8125rem] font-semibold tracking-[0.02em] transition-colors duration-300 ${isActive ? 'text-ink' : 'text-muted hover:text-ink'}`}
                  >
                    {l.label}
                    {isActive && (
                      <motion.span
                        layoutId="nav-indicator"
                        className="absolute bottom-1.5 left-1/2 size-1 -translate-x-1/2 rounded-full bg-accent"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                  </a>
                </li>
              )
            })}
          </ul>

          <div className="flex items-center">
            <IconButton label="Buscar produtos" onClick={() => setSearchOpen(true)}>
              <Search size={19} strokeWidth={1.6} />
            </IconButton>
            <IconButton label={`Favoritos (${favorites.length})`} onClick={() => openDrawer('favorites')} className="max-sm:hidden">
              <Heart size={19} strokeWidth={1.6} />
              <Badge n={favorites.length} />
            </IconButton>
            <IconButton label={`Sacola (${count} ${count === 1 ? 'item' : 'itens'})`} onClick={() => openDrawer('bag')}>
              <ShoppingBag size={19} strokeWidth={1.6} />
              <Badge n={count} />
            </IconButton>
            <IconButton label={themeLabel} onClick={toggle} className="max-sm:hidden">
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={theme}
                  initial={{ rotate: -60, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 60, opacity: 0 }}
                  transition={{ duration: 0.35, ease: EASE }}
                  className="grid"
                >
                  <ThemeIcon size={18} strokeWidth={1.6} />
                </motion.span>
              </AnimatePresence>
            </IconButton>
            <IconButton label="Abrir menu" aria-expanded={menuOpen} aria-controls="menu-mobile" onClick={() => setMenuOpen(true)} className="lg:hidden">
              <Menu size={20} strokeWidth={1.6} />
            </IconButton>
          </div>
        </nav>
      </header>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} active={active} themeLabel={themeLabel} onTheme={toggle} ThemeIcon={ThemeIcon} />
    </>
  )
}

function MobileMenu({
  open,
  onClose,
  active,
  themeLabel,
  onTheme,
  ThemeIcon,
}: {
  open: boolean
  onClose: () => void
  active: string | null
  themeLabel: string
  onTheme: () => void
  ThemeIcon: typeof Sun
}) {
  const ref = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const { favorites, openDrawer } = useShop()
  useDialog(open, ref, onClose)

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={ref}
          id="menu-mobile"
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          className="fixed inset-0 z-[60] flex flex-col bg-bg lg:hidden"
          initial={reduce ? { opacity: 0 } : { clipPath: 'inset(0% 0% 100% 0%)' }}
          animate={reduce ? { opacity: 1 } : { clipPath: 'inset(0% 0% 0% 0%)' }}
          exit={reduce ? { opacity: 0 } : { clipPath: 'inset(0% 0% 100% 0%)' }}
          transition={{ duration: 0.7, ease: EASE }}
        >
          <div className="flex items-center justify-between px-5 py-4">
            <span className="display text-[1.65rem] font-medium">{site.brand}<span className="text-accent">.</span></span>
            <IconButton label="Fechar menu" onClick={onClose}>
              <X size={22} strokeWidth={1.6} />
            </IconButton>
          </div>
          <nav aria-label="Menu móvel" className="flex flex-1 flex-col justify-center px-5">
            <ol className="space-y-1">
              {NAV_LINKS.map((l, i) => (
                <li key={l.id} className="overflow-hidden">
                  <motion.a
                    href={`#${l.id}`}
                    onClick={(e) => {
                      e.preventDefault()
                      onClose()
                      scrollToId(l.id, 80)
                    }}
                    aria-current={active === l.id ? 'true' : undefined}
                    initial={reduce ? false : { y: '100%' }}
                    animate={{ y: 0 }}
                    transition={{ duration: 0.8, ease: EASE, delay: 0.18 + i * 0.07 }}
                    className="flex items-baseline gap-4 py-2"
                  >
                    <span className="eyebrow w-6 text-muted tabular-nums">0{i + 1}</span>
                    <span className={`display text-[3.25rem] ${active === l.id ? 'italic text-accent' : ''}`}>{l.label}</span>
                  </motion.a>
                </li>
              ))}
            </ol>
          </nav>
          <div className="grid grid-cols-2 gap-2 border-t border-line px-5 pt-4 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
            <button
              type="button"
              onClick={() => {
                onClose()
                openDrawer('favorites')
              }}
              className="flex h-12 items-center justify-center gap-2 rounded-full border border-line text-sm font-semibold"
            >
              <Heart size={16} strokeWidth={1.7} /> Favoritos ({favorites.length})
            </button>
            <button type="button" onClick={onTheme} className="flex h-12 items-center justify-center gap-2 rounded-full border border-line text-sm font-semibold">
              <ThemeIcon size={16} strokeWidth={1.7} /> {themeLabel.replace('Ativar ', '')}
            </button>
            <p className="col-span-2 pt-2 text-center text-xs text-muted">{site.demoNotice}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
