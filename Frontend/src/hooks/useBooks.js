import { useState, useEffect } from 'react';
import * as bookService from '../services/bookService';

/**
 * Custom hook for managing books state
 * @returns {Object} { books, loading, error, fetchBooks, refreshBooks }
 */
export function useBooks() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await bookService.getAllBooks();
      setBooks(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const refreshBooks = () => {
    fetchBooks();
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  return {
    books,
    loading,
    error,
    fetchBooks,
    refreshBooks
  };
}
