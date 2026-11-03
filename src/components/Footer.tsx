import { Link } from 'react-router-dom'
import { ExternalLink, Phone, ShieldAlert } from 'lucide-react'
import { Logo } from './Navbar'

const cols: { title: string; links: { to: string; label: string; ext?: boolean }[] }[] = [
  {
    title: 'About PoliceFlow',
    links: [
      { to: '/about', label: 'About the proposal' },
      { to: '/#institution', label: 'Governance approach' },
      { to: '/#journey', label: 'How it works' },
      { to: '/contact', label: 'Contact' },
    ],
  },
  {
    title: 'Citizen Services',
    links: [
      { to: '/book', label: 'Book appointment' },
      { to: '/track', label: 'Track application' },
      { to: '/#stations', label: 'Police stations' },
      { to: 'https://cybercrime.gov.in/', label: 'Cybercrime portal', ext: true },
      { to: 'https://citizen.mahapolice.gov.in/', label: 'Maharashtra Police citizen portal', ext: true },
    ],
  },
  {
    title: 'Verification Information',
    links: [
      { to: '/book?service=passport', label: 'Passport verification' },
      { to: '/book?service=tenant', label: 'Tenant verification' },
      { to: '/book?service=character', label: 'Character verification' },
      { to: 'https://www.passportindia.gov.in/', label: 'Passport Seva', ext: true },
    ],
  },
  {
    title: 'Help & Support',
    links: [
      { to: '/#faq', label: 'FAQs' },
      { to: '/about#privacy', label: 'Privacy policy' },
      { to: '/about#terms', label: 'Terms and conditions' },
      { to: '/about#accessibility', label: 'Accessibility' },
    ],
  },
]

const helplines = [
  ['112', 'Emergency'], ['1091', 'Women'], ['1098', 'Child'], ['1930', 'Cyber'], ['14567', 'Senior citizens'], ['108', 'Ambulance'],
]

export default function Footer() {
  return (
    <footer className="bg-navy-900 text-slate-300">
      <div className="border-b border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-6 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-cyan">Emergency helplines · 24×7</p>
          <ul className="grid grid-cols-3 gap-2 sm:grid-cols-6 lg:flex lg:gap-6">
            {helplines.map(([n, l]) => (
              <li key={n}>
                <a href={`tel:${n}`} className="flex flex-col rounded-xl bg-white/5 px-3 py-2 hover:bg-white/10 lg:flex-row lg:items-baseline lg:gap-1.5 lg:bg-transparent lg:p-0">
                  <span className="flex items-center gap-1 text-base font-extrabold text-white"><Phone className="h-3 w-3 text-cyan" />{n}</span>
                  <span className="text-[11px]">{l}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:grid-cols-2 sm:px-6 lg:grid-cols-[1.3fr_repeat(4,1fr)] lg:px-8">
        <div className="sm:col-span-2 lg:col-span-1">
          <Logo light />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-400">
            A proposed smart-verification platform for appointments, document readiness and transparent tracking at the Navi Mumbai Police Commissionerate.
          </p>
        </div>
        {cols.map((c) => (
          <div key={c.title}>
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">{c.title}</h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              {c.links.map((l) => (
                <li key={l.label}>
                  {l.ext ? (
                    <a href={l.to} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:text-white">{l.label} <ExternalLink className="h-3 w-3" /></a>
                  ) : (
                    <Link to={l.to} className="hover:text-white">{l.label}</Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-6 text-xs leading-relaxed text-slate-500 sm:px-6 lg:flex-row lg:items-start lg:justify-between lg:px-8">
          <p className="flex max-w-3xl gap-2">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
            <span>
              <strong className="text-slate-300">Independent prototype.</strong> PoliceFlow is not an official website of Navi Mumbai Police, Maharashtra Police
              or any government body, and has not been endorsed by them. Appointments, stations and figures marked “Demo data” are synthetic. For official
              information visit{' '}
              <a className="text-slate-300 underline hover:text-white" href="https://www.navimumbaipolice.gov.in/" target="_blank" rel="noreferrer">navimumbaipolice.gov.in</a>.
            </span>
          </p>
          <p className="shrink-0">© {new Date().getFullYear()} PoliceFlow prototype</p>
        </div>
      </div>
    </footer>
  )
}
