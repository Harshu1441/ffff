import React, { useEffect } from 'react';
import { X } from 'lucide-react';

const ErrorModal = ({ message, subMessage, onClose, autoCloseDelay = 3000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onClose) {
        onClose();
      }
    }, autoCloseDelay);

    return () => clearTimeout(timer);
  }, [onClose, autoCloseDelay]);

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-opacity-40 flex justify-center items-center z-[60]">
      <div className="bg-white rounded-lg p-6 shadow-xl transform transition-all duration-300 scale-100 ease-out max-w-md w-full">
        <div className="flex flex-col items-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <X className="h-8 w-8 text-red-600" />
          </div>
          <div className="mt-3 text-center">
            <h3 className="text-lg font-medium text-gray-900">
              {message || 'Error Occurred'}
            </h3>
            {subMessage && (
              <div className="mt-2">
                <p className="text-sm text-gray-500">{subMessage}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorModal;