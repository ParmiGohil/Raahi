'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { UploadCloud, FileText, PenLine, Plus, Check, Trash2, ShieldCheck } from 'lucide-react';
import type { Segment } from '../domain/types';
import { baseline } from '../fixtures/trip';
import { formatMoney, time } from '../engine/recover';
import { organizeBookings } from '../engine/organize';
import { parseBookingText, type ExtractedBooking } from '../domain/pdf-booking';
import { readPdf } from './pdf-reader';
import { PdfPreview } from './pdf-preview';
import { useTrip } from './trip-provider';
import { PageHeading, LoadingTrip } from './journey-pages';
const localDate = (iso: string) => new Date(Date.parse(iso) + 330 * 60000).toISOString().slice(0, 16);
type Form = { title: string; kind: Segment['kind']; from: string; to: string; start: string; end: string; reference: string; cost: string; priority: boolean; fixedTime: boolean; durationUnknown: boolean; locationUnknown: boolean; flexible: boolean; requires: string; deadline: string; cutoff: string; latest: string; buffer: string };
const empty: Form = { title: '', kind: 'flight', from: '', to: '', start: '', end: '', reference: '', cost: '0', priority: false, fixedTime: true, durationUnknown: false, locationUnknown: false, flexible: false, requires: 'auto', deadline: '', cutoff: '', latest: '', buffer: '30' };
function fromSegment(s: Segment): Form {
  return { title: s.title, kind: s.kind, from: s.from, to: s.to, start: localDate(s.start), end: localDate(s.end), reference: s.reference ?? '', cost: s.cost === undefined ? '' : String(s.cost / 100), priority: !!s.priority, fixedTime: s.fixedTime ?? !s.flexible, durationUnknown: !!s.durationUnknown, locationUnknown: !!s.locationUnknown, flexible: !!s.flexible, requires: s.connectionMode === 'independent' ? 'none' : s.connectionMode === 'auto' ? 'auto' : s.requires[0] ?? 'auto', deadline: s.changeDeadline ? localDate(s.changeDeadline) : '', cutoff: s.cutoff ? localDate(s.cutoff) : '', latest: s.windowEnd ? localDate(s.windowEnd) : '', buffer: String(s.recommendedBuffer ?? 30) };
}
type PdfFile = { file: File; url: string };
type ReviewItem = ExtractedBooking & { filename: string; sample?: boolean };
export function AddItineraryPage() {
  const { data, busy, mutate } = useTrip(); const router = useRouter();
  const [tab, setTab] = useState<'manual' | 'pdf'>('manual');
  const [form, setForm] = useState<Form>(empty); const [editing, setEditing] = useState<string | null>(null);
  const [message, setMessage] = useState(''); const [files, setFiles] = useState<PdfFile[]>([]);
  const [activePdf, setActivePdf] = useState(0); const [queue, setQueue] = useState<ReviewItem[]>([]);
  const [confirmed, setConfirmed] = useState(false); const [reading, setReading] = useState(false);
  const [dragging, setDragging] = useState(false); const [restored, setRestored] = useState(false);
  const [sourceText, setSourceText] = useState(''); const [confirmAll, setConfirmAll] = useState(false); const urls = useRef<string[]>([]);
  const formRef = useRef<HTMLFormElement>(null);
  const reviewing = queue[0];
  useEffect(() => {
    try { const saved = sessionStorage.getItem('raahi-booking-form-v2'); if (saved) { const draft = JSON.parse(saved); setForm({ ...empty, ...draft.form }); setEditing(draft.editing ?? null); } } catch { /* Storage may be unavailable. Server-saved bookings are unaffected. */ }
    setRestored(true);
    return () => urls.current.forEach(url => URL.revokeObjectURL(url));
  }, []);
  useEffect(() => { if (restored && !reviewing) { try { sessionStorage.setItem('raahi-booking-form-v2', JSON.stringify({ form, editing })); } catch { /* Optional draft memory. */ } } }, [form, editing, restored, reviewing]);
  if (!data) return <LoadingTrip />;
  const saved = data.state.mode === 'personal' ? data.state.applied?.segments ?? data.state.bookings ?? [] : [];
  function update<K extends keyof Form>(key: K, value: Form[K]) { setForm(f => ({ ...f, [key]: value, ...(key === 'kind' ? { fixedTime: true, flexible: false } : {}) })); }
  function takeFiles(input: FileList | File[]) {
    const list = Array.from(input); if (!list.length) return;
    if (list.some(f => !f.name.toLowerCase().endsWith('.pdf') || f.size > 10 * 1024 * 1024) || list.length > 10) { setMessage('Choose up to 10 PDFs, each under 10 MB.'); return; }
    urls.current.forEach(url => URL.revokeObjectURL(url));
    const chosen = list.map(file => ({ file, url: URL.createObjectURL(file) })); urls.current = chosen.map(f => f.url);
    setFiles(chosen); setActivePdf(0); setQueue([]); setSourceText(''); setMessage('PDFs stay in this browser. Extract details, then compare them with the original before saving.');
  }
  function showReview(items: ReviewItem[]) { setQueue(items); setConfirmAll(false); if (items[0]) setForm({ ...empty, ...items[0], priority: items[0].kind === 'activity', fixedTime: true }); setEditing(null); setConfirmed(false); }
  async function extract() {
    setReading(true); setMessage('Reading the document text…');
    const items: ReviewItem[] = []; const errors: string[] = []; const texts: string[] = [];
    for (const { file } of files) {
      try { const text = await readPdf(file); texts.push(`${file.name}\n${text}`); items.push(...parseBookingText(text).map(item => ({ ...item, filename: file.name }))); }
      catch (error) { errors.push(`${file.name}: ${error instanceof Error ? error.message : 'Could not read this PDF.'}`); }
    }
    setSourceText(texts.join('\n\n')); showReview(items); setReading(false);
    setMessage([items.length ? `${items.length} document section(s) ready for review. Uncertain fields are left blank. Dates without a timezone must be verified as IST.` : 'No booking details were extracted.', ...errors].join(' '));
  }
  function sample() {
    const s = baseline()[0];
    showReview([{ title: s.title, kind: 'flight', from: s.from, to: s.to, start: localDate(s.start), end: localDate(s.end), reference: 'SAMPLE-ONLY', cost: '4500', source: 'Fictional Mumbai–Goa sample. This is not extracted from your document.', warnings: ['Sample data only. Do not mistake these values for your PDF contents.'], filename: 'Fictional sample', sample: true }]);
  }
  async function add(e: React.FormEvent) {
    e.preventDefault(); if (busy || reading) return; setMessage('');
    const start = new Date(form.start + ':00+05:30'), end = new Date((form.durationUnknown ? form.start : form.end) + ':00+05:30');
    if (!Number.isFinite(start.getTime()) || !Number.isFinite(end.getTime()) || end < start) { setMessage('End time must be on or after the start time.'); return; }
    if (!form.title.trim() || (!form.locationUnknown && (!form.from.trim() || !form.to.trim()))) { setMessage('Enter the booking name and both locations.'); return; }
    if (reviewing && !confirmed) { setMessage('Compare the fields with the PDF and confirm before saving.'); return; }
    const connectionMode = form.requires === 'auto' ? 'auto' : form.requires === 'none' ? 'independent' : 'manual';
    const fixedTime = form.fixedTime || form.priority;
    const booking: Segment = {
      id: editing ?? crypto.randomUUID(), kind: form.kind, title: form.title.trim(), from: form.from.trim() || 'Not specified', to: form.to.trim() || 'Not specified', durationUnknown: form.durationUnknown, locationUnknown: form.locationUnknown, start: start.toISOString(), end: end.toISOString(), connectionMode,
      requires: connectionMode === 'manual' ? [form.requires] : [], cash: 0, available: true, reference: form.reference.trim(), ...(form.cost !== '' ? {cost: Math.round(Number(form.cost) * 100)} : {}), priority: form.priority, fixedTime, flexible: form.flexible && !fixedTime, recommendedBuffer: Number(form.buffer),
      evidence: reviewing ? reviewing.sample ? 'Explicit fictional sample, reviewed by user.' : 'PDF text extracted locally and reviewed by user; provider details unverified.' : 'User-entered details; provider details unverified.',
      ...(form.deadline ? { changeDeadline: new Date(form.deadline + ':00+05:30').toISOString() } : {}), ...(form.cutoff ? { cutoff: new Date(form.cutoff + ':00+05:30').toISOString() } : {}), ...(form.latest ? { windowEnd: new Date(form.latest + ':00+05:30').toISOString() } : {}),
    };
    const list = organizeBookings(editing ? saved.map(s => s.id === editing ? booking : s) : [...saved, booking]);
    if (list.length > 100) { setMessage('This local prototype supports 100 saved bookings per itinerary.'); return; }
    if (!await mutate({ action: 'itinerary', bookings: list })) return;
    setEditing(null);
    if (queue.length > 1) showReview(queue.slice(1));
    else { setQueue([]); setForm(empty); setConfirmed(false); }
    setMessage('Booking saved. All pages now use the updated, time-ordered itinerary.');
  }
  async function saveAll() {
    if (!confirmAll || busy) return;
    if (queue.some(q => !q.title || !q.start || (!q.end && !q.durationUnknown))) { setMessage('Some sections need missing times or titles. Review and save those individually.'); return; }
    const imported: Segment[] = queue.map(q => ({ id:crypto.randomUUID(), title:q.title, kind:q.kind, start:new Date(q.start+':00+05:30').toISOString(), end:new Date((q.durationUnknown?q.start:q.end)+':00+05:30').toISOString(), from:q.from||'Not specified', to:q.to||'Not specified', durationUnknown:!!q.durationUnknown, locationUnknown:!!q.locationUnknown || !q.from || !q.to, requires:[], connectionMode:'auto', cash:0, available:true, fixedTime:true, priority:q.kind==='activity', reference:q.reference, ...(q.cost!==''?{cost:Math.round(Number(q.cost)*100)}:{}), evidence:'Document schedule extracted locally and reviewed by user. Missing durations, locations and costs remain unknown.' }));
    if (saved.length + imported.length > 100) {setMessage('Save up to 100 itinerary items in this prototype.');return;}
    if (await mutate({action:'itinerary',bookings:organizeBookings([...saved,...imported])})) {setQueue([]);setForm(empty);setConfirmed(false);setConfirmAll(false);setMessage(`${imported.length} items saved in date and time order. Missing source details remain explicitly unknown.`);}
  }
  async function remove(id: string) {
    if (await mutate({ action: 'itinerary', bookings: saved.filter(s => s.id !== id).map(s => ({ ...s, requires: s.requires.filter(p => p !== id) })) })) {
      if (editing === id) { setEditing(null); setForm(empty); }
      setMessage('Booking removed; remaining automatic connections updated.');
    }
  }
  return <>
    <PageHeading eyebrow="MAKE THE JOURNEY YOURS" title="Bring your plans together." description="Each booking saves immediately. Raahi arranges your journey by departure time and connects nearby stops. All times are IST." />
    <div className="add-layout"><section className="overview-card add-form-card">
      <div className="input-tabs" role="tablist" aria-label="Itinerary input method">
        <button role="tab" aria-selected={tab === 'manual'} onClick={() => { setTab('manual'); setQueue([]); }}><PenLine size={18} /> Manual entry</button>
        <button role="tab" aria-selected={tab === 'pdf'} onClick={() => setTab('pdf')}><FileText size={18} /> Upload booking PDFs</button>
      </div>
      {tab === 'pdf' && <>
        <div className={`pdf-drop ${dragging ? 'dragging' : ''} ${files.length ? 'has-pdf' : ''}`} onDragOver={e => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={e => { e.preventDefault(); setDragging(false); if (!reading) takeFiles(e.dataTransfer.files); }}>
          {files.length ? <><div className="pdf-file-tabs">{files.map((f,i) => <button key={f.url} aria-pressed={i === activePdf} onClick={() => setActivePdf(i)}><FileText size={20}/><span>{f.file.name}<small>{Math.ceil(f.file.size / 1024)} KB · PDF {i+1} of {files.length}</small></span></button>)}</div><PdfPreview key={files[activePdf].url} file={files[activePdf].file} /><a href={files[activePdf].url} target="_blank" rel="noreferrer" className="text-button">Open original PDF in a new tab</a></> : <><UploadCloud size={34}/><h2>Drop your booking PDFs here</h2><p>Up to 10 files · 10 MB each · processed on your device</p></>}
          <label className="button outline">{files.length ? 'Choose different PDFs' : 'Choose PDFs'}<input className="file-input" aria-label="Choose booking PDFs" type="file" accept="application/pdf,.pdf" multiple disabled={reading} onChange={e => { if(e.target.files) takeFiles(e.target.files); }} /></label>
        </div>
        {files.length > 0 && <div className="pdf-extract-actions"><button className="button primary" disabled={reading} onClick={extract}>{reading ? 'Reading PDF text…' : 'Extract actual PDF details'}</button><button className="text-button" disabled={reading} onClick={sample}>Load sample details (fictional demo)</button></div>}
        <p className="simulation-disclosure">Actual document text is read locally. No AI or cloud upload. Scans, ambiguous dates and unrecognized layouts require manual review; missing details are never invented.</p>
        {sourceText && <details className="extracted-source"><summary>View all extracted text</summary><pre>{sourceText}</pre></details>}
      </>}
      {queue.length > 1 && <section className="pdf-review-note"><h3>{queue.length} extracted items</h3><p>Review every row. Only values supplied in the document are retained. Individual edits below are saved separately; this bulk action saves these listed extracted values.</p><ol className="import-list">{queue.map((q,i)=><li key={i}><strong>{q.start.replace('T',' · ')} · {q.title}</strong><small>{q.durationUnknown?'Duration not supplied':'Ends '+q.end.replace('T',' ')} · {q.cost ? 'INR '+q.cost : 'Price not supplied'}</small></li>)}</ol><label className="verification-check"><input type="checkbox" checked={confirmAll} onChange={e=>setConfirmAll(e.target.checked)}/> I reviewed all listed items against the original PDF.</label><button className="button primary" disabled={!confirmAll || busy} onClick={saveAll}>Save all {queue.length} extracted items</button></section>}
      {(tab === 'manual' || reviewing) && <form ref={formRef} className="booking-form" onSubmit={add}>
        <div className="section-heading"><div><p className="eyebrow">{reviewing ? reviewing.sample ? 'FICTIONAL SAMPLE REVIEW' : 'REVIEW ACTUAL PDF DETAILS' : editing ? 'EDIT SAVED BOOKING' : 'MANUAL ENTRY'}</p><h2>{reviewing ? 'Compare. Confirm. Save.' : editing ? 'Fine-tune this stop.' : 'A new part of the journey.'}</h2></div></div>
        {reviewing && <div className="pdf-review-note"><strong>{reviewing.filename} · {queue.length} section(s) left</strong>{reviewing.warnings.map(w => <p key={w}>{w}</p>)}<details open><summary>Source text for these fields</summary><pre>{reviewing.source}</pre></details></div>}
        <fieldset disabled={busy || reading}><div className="form-grid">
          <label>Category<select value={form.kind} onChange={e => update('kind', e.target.value as Segment['kind'])}><option value="flight">Flight</option><option value="train">Train</option><option value="transfer">Cab / transfer</option><option value="checkin">Hotel check-in</option><option value="activity">Event</option>{['exit','storage'].includes(form.kind) && <option value={form.kind}>{form.kind}</option>}</select></label>
          <label>Booking / event name<input required maxLength={120} value={form.title} onChange={e => update('title',e.target.value)} placeholder="e.g. Flight to Goa"/></label>
          <label>Origin / location<input required={!form.locationUnknown} maxLength={100} value={form.from} onChange={e => update('from',e.target.value)}/></label>
          <label>Destination<input required={!form.locationUnknown} maxLength={100} value={form.to} onChange={e => update('to',e.target.value)}/></label>
          <label>Start / departure<input required type="datetime-local" value={form.start} onChange={e => update('start',e.target.value)}/></label>
          <label>End / arrival<input required={!form.durationUnknown} disabled={form.durationUnknown} type="datetime-local" value={form.durationUnknown ? '' : form.end} onChange={e => update('end',e.target.value)}/></label>
          <label>Booking reference<input maxLength={80} value={form.reference} onChange={e => update('reference',e.target.value)}/></label>
          <label>Already-paid cost (₹)<input type="number" placeholder="Not supplied" min="0" max="1000000" step="0.01" value={form.cost} onChange={e => update('cost',e.target.value)}/></label>
          <label>Connection<select value={form.requires} onChange={e => update('requires',e.target.value)}><option value="auto">Automatically connect by time</option><option value="none">Independent booking</option>{saved.filter(s => s.id !== editing).map(s => <option key={s.id} value={s.id}>{s.title}</option>)}</select></label>
          <label>Suggested connection buffer (min)<input required type="number" min="0" max="1440" value={form.buffer} onChange={e => update('buffer',e.target.value)}/></label>
          <label className="wide-field">Change / cancellation deadline<input type="datetime-local" value={form.deadline} onChange={e => update('deadline',e.target.value)}/></label>
        </div>
        <label className="flexible-option"><input type="checkbox" checked={form.durationUnknown} onChange={e=>update('durationUnknown',e.target.checked)}/> Only a scheduled start is known; duration is not supplied.</label>
        <label className="flexible-option"><input type="checkbox" checked={form.locationUnknown} onChange={e=>update('locationUnknown',e.target.checked)}/> Exact connection locations are not supplied.</label>
        <details className="advanced-timing"><summary>Boarding and check-in cutoffs (optional)</summary><div className="form-grid"><label>Boarding / admission cutoff<input type="datetime-local" value={form.cutoff} onChange={e => update('cutoff',e.target.value)}/></label><label>Latest allowed check-in<input type="datetime-local" value={form.latest} onChange={e => update('latest',e.target.value)}/></label></div></details>
        <label className="priority-option"><input type="checkbox" checked={form.priority} onChange={e => update('priority',e.target.checked)}/><ShieldCheck/><span><strong>Must-save event</strong><small>Keep this commitment at its original time.</small></span></label>
        <label className="flexible-option"><input type="checkbox" checked={form.fixedTime || form.priority} disabled={form.priority} onChange={e => update('fixedTime',e.target.checked)}/> Fixed booking time — recovery cannot move it.</label>
        {!form.fixedTime && !form.priority && <label className="flexible-option"><input type="checkbox" checked={form.flexible} onChange={e => update('flexible',e.target.checked)}/> I can freely move this commitment later.</label>}
        {reviewing && <label className="verification-check"><input required type="checkbox" checked={confirmed} onChange={e => setConfirmed(e.target.checked)}/> I compared these dates, times, locations and cost with the {reviewing.sample ? 'fictional sample' : 'original PDF'}.</label>}
        <button className="button primary" type="submit"><Check size={17}/>{busy ? 'Saving…' : editing ? 'Save booking changes' : reviewing ? 'Confirm and save booking' : 'Save booking'}</button>
        {reviewing && <button type="button" className="text-button" onClick={() => { showReview(queue.slice(1)); if (queue.length === 1) setForm(empty); }}>Skip this document section</button>}
        </fieldset>
      </form>}
      {message && <p className="form-message" role="status">{message}</p>}
    </section><aside className="draft-summary"><div className="overview-card"><p className="eyebrow">YOUR SAVED ITINERARY</p><h2>{saved.length} bookings, one connected trip.</h2><p>Saved to this browser’s trip. Automatic connections update when you add an earlier or later booking.</p>
      {saved.map((s,i) => <div className="draft-booking" key={s.id}><span>{String(i+1).padStart(2,'0')}</span><div><strong>{s.title}</strong><small>{new Date(s.start).toLocaleDateString('en-IN',{timeZone:'Asia/Kolkata',day:'numeric',month:'short'})} · {time(s.start)}{s.durationUnknown ? ' · duration unknown' : '–'+time(s.end)} · {s.cost === undefined ? 'Price not supplied' : formatMoney(s.cost)}</small><button className="text-button" disabled={busy} aria-label={`Edit ${s.title}`} onClick={() => { setForm(fromSegment(s)); setEditing(s.id); setTab('manual'); setQueue([]); }}>Edit</button></div><button className="icon-button" disabled={busy} aria-label={`Remove ${s.title}`} onClick={() => remove(s.id)}><Trash2 size={15}/></button></div>)}
      {!saved.length && <p>Your first saved booking will appear here.</p>}
      <button className="button primary save-itinerary" disabled={busy} onClick={() => { if (form.title || form.start || form.from) { setMessage('Save the booking you are editing before opening the itinerary.'); formRef.current?.requestSubmit(); } else router.push('/itinerary'); }}>View saved itinerary</button>
      {data.state.mode !== 'personal' && <button className="text-button" disabled={busy} onClick={async () => { if (await mutate({ action:'itinerary', bookings: (data.state.applied?.segments ?? data.recovery.timeline).map(s => ({...s, fixedTime: s.kind === 'activity', connectionMode:'auto'})) })) setMessage('Demo copied and saved as a personal itinerary.'); }}>Copy current demo to edit</button>}
      <small className="draft-footnote">Connections describe the planned sequence. Location mismatches and tight transfers are flagged, not assumed safe.</small>
    </div></aside></div>
  </>;
}
