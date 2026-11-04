import { useMemo, useState, type FormEvent, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Activity, BadgeCheck, Clock, Database, Download, FileQuestion, Globe, ImagePlus, LayoutDashboard, ListChecks, Plus, Save, Trash2, UserPlus, Users, X,
} from 'lucide-react'
import { allAppointments, seedSampleAppointments, serviceName, type Appointment, type Status } from '../../lib/store'
import { readLog } from '../../lib/audit'
import { addUser, listUsers, removeUser, setActive, setPassword, type Role, type Session } from '../../lib/auth'
import { NEWS_CATS, imageToDataUrl, updateContent, useContent, type NewsItem, type Profile, type SiteContent } from '../../lib/content'
import { useMediaUrl } from '../../lib/media'
import CenterUploader from '../../components/CenterUploader'
import { ApplicantPanel, PortalShell, RequireRole, StatusPill, fmtTime, useStoreTick } from './shared'

type Tab = 'overview' | 'applications' | 'activity' | 'staff' | 'website'
const TABS: { id: Tab; label: string; icon: typeof Activity }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'applications', label: 'Applications', icon: ListChecks },
  { id: 'activity', label: 'Activity log', icon: Activity },
  { id: 'staff', label: 'Staff accounts', icon: Users },
  { id: 'website', label: 'Website content', icon: Globe },
]

export default function AdminPanel() {
  return <RequireRole role="admin">{(s) => <Panel session={s} />}</RequireRole>
}

function Panel({ session }: { session: Session }) {
  useStoreTick()
  const [tab, setTab] = useState<Tab>('overview')
  const [open, setOpen] = useState<string | null>(null)
  const appts = allAppointments()
  const openAppt = appts.find((a) => a.id === open)

  const tabs = (
    <nav className="no-scrollbar -mb-px flex gap-1 overflow-x-auto" aria-label="Admin sections">
      {TABS.map((t) => (
        <button key={t.id} onClick={() => setTab(t.id)} aria-current={tab === t.id}
          className={`flex shrink-0 items-center gap-2 border-b-2 px-3 py-3 text-sm font-bold transition ${tab === t.id ? 'border-royal text-royal' : 'border-transparent text-slate-500 hover:text-navy'}`}>
          <t.icon className="h-4 w-4" /> {t.label}
        </button>
      ))}
    </nav>
  )

  return (
    <PortalShell session={session} title="Admin panel" tabs={tabs}>
      {tab === 'overview' && <Overview appts={appts} onOpen={setOpen} />}
      {tab === 'applications' && <Applications appts={appts} onOpen={setOpen} />}
      {tab === 'activity' && <ActivityLog />}
      {tab === 'staff' && <Staff session={session} />}
      {tab === 'website' && <Website session={session} />}

      <AnimatePresence>
        {openAppt && (
          <motion.div className="fixed inset-0 z-[60] flex justify-end bg-navy-900/50 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(null)}>
            <motion.aside
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 260 }}
              onClick={(e) => e.stopPropagation()}
              className="h-full w-full max-w-xl overflow-y-auto bg-canvas p-4 sm:p-6"
              role="dialog" aria-label={`Application ${openAppt.id}`}
            >
              <div className="mb-4 flex items-center justify-between">
                <p className="font-extrabold text-navy">Application</p>
                <button onClick={() => setOpen(null)} aria-label="Close" className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white"><X className="h-5 w-5" /></button>
              </div>
              <ApplicantPanel key={openAppt.id + openAppt.status} appt={openAppt} session={session} />
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </PortalShell>
  )
}

