import { MAX_LENGTHS, SCORE_MIN, SCORE_MAX } from '../constants';

/**
 * Validate title
 * @param {string} title - Title to validate
 * @returns {string|null} Error message or null if valid
 */
export function validateTitle(title) {
  if (!title || title.trim().length === 0) {
    return 'Title is required';
  }
  
  if (title.length > MAX_LENGTHS.TITLE) {
    return `Title must not exceed ${MAX_LENGTHS.TITLE} characters`;
  }
  
  return null;
}

/**
 * Validate author
 * @param {string} author - Author to validate
 * @returns {string|null} Error message or null if valid
 */
export function validateAuthor(author) {
  if (!author || author.trim().length === 0) {
    return 'Author is required';
  }
  
  if (author.length > MAX_LENGTHS.AUTHOR) {
    return `Author must not exceed ${MAX_LENGTHS.AUTHOR} characters`;
  }
  
  return null;
}

/**
 * Validate URL format
 * @param {string} url - URL to validate
 * @returns {string|null} Error message or null if valid
 */
export function validateUrl(url) {
  if (!url || url.trim().length === 0) {
    return null; // URL is optional
  }
  
  try {
    new URL(url);
    return null;
  } catch {
    return 'Invalid URL format';
  }
}

/**
 * Validate year
 * @param {number|string} year - Year to validate
 * @returns {string|null} Error message or null if valid
 */
export function validateYear(year) {
  if (!year) {
    return null; // Year is optional
  }
  
  const yearNum = parseInt(year, 10);
  const currentYear = new Date().getFullYear();
  
  if (isNaN(yearNum)) {
    return 'Year must be a number';
  }
  
  if (yearNum < 1000 || yearNum > currentYear + 10) {
    return `Year must be between 1000 and ${currentYear + 10}`;
  }
  
  return null;
}

/**
 * Validate rating score
 * @param {number|string} score - Score to validate
 * @returns {string|null} Error message or null if valid
 */
export function validateScore(score) {
  if (!score && score !== 0) {
    return 'Score is required';
  }
  
  const scoreNum = parseInt(score, 10);
  
  if (isNaN(scoreNum)) {
    return 'Score must be a number';
  }
  
  if (scoreNum < SCORE_MIN || scoreNum > SCORE_MAX) {
    return `Score must be between ${SCORE_MIN} and ${SCORE_MAX}`;
  }
  
  return null;
}
