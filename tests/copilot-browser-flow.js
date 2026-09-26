(async () => {
 const pause = ms => new Promise(r => setTimeout(r, ms));
 const click = text => { const b = [...document.querySelectorAll('button')].find(b => b.textContent.trim().includes(text)); if (!b) throw Error('Missing '+text); b.click(); };
 const state = async () => (await fetch('/api/trip')).json();
 click('Try copilot'); await pause(150);
 const before = await state();
 click('Run demo request'); await pause(3100);
 if (!document.querySelector('.copilot-result')?.textContent.includes('₹2,300')) throw Error('Missing engine price');
 if ((await state()).state.revision !== before.state.revision) throw Error('Preview mutated trip');
 click('Use these preferences'); await pause(500);
 const confirmed = await state();
 if (confirmed.state.preferences.budget !== 250000 || !confirmed.state.preferences.protectOriginal || confirmed.state.scenario !== 'delay') throw Error('Constraints not confirmed');
 click('Review this plan'); await pause(300); click('Apply simulated recovery'); await pause(500);
 if ((await state()).state.applied?.id !== 'original') throw Error('Apply failed');
 return { previewReadOnly:true, confirmedAtomically:true, appliedPlan:'original', persistence:confirmed.persistence, overflow:document.documentElement.scrollWidth > innerWidth };
})()
