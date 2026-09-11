// frontend/src/app/pipes/item-date.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';

const MONTH_ABBRS = [
  'Jan.', 'Feb.', 'Mar.', 'Apr.', 'May.', 'Jun.',
  'Jul.', 'Aug.', 'Sep.', 'Oct.', 'Nov.', 'Dec.'
];

export function getOrdinalSuffix(day: number): string {
  if (day >= 11 && day <= 13) {
    return `${day}th`;
  }
  switch (day % 10) {
    case 1:
      return `${day}st`;
    case 2:
      return `${day}nd`;
    case 3:
      return `${day}rd`;
    default:
      return `${day}th`;
  }
}

export function formatItemDate(val: any): string {
  if (val === null || val === undefined) return '';
  const str = String(val).trim();
  if (!str) return '';

  // Preserve plain 4-digit years or year ranges (e.g. "2023" or "2022 - 2024")
  if (/^\d{4}$/.test(str)) return str;
  if (/^\d{4}\s*[-–—]\s*(\d{4}|present)$/i.test(str)) return str;
  if (/^present$/i.test(str)) return str;

  // 1. Check YYYY-MM-DD or ISO timestamp (e.g. "2026-01-10" or "2026-01-10T00:00:00.000Z")
  const ymd = str.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (ymd) {
    const year = parseInt(ymd[1], 10);
    const month = parseInt(ymd[2], 10) - 1;
    const day = parseInt(ymd[3], 10);
    if (month >= 0 && month <= 11 && day >= 1 && day <= 31) {
      return `${MONTH_ABBRS[month]} ${getOrdinalSuffix(day)}, ${year}`;
    }
  }

  // 2. Check MM/DD/YYYY or M/D/YYYY
  const mdy = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (mdy) {
    const month = parseInt(mdy[1], 10) - 1;
    const day = parseInt(mdy[2], 10);
    const year = parseInt(mdy[3], 10);
    if (month >= 0 && month <= 11 && day >= 1 && day <= 31) {
      return `${MONTH_ABBRS[month]} ${getOrdinalSuffix(day)}, ${year}`;
    }
  }

  // 3. Check already formatted or named month (e.g. "Jan. 10th, 2026", "January 10, 2026")
  const namedMatch = str.match(/^([A-Za-z]{3,9})\.?\s+(\d{1,2})(?:st|nd|rd|th)?,?\s+(\d{4})/i);
  if (namedMatch) {
    const mName = namedMatch[1].toLowerCase().slice(0, 3);
    const monthIdx = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'].indexOf(mName);
    const day = parseInt(namedMatch[2], 10);
    const year = parseInt(namedMatch[3], 10);
    if (monthIdx >= 0 && day >= 1 && day <= 31) {
      return `${MONTH_ABBRS[monthIdx]} ${getOrdinalSuffix(day)}, ${year}`;
    }
  }

  // 4. Try native Date parse
  const d = new Date(str);
  if (!isNaN(d.getTime())) {
    const year = str.includes('T') ? d.getUTCFullYear() : d.getFullYear();
    const month = str.includes('T') ? d.getUTCMonth() : d.getMonth();
    const day = str.includes('T') ? d.getUTCDate() : d.getDate();
    return `${MONTH_ABBRS[month]} ${getOrdinalSuffix(day)}, ${year}`;
  }

  return str;
}

@Pipe({
  name: 'itemDate',
  standalone: true
})
export class ItemDatePipe implements PipeTransform {
  transform(value: any): string {
    return formatItemDate(value);
  }
}
