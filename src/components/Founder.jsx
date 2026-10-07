import { useMemo, useState } from 'react'
import { Plus, Search, Eye, Download, Pencil, Trash2, Bell } from 'lucide-react'
import { CATS, counts, daysLeft, download, fmt, status } from '../store'
import { Dot } from './Modals'
import { Switch } from './Prefs'

export default function Founder({ docs, open, remove, prefs, setPrefs }) {
  const [q, setQ] = useState('')
  const [cat, setCat] = useState('All')
  const rows = useMemo(() => docs.filter((d) => d.name.toLowerCase().includes(q.toLowerCase()) && (cat === 'All' || d.category === cat) && (!prefs.actionOnly || status(d) !== 'verified')), [docs, q, cat, prefs.actionOnly])
  const c = counts(docs)
  const due = docs.filter((d) => d.present && d.expires && daysLeft(d.expires) <= 60).length
  const stat = [['Total documents', c.total], ['Verified', c.verified], ['Expiring soon', c.expiring], ['Needs attention', c.attention], ['Missing', c.missing]]
  const ic = 'rounded p-1.5 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div><h1 className="text-2xl font-semibold">Documents</h1><p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Corporate records and their current status.</p></div>
        <button className="btn btn-primary" onClick={() => open({ type: 'form' })}><Plus size={16} /> Add document</button>
      </div>
      <dl className="grid grid-cols-2 divide-x divide-slate-200 dark:divide-slate-700 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 sm:grid-cols-5">
        {stat.map(([k, v]) => <div key={k} className="px-4 py-3.5"><dt className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{k}</dt><dd className="mt-1 text-2xl font-semibold tabular-nums">{v}</dd></div>)}
      </dl>
      {due > 0 && (
        <div className="flex items-center justify-between rounded-lg border border-amber-300 bg-amber-50 dark:border-amber-700/50 dark:bg-amber-950/30 px-4 py-3 text-sm">
          <span className="flex items-center gap-2"><Bell size={16} className="text-amber-700" />{due} document{due > 1 && 's'} expire within 60 days.</span>
          <button className="font-medium text-accent dark:text-blue-400 hover:underline" onClick={() => open({ type: 'remind' })}>View reminders</button>
        </div>)}
      <div className="flex flex-col gap-3 sm:flex-row">
        <label className="relative flex-1"><span className="sr-only">Search documents</span><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input className="field pl-9" placeholder="Search documents" value={q} onChange={(e) => setQ(e.target.value)} /></label>
        <label><span className="sr-only">Category</span><select className="field sm:w-56" value={cat} onChange={(e) => setCat(e.target.value)}>{['All', ...CATS].map((x) => <option key={x} value={x}>{x === 'All' ? 'All categories' : x}</option>)}</select></label>
        <div className="rounded-md border border-slate-300 dark:border-slate-600 px-3"><Switch checked={prefs.actionOnly} onChange={(v) => setPrefs({ actionOnly: v })} label="Needs action only" /></div>
      </div>
      <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
        <table className={`w-full min-w-[640px] text-left text-sm ${prefs.compact ? 'compact' : ''}`}>
          <thead className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400"><tr>{['Document', 'Category', 'Status', 'Updated', ''].map((h) => <th key={h} className="px-4 py-2.5 font-medium">{h}</th>)}</tr></thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {rows.map((d) => (
              <tr key={d.id} className="hover:bg-slate-50 dark:hover:bg-slate-800">
                <td className="px-4 py-3 font-medium">{d.name}</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{d.category}</td>
                <td className="px-4 py-3"><Dot s={status(d)} /></td>
                <td className="px-4 py-3 tabular-nums text-slate-600 dark:text-slate-400">{fmt(d.updated)}</td>
                <td className="px-4 py-2"><div className="flex justify-end">
                  {d.present ? <>
                    <button className={ic} aria-label={`View ${d.name}`} onClick={() => open({ type: 'view', doc: d })}><Eye size={16} /></button>
                    <button className={ic} aria-label={`Download ${d.name}`} onClick={() => download(d)}><Download size={16} /></button>
                  </> : <button className="mr-1 text-sm font-medium text-accent dark:text-blue-400 hover:underline" onClick={() => open({ type: 'form', doc: d })}>Upload</button>}
                  <button className={ic} aria-label={`Edit ${d.name}`} onClick={() => open({ type: 'form', doc: d })}><Pencil size={16} /></button>
                  <button className={ic} aria-label={`Delete ${d.name}`} onClick={() => confirm(`Delete "${d.name}"?`) && remove(d.id)}><Trash2 size={16} /></button>
                </div></td>
              </tr>))}
            {!rows.length && <tr><td colSpan="5" className="px-4 py-10 text-center text-slate-500 dark:text-slate-400">No documents match your search.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
