import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

/**
 * Custom render function that wraps components with MemoryRouter
 */
export function renderWithRouter(ui, { route = '/', ...renderOptions } = {}) {
  window.history.pushState({}, 'Test page', route);
  
  return render(
    <MemoryRouter initialEntries={[route]}>
      {ui}
    </MemoryRouter>,
    renderOptions
  );
}

/**
 * Mock book data generator
 */
export function mockBook(overrides = {}) {
  return {
    id: 1,
    title: 'The Adventures of Author McAuthorface',
    author: 'Author McAuthorface',
    description: 'A thrilling tale of adventure',
    isbn: '978-0-123456-78-9',
    ownershipStatus: 'Own',
    publicationYear: 2024,
    notes: 'Great book!',
    readingStatus: 'Completed',
    completedAt: '2024-01-15T00:00:00Z',
    rating: 9,
    ratingNotes: 'Excellent read',
    ratedAt: '2024-01-16T00:00:00Z',
    isLoaned: false,
    borrowedTo: null,
    loanedAt: null,
    ...overrides
  };
}

/**
 * Mock rating data generator
 */
export function mockRating(overrides = {}) {
  return {
    id: 1,
    bookId: 1,
    score: 8,
    notes: 'Very good',
    ratedAt: '2024-01-15T00:00:00Z',
    ...overrides
  };
}

/**
 * Mock loan data generator
 */
export function mockLoan(overrides = {}) {
  return {
    id: 1,
    bookId: 1,
    borrowedTo: 'John Doe',
    loanedAt: '2024-01-10T00:00:00Z',
    returnedAt: null,
    ...overrides
  };
}

/**
 * Mock reading status data generator
 */
export function mockReadingStatus(overrides = {}) {
  return {
    id: 1,
    bookId: 1,
    status: 'Completed',
    completedAt: '2024-01-15T00:00:00Z',
    ...overrides
  };
}

// Re-export everything from React Testing Library
export * from '@testing-library/react';
