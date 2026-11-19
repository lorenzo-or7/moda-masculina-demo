import { useEffect, useState } from 'react'

/** Retorna o id da seção mais visível na faixa central da viewport. */
export function useActiveSection(ids: string[]) {
  const [active, setActive] = useState<string | null>(null)

  useEffect(() => {
    const els = ids.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => !!el)
    if (!els.length) return
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting)
        if (visible.length) {
          visible.sort((a, b) => b.intersectionRatio - a.intersectionRatio)
          setActive(visible[0].target.id)
        } else if (window.scrollY < window.innerHeight * 0.5) {
          setActive(null)
        }
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: [0, 0.01] },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [ids])

  return active
}
