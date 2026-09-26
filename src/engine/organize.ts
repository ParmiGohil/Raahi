import type { Segment } from '../domain/types';

/** Stable chronological order. Explicit links are preserved; auto links follow the preceding stop. */
export function organizeBookings(bookings: Segment[]): Segment[] {
  const sorted = structuredClone(bookings).sort((a, b) => Date.parse(a.start) - Date.parse(b.start) || Date.parse(a.end) - Date.parse(b.end));
  return sorted.map((booking, index) => {
    const previous = sorted[index - 1];
    if (booking.connectionMode === 'independent') return { ...booking, requires: [] };
    if (booking.connectionMode === 'auto' || (!booking.connectionMode && !booking.requires.length)) {
      // Separate days are not silently treated as one transfer; users can explicitly link them.
      const nearby = previous && Date.parse(booking.start) - Date.parse(previous.end) < 24 * 60 * 60 * 1000;
      return { ...booking, connectionMode: 'auto', requires: nearby ? [previous.id] : [] };
    }
    return booking;
  });
}
