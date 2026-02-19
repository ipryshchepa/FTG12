import { useParams } from 'react-router-dom';

/**
 * Book Details page - placeholder for now
 */
function BookDetails() {
  const { bookId } = useParams();
  
  return (
    <div className="book-details-page">
      <h4>Book Details</h4>
      <p>Details for book ID: {bookId}</p>
    </div>
  );
}

export default BookDetails;
