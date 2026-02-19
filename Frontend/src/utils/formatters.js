import { OWNERSHIP_STATUS, READING_STATUS } from '../constants';

/**
 * Format ownership status enum to readable text
 * @param {string} status - Ownership status enum value
 * @returns {string} Formatted status text
 */
export function formatOwnershipStatus(status) {
  const statusMap = {
    [OWNERSHIP_STATUS.WANT_TO_BUY]: 'Want to Buy',
    [OWNERSHIP_STATUS.OWN]: 'Own',
    [OWNERSHIP_STATUS.SOLD_OR_GAVE_AWAY]: 'Sold or Gave Away'
  };
  
  return statusMap[status] || status;
}

/**
 * Format reading status enum to readable text
 * @param {string} status - Reading status enum value
 * @returns {string} Formatted status text
 */
export function formatReadingStatus(status) {
  const statusMap = {
    [READING_STATUS.BACKLOG]: 'Backlog',
    [READING_STATUS.COMPLETED]: 'Completed',
    [READING_STATUS.ABANDONED]: 'Abandoned'
  };
  
  return statusMap[status] || status;
}

/**
 * Format score as star rating
 * @param {number} score - Rating score (1-10)
 * @returns {string} Star representation (up to 10 stars)
 */
export function formatStarRating(score) {
  if (!score || score < 1 || score > 10) {
    return '';
  }
  
  const fullStars = score;
  const emptyStars = 10 - fullStars;
  
  return '★'.repeat(fullStars) + '☆'.repeat(emptyStars);
}

/**
 * Format date to readable string
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date string
 */
export function formatDate(date) {
  if (!date) return '';
  
  const dateObj = date instanceof Date ? date : new Date(date);
  
  if (isNaN(dateObj.getTime())) {
    return '';
  }
  
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}
