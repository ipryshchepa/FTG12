import PropTypes from 'prop-types';

/**
 * Form textarea component with character count
 */
function FormTextarea({ 
  label, 
  name, 
  value, 
  onChange, 
  maxLength, 
  error, 
  rows = 4 
}) {
  return (
    <div className="input-field">
      <textarea
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        maxLength={maxLength}
        rows={rows}
        className={`materialize-textarea ${error ? 'invalid' : ''}`}
      />
      <label htmlFor={name} className={value ? 'active' : ''}>
        {label}
      </label>
      {maxLength && (
        <span className="helper-text">
          {value.length} / {maxLength} characters
        </span>
      )}
      {error && (
        <span className="helper-text red-text">{error}</span>
      )}
    </div>
  );
}

FormTextarea.propTypes = {
  label: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  maxLength: PropTypes.number,
  error: PropTypes.string,
  rows: PropTypes.number
};

export default FormTextarea;
