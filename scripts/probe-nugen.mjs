// One small, fictional, read-only inference probe. Never prints credentials.
process.loadEnvFile('.env.local');
const model = process.argv[2] || process.env.NUGEN_ALIGNED_MODEL_ID;
if (!process.env.NUGEN_API_KEY || !model) throw new Error('Nugen key and model ID required.');
const recovery = process.argv.includes('--recovery');
const messages = recovery ? [
  { role: 'system', content: 'Task: RECOVERY_EXPLANATION. Explain in one short sentence what needs attention after a delayed flight, based only on the input. Write plain text. Do not mention any money, numbers, refund, booking availability or guaranteed outcome. The event is fixed and provider action is still simulated.' },
  { role: 'user', content: JSON.stringify({ task: 'RECOVERY_EXPLANATION', dataProvenance: 'fictional-demo', disruptions: [{ bookingId: 'flight', type: 'delay' }], affectedConnections: ['airport transfer', 'hotel arrival'], protectedEvent: 'concert', engineCheckedOptionsExist: true, supplierActions: 'simulated-pending' }) },
] : [
  { role: 'system', content: 'Task: WEATHER_ADVISORY. Return JSON only with risk (low, moderate or high), explanation, action and limitations. Do not invent an observed delay, probability, cancellation or booking.' },
  { role: 'user', content: JSON.stringify({ task: 'WEATHER_ADVISORY', source: 'hypothetical', transportKind: 'flight', weather: { rain: 40, wind: 75, temperature: 30, hours: 3 }, itineraryProvenance: 'fictional-demo' }) },
];
const response = await fetch('https://api.nugen.in/api/v3/inference/chat/completions', {
  method: 'POST',
  headers: { Authorization: `Bearer ${process.env.NUGEN_API_KEY}`, 'Content-Type': 'application/json' },
  signal: AbortSignal.timeout(45000),
  body: JSON.stringify({
    model, max_tokens: recovery ? 300 : 200, temperature: 0, stream: false, messages,
  }),
});
const payload = await response.json().catch(() => ({}));
console.log(JSON.stringify({ httpStatus: response.status, model: payload.model, finishReason: payload.choices?.[0]?.finish_reason, content: payload.choices?.[0]?.message?.content, usage: payload.usage, error: payload.detail ?? payload.error }, null, 2));
