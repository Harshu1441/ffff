import React from 'react';
import './Loader.css';

const Loader = () => {
  return (
    <div className="loader-overlay">
      <div className="loader-container">
        <div className="spinner">
          <div className="ring"></div>
          <div className="ring"></div>
          <div className="ring"></div>
          <span className="loading-text">Loading...</span>
        </div>
      </div>
    </div>
  );
};

export default Loader;