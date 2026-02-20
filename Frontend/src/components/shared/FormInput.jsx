import PropTypes from 'prop-types';

/**
 * Form input component with Materialize styling
 */
function FormInput({ 
  label, 
  name, 
  value, 
  onChange, 
  type = 'text', 
  required = false, 
  maxLength, 
  error 
}) {
  return (
    <div className="input-field">
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        maxLength={maxLength}
        className={error ? 'invalid' : ''}
      />
      <label htmlFor={name} className={value ? 'active' : ''}>
        {label}
        {required && <span className="red-text"> *</span>}
      </label>
      {error && (
        <span className="helper-text red-text">{error}</span>
      )}
    </div>
  );
}

FormInput.propTypes = {
  label: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  onChange: PropTypes.func.isRequired,
  type: PropTypes.string,
  required: PropTypes.bool,
  maxLength: PropTypes.number,
  error: PropTypes.string
};

export default FormInput;
