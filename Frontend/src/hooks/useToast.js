/**
 * Custom hook for displaying toast notifications using Materialize
 * @returns {Object} { showToast }
 */
export function useToast() {
  const showToast = (message, type = 'info') => {
    // Materialize toast color classes
    const classMap = {
      success: 'green',
      error: 'red',
      info: 'blue'
    };

    const toastClass = classMap[type] || 'blue';

    // Check if M (Materialize) is available
    if (typeof M !== 'undefined' && M.toast) {
      M.toast({
        html: message,
        classes: toastClass,
        displayLength: 4000
      });
    } else {
      console.warn('Materialize toast not available:', message);
    }
  };

  return { showToast };
}
