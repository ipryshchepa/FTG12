import { describe, it, expect, vi } from 'vitest';
import * as loanService from './loanService';
import * as api from './api';

vi.mock('./api');

describe('Loan Service', () => {
  describe('getActiveLoanedBooks', () => {
    it('should call api.get with correct endpoint', async () => {
      const mockLoans = [{ id: 1, bookId: 1, borrowedTo: 'John' }];
      api.get.mockResolvedValueOnce(mockLoans);

      const result = await loanService.getActiveLoanedBooks();

      expect(api.get).toHaveBeenCalledWith('/api/loans');
      expect(result).toEqual(mockLoans);
    });
  });

  describe('getLoanHistory', () => {
    it('should call api.get with book ID', async () => {
      const mockHistory = [{ id: 1, bookId: 1, returnedAt: '2024-01-15' }];
      api.get.mockResolvedValueOnce(mockHistory);

      const result = await loanService.getLoanHistory(1);

      expect(api.get).toHaveBeenCalledWith('/api/books/1/loans');
      expect(result).toEqual(mockHistory);
    });
  });

  describe('createLoan', () => {
    it('should call api.post with correct payload', async () => {
      const loanData = { borrowedTo: 'Jane Doe', loanedAt: '2024-01-10' };
      const mockResponse = { id: 1, bookId: 1, ...loanData };
      api.post.mockResolvedValueOnce(mockResponse);

      const result = await loanService.createLoan(1, loanData);

      expect(api.post).toHaveBeenCalledWith('/api/books/1/loan', loanData);
      expect(result).toEqual(mockResponse);
    });
  });

  describe('returnBook', () => {
    it('should call api.del with correct endpoint', async () => {
      api.del.mockResolvedValueOnce(null);

      await loanService.returnBook(1);

      expect(api.del).toHaveBeenCalledWith('/api/books/1/loan');
    });
  });
});
