import { AnimatePresence, motion } from 'motion/react'
import { Check, Info, X } from 'lucide-react'
import { useShop } from '../../store/shop'
import { EASE } from './motion'

export function Toaster() {
  const { toasts, dismissToast } = useShop()
  return (
    <div aria-live="polite" role="status" className="pointer-events-none fixed inset-x-0 top-3 z-[80] flex flex-col items-center gap-2 px-4 sm:top-auto sm:bottom-6">
      <AnimatePresence initial={false}>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, transition: { duration: 0.2 } }}
            transition={{ duration: 0.45, ease: EASE }}
            className="pointer-events-auto flex max-w-[min(28rem,100%)] items-center gap-3 rounded-full bg-ink py-2 pr-2 pl-4 text-[0.8125rem] font-medium text-bg shadow-[0_12px_40px_-12px_rgb(0_0_0/0.35)]"
          >
            {t.tone === 'error' ? <Info size={15} aria-hidden /> : <Check size={15} aria-hidden />}
            <span className="min-w-0 flex-1">{t.message}</span>
            <button type="button" onClick={() => dismissToast(t.id)} aria-label="Fechar aviso" className="grid size-8 place-items-center rounded-full hover:bg-bg/15">
              <X size={14} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
