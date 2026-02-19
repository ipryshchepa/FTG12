import { useState } from 'react';

/**
 * Custom hook for managing modal state
 * @returns {Object} { isOpen, data, openModal, closeModal, toggle }
 */
export function useModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState(null);

  const openModal = (modalData = null) => {
    setData(modalData);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setData(null);
  };

  const toggle = () => {
    setIsOpen(prev => !prev);
  };

  return {
    isOpen,
    data,
    openModal,
    closeModal,
    toggle
  };
}
