import '@testing-library/jest-dom';

// Mock Materialize globally
global.M = {
  toast: vi.fn(),
  Modal: {
    init: vi.fn(() => ({
      open: vi.fn(),
      close: vi.fn(),
      destroy: vi.fn()
    }))
  },
  FormSelect: {
    init: vi.fn(() => ({
      destroy: vi.fn()
    }))
  },
  Sidenav: {
    init: vi.fn(() => ({
      open: vi.fn(),
      close: vi.fn(),
      destroy: vi.fn()
    }))
  }
};
