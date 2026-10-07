import { Share2 } from 'lucide-react'
import { counts, readiness, status } from '../store'

function Ring({ score }) {
  const r = 54, c = 2 * Math.PI * r
  return (
    <svg viewBox="0 0 140 140" className="h-40 w-40 -rotate-90" role="img" aria-label={`Readiness ${score} out of 100`}>
      <circle cx="70" cy="70" r={r} fill="none" className="stroke-slate-200 dark:stroke-slate-700" strokeWidth="10" />
      <circle cx="70" cy="70" r={r} fill="none" className="stroke-ink dark:stroke-slate-100" strokeWidth="10" strokeDasharray={c} strokeDashoffset={c * (1 - score / 100)} />
      <text x="70" y="70" textAnchor="middle" dominantBaseline="central" transform="rotate(90 70 70)" className="fill-slate-900 dark:fill-slate-100 text-[34px] font-semibold">{score}</text>
    </svg>
  )
}

export default function Investor({ docs, open }) {
  const r = readiness(docs), c = counts(docs)
  const issues = docs.filter((d) => status(d) !== 'verified').sort((a, b) => (status(a) === 'missing' ? -1 : 1) - (status(b) === 'missing' ? -1 : 1))
  const label = { missing: 'This document is missing. Investors expect it before closing a round.', attention: 'Flagged for review. Outdated or incomplete records raise diligence questions.', expiring: 'Expires soon. Renew before it lapses during diligence.' }
  const act = (d) => open({ type: 'form', doc: d })
  const verdict = r.score >= 90 ? 'Ready for diligence' : r.score >= 70 ? 'Nearly ready' : 'Not yet ready'
  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div><h1 className="text-2xl font-semibold">Investor readiness</h1><p className="mt-1 text-sm text-slate-600 dark:text-slate-400">How your records appear to an investor’s counsel during diligence.</p></div>
        <button className="btn" onClick={() => open({ type: 'share' })}><Share2 size={16} /> Share summary</button>
      </div>
      <section className="grid gap-6 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 md:grid-cols-[auto_1fr]">
        <div className="flex flex-col items-center gap-2"><Ring score={r.score} /><p className="text-sm font-medium">{verdict}</p></div>
        <ul className="divide-y divide-slate-100 dark:divide-slate-800 self-center">
          {r.cats.map((x) => (
            <li key={x.name} className="flex items-center justify-between gap-4 py-3 text-sm">
              <span className="font-medium">{x.name}</span>
              <span className="flex items-center gap-3"><span className="hidden h-1.5 w-32 rounded bg-slate-200 sm:block"><span className="block h-full rounded bg-ink dark:bg-slate-200" style={{ width: `${(x.score / x.total) * 100}%` }} /></span><span className="w-10 text-right tabular-nums text-slate-600 dark:text-slate-400">{x.score}/{x.total}</span></span>
            </li>))}
        </ul>
      </section>
      <dl className="grid divide-y divide-slate-200 dark:divide-slate-700 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        {[['Verified', c.verified, 'Ready for the data room'], ['Needs attention', c.attention + c.expiring, 'May prompt questions'], ['Missing', c.missing, 'May delay closing']].map(([k, v, s]) => (
          <div key={k} className="px-5 py-4"><dt className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{k}</dt><dd className="mt-1 text-3xl font-semibold tabular-nums">{v}</dd><p className="text-sm text-slate-500 dark:text-slate-400">{s}</p></div>))}
      </dl>
      <section>
        <div className="mb-3 flex items-center justify-between"><h2 className="text-lg font-semibold">Issues to resolve</h2>{issues[0] && <button className="btn btn-primary" onClick={() => act(issues[0])}>Resolve first item</button>}</div>
        {!issues.length ? <p className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 text-sm text-slate-600 dark:text-slate-400">No open issues.</p> : (
          <ul className="divide-y divide-slate-200 dark:divide-slate-700 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
            {issues.map((d) => { const s = status(d); return (
              <li key={d.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex gap-3"><span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${s === 'missing' ? 'bg-slate-400' : s === 'attention' ? 'bg-red-600' : 'bg-amber-500'}`} /><div><p className="font-medium">{d.name}</p><p className="text-sm text-slate-600 dark:text-slate-400">{label[s]}</p></div></div>
                <button className="btn" onClick={() => act(d)}>{s === 'missing' ? 'Upload' : 'Update'}</button>
              </li>) })}
          </ul>)}
      </section>
    </div>
  )
}
