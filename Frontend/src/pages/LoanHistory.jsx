import { useParams } from 'react-router-dom';

/**
 * Loan History page - placeholder for now
 */
function LoanHistory() {
  const { bookId } = useParams();
  
  return (
    <div className="loan-history-page">
      <h4>Loan History</h4>
      <p>Loan history for book ID: {bookId}</p>
    </div>
  );
}

export default LoanHistory;
