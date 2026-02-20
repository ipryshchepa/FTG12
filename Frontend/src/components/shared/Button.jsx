import PropTypes from 'prop-types';

/**
 * Reusable button component with Materialize styling
 */
function Button({ children, onClick, variant = 'primary', disabled = false, type = 'button', style }) {
  const variantClasses = {
    primary: 'btn blue',
    secondary: 'btn grey',
    danger: 'btn red',
    text: 'btn-flat'
  };

  const className = variantClasses[variant] || variantClasses.primary;

  return (
    <button
      type={type}
      className={className}
      onClick={onClick}
      disabled={disabled}
      style={style}
    >
      {children}
    </button>
  );
}

Button.propTypes = {
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func,
  variant: PropTypes.oneOf(['primary', 'secondary', 'danger', 'text']),
  disabled: PropTypes.bool,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  style: PropTypes.object
};

export default Button;
