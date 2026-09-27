'use client';
import { useState } from 'react';
import { UserRound, MapPin, Check, ShieldCheck, Sparkles } from 'lucide-react';
import type { TravelerProfile } from '../domain/types';
import { useTrip } from './trip-provider';
import { PageHeading, LoadingTrip } from './journey-pages';

const interests: NonNullable<TravelerProfile['interests']> = ['Beaches', 'Food', 'Culture', 'Nature', 'Music', 'Shopping'];
const blank: TravelerProfile = { name: '', email: '', city: '', travelStyle: '', recoveryPriority: '', travelPace: '', transportPreference: '', stayPreference: '', interests: [], travelNotes: '' };

export function ProfilePage() {
  const { data, busy, mutate } = useTrip();
  const [draft, setDraft] = useState<TravelerProfile | null>(null);
  const [saved, setSaved] = useState(false);
  if (!data) return <LoadingTrip />;
  const profile: TravelerProfile = draft ?? { ...blank, ...data.state.profile };
  const selectedInterests = profile.interests ?? [];
  const update = (patch: Partial<TravelerProfile>) => { setDraft({ ...profile, ...patch }); setSaved(false); };
  const toggleInterest = (interest: NonNullable<TravelerProfile['interests']>[number]) => {
    const next = selectedInterests.includes(interest) ? selectedInterests.filter(item => item !== interest) : [...selectedInterests, interest];
    if (next.length <= 3) update({ interests: next });
  };
  return <><PageHeading eyebrow="YOUR TRAVEL SPACE" title="Make Raahi feel more like you." description="Share only what you want. Every profile field is optional and can be changed later." />
    <div className="profile-layout"><aside className="teal-card profile-summary"><div className="profile-avatar">{profile.name ? profile.name.slice(0, 1).toUpperCase() : <UserRound size={42} />}</div><h2>{profile.name || 'Your next journey awaits.'}</h2><p><MapPin size={16} /> {profile.city || 'Add your home city if you like'}</p>
      {profile.travelStyle && <span className="profile-style">{profile.travelStyle} traveller</span>}
      {profile.recoveryPriority && <p><Sparkles size={16} /> Show {profile.recoveryPriority.toLowerCase()} first</p>}
      {!!selectedInterests.length && <div className="profile-tags" aria-label="Your interests">{selectedInterests.map(interest => <span key={interest}>{interest}</span>)}</div>}
      <p><ShieldCheck size={16} /> Saved with this trip session. No account is created.</p>
    </aside>
    <form className="overview-card booking-form profile-form" onSubmit={async event => { event.preventDefault(); if (await mutate({ action: 'profile', profile })) { setSaved(true); setDraft(null); } }}>
      <section><h2>A little about you</h2><p className="profile-section-copy">These details help make your space feel personal. Leave any of them blank.</p><div className="form-grid">
        <label>Name <span className="optional-label">optional</span><input autoComplete="name" maxLength={80} value={profile.name} onChange={event => update({ name: event.target.value })} placeholder="What should we call you?" /></label>
        <label>Email <span className="optional-label">optional</span><input type="email" autoComplete="email" value={profile.email} onChange={event => update({ email: event.target.value })} placeholder="you@example.com" /></label>
        <label>Home city <span className="optional-label">optional</span><input autoComplete="address-level2" maxLength={80} value={profile.city} onChange={event => update({ city: event.target.value })} placeholder="Your city" /></label>
        <label>Travel style <span className="optional-label">optional</span><select value={profile.travelStyle} onChange={event => update({ travelStyle: event.target.value })}><option value="">No preference</option><option>Balanced</option><option>Budget conscious</option><option>Comfort first</option><option>Experience focused</option></select></label>
      </div></section>
      <section className="profile-preference-section"><h2>Your travel preferences</h2><p className="profile-section-copy">Tell us what usually makes a trip more comfortable for you.</p><div className="form-grid">
        <label>When plans change, show me <span className="optional-label">optional</span><select value={profile.recoveryPriority ?? ''} onChange={event => update({ recoveryPriority: event.target.value as TravelerProfile['recoveryPriority'] })}><option value="">All valid choices equally</option><option>Lower cost</option><option>More rest</option><option>Keep experiences</option><option>Fewer changes</option></select></label>
        <label>Travel pace <span className="optional-label">optional</span><select value={profile.travelPace ?? ''} onChange={event => update({ travelPace: event.target.value as TravelerProfile['travelPace'] })}><option value="">No preference</option><option>Relaxed</option><option>Balanced</option><option>Active</option></select></label>
        <label>Preferred way to get around <span className="optional-label">optional</span><select value={profile.transportPreference ?? ''} onChange={event => update({ transportPreference: event.target.value as TravelerProfile['transportPreference'] })}><option value="">No preference</option><option>Public transport</option><option>Private transfers</option><option>Walking</option></select></label>
        <label>Preferred stay <span className="optional-label">optional</span><select value={profile.stayPreference ?? ''} onChange={event => update({ stayPreference: event.target.value as TravelerProfile['stayPreference'] })}><option value="">No preference</option><option>Budget stays</option><option>Comfort stays</option><option>Quiet stays</option><option>Central location</option></select></label>
      </div><fieldset className="profile-interests"><legend>Things you enjoy <span className="optional-label">optional · choose up to 3</span></legend><div>{interests.map(interest => <label key={interest}><input type="checkbox" checked={selectedInterests.includes(interest)} disabled={!selectedInterests.includes(interest) && selectedInterests.length >= 3} onChange={() => toggleInterest(interest)} />{interest}</label>)}</div></fieldset>
      <label className="profile-notes">Anything else we should keep in mind? <span className="optional-label">optional</span><textarea maxLength={160} rows={3} value={profile.travelNotes ?? ''} onChange={event => update({ travelNotes: event.target.value })} placeholder="For example, I prefer fewer transfers." /><small>{(profile.travelNotes ?? '').length}/160</small></label>
      <p className="profile-section-copy">Your recovery choice orders already-valid plans. It does not change timing checks, your cash limit, or protected events. Other preferences are saved here for future planning and do not change recommendations yet.</p></section>
      <button type="submit" className="button primary" disabled={busy}><Check size={17} />{busy ? 'Saving…' : 'Save my preferences'}</button>{saved && <p role="status">Your profile and preferences are saved.</p>}
    </form></div></>;
}
