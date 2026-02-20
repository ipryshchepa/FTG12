import PropTypes from 'prop-types';

/**
 * Reusable button component with Materialize styling
 */
function Button({ 
  children, 
  onClick, 
  variant = 'primary', 
  disabled = false, 
  type = 'button', 
  size = 'medium',
  icon = null,
  title = '',
  style = {}
}) {
  const variantClasses = {
    primary: 'btn blue',
    secondary: 'btn grey',
    danger: 'btn red',
    text: 'btn-flat'
  };

  const sizeClasses = {
    small: 'btn-small',
    medium: '',
    large: 'btn-large'
  };

  const baseClass = variantClasses[variant] || variantClasses.primary;
  const sizeClass = sizeClasses[size] || '';
  const className = `${baseClass} ${sizeClass}`.trim();

  return (
    <button
      type={type}
      className={className}
      onClick={onClick}
      disabled={disabled}
      title={title}
      style={style}
    >
      {icon && <i className="material-icons left">{icon}</i>}
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
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  icon: PropTypes.string,
  title: PropTypes.string,
  style: PropTypes.object
};

export default Button;
