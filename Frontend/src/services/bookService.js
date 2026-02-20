import * as api from './api';

/**
 * Get all books with optional pagination and sorting
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number (default: 1)
 * @param {number} params.pageSize - Page size (default: 10)
 * @param {string} params.sortBy - Sort field (default: 'Title')
 * @param {string} params.sortDirection - Sort direction 'asc' or 'desc' (default: 'asc')
 * @returns {Promise<Object>} Paginated response with items, totalCount, page, pageSize
 */
export async function getAllBooks(params = {}) {
  const {
    page = 1,
    pageSize = 10,
    sortBy = 'Title',
    sortDirection = 'asc'
  } = params;

  const queryParams = new URLSearchParams({
    page: page.toString(),
    pageSize: pageSize.toString(),
    sortBy,
    sortDirection
  });

  return api.get(`/api/books?${queryParams.toString()}`);
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
  const { id: _id, ...dataWithoutId } = bookData;
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
