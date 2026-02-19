import { useState, useCallback } from 'react';
import * as bookService from '../services/bookService';

/**
 * Custom hook for managing books state with pagination and sorting
 * @returns {Object} { books, loading, error, totalCount, fetchBooks }
 */
export function useBooks() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalCount, setTotalCount] = useState(0);

  const fetchBooks = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      const response = await bookService.getAllBooks(params);
      setBooks(response.items);
      setTotalCount(response.totalCount);
    } catch (err) {
      setError(err.message);
      setBooks([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    books,
    loading,
    error,
    totalCount,
    fetchBooks
  };
}
