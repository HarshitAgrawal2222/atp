import { useEffect, useState } from 'react'
import { Bell, Moon, Sun } from 'lucide-react'
import { Prefs, useTheme } from './components/Prefs'
import Founder from './components/Founder'
import Investor from './components/Investor'
import { DocForm, Reminders, Share, Viewer } from './components/Modals'
import { daysLeft, useDocs, usePersist } from './store'

export default function App() {
  const [docs, setDocs, err] = useDocs()
  const [view, setView] = usePersist('atp.view', 'founder')
  const [share, setShare] = usePersist('atp.share', null)
  const [modal, setModal] = useState(null)
  const [prefs, setPrefs0] = usePersist('atp.prefs', { theme: 'system', compact: false, actionOnly: false })
  const setPrefs = (p) => setPrefs0((x) => ({ ...x, ...p }))
  const dark = useTheme(prefs.theme)
  useEffect(() => {
    const h = (e) => {
      if (e.key.toLowerCase() !== 'd' || e.metaKey || e.ctrlKey || e.altKey || /input|select|textarea/i.test(e.target.tagName)) return
      setPrefs({ theme: dark ? 'light' : 'dark' })
    }
    window.addEventListener('keydown', h); return () => window.removeEventListener('keydown', h)
  }, [dark])
  const close = () => setModal(null)
  const save = (d) => { setDocs((p) => (p.some((x) => x.id === d.id) ? p.map((x) => (x.id === d.id ? d : x)) : [...p, d])); close() }
  const remove = (id) => setDocs((p) => p.filter((d) => d.id !== id))
  const due = docs.filter((d) => d.present && d.expires && daysLeft(d.expires) <= 60).length
  const tab = (k, t) => (
    <button role="tab" aria-selected={view === k} onClick={() => setView(k)} className={`rounded px-4 py-1.5 text-sm font-medium ${view === k ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'}`}>{t}</button>
  )
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2.5"><span className="grid h-8 w-8 place-items-center rounded bg-ink dark:bg-accent text-xs font-semibold text-white">ATP</span><span className="hidden font-semibold sm:block">Legal Records</span></div>
          <div role="tablist" aria-label="View" className="flex rounded-md bg-slate-100 dark:bg-slate-800 p-1">{tab('founder', 'Founder view')}{tab('investor', 'Investor view')}</div>
          <div className="flex items-center gap-1">
          <button onClick={() => setPrefs({ theme: dark ? 'light' : 'dark' })} aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'} title="Toggle theme (D)" className="rounded p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">{dark ? <Sun size={18} /> : <Moon size={18} />}</button>
          <Prefs prefs={prefs} set={setPrefs} />
          <button onClick={() => setModal({ type: 'remind' })} aria-label={`Reminders, ${due} due`} className="relative rounded p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
            <Bell size={18} />{due > 0 && <span className="absolute right-0.5 top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-red-600 px-1 text-[10px] font-medium text-white">{due}</span>}
          </button>
          </div>
        </div>
      </header>
      {err && <p role="alert" className="bg-red-50 dark:bg-red-950/40 dark:text-red-300 px-4 py-2 text-center text-sm text-red-700">{err}</p>}
      <main>{view === 'founder' ? <Founder docs={docs} open={setModal} remove={remove} prefs={prefs} setPrefs={setPrefs} /> : <Investor docs={docs} open={setModal} />}</main>
      {modal?.type === 'form' && <DocForm doc={modal.doc} onSave={save} onClose={close} />}
      {modal?.type === 'view' && <Viewer doc={modal.doc} onClose={close} />}
      {modal?.type === 'remind' && <Reminders docs={docs} onClose={close} onRenew={(d) => setModal({ type: 'form', doc: d })} />}
      {modal?.type === 'share' && <Share share={share} setShare={setShare} onClose={close} />}
    </div>
  )
}
