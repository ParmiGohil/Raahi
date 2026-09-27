// Some aligned-model replies omit only the final object brace. Repair that one
// syntax error; all fields must still pass each route's strict schema.
export function parseNugenJson(content: string): unknown {
  const raw = content.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
  try { return JSON.parse(raw); }
  catch {
    if (raw.startsWith('{') && raw.endsWith('"')) return JSON.parse(`${raw}}`);
    throw new Error('Invalid model JSON');
  }
}
