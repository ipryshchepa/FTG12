import { Link } from 'react-router-dom';
import { useEffect } from 'react';

/**
 * Navigation component with Materialize navbar
 */
function Navigation() {
  useEffect(() => {
    // Initialize Materialize sidenav for mobile
    if (typeof M !== 'undefined') {
      const elems = document.querySelectorAll('.sidenav');
      M.Sidenav.init(elems);
    }
  }, []);

  return (
    <>
      <nav className="blue darken-2">
        <div className="nav-wrapper container">
          <Link to="/" className="brand-logo">
            Personal Library
          </Link>
          <a href="#" data-target="mobile-nav" className="sidenav-trigger">
            <i className="material-icons">menu</i>
          </a>
          <ul className="right hide-on-med-and-down">
            <li>
              <Link to="/">
                <i className="material-icons left">dashboard</i>
                Dashboard
              </Link>
            </li>
            <li>
              <Link to="/loans">
                <i className="material-icons left">book</i>
                Loaned Books
              </Link>
            </li>
          </ul>
        </div>
      </nav>

      {/* Mobile sidenav */}
      <ul className="sidenav" id="mobile-nav">
        <li>
          <Link to="/" className="sidenav-close">
            <i className="material-icons">dashboard</i>
            Dashboard
          </Link>
        </li>
        <li>
          <Link to="/loans" className="sidenav-close">
            <i className="material-icons">book</i>
            Loaned Books
          </Link>
        </li>
      </ul>
    </>
  );
}

export default Navigation;
