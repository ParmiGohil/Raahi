'use client';
import { useEffect, useState, useMemo } from 'react';
import { CloudRain, MapPin, RefreshCw, ArrowDown, ShieldCheck, Wind, Thermometer } from 'lucide-react';
import type { Segment } from '../domain/types';
import { simulateWeather, weatherPlaces, forecastAt, redateDemo, ensembleImpact, type WeatherInput, type WeatherSnapshot } from '../engine/weather';
import { tripHealth } from '../engine/journey';
import { baseline } from '../fixtures/trip';
import { WeatherMap, WeatherConnections } from './weather-visuals';

const normal: WeatherInput = { rain: 0, wind: 10, temperature: 28, hours: 1 };
const extreme: WeatherInput = { rain: 40, wind: 75, temperature: 30, hours: 3 };
const dateLabel = (value: string) => new Date(value).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
export function WeatherTwin({ bookings: savedBookings }: { bookings: Segment[] }) {
  const [demoDate, setDemoDate] = useState<number | null>(null);
  const bookings = useMemo(() => demoDate ? redateDemo(baseline(), demoDate) : savedBookings, [demoDate, savedBookings]);
  const [placeId, setPlaceId] = useState<string>('goi');
  const [bookingId, setBookingId] = useState('');
  const [snapshot, setSnapshot] = useState<WeatherSnapshot | null>(null);
  const [error, setError] = useState(''); const [loading, setLoading] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const [insight, setInsight] = useState<{signature: string; text: string} | null>(null);
  const [input, setInput] = useState<WeatherInput>(normal);
  const [mode, setMode] = useState('Normal-weather scenario');
  const [shown, setShown] = useState<{input: WeatherInput; id: string; signature: string} | null>(null);
  const targets = bookings.filter(b => ['flight', 'train', 'transfer'].includes(b.kind));
  const selected = targets.find(b => b.id === bookingId) ?? targets[0];
  const place = weatherPlaces.find(p => p.id === placeId)!;
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setError(''); setSnapshot(null);
    fetch(`/api/weather?place=${placeId}`, { signal: controller.signal }).then(async r => {
      const result = await r.json(); if (!r.ok) throw new Error(result.error); return result as WeatherSnapshot;
    }).then(setSnapshot).catch(e => { if (e.name !== 'AbortError') setError(e.message); }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    const timer = window.setTimeout(() => setRefresh(n => n + 1), 300000);
    return () => { controller.abort(); window.clearTimeout(timer); };
  }, [placeId, refresh]);
  const matching = selected && snapshot && forecastAt(snapshot.hours, selected.start);
  const effective = mode === 'Booking-time forecast' && matching ? { ...matching, hours: input.hours } : input;
  const forecastMissing = mode === 'Booking-time forecast' && !matching;
  const signature = JSON.stringify([bookings, selected?.id, placeId, mode, mode === 'Booking-time forecast' ? null : effective]);
  const result = shown && !forecastMissing && shown.signature === signature ? simulateWeather(bookings, shown.id, mode === 'Booking-time forecast' && matching ? effective : shown.input) : null;
  const uncertainty = result && mode === 'Booking-time forecast' ? ensembleImpact(bookings, shown!.id, snapshot?.members ?? []) : null;
  const insightSignature = result ? JSON.stringify([signature, effective]) : '';
  useEffect(() => {
    if (!insightSignature || !selected) return;
    const controller = new AbortController();
    setInsight(null);
    fetch('/api/weather/insight', { method:'POST', signal:controller.signal, headers:{'Content-Type':'application/json'}, body:JSON.stringify({kind:selected.kind,weather:effective,source:mode === 'Booking-time forecast' ? 'forecast' : 'hypothetical'}) })
      .then(r=>r.json()).then(value=>setInsight({signature:insightSignature,text:value.insight ? `Nugen assessment (${value.insight.risk} exposure): ${value.insight.explanation} ${value.insight.action} ${value.insight.limitations}` : value.message ?? value.error}))
      .catch(e=>{if(e.name !== 'AbortError') setInsight({signature:insightSignature,text:'AI assessment unavailable. Rules-based preview only.'});});
    return ()=>controller.abort();
  // The signature contains the selected context and refreshed weather values.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [insightSignature]);
  const health = result && tripHealth({ mode: 'personal', bookings, revision: 0, scenario: 'original', preferences: { budget: 0, protectOriginal: true }, applied: null, history: [] }, result.recovery);
  const baselineHealth = result && tripHealth({ mode: 'personal', bookings, revision: 0, scenario: 'original', preferences: { budget: 0, protectOriginal: true }, applied: null, history: [] }, result.baseline);
  const nextHour = snapshot?.hours.find(h => Date.parse(h.time) >= Date.now());
  const bbox = `${place.lon - .12},${place.lat - .09},${place.lon + .12},${place.lat + .09}`;
  return <section className="weather-twin" aria-labelledby="weather-title">
    <div className="weather-title"><div><p className="eyebrow">YOUR JOURNEY, THROUGH A DIFFERENT FORECAST</p><h2 id="weather-title">A little foresight.<br/><em>A clearer way forward.</em></h2><p>Explore how weather at one location could ripple through your connected bookings.</p></div><div className="weather-symbol"><CloudRain size={60}/><span>Weather Twin · preview</span></div></div>
    <div className="weather-disclosure"><ShieldCheck size={20}/><span>Live forecast data · rules-based impact simulation. No bookings are changed.</span></div>
    <div className="weather-grid">
      <div className="weather-panel"><div className="section-heading"><h3><MapPin size={19}/> Live forecast</h3><button className="text-button" disabled={loading} onClick={() => setRefresh(n => n + 1)} aria-label="Refresh weather"><RefreshCw size={17}/>{loading ? 'Updating…' : 'Refresh'}</button></div>
        <label>Explore a location<select value={placeId} onChange={e => setPlaceId(e.target.value)}>{weatherPlaces.map(p => <option value={p.id} key={p.id}>{p.name}</option>)}</select></label>
        <WeatherMap lat={place.lat} lon={place.lon} name={place.name}/>
        <small>Location reference, not a verified booking route. Choose the location where this booking could be affected.</small>
        {error && <p role="alert" className="weather-notice">{error}</p>}
        {nextHour && <><div className="weather-readings"><span><CloudRain size={18}/><strong>{nextHour.rain} mm</strong>per hour</span><span><Wind size={18}/><strong>{nextHour.wind} km/h</strong>wind</span><span><Thermometer size={18}/><strong>{nextHour.temperature}°C</strong>temperature</span></div><small>Next forecast hour: {dateLabel(nextHour.time)} IST. Retrieved {dateLabel(snapshot!.fetchedAt)} IST. Auto-refresh every 5 minutes; provider cache up to 5 minutes. <a href="https://open-meteo.com/" target="_blank" rel="noreferrer">Open-Meteo</a> model forecast.</small></>}
      </div>
      <div className="weather-panel"><p className="eyebrow">CHANGE THE CONDITIONS</p><h3>What if the weather turns?</h3>
        <label><input type="checkbox" checked={!!demoDate} onChange={e => { setDemoDate(e.target.checked ? Date.now() : null); setShown(null); setBookingId(''); }}/> Try the Goa demo tomorrow (preview only)</label>
        {demoDate && <small>Using a separate demo for {dateLabel(bookings[0].start)} IST. Your saved itinerary and its dates are unchanged.</small>}
        <label>Which part of your trip?<select value={selected?.id ?? ''} onChange={e => setBookingId(e.target.value)}>{!targets.length && <option value="">No transport bookings available</option>}{targets.map(b => <option key={b.id} value={b.id}>{b.title}</option>)}</select></label>
        <p>Choose what you would like to test.</p>
        <div className="weather-choices">
          <button aria-pressed={mode === 'Normal-weather scenario'} onClick={() => { setInput(normal); setMode('Normal-weather scenario'); }}><strong>Clear weather</strong><span>A usual day, with no extra weather delay.</span></button>
          <button aria-pressed={mode === 'Rainy-weather scenario'} onClick={() => { setInput({ rain: 12, wind: 30, temperature: 28, hours: 2 }); setMode('Rainy-weather scenario'); }}><strong>A rainy spell</strong><span>Rain slows travel for around two hours.</span></button>
          <button aria-pressed={mode === 'Extreme-weather scenario'} onClick={() => { setInput(extreme); setMode('Extreme-weather scenario'); }}><strong>A heavy storm</strong><span>Heavy rain and strong winds last around three hours.</span></button>
          <button disabled={!matching} aria-pressed={mode === 'Booking-time forecast'} onClick={() => { setInput({...normal,hours:1}); setMode('Booking-time forecast'); }}><strong>Use the real forecast</strong><span>Check the forecast at your booking time.</span></button>
        </div>
        {selected && !matching && <p className="weather-notice">No matching forecast for {dateLabel(selected.start)} IST at this location. Manual scenarios are hypothetical; today’s weather is not substituted for your travel date.</p>}
        <button className="button primary weather-show" disabled={!selected || forecastMissing} onClick={() => { if (selected) setShown({ input: effective, id: selected.id, signature }); }}>Show changes & delays</button>
        <p className="weather-mode">Preview only. Your saved trip will stay as it is.</p>
      </div>
    </div>
    {!selected && <p className="weather-notice">Add a flight, train or transfer with known times to explore connected weather impacts.</p>}
    {!result && <p className="weather-preview-hint" role="status">{shown ? 'Your choices have changed. Select “Show changes & delays” to update the preview.' : 'Choose a weather situation, then select “Show changes & delays” to see what happens to your trip.'}</p>}
    {result && <div aria-live="polite"><div className="weather-results"><div><small>WHAT HAPPENS TO YOUR JOURNEY?</small><strong>{result.incomplete ? 'More details needed' : result.minutes ? `${result.minutes >= 60 ? Math.floor(result.minutes / 60) + ' hr ' : ''}${result.minutes % 60 ? result.minutes % 60 + ' min ' : ''}later` : 'No extra delay'}</strong><p>{result.incomplete ? 'Add this booking’s duration before estimating a delay.' : result.minutes ? `${selected?.title} would finish ${result.minutes} minutes later in this scenario.` : 'This weather scenario adds no delay to the selected booking.'}</p><small>Demo estimate, not a confirmed provider delay.</small></div><div><small>HOW YOUR TRIP IS DOING</small><strong>{baselineHealth?.provisional ? '—' : baselineHealth?.score} → {health?.provisional ? '—' : health?.score}</strong><p>Trip Health before and after /100. A planning score, not a probability.</p></div><div><small>WHAT ELSE CHANGES?</small><strong>{result.changed.length} booking{result.changed.length === 1 ? '' : 's'}</strong><p>{result.changed.length ? 'Have a different status in this preview. Follow the connections below.' : 'No booking status changes. Any existing trip issues still need attention.'}</p></div></div>
      {uncertainty && <p className="weather-notice">Forecast spread: {uncertainty.lower}–{uncertainty.upper} minutes of added delay across the middle 80% of {uncertainty.samples} weather forecasts. {uncertainty.blocked}/{uncertainty.samples} scenarios ({uncertainty.fraction}%) create a new missed connection under our demo rules. This is an ensemble scenario fraction, not a calibrated travel probability.</p>}
      {result && mode === 'Booking-time forecast' && !uncertainty && <p className="weather-notice">Uncertainty cannot be calculated for this booking: ensemble data or complete itinerary details are missing.</p>}
      {insight?.signature === insightSignature && <p className="weather-notice">{insight.text}</p>}
      <WeatherConnections bookings={bookings} impacts={result.recovery.impacts}/>
      <details className="weather-panel"><summary>See the booking-by-booking details</summary><h3>Follow the ripple</h3><p>Fixed booking times stay fixed. Missed connections are flagged for review.</p><div className="weather-chain">{result.recovery.impacts.map((impact, i) => <div key={impact.id}>{i > 0 && <ArrowDown className="weather-chain-arrow" size={18}/>}<article className={`weather-booking weather-${impact.state}`}><span>{String(i + 1).padStart(2, '0')}</span><div><strong>{bookings.find(b => b.id === impact.id)?.title}</strong><p>{impact.reason}</p></div><small>{impact.state === 'unaffected' ? 'No new issue' : impact.state.replace('-', ' ')}</small></article></div>)}</div></details>
    </div>}
    <div className="weather-grid weather-bottom"><div className="weather-panel"><h3>On the ground</h3><p>Public reports near {place.name}. Context only; these do not change the simulation.</p><small>{snapshot?.reportsStatus ?? (loading ? 'Checking public sources…' : 'Reports unavailable while weather could not be loaded.')}</small>{snapshot?.reports.map(report => <article className="weather-report" key={report.url}><p>{report.text}</p><a href={report.url} target="_blank" rel="noreferrer">View original report ↗</a><small>{report.at && dateLabel(report.at)} IST · {report.historical ? 'historical report, not current conditions' : 'recent report'} · unverified</small></article>)}</div><div className="weather-panel"><h3>How this preview works</h3><p>We apply weather exposure to your selected transport booking, then run Raahi’s existing dependency checks. Existing gaps and missing details remain visible.</p><details><summary>View the simulation assumptions</summary><p>Delay in minutes = (rain × 2 for flights or × 3 for road/rail + wind above 25 km/h × 1.5 + road heat above 35°C) × exposure hours / 3, rounded. Exposure is capped at 3 hours. These authored coefficients are not trained or calibrated. They are a demonstration of sensitivity, not operational forecasts.</p><p>No cancellation, supplier availability, alternative route, probability or price is inferred. Social reports are unverified context. Model learning and Nugen inference are not connected yet.</p></details><p><strong>Recovery guidance:</strong> If a connection becomes blocked, verify a replacement transfer with the provider. Preserve fixed events; no weather recovery is automatically applied.</p></div></div>
  </section>;
}
