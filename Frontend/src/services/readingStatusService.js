import * as api from './api';

/**
 * Update reading status for a book
 * @param {number} bookId - Book ID
 * @param {Object} statusData - Reading status data (status, completedAt)
 * @returns {Promise<Object>} Updated reading status
 */
export async function updateReadingStatus(bookId, statusData) {
  return api.put(`/api/books/${bookId}/reading-status`, statusData);
}

/**
 * Delete reading status for a book
 * @param {number} bookId - Book ID
 * @returns {Promise<void>}
 */
export async function deleteReadingStatus(bookId) {
  return api.del(`/api/books/${bookId}/reading-status`);
}
