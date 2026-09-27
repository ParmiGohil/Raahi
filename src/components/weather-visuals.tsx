'use client';
import { useState } from 'react';
import type { Segment, Impact } from '../domain/types';

export function WeatherMap({ lat, lon, name }: { lat: number; lon: number; name: string }) {
  return <MapTiles key={`${lat},${lon}`} lat={lat} lon={lon} name={name}/>;
}
function MapTiles({ lat, lon, name }: { lat: number; lon: number; name: string }) {
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const zoom = 11, scale = 2 ** zoom;
  const x = (lon + 180) / 360 * scale;
  const rad = lat * Math.PI / 180;
  const y = (1 - Math.asinh(Math.tan(rad)) / Math.PI) / 2 * scale;
  return <div className="weather-map-wrap"><div className="weather-tile-map" role="img" aria-label={`Map centred on ${name}`}>
    <div className="weather-tiles" key={attempt} style={{ left: `calc(50% - ${(x - Math.floor(x) + 1) * 256}px)`, top: `calc(50% - ${(y - Math.floor(y) + 1) * 256}px)` }}>
      {Array.from({length:9}, (_, i) => <img key={i} alt="" width={256} height={256} referrerPolicy="strict-origin-when-cross-origin" src={`https://tile.openstreetmap.org/${zoom}/${Math.floor(x) - 1 + i % 3}/${Math.floor(y) - 1 + Math.floor(i / 3)}.png`} onError={() => setFailed(true)}/>)}
    </div><div className="weather-map-pin"><span>●</span><strong>{name}</strong></div>
    {failed && <div className="weather-map-error"><strong>The map tiles couldn’t load.</strong><p>Check your internet connection or open the map below.</p><button onClick={() => { setFailed(false); setAttempt(n => n + 1); }}>Retry map</button></div>}
    <a className="weather-attribution" href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">© OpenStreetMap contributors</a>
  </div><a className="text-button" href={`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=11/${lat}/${lon}`} target="_blank" rel="noreferrer">Open full map ↗</a></div>;
}

export function WeatherConnections({ bookings, impacts }: { bookings: Segment[]; impacts: Impact[] }) {
  const colors = { unaffected: '#648c70', direct: '#bb8a2c', blocked: '#ba6457', 'at-risk': '#ba6457' };
  const labels = { unaffected: 'No new issue', direct: 'Weather delay', blocked: 'Connection missed', 'at-risk': 'Needs attention' };
  const width = Math.max(600, bookings.length * 170);
  return <section className="weather-panel weather-simple-graph"><h3>How the effect travels</h3><p>Each arrow connects bookings that depend on one another. Separate bookings have no connecting arrow.</p><div className="weather-graph-scroll" tabIndex={0} role="region" aria-label="Scrollable booking dependency graph"><svg width={width} height="240" role="img" aria-label="Weather impacts across connected bookings"><defs><marker id="weather-arrow" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0 0 L7 3.5 L0 7" fill="#82988a"/></marker></defs>
    {bookings.flatMap((b, i) => b.requires.map(id => { const parent = bookings.findIndex(p => p.id === id); if(parent < 0) return null; const x = parent * 170 + 155, end = i * 170 + 15; return <path key={`${id}-${b.id}`} d={Math.abs(i-parent) === 1 ? `M${x} 100 H${end-4}` : `M${x} 80 Q${(x+end)/2} 0 ${end} 80`} stroke="#82988a" fill="none" strokeWidth="2" markerEnd="url(#weather-arrow)"/>; }))}
    {bookings.map((b, i) => { const impact = impacts.find(p => p.id === b.id); const status = impact?.state ?? 'unaffected'; return <g key={b.id} transform={`translate(${i*170+15},50)`}><title>{b.title}: {impact?.reason}</title><rect width="140" height="150" rx="16" fill={status === 'unaffected' ? '#f3f8f0' : status === 'direct' ? '#fff8e6' : '#fff2ed'} stroke={colors[status]} strokeWidth="2"/><text x="70" y="30" textAnchor="middle" fill={colors[status]} fontSize="12">{b.kind === 'checkin' ? 'HOTEL' : b.kind.toUpperCase()}</text><foreignObject x="10" y="45" width="120" height="65"><div className="weather-graph-name">{b.title}</div></foreignObject><text x="70" y="130" textAnchor="middle" fill={colors[status]} fontSize="11">{labels[status]}</text></g>; })}
  </svg></div><p className="weather-graph-legend">Green: no new issue · Yellow: directly affected · Red: connection needs attention</p></section>;
}
