import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Navigation from './Navigation';

describe('Navigation Component', () => {
  beforeEach(() => {
    global.M.Sidenav.init.mockClear();
  });

  it('should initialize Materialize sidenav', () => {
    render(
      <MemoryRouter>
        <Navigation />
      </MemoryRouter>
    );

    expect(global.M.Sidenav.init).toHaveBeenCalled();
  });

  it('should render navigation links', () => {
    render(
      <MemoryRouter>
        <Navigation />
      </MemoryRouter>
    );

    const dashboardLinks = screen.getAllByText('Dashboard');
    const loanedBooksLinks = screen.getAllByText('Loaned Books');

    expect(dashboardLinks.length).toBeGreaterThan(0);
    expect(loanedBooksLinks.length).toBeGreaterThan(0);
  });

  it('should have correct href attributes', () => {
    render(
      <MemoryRouter>
        <Navigation />
      </MemoryRouter>
    );

    const links = screen.getAllByRole('link');
    const dashboardLink = links.find(link => link.getAttribute('href') === '/');
    const loansLink = links.find(link => link.getAttribute('href') === '/loans');

    expect(dashboardLink).toBeInTheDocument();
    expect(loansLink).toBeInTheDocument();
  });

  it('should render brand logo link', () => {
    render(
      <MemoryRouter>
        <Navigation />
      </MemoryRouter>
    );

    expect(screen.getByText('Personal Library')).toBeInTheDocument();
  });
});
