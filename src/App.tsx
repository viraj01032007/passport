import { useEffect } from 'react'
import { Link, Route, Routes, useLocation } from 'react-router-dom'
import Navbar, { TopBar } from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Book, { Page } from './pages/Book'
import Track from './pages/Track'
import { About, Contact, Login } from './pages/Info'
import { LangProvider } from './lib/i18n'
import { PortalLogin } from './pages/portal/shared'
import StaffDesk from './pages/portal/StaffDesk'
import AdminPanel from './pages/portal/AdminPanel'

/** Scroll to #hash targets (e.g. /#services) and to top on page change. */
function ScrollManager() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (hash) {
      const t = setTimeout(() => document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' }), 60)
      return () => clearTimeout(t)
    }
    window.scrollTo(0, 0)
  }, [pathname, hash])
  return null
}

function NotFound() {
  return (
    <Page>
      <div className="mx-auto max-w-md py-16 text-center">
        <p className="text-6xl font-extrabold text-royal">404</p>
        <p className="mt-3 text-navy-600">This page doesn’t exist.</p>
        <Link to="/" className="mt-6 inline-flex rounded-2xl bg-navy px-6 py-3 font-bold text-white">Back home</Link>
      </div>
    </Page>
  )
}

export default function App() {
  return (
    <LangProvider>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2">
        Skip to content
      </a>
      <ScrollManager />
      <TopBar />
      <Navbar />
      <div id="main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/book" element={<Book />} />
          <Route path="/track" element={<Track />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/staff/login" element={<PortalLogin role="staff" />} />
          <Route path="/staff" element={<StaffDesk />} />
          <Route path="/admin/login" element={<PortalLogin role="admin" />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
      <Footer />
    </LangProvider>
  )
}
