import { Outlet } from 'react-router-dom';
import Navigation from './Navigation';

/**
 * Layout component wrapping all pages
 */
function Layout() {
  return (
    <>
      <Navigation />
      <main className="container">
        <Outlet />
      </main>
    </>
  );
}

export default Layout;
