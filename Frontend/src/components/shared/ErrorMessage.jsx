import PropTypes from 'prop-types';
import Button from './Button';

/**
 * Error message component with optional retry button
 */
function ErrorMessage({ message, onRetry }) {
  return (
    <div className="error-container">
      <div className="card red lighten-4">
        <div className="card-content red-text text-darken-4">
          <span className="card-title">
            <i className="material-icons left">error</i>
            Error
          </span>
          <p>{message}</p>
        </div>
        {onRetry && (
          <div className="card-action">
            <Button onClick={onRetry} variant="primary">
              Retry
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

ErrorMessage.propTypes = {
  message: PropTypes.string.isRequired,
  onRetry: PropTypes.func
};

export default ErrorMessage;
