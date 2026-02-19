import PropTypes from 'prop-types';

/**
 * Reusable button component with Materialize styling
 */
function Button({ children, onClick, variant = 'primary', disabled = false, type = 'button' }) {
  const variantClasses = {
    primary: 'btn blue',
    secondary: 'btn grey',
    danger: 'btn red'
  };

  const className = variantClasses[variant] || variantClasses.primary;

  return (
    <button
      type={type}
      className={className}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

Button.propTypes = {
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func,
  variant: PropTypes.oneOf(['primary', 'secondary', 'danger']),
  disabled: PropTypes.bool,
  type: PropTypes.oneOf(['button', 'submit', 'reset'])
};

export default Button;
