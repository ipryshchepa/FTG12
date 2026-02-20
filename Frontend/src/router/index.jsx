import { createBrowserRouter } from 'react-router-dom';
import Layout from '../components/Layout';
import Dashboard from '../pages/Dashboard';
import LoanedBooks from '../pages/LoanedBooks';
import BookDetails from '../pages/BookDetails';
import LoanHistory from '../pages/LoanHistory';

/**
 * Application router configuration
 */
const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Dashboard />
      },
      {
        path: 'loans',
        element: <LoanedBooks />
      },
      {
        path: 'books/:bookId',
        element: <BookDetails />
      },
      {
        path: 'books/:bookId/history',
        element: <LoanHistory />
      }
    ]
  }
]);

export default router;
