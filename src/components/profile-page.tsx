'use client';
import { useState } from 'react';
import { UserRound, MapPin, Check, ShieldCheck } from 'lucide-react';
import { useTrip } from './trip-provider';
import { PageHeading, LoadingTrip } from './journey-pages';
export function ProfilePage() {
  const { data, busy, mutate } = useTrip();
  const [draft, setDraft] = useState<{name:string;email:string;city:string;travelStyle:string} | null>(null);
  const [saved, setSaved] = useState(false);
  if (!data) return <LoadingTrip/>;
  const profile = draft ?? data.state.profile ?? {name:'',email:'',city:'',travelStyle:'Balanced'};
  const update = (key: keyof typeof profile, value: string) => { setDraft({...profile,[key]:value}); setSaved(false); };
  return <><PageHeading eyebrow="YOUR TRAVEL SPACE" title="A little about you." description="Simple details for your Raahi workspace. This local profile does not create an account or send email."/>
    <div className="profile-layout"><section className="teal-card profile-summary"><div className="profile-avatar">{profile.name ? profile.name.slice(0,1).toUpperCase() : <UserRound size={42}/>}</div><h2>{profile.name || 'Your next journey awaits.'}</h2><p><MapPin size={16}/> {profile.city || 'Add your home city'}</p><span className="profile-style">{profile.travelStyle} traveller</span><p><ShieldCheck size={16}/> Saved with this browser’s trip session.</p></section>
    <form className="overview-card booking-form" onSubmit={async e => { e.preventDefault(); if(await mutate({action:'profile',profile})) {setSaved(true);setDraft(null);} }}><h2>Traveller details</h2><div className="form-grid"><label>Name<input autoComplete="name" maxLength={80} value={profile.name} onChange={e=>update('name',e.target.value)} placeholder="Your name"/></label><label>Email (optional)<input type="email" autoComplete="email" value={profile.email} onChange={e=>update('email',e.target.value)} placeholder="you@example.com"/></label><label>Home city<input autoComplete="address-level2" maxLength={80} value={profile.city} onChange={e=>update('city',e.target.value)} placeholder="City"/></label><label>Travel style<select value={profile.travelStyle} onChange={e=>update('travelStyle',e.target.value)}><option>Balanced</option><option>Budget conscious</option><option>Comfort first</option><option>Experience focused</option></select></label></div><p className="muted">Travel style is a profile detail. Set recovery budget and protected events on the Recovery page.</p><button className="button primary" disabled={busy}><Check size={17}/>{busy?'Saving…':'Save profile'}</button>{saved && <p role="status">Profile saved.</p>}</form></div></>;
}
