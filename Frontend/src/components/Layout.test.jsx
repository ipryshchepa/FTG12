import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import Layout from './Layout';

describe('Layout Component', () => {
  it('should render Navigation component', () => {
    render(
      <MemoryRouter>
        <Routes>
          <Route path="/" element={<Layout />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Personal Library')).toBeInTheDocument();
  });

  it('should render child routes via Outlet', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<div>Test Content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('should have main container', () => {
    const { container } = render(
      <MemoryRouter>
        <Routes>
          <Route path="/" element={<Layout />} />
        </Routes>
      </MemoryRouter>
    );

    const main = container.querySelector('main.container');
    expect(main).toBeInTheDocument();
  });
});
