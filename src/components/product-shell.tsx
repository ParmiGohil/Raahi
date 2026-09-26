'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Plus, Sparkles, Zap, UserRound } from 'lucide-react';
import { Brand } from './brand';
import { TripProvider, useTrip } from './trip-provider';
const links = [['/', 'Trip workspace', 'यात्रा कार्यक्षेत्र'], ['/itinerary', 'My itinerary', 'मेरी यात्रा'], ['/dependencies', 'Dependencies', 'यात्रा संबंध'], ['/what-if', 'What-if', 'अगर ऐसा हो'], ['/recovery', 'Recovery', 'समाधान']] as const;
function Frame({ children }: { children: React.ReactNode }) {
  const path = usePathname(); const [hindi, setHindi] = useState(false); const { data, error, reload } = useTrip();
  return <div className="product-shell">
    <a className="skip-link" href="#main-content">Skip to content</a>
    <header className="product-header"><Link href="/" aria-label="Raahi home"><Brand /></Link>
      <nav aria-label="Main navigation">{links.map(([href, en, hi]) => <Link key={href} href={href} aria-current={path === href ? 'page' : undefined}>{hindi ? hi : en}</Link>)}</nav>
      <div className="product-controls"><button className="language-control" onClick={() => setHindi(!hindi)} aria-label="Switch navigation language" title="Navigation translated; detailed trip content is in English">{hindi ? 'HI / EN' : 'EN / HI'}</button><details className="profile-menu"><summary aria-label="Traveler profile"><UserRound size={18} /></summary><div><strong>Your travel workspace</strong><p>{data?.state.mode === 'personal' ? 'Personal itinerary' : 'Fictional Goa demo'}</p><p>Saved in this browser session. No account required.</p>{hindi && <small>Navigation is in Hindi. Detailed content remains in English.</small>}</div></details></div>
    </header>
    {error && <div className="product-error" role="alert">{error} <button onClick={() => reload().catch(() => undefined)}>Reload trip</button></div>}
    <main id="main-content" className="product-main">{children}</main>
    <footer className="product-footer"><Brand compact /><span>A little clarity. A way forward.</span><small>{data?.state.mode === 'personal' ? 'User-entered timings · provider details unverified' : 'Fictional bookings · simulated supplier actions'}</small></footer>
    {path !== '/add-itinerary' && <nav className="quick-actions" aria-label="Quick actions"><Link href="/add-itinerary"><Plus size={16} /><span>Add booking</span></Link><Link href="/recovery"><Zap size={16} /><span>Disruption</span></Link><Link href="/what-if"><Sparkles size={16} /><span>What-if</span></Link></nav>}
  </div>;
}
export function ProductShell({ children }: { children: React.ReactNode }) { return <TripProvider><Frame>{children}</Frame></TripProvider>; }

