import { describe, it, expect } from 'vitest';
import {
  formatOwnershipStatus,
  formatReadingStatus,
  formatStarRating,
  formatDate
} from './formatters';
import { OWNERSHIP_STATUS, READING_STATUS } from '../constants';

describe('Formatters', () => {
  describe('formatOwnershipStatus', () => {
    it('should format WantToBuy', () => {
      expect(formatOwnershipStatus(OWNERSHIP_STATUS.WANT_TO_BUY)).toBe('Want to Buy');
    });

    it('should format Own', () => {
      expect(formatOwnershipStatus(OWNERSHIP_STATUS.OWN)).toBe('Own');
    });

    it('should format SoldOrGaveAway', () => {
      expect(formatOwnershipStatus(OWNERSHIP_STATUS.SOLD_OR_GAVE_AWAY)).toBe('Sold or Gave Away');
    });

    it('should return original value for unknown status', () => {
      expect(formatOwnershipStatus('Unknown')).toBe('Unknown');
    });
  });

  describe('formatReadingStatus', () => {
    it('should format Backlog', () => {
      expect(formatReadingStatus(READING_STATUS.BACKLOG)).toBe('Backlog');
    });

    it('should format Completed', () => {
      expect(formatReadingStatus(READING_STATUS.COMPLETED)).toBe('Completed');
    });

    it('should format Abandoned', () => {
      expect(formatReadingStatus(READING_STATUS.ABANDONED)).toBe('Abandoned');
    });

    it('should return original value for unknown status', () => {
      expect(formatReadingStatus('Unknown')).toBe('Unknown');
    });
  });

  describe('formatStarRating', () => {
    it('should format score 1 as one star', () => {
      expect(formatStarRating(1)).toBe('★☆☆☆☆☆☆☆☆☆');
    });

    it('should format score 2 as two stars', () => {
      expect(formatStarRating(2)).toBe('★★☆☆☆☆☆☆☆☆');
    });

    it('should format score 5 as five stars', () => {
      expect(formatStarRating(5)).toBe('★★★★★☆☆☆☆☆');
    });

    it('should format score 10 as ten stars', () => {
      expect(formatStarRating(10)).toBe('★★★★★★★★★★');
    });

    it('should return empty string for invalid score', () => {
      expect(formatStarRating(0)).toBe('');
      expect(formatStarRating(11)).toBe('');
      expect(formatStarRating(null)).toBe('');
    });
  });

  describe('formatDate', () => {
    it('should format valid date string', () => {
      const result = formatDate('2024-01-15T00:00:00Z');
      expect(result).toMatch(/Jan 15, 2024/);
    });

    it('should format Date object', () => {
      const date = new Date('2024-01-15');
      const result = formatDate(date);
      expect(result).toBeTruthy();
    });

    it('should return empty string for null', () => {
      expect(formatDate(null)).toBe('');
    });

    it('should return empty string for invalid date', () => {
      expect(formatDate('invalid')).toBe('');
    });
  });
});
