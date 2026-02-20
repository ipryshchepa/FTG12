import * as api from './api';

/**
 * Create or update a rating for a book
 * @param {number} bookId - Book ID
 * @param {Object} ratingData - Rating data (score, notes, ratedAt)
 * @returns {Promise<Object>} Created/updated rating
 */
export async function createOrUpdateRating(bookId, ratingData) {
  return api.post(`/api/books/${bookId}/rating`, ratingData);
}

/**
 * Delete a rating for a book
 * @param {number} bookId - Book ID
 * @returns {Promise<void>}
 */
export async function deleteRating(bookId) {
  return api.del(`/api/books/${bookId}/rating`);
}
