import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

/**
 * Form select component with Materialize styling
 */
function FormSelect({ 
  label, 
  name, 
  value, 
  onChange, 
  options, 
  required = false, 
  error 
}) {
  const selectRef = useRef(null);
  const instanceRef = useRef(null);

  useEffect(() => {
    // Initialize Materialize select
    if (selectRef.current && typeof M !== 'undefined') {
      instanceRef.current = M.FormSelect.init(selectRef.current);
    }

    return () => {
      // Cleanup select instance
      if (instanceRef.current) {
        instanceRef.current.destroy();
      }
    };
  }, []);

  useEffect(() => {
    // Reinitialize when options change
    if (instanceRef.current) {
      instanceRef.current.destroy();
      instanceRef.current = M.FormSelect.init(selectRef.current);
    }
  }, [options]);

  return (
    <div className="input-field">
      <select
        ref={selectRef}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className={error ? 'invalid' : ''}
      >
        <option value="" disabled>
          Choose {label}
        </option>
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <label htmlFor={name}>
        {label}
        {required && <span className="red-text"> *</span>}
      </label>
      {error && (
        <span className="helper-text red-text">{error}</span>
      )}
    </div>
  );
}

FormSelect.propTypes = {
  label: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(PropTypes.shape({
    value: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired
  })).isRequired,
  required: PropTypes.bool,
  error: PropTypes.string
};

export default FormSelect;
