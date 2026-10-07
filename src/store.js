import { useEffect, useState } from 'react'

export const REQUIRED = {
  Incorporation: ['Certificate of Incorporation', 'Memorandum of Association', 'Articles of Association'],
  Ownership: ['Founder Agreement', 'Shareholders Agreement', 'ESOP Policy', 'Cap Table', 'Share Certificates'],
  'Intellectual Property': ['IP Assignment Agreement', 'Trademark Registration', 'Employee Invention Assignment'],
  Governance: ['Board Resolutions', 'Statutory Registers', 'Annual ROC Filings'],
  Regulatory: ['GST Certificate', 'PAN & TAN', 'Audited Financials', 'Income Tax Returns'],
}
export const CATS = Object.keys(REQUIRED)
const O = {
  'Shareholders Agreement': { expires: '2026-11-20', updated: '2024-08-18' },
  'ESOP Policy': { present: false, updated: '' },
  'Board Resolutions': { reviewed: 'attention', updated: '2024-06-11' },
  'Annual ROC Filings': { reviewed: 'attention', updated: '2024-10-30' },
  'GST Certificate': { expires: '2026-12-01', updated: '2026-01-05' },
}
const SEED = Object.entries(REQUIRED).flatMap(([category, names]) =>
  names.map((name) => ({ id: name, name, category, reviewed: 'verified', expires: '', updated: '2024-03-02', present: true, file: null, ...O[name] })))

export function usePersist(key, init) {
  const [v, setV] = useState(() => { try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : init } catch { return init } })
  const [err, setErr] = useState('')
  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(v)); setErr('') }
    catch { setErr('Browser storage is full. Delete a document or attach a smaller file.') }
  }, [key, v])
  return [v, setV, err]
}
export const useDocs = () => usePersist('atp.docs.v1', SEED)

export const today = () => new Date().toISOString().slice(0, 10)
export const daysLeft = (d) => Math.ceil((new Date(d) - new Date(today())) / 864e5)
export const fmt = (s) => (s ? new Date(s).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—')

export function status(d) {
  if (!d.present) return 'missing'
  if (d.reviewed === 'attention') return 'attention'
  if (d.expires) { const n = daysLeft(d.expires); if (n < 0) return 'attention'; if (n <= 60) return 'expiring' }
  return 'verified'
}
export const STATUS = {
  verified: ['Verified', 'bg-emerald-600'], expiring: ['Expiring soon', 'bg-amber-500'],
  attention: ['Needs attention', 'bg-red-600'], missing: ['Missing', 'bg-slate-400'],
}
export const counts = (docs) => {
  const c = { total: docs.length, verified: 0, expiring: 0, attention: 0, missing: 0 }
  docs.forEach((d) => c[status(d)]++); return c
}
export function readiness(docs) {
  const cats = CATS.map((name) => {
    const done = REQUIRED[name].filter((r) => docs.some((d) => d.name.trim().toLowerCase() === r.toLowerCase() && ['verified', 'expiring'].includes(status(d)))).length
    return { name, score: done, total: REQUIRED[name].length }
  })
  const s = cats.reduce((a, c) => a + c.score, 0), t = cats.reduce((a, c) => a + c.total, 0)
  return { cats, score: Math.round((s / t) * 100) }
}
export function download(d) {
  const a = document.createElement('a')
  if (d.file?.data) { a.href = d.file.data; a.download = d.file.name }
  else {
    const t = `${d.name}\nCategory: ${d.category}\nLast updated: ${fmt(d.updated)}\nExpires: ${fmt(d.expires)}\nStatus: ${STATUS[status(d)][0]}\n\nNo file is attached to this record.\n`
    a.href = URL.createObjectURL(new Blob([t], { type: 'text/plain' })); a.download = `${d.name}-record.txt`
  }
  a.click()
}
