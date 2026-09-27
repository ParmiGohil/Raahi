import { NextRequest, NextResponse } from 'next/server';
import { weatherPlaces } from '../../../engine/weather';

export async function GET(request: NextRequest) {
  const place = weatherPlaces.find(p => p.id === request.nextUrl.searchParams.get('place'));
  if (!place) return NextResponse.json({ error: 'Choose a supported weather location.' }, { status: 400 });
  const url = new URL('https://api.open-meteo.com/v1/forecast');
  url.search = new URLSearchParams({ latitude: String(place.lat), longitude: String(place.lon), hourly: 'precipitation,temperature_2m,wind_speed_10m', forecast_days: '7', timezone: 'UTC' }).toString();
  const social = new URL('https://api.bsky.app/xrpc/app.bsky.feed.searchPosts');
  social.search = new URLSearchParams({ q: place.query, limit: '5', sort: 'latest', since: new Date(Date.now() - 7 * 86400000).toISOString() }).toString();
  const ensembleUrl = new URL('https://ensemble-api.open-meteo.com/v1/ensemble');
  ensembleUrl.search = new URLSearchParams({ latitude: String(place.lat), longitude: String(place.lon), hourly: 'precipitation,temperature_2m,wind_speed_10m', models: 'icon_seamless', forecast_days: '7', timezone: 'UTC' }).toString();
  const [weather, signals, ensemble] = await Promise.allSettled([
    fetch(url, { next: { revalidate: 300 }, signal: AbortSignal.timeout(12000) }).then(async r => { if (!r.ok) throw new Error('Weather provider unavailable'); return r.json(); }),
    fetch(social, { next: { revalidate: 300 }, signal: AbortSignal.timeout(8000) }).then(async r => { if (!r.ok) throw new Error('Public search unavailable'); const data = await r.json(); if (Array.isArray(data.posts) && data.posts.length) return data; const archive = new URL(social); archive.searchParams.delete('since'); archive.searchParams.set('limit','30'); const older = await fetch(archive, { next: { revalidate: 1800 }, signal: AbortSignal.timeout(8000) }); if (!older.ok) throw new Error('Archive unavailable'); return older.json(); }),
    fetch(ensembleUrl, { next: { revalidate: 1800 }, signal: AbortSignal.timeout(12000) }).then(async r => { if (!r.ok) throw new Error('Ensemble unavailable'); return r.json(); }),
  ]);
  if (weather.status === 'rejected') return NextResponse.json({ error: 'Live weather is unavailable. Retry shortly; manual weather scenarios still work.' }, { status: 502 });
  const hourly = weather.value.hourly;
  if (!Array.isArray(hourly?.time)) return NextResponse.json({ error: 'Weather provider returned incomplete data.' }, { status: 502 });
  const hours = hourly.time.flatMap((time: string, i: number) => {
    const rain = hourly.precipitation?.[i], wind = hourly.wind_speed_10m?.[i], temperature = hourly.temperature_2m?.[i];
    return [rain, wind, temperature].every(v => typeof v === 'number' && Number.isFinite(v)) ? [{ time: `${time}Z`, rain, wind, temperature }] : [];
  });
  const posts = signals.status === 'fulfilled' && Array.isArray(signals.value.posts) ? signals.value.posts : [];
  const reports = posts.flatMap((post: { uri?: string; author?: { did?: string }; record?: { text?: string; createdAt?: string } }) => {
    const id = post.uri?.split('/').pop();
    const text = post.record?.text ?? '';
    const relevant = /\b(rain|flood|storm|weather|monsoon|waterlog|wind|heat)/i.test(text) && /\b(goa|mumbai)\b/i.test(text) && !/\b(music|trance|album|dj|acid rain)\b/i.test(text);
    const historical = !post.record?.createdAt || Date.parse(post.record.createdAt) < Date.now() - 7 * 86400000;
    return relevant && id && post.author?.did && post.record?.text ? [{ historical, text: post.record.text.slice(0, 600), at: post.record.createdAt ?? '', url: `https://bsky.app/profile/${encodeURIComponent(post.author.did)}/post/${encodeURIComponent(id)}` }] : [];
  });
  const eh = ensemble.status === 'fulfilled' ? ensemble.value.hourly : null;
  const members = eh && Array.isArray(eh.time) ? Object.keys(eh).filter(k => /^precipitation(_member\d+)?$/.test(k)).map(k => { const suffix = k.slice('precipitation'.length); return eh.time.flatMap((time: string, i: number) => { const rain = eh[k]?.[i], wind = eh['wind_speed_10m' + suffix]?.[i], temperature = eh['temperature_2m' + suffix]?.[i]; return [rain, wind, temperature].every(v => typeof v === 'number' && Number.isFinite(v)) ? [{ time: time + 'Z', rain, wind, temperature }] : []; }); }) : [];
  return NextResponse.json({ members, ensembleStatus: members.length ? 'ICON ensemble; weather spread only, travel effects use uncalibrated rules.' : 'Ensemble unavailable; no probability will be displayed.', place: place.id, fetchedAt: new Date().toISOString(), hours, reports: reports.slice(0,5), reportsStatus: signals.status === 'rejected' ? 'Public search unavailable. No reports have been invented.' : reports.length ? 'Weather-related public posts. Check dates: older reports are historical context only, never current disruption evidence.' : 'No matching public reports in the last seven days.' });
}
