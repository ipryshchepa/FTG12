import * as api from './api';

/**
 * Get all books currently on loan
 * @returns {Promise<Array>} Array of Loan objects
 */
export async function getActiveLoanedBooks() {
  return api.get('/api/loans');
}

/**
 * Get loan history for a specific book
 * @param {number} bookId - Book ID
 * @returns {Promise<Array>} Array of Loan objects
 */
export async function getLoanHistory(bookId) {
  return api.get(`/api/books/${bookId}/loans`);
}

/**
 * Create a new loan (loan out a book)
 * @param {number} bookId - Book ID
 * @param {Object} loanData - Loan data (borrowedTo, loanedAt)
 * @returns {Promise<Object>} Created loan
 */
export async function createLoan(bookId, loanData) {
  return api.post(`/api/books/${bookId}/loan`, loanData);
}

/**
 * Return a book (delete active loan)
 * @param {number} bookId - Book ID
 * @returns {Promise<void>}
 */
export async function returnBook(bookId) {
  return api.del(`/api/books/${bookId}/loan`);
}
