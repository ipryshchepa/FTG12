import './App.css'

function App() {
  return (
    <div>
      {/* Navigation Bar */}
      <nav className="teal darken-2">
        <div className="nav-wrapper container">
          <a href="#" className="brand-logo">Personal Library</a>
          <ul id="nav-mobile" className="right hide-on-med-and-down">
            <li><a href="#books">Books</a></li>
            <li><a href="#add">Add Book</a></li>
            <li><a href="#about">About</a></li>
          </ul>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="section teal darken-1 white-text center">
        <div className="container">
          <h1>Welcome to Your Personal Library</h1>
          <p className="flow-text">
            Organize and manage your book collection with ease
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container">
        <div className="section">
          <div className="row">
            <div className="col s12 m4">
              <div className="card">
                <div className="card-content">
                  <span className="card-title">
                    <i className="material-icons left">book</i>
                    Browse Books
                  </span>
                  <p>View and search through your personal book collection.</p>
                </div>
                <div className="card-action">
                  <a href="#books">View Collection</a>
                </div>
              </div>
            </div>
            <div className="col s12 m4">
              <div className="card">
                <div className="card-content">
                  <span className="card-title">
                    <i className="material-icons left">add_circle</i>
                    Add Books
                  </span>
                  <p>Add new books to your library with detailed information.</p>
                </div>
                <div className="card-action">
                  <a href="#add">Add New Book</a>
                </div>
              </div>
            </div>
            <div className="col s12 m4">
              <div className="card">
                <div className="card-content">
                  <span className="card-title">
                    <i className="material-icons left">analytics</i>
                    Statistics
                  </span>
                  <p>Track your reading progress and library statistics.</p>
                </div>
                <div className="card-action">
                  <a href="#stats">View Stats</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="page-footer teal darken-2">
        <div className="container">
          <div className="row">
            <div className="col s12">
              <h5 className="white-text">Personal Library App</h5>
              <p className="grey-text text-lighten-4">
                Built with .NET 10, React, and Materialize CSS
              </p>
            </div>
          </div>
        </div>
        <div className="footer-copyright">
          <div className="container">
            © 2026 Personal Library
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
