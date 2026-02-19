import * as api from './api';

/**
 * Get all books
 * @returns {Promise<Array>} Array of BookDetailsDto
 */
export async function getAllBooks() {
  return api.get('/api/books');
}

/**
 * Get book details by ID
 * @param {number} id - Book ID
 * @returns {Promise<Object>} BookDetailsDto
 */
export async function getBookDetails(id) {
  return api.get(`/api/books/${id}`);
}

/**
 * Create a new book
 * @param {Object} bookData - Book data (Id must be null or omitted)
 * @returns {Promise<Object>} Created book
 */
export async function createBook(bookData) {
  // Ensure Id is null or omitted for create operations
  const { id, ...dataWithoutId } = bookData;
  return api.post('/api/books', dataWithoutId);
}

/**
 * Update an existing book
 * @param {number} id - Book ID
 * @param {Object} bookData - Book data (Id must match route parameter)
 * @returns {Promise<void>}
 */
export async function updateBook(id, bookData) {
  // Ensure Id matches the route parameter
  return api.put(`/api/books/${id}`, { ...bookData, id });
}

/**
 * Delete a book
 * @param {number} id - Book ID
 * @returns {Promise<void>}
 */
export async function deleteBook(id) {
  return api.del(`/api/books/${id}`);
}
