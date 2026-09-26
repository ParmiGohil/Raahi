'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Plus, Sparkles, Zap, UserRound } from 'lucide-react';
import { Brand } from './brand';
import { TripProvider, useTrip } from './trip-provider';
const links = [['/', 'Trip workspace'], ['/itinerary', 'My itinerary'], ['/dependencies', 'Dependencies'], ['/what-if', 'What-if'], ['/recovery', 'Recovery']] as const;
function Frame({ children }: { children: React.ReactNode }) {
  const path = usePathname(); const { data, error, reload } = useTrip();
  return <div className="product-shell">
    <a className="skip-link" href="#main-content">Skip to content</a>
    <header className="product-header"><Link href="/" aria-label="Raahi home"><Brand /></Link>
      <nav aria-label="Main navigation">{links.map(([href, label]) => <Link key={href} href={href} aria-current={path === href ? 'page' : undefined}>{label}</Link>)}</nav>
      <div className="product-controls"><Link className="profile-link" href="/profile" aria-label="Traveler profile" aria-current={path === '/profile' ? 'page' : undefined}><UserRound size={20}/><span>{data?.state.profile?.name?.split(' ')[0] || 'Profile'}</span></Link></div>
    </header>
    {error && <div className="product-error" role="alert">{error} <button onClick={() => reload().catch(() => undefined)}>Reload trip</button></div>}
    <main id="main-content" className="product-main">{children}</main>
    <footer className="product-footer"><Brand compact/><span>A little clarity. A way forward.</span><small>{data?.state.mode === 'personal' ? 'User-entered timings · provider details unverified' : 'Fictional bookings · simulated supplier actions'}</small></footer>
    {path !== '/add-itinerary' && <nav className="quick-actions" aria-label="Quick actions"><Link href="/add-itinerary"><Plus size={19}/><span>Add booking</span></Link><Link href="/recovery"><Zap size={19}/><span>Disruption</span></Link><Link href="/what-if"><Sparkles size={19}/><span>What-if</span></Link></nav>}
  </div>;
}
export function ProductShell({ children }: { children: React.ReactNode }) { return <TripProvider><Frame>{children}</Frame></TripProvider>; }
