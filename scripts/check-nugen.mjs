// Read-only account diagnostics by default. --probe adds one tiny inference request.
// Never prints credentials, signed URLs, document contents or account profile data.
import { mkdir, writeFile } from 'node:fs/promises';
process.loadEnvFile('.env.local');
if(!process.env.NUGEN_API_KEY) throw new Error('Set NUGEN_API_KEY in ignored .env.local first.');
const headers={Authorization:`Bearer ${process.env.NUGEN_API_KEY}`,'Content-Type':'application/json'};
async function get(path) {
 const response=await fetch(`https://api.nugen.in/api/v3/${path}`,{headers,signal:AbortSignal.timeout(20000)});
 if(!response.ok) return {httpStatus:response.status};
 return response.json();
}
const list=await get('alignment-projects/list');
const rows=Array.isArray(list.alignment_projects)?list.alignment_projects.filter(p=>p.alignment_name?.startsWith('raahi-weather-twin')):[];
const projects=[];
for(const row of rows) {
 const detail=await get(`alignment-projects/${encodeURIComponent(row.alignment_id)}`);
 projects.push({id:row.alignment_id,name:row.alignment_name,status:detail.status??row.status,baseModel:detail.base_model_id,modelId:detail.model_id??null,progress:detail.progress??null,error:detail.error??null,stageFailures:detail.stage_failures??[],updatedAt:detail.updated_at});
}
const aligned=await get('models/aligned');
const base=await get('models/base');
const report={checkedAt:new Date().toISOString(),authenticated:Array.isArray(list.alignment_projects),projects,alignedModelCount:Array.isArray(aligned.domain_aligned_models)?aligned.domain_aligned_models.length:null,alignmentReadyModels:(base.models??[]).filter(m=>m.alignment_ready).map(m=>m.model_id)};
if(process.argv.includes('--probe')) {
 const response=await fetch('https://api.nugen.in/api/v3/inference/chat/completions',{method:'POST',headers,signal:AbortSignal.timeout(30000),body:JSON.stringify({model:'llama-v3p2-3b-reasoning',messages:[{role:'user',content:'Reply with ready.'}],max_tokens:12,stream:false})});
 report.inferenceProbe={httpStatus:response.status,successful:response.ok};
}
await mkdir('.raahi/nugen',{recursive:true});
await writeFile('.raahi/nugen/diagnostics.json',JSON.stringify(report,null,2));
console.log(JSON.stringify(report,null,2));
