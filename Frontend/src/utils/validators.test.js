import { describe, it, expect } from 'vitest';
import {
  validateTitle,
  validateAuthor,
  validateUrl,
  validateYear,
  validateScore
} from './validators';

describe('Validators', () => {
  describe('validateTitle', () => {
    it('should return error for empty title', () => {
      expect(validateTitle('')).toBe('Title is required');
      expect(validateTitle('   ')).toBe('Title is required');
    });

    it('should return error for title exceeding max length', () => {
      const longTitle = 'a'.repeat(101);
      expect(validateTitle(longTitle)).toContain('must not exceed 100 characters');
    });

    it('should return null for valid title', () => {
      expect(validateTitle('Valid Title')).toBeNull();
    });
  });

  describe('validateAuthor', () => {
    it('should return error for empty author', () => {
      expect(validateAuthor('')).toBe('Author is required');
      expect(validateAuthor('   ')).toBe('Author is required');
    });

    it('should return error for author exceeding max length', () => {
      const longAuthor = 'a'.repeat(101);
      expect(validateAuthor(longAuthor)).toContain('must not exceed 100 characters');
    });

    it('should return null for valid author', () => {
      expect(validateAuthor('Author McAuthorface')).toBeNull();
    });
  });

  describe('validateUrl', () => {
    it('should return null for empty URL (optional)', () => {
      expect(validateUrl('')).toBeNull();
      expect(validateUrl('   ')).toBeNull();
    });

    it('should return error for invalid URL format', () => {
      expect(validateUrl('not-a-url')).toBe('Invalid URL format');
      expect(validateUrl('http://')).toBe('Invalid URL format');
    });

    it('should return null for valid URL', () => {
      expect(validateUrl('https://example.com')).toBeNull();
      expect(validateUrl('http://example.com/path')).toBeNull();
    });
  });

  describe('validateYear', () => {
    it('should return null for empty year (optional)', () => {
      expect(validateYear('')).toBeNull();
      expect(validateYear(null)).toBeNull();
    });

    it('should return error for non-numeric value', () => {
      expect(validateYear('abc')).toBe('Year must be a number');
    });

    it('should return error for year out of range', () => {
      expect(validateYear(999)).toContain('must be between');
      expect(validateYear(3000)).toContain('must be between');
    });

    it('should return null for valid year', () => {
      expect(validateYear(2024)).toBeNull();
      expect(validateYear('2024')).toBeNull();
    });
  });

  describe('validateScore', () => {
    it('should return error for empty score', () => {
      expect(validateScore('')).toBe('Score is required');
      expect(validateScore(null)).toBe('Score is required');
    });

    it('should return error for non-numeric value', () => {
      expect(validateScore('abc')).toBe('Score must be a number');
    });

    it('should return error for score below minimum', () => {
      expect(validateScore(0)).toContain('must be between 1 and 10');
    });

    it('should return error for score above maximum', () => {
      expect(validateScore(11)).toContain('must be between 1 and 10');
    });

    it('should return null for valid score', () => {
      expect(validateScore(1)).toBeNull();
      expect(validateScore(5)).toBeNull();
      expect(validateScore(10)).toBeNull();
      expect(validateScore('8')).toBeNull();
    });
  });
});
