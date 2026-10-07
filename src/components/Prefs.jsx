import { useEffect, useRef, useState } from 'react'
import { SlidersHorizontal } from 'lucide-react'

export function useTheme(theme) {
  const mq = () => matchMedia('(prefers-color-scheme: dark)')
  const calc = () => theme === 'dark' || (theme === 'system' && mq().matches)
  const [dark, setDark] = useState(calc)
  useEffect(() => {
    const u = () => { const d = calc(); setDark(d); document.documentElement.classList.toggle('dark', d) }
    u(); const m = mq(); m.addEventListener('change', u); return () => m.removeEventListener('change', u)
  }, [theme])
  return dark
}

export const Switch = ({ checked, onChange, label, hint }) => (
  <button role="switch" aria-checked={checked} onClick={() => onChange(!checked)} className="flex w-full items-center justify-between gap-4 whitespace-nowrap py-2.5 text-left text-sm">
    <span><span className="block font-medium">{label}</span>{hint && <span className="block whitespace-normal text-xs text-slate-500 dark:text-slate-400">{hint}</span>}</span>
    <span className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${checked ? 'bg-accent' : 'bg-slate-300'}`}>
      <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-[#ffffff] transition-all ${checked ? 'left-[18px]' : 'left-0.5'}`} />
    </span>
  </button>
)

export function Prefs({ prefs, set }) {
  const [o, setO] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    if (!o) return
    const m = (e) => !ref.current?.contains(e.target) && setO(false)
    const k = (e) => e.key === 'Escape' && setO(false)
    document.addEventListener('mousedown', m); document.addEventListener('keydown', k)
    return () => { document.removeEventListener('mousedown', m); document.removeEventListener('keydown', k) }
  }, [o])
  return (
    <div ref={ref} className="relative">
      <button aria-label="Preferences" aria-expanded={o} onClick={() => setO(!o)} className="rounded p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"><SlidersHorizontal size={18} /></button>
      {o && (
        <div className="absolute right-0 top-full z-50 mt-2 w-72 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 shadow-lg">
          <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Theme</p>
          <div role="radiogroup" aria-label="Theme" className="mt-2 grid grid-cols-3 gap-1 rounded-md bg-slate-100 dark:bg-slate-800 p-1">
            {['light', 'dark', 'system'].map((t) => (
              <button key={t} role="radio" aria-checked={prefs.theme === t} onClick={() => set({ theme: t })} className={`rounded px-2 py-1 text-sm capitalize ${prefs.theme === t ? 'bg-white dark:bg-slate-900 font-medium shadow-sm' : 'text-slate-600 dark:text-slate-400'}`}>{t}</button>
            ))}
          </div>
          <div className="mt-3 divide-y divide-slate-200 dark:divide-slate-700 border-t border-slate-200 dark:border-slate-700">
            <Switch checked={prefs.compact} onChange={(v) => set({ compact: v })} label="Compact rows" hint="Fit more documents on screen." />
            <Switch checked={prefs.actionOnly} onChange={(v) => set({ actionOnly: v })} label="Needs action only" hint="Hide verified documents." />
          </div>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Press D to switch light and dark.</p>
        </div>)}
    </div>
  )
}
