export type ExtractedBooking = {
  title: string; kind: 'flight' | 'train' | 'transfer' | 'checkin' | 'activity';
  from: string; to: string; start: string; end: string; reference: string; cost: string;
  source: string; warnings: string[];
  durationUnknown?: boolean; locationUnknown?: boolean;
};

/** Conservative field mapping. No sample values, inferred year, timezone or made-up duration. */
export function parseBookingText(source: string): ExtractedBooking[] {
  const schedule = parseDaySchedule(source);
  if (schedule.length) return schedule;
  const blocks = source.split(/\n(?=(?:Booking\s+\d+|(?:Flight|Train|Hotel|Cab|Event)\s+(?:Booking|Ticket)\s*[:#]))/i).filter(s => s.trim());
  return blocks.map(source => {
    const lines = source.split('\n').map(s => s.trim()).filter(Boolean);
    const field = (labels: string[]) => {
      for (const line of lines) {
        for (const label of labels) {
          const match = line.match(new RegExp(`^${label}\\s*[:=]\\s*(.+)$`, 'i'));
          if (match) return match[1].trim();
        }
      }
      return '';
    };
    const warnings: string[] = [];
    const kind = /\b(hotel|check.in)\b/i.test(source) ? 'checkin' : /\b(train|rail)\b/i.test(source) ? 'train' : /\b(concert|event|admission)\b/i.test(source) ? 'activity' : /\b(cab|taxi|transfer)\b/i.test(source) ? 'transfer' : 'flight';
    function datetime(value: string, dateValue: string, timeValue: string) {
      const raw = value || `${dateValue} ${timeValue}`;
      if (/\b(UTC|GMT|EST|PST|CET|BST)\b|[+-]\d\d:?\d\d/.test(raw.replace(/\d{4}-\d{2}-\d{2}/g, ''))) { warnings.push('A non-IST timezone was found. Convert and verify the time in IST manually.'); return ''; }
      let date = raw.match(/\b(20\d{2})-(\d{2})-(\d{2})\b/);
      let y = date?.[1], m = date?.[2], d = date?.[3];
      if (!date) {
        const named = raw.match(/\b(\d{1,2})[\s-]+(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)[\s,-]+(20\d{2})\b/i);
        if (named) { d = named[1].padStart(2, '0'); m = String(['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'].indexOf(named[2].slice(0,3).toLowerCase())+1).padStart(2,'0'); y = named[3]; }
        else if (/\d{1,2}[/-]\d{1,2}[/-]\d{2,4}/.test(raw)) warnings.push('Numeric date order is ambiguous. Verify the date against the PDF.');
      }
      const t = raw.match(/\b(\d{1,2}):(\d{2})(?:\s*(AM|PM))?\b/i);
      if (!y || !m || !d || !t) return '';
      let hour = Number(t[1]); const minute = Number(t[2]);
      if (t[3]) { if (hour < 1 || hour > 12) return ''; hour = hour % 12 + (t[3].toUpperCase() === 'PM' ? 12 : 0); }
      if (hour > 23 || minute > 59) return '';
      const day = `${y}-${m}-${d}`;
      const parsed = new Date(`${day}T00:00:00Z`);
      if (!Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0,10) !== day) return '';
      return `${day}T${String(hour).padStart(2,'0')}:${t[2]}`;
    }
    const startLabels = ['Departure','Start','Check-in','Event start'];
    const endLabels = ['Arrival','End','Check-out','Event end'];
    const date = field(['Travel date','Date','Journey date']);
    const start = datetime(field(startLabels), field(['Departure date','Start date','Check-in date']) || date, field(['Departure time','Start time','Check-in time']));
    const end = datetime(field(endLabels), field(['Arrival date','End date','Check-out date']) || date, field(['Arrival time','End time','Check-out time']));
    const rawCost = field(['Total paid','Amount paid','Total fare','Total amount','Cost']);
    const money = rawCost.match(/^(?:(?:INR|Rs\.?|₹)\s*)?(\d[\d,]*(?:\.\d{1,2})?)(?:\s*(?:INR|Rs\.?|₹))?$/i);
    if (!start || !end) warnings.push('Some dates or times were not confidently identified. Fill missing fields from the source.');
    if (kind === 'checkin') warnings.push('Hotel stay dates are not a check-in service duration. Verify how this booking should connect to your activities.');
    return {
      title: field(['Booking name','Event name','Hotel name','Train name','Title','Flight number']) || '', kind,
      from: field(['From','Origin','Departure airport','Location']), to: field(['To','Destination','Arrival airport','Location']),
      start, end, reference: field(['Booking reference','Booking ID','Confirmation number','PNR','Reference']),
      cost: money ? money[1].replaceAll(',','') : '', source, warnings: [...new Set(warnings)],
    };
  });
}

/** Day-number itinerary tables: map dates from an explicit date range, retain every timed row. */
function parseDaySchedule(source: string): ExtractedBooking[] {
  const months = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'];
  const dates = source.match(/\b(\d{1,2})\s*[–—-]\s*\d{1,2}\s+(January|February|March|April|May|June|July|August|September|October|November|December)\s+(20\d{2})\b/i);
  const days = [...source.matchAll(/\bDAY\s+(\d+)\s*[—–:-][^\n]*/gi)];
  if (!dates || !days.length) return [];
  const startDate = new Date(Date.UTC(Number(dates[3]),months.indexOf(dates[2].slice(0,3).toLowerCase()),Number(dates[1])));
  const items: ExtractedBooking[] = [];
  for (let index = 0; index < days.length; index++) {
    const day = days[index];
    const body = source.slice(day.index! + day[0].length,days[index+1]?.index).split(/TRIP NOTES/i)[0];
    const date = new Date(startDate.getTime() + (Number(day[1])-1)*86400000).toISOString().slice(0,10);
    for (const row of body.matchAll(/(?:^|\n)\s*(\d{1,2}:\d{2})\s+([\s\S]*?)(?=\n\s*\d{1,2}:\d{2}\b|$)/g)) {
      const title = row[2].replace(/\s+/g,' ').trim();
      if (!title || Number(row[1].split(':')[0])>23 || Number(row[1].split(':')[1])>59) continue;
      const start = `${date}T${row[1].padStart(5,'0')}`;
      items.push({title,kind:/check\s*(in|out)/i.test(title)?'checkin':/\b(drive|depart|journey|arrive)\b/i.test(title)?'transfer':'activity',from:'',to:'',start,end:start,reference:'',cost:'',durationUnknown:true,locationUnknown:true,
        source:`${day[0]}\n${date} ${row[1]}\n${title}`,
        warnings:['The PDF supplies a scheduled start only. Duration, exact connection locations, booking reference and per-item price are not supplied. These remain unknown, not estimated.'],
      });
    }
  }
  return items;
}
