import { MotionConfig } from 'motion/react'
import { lazy, Suspense } from 'react'
import { Footer } from './components/layout/Footer'
import { Navbar } from './components/layout/Navbar'
import { SearchOverlay } from './components/overlays/SearchOverlay'
import { Toaster } from './components/ui/Toaster'
import { Catalog } from './sections/Catalog'
import { Collections } from './sections/Collections'
import { Hero } from './sections/Hero'
import { Lookbook } from './sections/Lookbook'
import { Manifesto } from './sections/Manifesto'
import { Spotlight } from './sections/Spotlight'
import { ShopProvider } from './store/shop'

// Overlays carregados sob demanda (code splitting).
const QuickView = lazy(() => import('./components/overlays/QuickView'))
const BagDrawer = lazy(() => import('./components/overlays/BagDrawer'))

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <ShopProvider>
        <Navbar />
        <main id="conteudo" tabIndex={-1} className="outline-none">
          <Hero />
          <Collections />
          <Catalog />
          <Lookbook />
          <Spotlight />
          <Manifesto />
        </main>
        <Footer />
        <SearchOverlay />
        <Suspense fallback={null}>
          <QuickView />
          <BagDrawer />
        </Suspense>
        <Toaster />
      </ShopProvider>
    </MotionConfig>
  )
}
