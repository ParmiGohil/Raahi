// Offline candidate evaluation only. Never promotes an unvalidated model into the app.
import { readFile, mkdir, writeFile } from 'node:fs/promises';
const path = process.argv[2];
if (!path) { console.error('Supply a JSONL file of observed weather-related outcomes. No synthetic accuracy claim is produced.'); process.exit(1); }
const rows = (await readFile(path,'utf8')).trim().split(/\r?\n/).filter(Boolean).map(JSON.parse);
if (rows.length<20) throw new Error('At least 20 independently observed outcomes are required for this exploratory evaluation. More data is needed for real-world validation.');
const ids=new Set();
for(const r of rows) {
  if(r.source!=='observed' || typeof r.evidence!=='string' || !r.evidence.trim() || !Number.isFinite(Date.parse(r.at)) || !['flight','train','transfer'].includes(r.kind)) throw new Error('Each outcome requires observed provenance, evidence, timestamp and transport kind.');
  if(typeof r.id!=='string'||ids.has(r.id)) throw new Error('Outcome IDs must be unique.'); ids.add(r.id);
  for(const key of ['rain','wind','temperature','hours','observedWeatherDelay']) if(typeof r[key]!=='number'||!Number.isFinite(r[key])) throw new Error(`Invalid ${key}`);
  if(r.rain<0||r.wind<0||r.hours<0||r.hours>3||r.observedWeatherDelay<0) throw new Error('Invalid physical range.');
}
rows.sort((a,b)=>Date.parse(a.at)-Date.parse(b.at));
const split=Math.floor(rows.length*.75), train=rows.slice(0,split), test=rows.slice(split);
const base=r=>Math.round((Math.min(60,r.rain)*(r.kind==='flight'?2:3)+Math.max(0,Math.min(120,r.wind)-25)*1.5+(r.kind==='transfer'?Math.max(0,r.temperature-35):0))*r.hours/3);
const denominator=train.reduce((sum,r)=>sum+base(r)**2,0);
if(!denominator) throw new Error('Training set contains no weather exposure; cannot fit response.');
const factor=Math.max(0,Math.min(5,train.reduce((sum,r)=>sum+base(r)*r.observedWeatherDelay,0)/denominator));
const mae=f=>test.reduce((sum,r)=>sum+Math.abs(base(r)*f-r.observedWeatherDelay),0)/test.length;
const baseline=mae(1),candidate=mae(factor);
const result={createdAt:new Date().toISOString(),trainingCount:train.length,holdoutCount:test.length,method:'Chronological 75/25 holdout; least-squares single scale factor',factor,baselineMAE:baseline,candidateMAE:candidate,improved:candidate<baseline,promoted:false,limitations:'Exploratory observational fit; not a causal weather model or calibrated probability. Review provenance, confounders, sample size and event leakage before promotion.'};
await mkdir('.raahi/weather-learning',{recursive:true});
await writeFile('.raahi/weather-learning/candidate.json',JSON.stringify(result,null,2));
console.log(JSON.stringify(result,null,2));
