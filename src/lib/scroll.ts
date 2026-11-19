/** Rola até uma seção respeitando movimento reduzido. Útil após fechar overlays. */
export function scrollToId(id: string, delay = 0) {
  const run = () => {
    const el = document.getElementById(id)
    if (!el) return
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
    el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
    history.replaceState(null, '', `#${id}`)
  }
  if (delay) window.setTimeout(run, delay)
  else requestAnimationFrame(run)
}
