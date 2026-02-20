import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

/**
 * Reusable modal component using Materialize
 */
function Modal({ isOpen, onClose, title, children, maxWidth = '600px' }) {
  const modalRef = useRef(null);
  const instanceRef = useRef(null);
  const onCloseRef = useRef(onClose);

  // Keep onClose ref up to date
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    // Initialize Materialize modal
    if (modalRef.current && typeof M !== 'undefined') {
      instanceRef.current = M.Modal.init(modalRef.current, {
        onCloseEnd: () => {
          // Call the latest onClose callback
          if (onCloseRef.current) {
            onCloseRef.current();
          }
        },
        dismissible: true
      });
    }

    return () => {
      // Cleanup modal instance
      if (instanceRef.current) {
        instanceRef.current.destroy();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only initialize once

  useEffect(() => {
    // Open or close modal based on isOpen prop
    if (instanceRef.current) {
      if (isOpen) {
        instanceRef.current.open();
      } else {
        instanceRef.current.close();
      }
    }
  }, [isOpen]);

  return (
    <div ref={modalRef} className="modal" style={{ maxWidth }}>
      <div className="modal-content">
        <h4>
          {title}
          <button
            className="modal-close btn-flat right"
            onClick={onClose}
            aria-label="Close"
          >
            <i className="material-icons">close</i>
          </button>
        </h4>
        {children}
      </div>
    </div>
  );
}

Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  children: PropTypes.node,
  maxWidth: PropTypes.string
};

export default Modal;
