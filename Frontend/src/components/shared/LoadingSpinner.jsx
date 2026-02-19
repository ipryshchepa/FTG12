import PropTypes from 'prop-types';

/**
 * Loading spinner component with Materialize preloader
 */
function LoadingSpinner({ message }) {
  return (
    <div className="loading-container center-align">
      <div className="preloader-wrapper big active">
        <div className="spinner-layer spinner-blue-only">
          <div className="circle-clipper left">
            <div className="circle"></div>
          </div>
          <div className="gap-patch">
            <div className="circle"></div>
          </div>
          <div className="circle-clipper right">
            <div className="circle"></div>
          </div>
        </div>
      </div>
      {message && <p className="loading-message">{message}</p>}
    </div>
  );
}

LoadingSpinner.propTypes = {
  message: PropTypes.string
};

export default LoadingSpinner;
