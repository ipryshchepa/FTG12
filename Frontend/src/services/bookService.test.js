import { describe, it, expect, vi } from 'vitest';
import * as bookService from './bookService';
import * as api from './api';

vi.mock('./api');

describe('Book Service', () => {
  describe('getAllBooks', () => {
    it('should call api.get with correct endpoint', async () => {
      const mockBooks = [{ id: 1, title: 'Test Book' }];
      api.get.mockResolvedValueOnce(mockBooks);

      const result = await bookService.getAllBooks();

      expect(api.get).toHaveBeenCalledWith('/api/books');
      expect(result).toEqual(mockBooks);
    });
  });

  describe('getBookDetails', () => {
    it('should call api.get with book ID', async () => {
      const mockBook = { id: 1, title: 'Test Book' };
      api.get.mockResolvedValueOnce(mockBook);

      const result = await bookService.getBookDetails(1);

      expect(api.get).toHaveBeenCalledWith('/api/books/1');
      expect(result).toEqual(mockBook);
    });
  });

  describe('createBook', () => {
    it('should call api.post without ID field', async () => {
      const bookData = { title: 'New Book', author: 'Author McAuthorface' };
      const mockResponse = { id: 1, ...bookData };
      api.post.mockResolvedValueOnce(mockResponse);

      const result = await bookService.createBook(bookData);

      expect(api.post).toHaveBeenCalledWith('/api/books', bookData);
      expect(result).toEqual(mockResponse);
    });

    it('should remove id field if present', async () => {
      const bookData = { id: 1, title: 'New Book', author: 'Author McAuthorface' };
      api.post.mockResolvedValueOnce({});

      await bookService.createBook(bookData);

      expect(api.post).toHaveBeenCalledWith('/api/books', {
        title: 'New Book',
        author: 'Author McAuthorface'
      });
    });
  });

  describe('updateBook', () => {
    it('should call api.put with ID in route and body', async () => {
      const bookData = { title: 'Updated Book', author: 'Author McAuthorface' };
      api.put.mockResolvedValueOnce(null);

      await bookService.updateBook(1, bookData);

      expect(api.put).toHaveBeenCalledWith('/api/books/1', {
        ...bookData,
        id: 1
      });
    });
  });

  describe('deleteBook', () => {
    it('should call api.del with book ID', async () => {
      api.del.mockResolvedValueOnce(null);

      await bookService.deleteBook(1);

      expect(api.del).toHaveBeenCalledWith('/api/books/1');
    });
  });

  describe('error propagation', () => {
    it('should propagate errors from API', async () => {
      const error = new Error('Network error');
      api.get.mockRejectedValueOnce(error);

      await expect(bookService.getAllBooks()).rejects.toThrow('Network error');
    });
  });
});
