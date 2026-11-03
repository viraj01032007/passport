import { Link } from 'react-router-dom'
import { Logo } from './Navbar'

export default function Footer() {
  return (
    <footer className="bg-navy-900 text-slate-300">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr] lg:px-8">
        <div>
          <Logo light />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-400">
            A proposed smart-governance platform for police verification appointments, document readiness and transparent tracking.
          </p>
        </div>
        <div>
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">Citizens</h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li><Link className="hover:text-white" to="/book">Book Appointment</Link></li>
            <li><Link className="hover:text-white" to="/track">Track Application</Link></li>
            <li><Link className="hover:text-white" to="/#how-it-works">How It Works</Link></li>
            <li><Link className="hover:text-white" to="/#faq">FAQs</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">Services</h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            <li>Passport Verification</li>
            <li>Tenant Verification</li>
            <li>Character Verification</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <p className="mx-auto max-w-7xl px-4 py-6 text-xs leading-relaxed text-slate-500 sm:px-6 lg:px-8">
          <strong className="text-slate-400">Disclaimer:</strong> PoliceFlow is a proposed prototype and is not an official portal of
          Navi Mumbai Police or any government body. Stations, figures and appointments shown are synthetic demonstration data. Always
          follow guidance from the official Passport Seva and police websites.
        </p>
      </div>
    </footer>
  )
}