/* ---------------- Overview ---------------- */
function Overview({ appts, onOpen }: { appts: Appointment[]; onOpen: (id: string) => void }) {
  const count = (s: Status[]) => appts.filter((a) => s.includes(a.status)).length
  const today = new Date().toDateString()
  const acceptedToday = appts.filter((a) => a.acceptedAt && new Date(a.acceptedAt).toDateString() === today).length
  const tiles = [
    { label: 'Open files', value: count(['Confirmed', 'Checked in', 'Documents verified']), icon: Clock, tone: 'text-royal bg-royal/10' },
    { label: 'Info requested', value: count(['Info requested']), icon: FileQuestion, tone: 'text-amber-700 bg-amber-100' },
    { label: 'Accepted today', value: acceptedToday, icon: BadgeCheck, tone: 'text-emerald-700 bg-emerald-100' },
    { label: 'All applications', value: appts.length, icon: Database, tone: 'text-navy bg-slate-100' },
  ]
  const recent = readLog().filter((l) => l.action.includes('Accepted') || l.action.includes('Declined')).slice(0, 6)
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {tiles.map((t) => (
          <div key={t.label} className="rounded-2xl border border-slate-200 bg-white p-5">
            <span className={`grid h-10 w-10 place-items-center rounded-xl ${t.tone}`}><t.icon className="h-5 w-5" /></span>
            <p className="mt-3 text-3xl font-extrabold tabular-nums text-navy">{t.value}</p>
            <p className="text-sm font-semibold text-slate-500">{t.label}</p>
          </div>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Latest decisions">
          {recent.length === 0 ? <Empty>No files accepted or declined yet.</Empty> : (
            <ul className="divide-y divide-slate-100">
              {recent.map((l) => (
                <li key={l.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                  <span className="min-w-0">
                    <span className="block font-bold text-navy">{l.action} · <button className="font-mono text-royal" onClick={() => l.target && onOpen(l.target)}>{l.target}</button></span>
                    <span className="block text-xs text-slate-500">{l.name} (@{l.by}) · {fmtTime(l.at)}</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card title="Demo data">
          <p className="text-sm text-ink">Add eight synthetic appointments for tomorrow so staff can practise scanning and accepting files.</p>
          <button onClick={seedSampleAppointments} className="mt-4 flex items-center gap-2 rounded-xl bg-navy px-4 py-3 text-sm font-bold text-white hover:bg-royal">
            <Plus className="h-4 w-4" /> Load sample appointments
          </button>
        </Card>
      </div>
    </div>
  )
}

/* ---------------- Applications ---------------- */
function Applications({ appts, onOpen }: { appts: Appointment[]; onOpen: (id: string) => void }) {
  const [q, setQ] = useState('')
  const [st, setSt] = useState<Status | 'All'>('All')
  const list = appts.filter((a) => (st === 'All' || a.status === st) && (a.name + a.id + a.reference).toLowerCase().includes(q.toLowerCase()))
  const statuses: (Status | 'All')[] = ['All', 'Confirmed', 'Checked in', 'Documents verified', 'Info requested', 'Accepted', 'Declined', 'Cancelled']
  return (
    <Card title={`Applications (${list.length})`}>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, ID or reference" className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-royal" />
        <select value={st} onChange={(e) => setSt(e.target.value as Status | 'All')} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold">
          {statuses.map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>
      {list.length === 0 ? <Empty>No applications match. Use “Load sample appointments” on the Overview tab to try the flow.</Empty> : (
        <div className="-mx-5 overflow-x-auto px-5">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="text-xs uppercase tracking-wider text-slate-400">
              <tr><th className="py-2 pr-3">Applicant</th><th className="pr-3">Service</th><th className="pr-3">Slot</th><th className="pr-3">Status</th><th className="pr-3">Accepted by</th><th /></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {list.map((a) => (
                <tr key={a.id} className="hover:bg-canvas">
                  <td className="py-3 pr-3"><p className="font-bold text-navy">{a.name}</p><p className="font-mono text-xs text-slate-500">{a.id}</p></td>
                  <td className="pr-3">{serviceName(a.service)}</td>
                  <td className="whitespace-nowrap pr-3 tabular-nums">{a.date} {a.slot}</td>
                  <td className="pr-3"><StatusPill s={a.status} /></td>
                  <td className="pr-3 text-xs">{a.acceptedBy ? <>{a.acceptedBy}<br /><span className="text-slate-500">{fmtTime(a.acceptedAt!)}</span></> : <span className="text-slate-400">-</span>}</td>
                  <td className="text-right"><button onClick={() => onOpen(a.id)} className="rounded-lg border border-slate-200 px-3 py-1.5 font-bold text-royal hover:border-royal">Open</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  )
}

/* ---------------- Activity log ---------------- */
function ActivityLog() {
  const [who, setWho] = useState('all')
  const [kind, setKind] = useState<'all' | 'decisions' | 'signin' | 'website'>('all')
  const log = readLog()
  const people = Array.from(new Set(log.map((l) => l.by)))
  const list = log.filter((l) =>
    (who === 'all' || l.by === who) &&
    (kind === 'all' ||
      (kind === 'decisions' && /Accepted|Declined|Marked|Request/.test(l.action)) ||
      (kind === 'signin' && /Sign|login/i.test(l.action)) ||
      (kind === 'website' && /photo|notice|news|profile|guided|centre/i.test(l.action))))

  const exportCsv = () => {
    const rows = [['Time', 'Username', 'Name', 'Role', 'Action', 'Target', 'Note'], ...list.map((l) => [new Date(l.at).toISOString(), l.by, l.name, l.role, l.action, l.target ?? '', l.note ?? ''])]
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    a.download = `policeflow-activity-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
  }

  return (
    <Card title={`Activity log (${list.length})`} action={<button onClick={exportCsv} className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold text-navy hover:border-royal"><Download className="h-4 w-4" /> Export CSV</button>}>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <select value={who} onChange={(e) => setWho(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold">
          <option value="all">Everyone</option>
          {people.map((p) => <option key={p} value={p}>@{p}</option>)}
        </select>
        <select value={kind} onChange={(e) => setKind(e.target.value as typeof kind)} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold">
          <option value="all">All actions</option>
          <option value="decisions">File decisions</option>
          <option value="signin">Sign-ins</option>
          <option value="website">Website changes</option>
        </select>
      </div>
      {list.length === 0 ? <Empty>Nothing logged yet.</Empty> : (
        <div className="-mx-5 overflow-x-auto px-5">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead className="text-xs uppercase tracking-wider text-slate-400">
              <tr><th className="py-2 pr-3">When</th><th className="pr-3">Who</th><th className="pr-3">Action</th><th className="pr-3">File / item</th><th>Note</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {list.slice(0, 300).map((l) => (
                <tr key={l.id}>
                  <td className="whitespace-nowrap py-2.5 pr-3 tabular-nums text-slate-500">{fmtTime(l.at)}</td>
                  <td className="pr-3"><span className="font-bold text-navy">{l.name}</span> <span className="text-xs text-slate-500">@{l.by} · {l.role}</span></td>
                  <td className={`pr-3 font-semibold ${l.action.includes('Accepted') ? 'text-emerald-700' : l.action.includes('Declined') || l.action.includes('Failed') ? 'text-rose-700' : 'text-navy'}`}>{l.action}</td>
                  <td className="pr-3 font-mono text-xs">{l.target ?? '-'}</td>
                  <td className="text-xs text-ink">{l.note ?? ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  )
}

/* ---------------- Staff accounts ---------------- */
function Staff({ session }: { session: Session }) {
  const users = listUsers()
  const [form, setForm] = useState({ username: '', name: '', password: '', role: 'staff' as Role })
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [pw, setPw] = useState<Record<string, string>>({})

  const run = async (fn: () => unknown, ok: string) => {
    setMsg(null)
    try { await fn(); setMsg({ ok: true, text: ok }) } catch (e) { setMsg({ ok: false, text: (e as Error).message }) }
  }
  const add = (e: FormEvent) => {
    e.preventDefault()
    run(async () => { await addUser(session, form); setForm({ username: '', name: '', password: '', role: 'staff' }) }, 'Account added.')
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <Card title={`Accounts (${users.length})`}>
        <ul className="divide-y divide-slate-100">
          {users.map((u) => (
            <li key={u.username} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-bold text-navy">{u.name} <span className="text-xs font-semibold text-slate-500">@{u.username}</span></p>
                <p className="text-xs">
                  <span className={`rounded-full px-2 py-0.5 font-bold ${u.role === 'admin' ? 'bg-navy text-white' : 'bg-royal/10 text-royal'}`}>{u.role}</span>{' '}
                  <span className={u.active ? 'text-emerald-700' : 'text-rose-600'}>{u.active ? 'Active' : 'Disabled'}</span>
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <input type="password" placeholder="New password" value={pw[u.username] ?? ''} onChange={(e) => setPw({ ...pw, [u.username]: e.target.value })} className="w-36 rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm" autoComplete="new-password" />
                <button onClick={() => run(async () => { await setPassword(session, u.username, pw[u.username] ?? ''); setPw({ ...pw, [u.username]: '' }) }, `Password changed for @${u.username}.`)} className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm font-bold text-navy hover:border-royal">Set</button>
                {u.username !== session.username && (
                  <>
                    <button onClick={() => run(() => setActive(session, u.username, !u.active), u.active ? 'Account disabled.' : 'Account enabled.')} className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm font-bold text-navy hover:border-royal">{u.active ? 'Disable' : 'Enable'}</button>
                    <button onClick={() => run(() => removeUser(session, u.username), 'Account removed.')} aria-label={`Remove ${u.username}`} className="grid h-8 w-8 place-items-center rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50"><Trash2 className="h-4 w-4" /></button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      </Card>
      <Card title="Add account">
        <form onSubmit={add} className="space-y-3">
          <Input label="Full name or desk name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
          <Input label="Username" value={form.username} onChange={(v) => setForm({ ...form, username: v })} />
          <Input label="Password (8+ characters)" type="password" value={form.password} onChange={(v) => setForm({ ...form, password: v })} />
          <label className="block text-sm font-bold text-navy">Role
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as Role })} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 font-semibold">
              <option value="staff">Staff</option>
              <option value="admin">Head admin</option>
            </select>
          </label>
          <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-navy py-3 font-bold text-white hover:bg-royal"><UserPlus className="h-4 w-4" /> Add account</button>
        </form>
        {msg && <p role="status" className={`mt-4 rounded-xl px-3 py-2 text-sm font-semibold ${msg.ok ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-700'}`}>{msg.text}</p>}
      </Card>
    </div>
  )
}

/* ---------------- Website content ---------------- */
function Website({ session }: { session: Session }) {
  const content = useContent()
  const [notice, setNotice] = useState(content.notice)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [draft, setDraft] = useState<NewsItem>(blankNews())
  const editing = useMemo(() => content.news.some((n) => n.id === draft.id), [content.news, draft.id])

  const run = async (fn: () => unknown, ok: string) => {
    setMsg(null)
    try { await fn(); setMsg({ ok: true, text: ok }) } catch (e) { setMsg({ ok: false, text: (e as Error).message }) }
  }
  const saveNews = (e: FormEvent) => {
    e.preventDefault()
    run(() => {
      if (!draft.title.trim() || !draft.text.trim()) throw new Error('Add a headline and a short description.')
      const news = editing ? content.news.map((n) => (n.id === draft.id ? draft : n)) : [draft, ...content.news]
      updateContent(session, { news }, editing ? 'Edited news item' : 'Added news item', draft.title)
      setDraft(blankNews())
    }, editing ? 'News item updated.' : 'News item published.')
  }

  return (
    <div className="space-y-6">
      {msg && <p role="status" className={`rounded-xl px-4 py-3 text-sm font-semibold ${msg.ok ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-700'}`}>{msg.text}</p>}

      <Card title="Notice banner">
        <p className="mb-3 text-sm text-ink">Shown in a yellow strip at the top of the homepage. Leave empty to hide it.</p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input value={notice} onChange={(e) => setNotice(e.target.value)} maxLength={180} placeholder="e.g. Verification desk closed on 15 November for a public holiday." className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-royal" />
          <button onClick={() => run(() => updateContent(session, { notice }, notice ? 'Updated notice banner' : 'Removed notice banner'), 'Notice saved.')} className="flex items-center justify-center gap-2 rounded-xl bg-navy px-5 py-2.5 text-sm font-bold text-white hover:bg-royal"><Save className="h-4 w-4" /> Save</button>
        </div>
      </Card>

      <CenterMediaEditor session={session} onMsg={setMsg} />
      <ProfileSlots session={session} field="guides" title="“Guided by” section (below the hero)" hint="Six round photos with name and designation. Only add people and photos the department has authorised." onMsg={setMsg} />
      <ProfileSlots session={session} field="profiles" title="Right-column profile cards" hint="These scroll on the right of the homepage. Empty slots show a blank frame." onMsg={setMsg} />

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <Card title={`News & updates (${content.news.length})`}>
          {content.news.length === 0 ? <Empty>No news items. Add one with the form.</Empty> : (
            <ul className="divide-y divide-slate-100">
              {content.news.map((n) => (
                <li key={n.id} className="flex items-start gap-3 py-3">
                  <div className="h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-slate-100">{n.image && <img src={n.image} alt="" className="h-full w-full object-cover" />}</div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold text-navy">{n.title}</p>
                    <p className="text-xs text-slate-500">{n.cat} · {n.date}</p>
                  </div>
                  <button onClick={() => setDraft(n)} className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm font-bold text-navy hover:border-royal">Edit</button>
                  <button onClick={() => run(() => updateContent(session, { news: content.news.filter((x) => x.id !== n.id) }, 'Removed news item', n.title), 'News item removed.')} aria-label={`Remove ${n.title}`} className="grid h-9 w-9 place-items-center rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50"><Trash2 className="h-4 w-4" /></button>
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card title={editing ? 'Edit news item' : 'Add news item'}>
          <form onSubmit={saveNews} className="space-y-3">
            <Input label="Headline" value={draft.title} onChange={(v) => setDraft({ ...draft, title: v })} />
            <label className="block text-sm font-bold text-navy">Short description
              <textarea value={draft.text} onChange={(e) => setDraft({ ...draft, text: e.target.value })} rows={3} maxLength={220} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 font-normal outline-none focus:border-royal" />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block text-sm font-bold text-navy">Category
                <select value={draft.cat} onChange={(e) => setDraft({ ...draft, cat: e.target.value as NewsItem['cat'] })} className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-2 py-2.5 text-sm font-semibold">
                  {NEWS_CATS.map((c) => <option key={c}>{c}</option>)}
                </select>
              </label>
              <Input label="Date" type="date" value={draft.date} onChange={(v) => setDraft({ ...draft, date: v })} />
            </div>
            <div className="flex items-center gap-3">
              <label className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-slate-200 py-2.5 text-sm font-bold text-navy hover:border-royal">
                <ImagePlus className="h-4 w-4" /> {draft.image ? 'Change photo' : 'Add photo'}
                <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ''; if (f) run(async () => setDraft({ ...draft, image: await imageToDataUrl(f, 900, 0.75) }), 'Photo attached.') }} />
              </label>
              {draft.image && <button type="button" onClick={() => setDraft({ ...draft, image: undefined })} className="rounded-xl border border-rose-200 px-3 py-2.5 text-sm font-bold text-rose-600">Remove photo</button>}
            </div>
            {draft.image && <img src={draft.image} alt="" className="aspect-video w-full rounded-xl object-cover" />}
            <div className="flex gap-2">
              <button className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-navy py-3 font-bold text-white hover:bg-royal"><Save className="h-4 w-4" /> {editing ? 'Save changes' : 'Publish'}</button>
              {editing && <button type="button" onClick={() => setDraft(blankNews())} className="rounded-xl border border-slate-200 px-4 font-bold text-navy">Cancel</button>}
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
}

function ProfileSlots({ session, field, title, hint, onMsg }: { session: Session; field: 'profiles' | 'guides'; title: string; hint: string; onMsg: (m: { ok: boolean; text: string }) => void }) {
  const content = useContent()
  const list = content[field]
  const label = field === 'guides' ? 'Guided-by slot' : 'Profile slot'
  const patch = (v: Profile[]): Partial<SiteContent> => (field === 'guides' ? { guides: v } : { profiles: v })
  const run = (fn: () => void, ok: string) => { try { fn(); onMsg({ ok: true, text: ok }) } catch (e) { onMsg({ ok: false, text: (e as Error).message }) } }
  return (
    <Card title={title}>
      <p className="mb-4 text-sm text-ink">{hint}</p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((p, i) => (
          <ProfileEditor key={p.id} index={i} p={p}
            onSave={(next, action) => run(() => updateContent(session, patch(list.map((x) => (x.id === p.id ? next : x))), action, `${label} ${i + 1}`), `${label} ${i + 1} saved.`)}
            onError={(text) => onMsg({ ok: false, text })} />
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <button onClick={() => run(() => updateContent(session, patch([...list, { id: crypto.randomUUID(), name: '', role: '', dept: '' }]), `Added ${label.toLowerCase()}`), 'Slot added.')} className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-navy hover:border-royal"><Plus className="h-4 w-4" /> Add slot</button>
        {list.length > 1 && (
          <button onClick={() => run(() => updateContent(session, patch(list.slice(0, -1)), `Removed ${label.toLowerCase()}`), 'Last slot removed.')} className="flex items-center gap-2 rounded-xl border border-rose-200 px-4 py-2.5 text-sm font-bold text-rose-600 hover:bg-rose-50"><Trash2 className="h-4 w-4" /> Remove last slot</button>
        )}
      </div>
    </Card>
  )
}

function CenterMediaEditor({ session }: { session: Session; onMsg?: unknown }) {
  const { center } = useContent()
  const preview = useMediaUrl(center?.src)
  return (
    <Card title="Homepage centre: photo or video">
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="relative grid aspect-[4/3] place-items-center overflow-hidden rounded-2xl border border-slate-200 bg-canvas">
          {center && preview ? (
            center.kind === 'video'
              ? <video key={preview} src={preview} className={`h-full w-full ${center.fit === 'cover' ? 'object-cover' : 'object-contain'}`} autoPlay muted loop playsInline />
              : <img src={preview} alt="" className={`h-full w-full ${center.fit === 'cover' ? 'object-cover' : 'object-contain p-4'}`} />
          ) : <p className="px-6 text-center text-sm font-semibold text-slate-400">Empty: the homepage shows a blank frame</p>}
          <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-bold text-navy shadow-sm">Live preview</span>
        </div>
        <CenterUploader session={session} />
      </div>
    </Card>
  )
}

function ProfileEditor({ index, p, onSave, onError }: { index: number; p: Profile; onSave: (p: Profile, action: string) => void; onError: (t: string) => void }) {
  const [d, setD] = useState(p)
  const dirty = d.name !== p.name || d.role !== p.role || d.dept !== p.dept || d.image !== p.image
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="relative aspect-[4/3] bg-slate-100">
        {d.image ? <img src={d.image} alt="" className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center text-xs font-semibold text-slate-400">Empty slot</div>}
        <span className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-0.5 text-[11px] font-bold text-navy">Slot {index + 1}</span>
      </div>
      <div className="space-y-2 p-3">
        <input value={d.name} onChange={(e) => setD({ ...d, name: e.target.value })} placeholder="Name" className="w-full rounded-lg border border-slate-200 px-2.5 py-2 text-sm" />
        <input value={d.role} onChange={(e) => setD({ ...d, role: e.target.value })} placeholder="Designation" className="w-full rounded-lg border border-slate-200 px-2.5 py-2 text-sm" />
        <input value={d.dept} onChange={(e) => setD({ ...d, dept: e.target.value })} placeholder="Department" className="w-full rounded-lg border border-slate-200 px-2.5 py-2 text-sm" />
        <div className="flex gap-2">
          <label className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-slate-200 py-2 text-sm font-bold text-navy hover:border-royal">
            <ImagePlus className="h-4 w-4" /> Photo
            <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={async (e) => { const f = e.target.files?.[0]; e.target.value = ''; if (!f) return; try { setD({ ...d, image: await imageToDataUrl(f, 700, 0.8) }) } catch (x) { onError((x as Error).message) } }} />
          </label>
          {(d.image || d.name) && <button onClick={() => { const empty = { id: p.id, name: '', role: '', dept: '' }; setD(empty); onSave(empty, 'Cleared profile slot') }} className="rounded-lg border border-rose-200 px-2.5 text-sm font-bold text-rose-600">Clear</button>}
        </div>
        <button disabled={!dirty} onClick={() => onSave(d, d.image !== p.image ? 'Updated profile photo' : 'Edited profile')} className="w-full rounded-lg bg-navy py-2 text-sm font-bold text-white hover:bg-royal disabled:opacity-40">Save</button>
      </div>
    </div>
  )
}

function blankNews(): NewsItem {
  return { id: crypto.randomUUID(), cat: 'Important Announcements', date: new Date().toISOString().slice(0, 10), title: '', text: '' }
}

/* ---------------- bits ---------------- */
function Card({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-card">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="font-extrabold text-navy">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  )
}
function Empty({ children }: { children: ReactNode }) {
  return <p className="rounded-2xl bg-canvas p-6 text-center text-sm text-slate-500">{children}</p>
}
function Input({ label, value, onChange, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <label className="block text-sm font-bold text-navy">{label}
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} autoComplete={type === 'password' ? 'new-password' : 'off'} className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 font-normal outline-none focus:border-royal focus:ring-4 focus:ring-royal/10" />
    </label>
  )
}
