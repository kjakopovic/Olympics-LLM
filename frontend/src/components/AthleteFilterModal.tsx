"use client";

import React, { useEffect } from "react";

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  // Close the modal when the escape key is pressed
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={onClose}
    >
      <div
        className="bg-primary-500 rounded-lg shadow-lg w-full max-w-lg p-6 relative"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
      >
        {/* Close Button */}
        <button
          className="absolute top-4 right-4 text-gray-500 text-3xl hover:text-gray-700"
          onClick={onClose}
          aria-label="Close Modal"
        >
          &times;
        </button>

        {/* Modal Title */}
        <h2 className="text-2xl font-semibold text-white mb-4">{title}</h2>

        {/* Modal Content */}
        <div>{children}</div>
      </div>
    </div>
  );
};

export default Modal;
