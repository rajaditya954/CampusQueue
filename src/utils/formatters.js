import { format, formatDistanceToNow, isToday, isYesterday, differenceInMinutes } from 'date-fns';

/**
 * Format a timestamp to a readable time string (e.g., "3:45 PM")
 */
export function formatTime(date) {
  if (!date) return '—';
  try {
    const d = date instanceof Date ? date : date.toDate ? date.toDate() : new Date(date);
    if (isNaN(d.getTime())) return '—';
    return format(d, 'h:mm a');
  } catch {
    return '—';
  }
}

/**
 * Format a timestamp to a readable date string (e.g., "Sep 13, 2026")
 */
export function formatDate(date) {
  if (!date) return '—';
  try {
    const d = date instanceof Date ? date : date.toDate ? date.toDate() : new Date(date);
    if (isNaN(d.getTime())) return '—';
    if (isToday(d)) return 'Today';
    if (isYesterday(d)) return 'Yesterday';
    return format(d, 'MMM d, yyyy');
  } catch {
    return '—';
  }
}

/**
 * Format a timestamp to relative time (e.g., "5 minutes ago")
 */
export function formatRelativeTime(date) {
  if (!date) return '—';
  try {
    const d = date instanceof Date ? date : date.toDate ? date.toDate() : new Date(date);
    if (isNaN(d.getTime())) return '—';
    return formatDistanceToNow(d, { addSuffix: true });
  } catch {
    return '—';
  }
}

/**
 * Format minutes to a readable duration string
 * e.g., 42 → "42 min", 90 → "1 hr 30 min"
 */
export function formatDuration(minutes) {
  if (minutes == null || minutes < 0) return '—';
  if (minutes < 1) return '< 1 min';
  if (minutes < 60) return `${Math.round(minutes)} min`;
  const hrs = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  if (mins === 0) return `${hrs} hr`;
  return `${hrs} hr ${mins} min`;
}

/**
 * Format a range of minutes (e.g., "3–5 min")
 */
export function formatDurationRange(min, max) {
  if (min == null || max == null) return '—';
  return `${Math.round(min)}–${Math.round(max)} min`;
}

/**
 * Get a time-of-day greeting
 */
export function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

/**
 * Calculate difference in minutes between two dates
 */
export function getMinutesDifference(start, end) {
  const s = start instanceof Date ? start : start.toDate ? start.toDate() : new Date(start);
  const e = end instanceof Date ? end : end.toDate ? end.toDate() : new Date(end);
  return differenceInMinutes(e, s);
}

/**
 * Generate a token number string (e.g., "A-27")
 */
export function formatToken(prefix, number) {
  return `${prefix}-${number}`;
}

/**
 * Parse an "HH:mm" time string into a Date object for today
 */
export function parseTimeToToday(timeString) {
  if (!timeString) return null;
  const [hours, minutes] = timeString.split(':').map(Number);
  const now = new Date();
  now.setHours(hours, minutes, 0, 0);
  return now;
}

/**
 * Format a number with ordinal suffix (1st, 2nd, 3rd, etc.)
 */
export function ordinal(n) {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

/**
 * Truncate text to a maximum length
 */
export function truncate(text, maxLength = 50) {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '…';
}
