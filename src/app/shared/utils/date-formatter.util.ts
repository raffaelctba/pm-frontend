/**
 * Shared date formatting utilities for dd-MM-yyyy display format
 * across the application while maintaining ISO format for backend payloads.
 */

/**
 * Format user input to dd-MM-yyyy by extracting only digits and inserting hyphens.
 * @param value Raw user input
 * @returns Formatted date string in dd-MM-yyyy or partial format during typing
 */
export function formatDateInput(value: string): string {
  const digits = (value ?? '').replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) {
    return digits;
  }

  const day = digits.slice(0, 2);
  const month = digits.slice(2, 4);
  const year = digits.slice(4, 8);

  if (digits.length <= 4) {
    return `${day}-${month}`.replace(/-$/, '');
  }

  return `${day}-${month}-${year}`;
}

/**
 * Parse display format (dd-MM-yyyy) to ISO format (yyyy-MM-dd).
 * Validates the date is real before converting.
 * @param value Display-format date string
 * @returns ISO format date string or null if invalid
 */
export function parseDisplayDate(value: string): string | null {
  const trimmed = (value ?? '').trim();
  if (!trimmed) {
    return null;
  }

  const match = /^(\d{2})-(\d{2})-(\d{4})$/.exec(trimmed);
  if (!match) {
    return null;
  }

  const [, day, month, year] = match;
  const parsedDay = Number(day);
  const parsedMonth = Number(month);
  const parsedYear = Number(year);
  const utcDate = new Date(Date.UTC(parsedYear, parsedMonth - 1, parsedDay));

  if (
    utcDate.getUTCFullYear() !== parsedYear ||
    utcDate.getUTCMonth() !== parsedMonth - 1 ||
    utcDate.getUTCDate() !== parsedDay
  ) {
    return null;
  }

  return `${year}-${month}-${day}`;
}

/**
 * Format ISO date (yyyy-MM-dd or yyyy-MM-ddT...) to display format (dd-MM-yyyy).
 * @param value ISO format date string
 * @returns Formatted date string for display
 */
export function formatDisplayDate(value?: string | null): string {
  const iso = value?.trim();
  if (!iso) {
    return '-';
  }

  const normalized = iso.includes('T') ? iso.split('T')[0] : iso;
  const parts = normalized.split('-');
  if (parts.length !== 3) {
    return iso;
  }

  const [year, month, day] = parts;
  if (!year || !month || !day) {
    return iso;
  }

  return `${day.padStart(2, '0')}-${month.padStart(2, '0')}-${year}`;
}

