import React, { useEffect } from 'react';

const SuccessModal = ({ message, subMessage, onClose, autoCloseDelay = 2000 }) => {
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
      <div className="bg-white rounded-lg p-6 shadow-xl transform transition-all duration-300 scale-100 ease-out">
        <div className="flex flex-col items-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
            <svg 
              className="h-8 w-8 text-green-600" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <div className="mt-3 text-center">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              {message || 'Rule Added Successfully!'}
            </h3>
            <div className="mt-2">
              <p className="text-sm text-gray-500">
                {subMessage || 'Your new rule has been created.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuccessModal;