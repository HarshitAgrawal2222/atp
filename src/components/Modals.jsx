import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { CATS, STATUS, daysLeft, download, fmt, status, today } from '../store'

export function Modal({ title, onClose, children, wide }) {
  useEffect(() => { const h = (e) => e.key === 'Escape' && onClose(); window.addEventListener('keydown', h); return () => window.removeEventListener('keydown', h) }, [onClose])
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/40 p-4 pt-20" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div role="dialog" aria-modal="true" aria-label={title} className={`w-full ${wide ? 'max-w-3xl' : 'max-w-md'} rounded-lg bg-white dark:bg-slate-900 shadow-xl`}>
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 px-5 py-3.5">
          <h2 className="font-semibold">{title}</h2>
          <button onClick={onClose} aria-label="Close" className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"><X size={18} /></button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}

export function Dot({ s }) {
  return <span className="inline-flex items-center gap-2 text-sm"><span className={`h-2 w-2 rounded-full ${STATUS[s][1]}`} />{STATUS[s][0]}</span>
}

export function DocForm({ doc, onSave, onClose }) {
  const [f, setF] = useState({ name: doc?.name || '', category: doc?.category || CATS[0], expires: doc?.expires || '', reviewed: doc?.reviewed || 'verified' })
  const [file, setFile] = useState(null)
  const [err, setErr] = useState('')
  const pick = (e) => {
    const x = e.target.files[0]; if (!x) return
    if (x.size > 1.5 * 1024 * 1024) { setErr('File is larger than 1.5 MB, the limit for browser storage.'); e.target.value = ''; return }
    const r = new FileReader()
    r.onload = () => { setFile({ name: x.name, type: x.type, size: x.size, data: r.result }); setErr('') }
    r.readAsDataURL(x)
  }
  const submit = (e) => {
    e.preventDefault()
    if (!f.name.trim()) return setErr('Enter a document name.')
    const present = !!(file || doc?.present)
    onSave({ ...(doc || { id: String(Date.now()) }), ...f, name: f.name.trim(), present, file: file || doc?.file || null, updated: file || !doc ? today() : doc.updated })
  }
  const L = ({ t, children }) => <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t}<div className="mt-1 font-normal">{children}</div></label>
  return (
    <Modal title={doc ? (doc.present ? 'Edit document' : 'Upload document') : 'Add document'} onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <L t="Document name"><input className="field" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} list="req" /></L>
        <L t="Category"><select className="field" value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })}>{CATS.map((c) => <option key={c}>{c}</option>)}</select></L>
        <div className="grid grid-cols-2 gap-3">
          <L t="Expiry date (optional)"><input type="date" className="field" value={f.expires} onChange={(e) => setF({ ...f, expires: e.target.value })} /></L>
          <L t="Review"><select className="field" value={f.reviewed} onChange={(e) => setF({ ...f, reviewed: e.target.value })}><option value="verified">Verified</option><option value="attention">Needs attention</option></select></L>
        </div>
        <L t={doc?.file ? `File (current: ${doc.file.name})` : 'File (PDF or image, up to 1.5 MB)'}><input type="file" accept=".pdf,image/*,.doc,.docx" onChange={pick} className="block w-full text-sm" /></L>
        {err && <p role="alert" className="text-sm text-red-600">{err}</p>}
        <div className="flex justify-end gap-2 pt-1"><button type="button" className="btn" onClick={onClose}>Cancel</button><button className="btn btn-primary">Save</button></div>
      </form>
    </Modal>
  )
}

export function Viewer({ doc, onClose }) {
  const s = status(doc), fl = doc.file
  const rows = [['Category', doc.category], ['Status', <Dot s={s} />], ['Last updated', fmt(doc.updated)], ['Expires', fmt(doc.expires)], ['File', fl ? `${fl.name} (${Math.round(fl.size / 1024)} KB)` : 'No file attached']]
  return (
    <Modal title={doc.name} onClose={onClose} wide>
      <dl className="grid grid-cols-[130px_1fr] gap-y-2 text-sm">{rows.map(([k, v]) => <div key={k} className="contents"><dt className="text-slate-500 dark:text-slate-400">{k}</dt><dd>{v}</dd></div>)}</dl>
      {fl?.type?.startsWith('image/') && <img src={fl.data} alt={doc.name} className="mt-4 max-h-96 rounded border border-slate-200 dark:border-slate-700" />}
      {fl?.type === 'application/pdf' && <iframe title={doc.name} src={fl.data} className="mt-4 h-96 w-full rounded border border-slate-200 dark:border-slate-700" />}
      <div className="mt-5 flex justify-end"><button className="btn btn-primary" disabled={!doc.present} onClick={() => download(doc)}>Download</button></div>
    </Modal>
  )
}

export function Reminders({ docs, onClose, onRenew }) {
  const list = docs.filter((d) => d.present && d.expires && daysLeft(d.expires) <= 60).sort((a, b) => a.expires.localeCompare(b.expires))
  return (
    <Modal title="Renewal reminders" onClose={onClose} wide>
      {!list.length ? <p className="text-sm text-slate-600 dark:text-slate-400">Nothing expires in the next 60 days.</p> : (
        <ul className="divide-y divide-slate-200 dark:divide-slate-700">{list.map((d) => { const n = daysLeft(d.expires); return (
          <li key={d.id} className="flex items-center justify-between gap-4 py-3">
            <div><p className="font-medium">{d.name}</p><p className="text-sm text-slate-500 dark:text-slate-400">{n < 0 ? `Expired ${-n} days ago` : `Expires in ${n} days`} · {fmt(d.expires)}</p></div>
            <button className="btn" onClick={() => onRenew(d)}>Renew</button>
          </li>) })}</ul>)}
    </Modal>
  )
}

export function Share({ share, setShare, onClose }) {
  const [copied, setCopied] = useState(false)
  const link = share ? `${location.origin}${location.pathname}#/data-room/${share.token}` : ''
  const make = () => setShare({ token: Math.random().toString(36).slice(2, 10) + Date.now().toString(36), created: today() })
  const copy = async () => { try { await navigator.clipboard.writeText(link); setCopied(true); setTimeout(() => setCopied(false), 1800) } catch { /* clipboard unavailable */ } }
  return (
    <Modal title="Share investor summary" onClose={onClose}>
      {!share ? <><p className="text-sm text-slate-600 dark:text-slate-400">Create a private link to this readiness summary. Revoke it at any time.</p><button className="btn btn-primary mt-4" onClick={make}>Create link</button></> : (
        <>
          <p className="text-sm text-slate-600 dark:text-slate-400">Link created {fmt(share.created)}.</p>
          <input readOnly value={link} onFocus={(e) => e.target.select()} className="field mt-2" />
          <div className="mt-4 flex gap-2"><button className="btn btn-primary" onClick={copy}>{copied ? 'Copied' : 'Copy link'}</button><button className="btn" onClick={make}>Regenerate</button><button className="btn" onClick={() => setShare(null)}>Revoke</button></div>
        </>)}
    </Modal>
  )
}
