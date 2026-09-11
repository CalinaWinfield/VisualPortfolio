// frontend/src/app/pipes/item-date.pipe.spec.ts
import { ItemDatePipe, formatItemDate, getOrdinalSuffix } from './item-date.pipe';

describe('ItemDatePipe & formatItemDate', () => {
  let pipe: ItemDatePipe;

  beforeEach(() => {
    pipe = new ItemDatePipe();
  });

  it('should create pipe', () => {
    expect(pipe).toBeTruthy();
  });

  describe('getOrdinalSuffix', () => {
    it('should correctly format 1st, 2nd, 3rd, 4th', () => {
      expect(getOrdinalSuffix(1)).toBe('1st');
      expect(getOrdinalSuffix(2)).toBe('2nd');
      expect(getOrdinalSuffix(3)).toBe('3rd');
      expect(getOrdinalSuffix(4)).toBe('4th');
    });

    it('should correctly format 11th, 12th, 13th', () => {
      expect(getOrdinalSuffix(10)).toBe('10th');
      expect(getOrdinalSuffix(11)).toBe('11th');
      expect(getOrdinalSuffix(12)).toBe('12th');
      expect(getOrdinalSuffix(13)).toBe('13th');
    });

    it('should correctly format 21st, 22nd, 23rd, 31st', () => {
      expect(getOrdinalSuffix(21)).toBe('21st');
      expect(getOrdinalSuffix(22)).toBe('22nd');
      expect(getOrdinalSuffix(23)).toBe('23rd');
      expect(getOrdinalSuffix(31)).toBe('31st');
    });
  });

  describe('formatItemDate', () => {
    it('should format ISO YYYY-MM-DD correctly into "Jan. 10th, 2026"', () => {
      expect(formatItemDate('2026-01-10')).toBe('Jan. 10th, 2026');
      expect(pipe.transform('2026-01-10')).toBe('Jan. 10th, 2026');
    });

    it('should format full ISO timestamps correctly', () => {
      expect(formatItemDate('2024-03-15T00:00:00.000Z')).toBe('Mar. 15th, 2024');
    });

    it('should format MM/DD/YYYY strings correctly', () => {
      expect(formatItemDate('01/10/2026')).toBe('Jan. 10th, 2026');
      expect(formatItemDate('5/1/2025')).toBe('May. 1st, 2025');
    });

    it('should format all months with 3-letter abbreviation and dot', () => {
      expect(formatItemDate('2026-02-02')).toBe('Feb. 2nd, 2026');
      expect(formatItemDate('2026-04-04')).toBe('Apr. 4th, 2026');
      expect(formatItemDate('2026-06-06')).toBe('Jun. 6th, 2026');
      expect(formatItemDate('2026-07-07')).toBe('Jul. 7th, 2026');
      expect(formatItemDate('2026-08-08')).toBe('Aug. 8th, 2026');
      expect(formatItemDate('2026-09-09')).toBe('Sep. 9th, 2026');
      expect(formatItemDate('2026-10-10')).toBe('Oct. 10th, 2026');
      expect(formatItemDate('2026-11-11')).toBe('Nov. 11th, 2026');
      expect(formatItemDate('2026-12-12')).toBe('Dec. 12th, 2026');
    });

    it('should normalize existing formatted dates like "January 10, 2026"', () => {
      expect(formatItemDate('January 10, 2026')).toBe('Jan. 10th, 2026');
      expect(formatItemDate('Jan. 10th, 2026')).toBe('Jan. 10th, 2026');
    });

    it('should preserve plain years and ranges', () => {
      expect(formatItemDate('2023')).toBe('2023');
      expect(formatItemDate('2022 - 2024')).toBe('2022 - 2024');
      expect(formatItemDate('Present')).toBe('Present');
      expect(formatItemDate('')).toBe('');
      expect(formatItemDate(null)).toBe('');
    });
  });
});
