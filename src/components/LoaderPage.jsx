import React from 'react';
import { FaSpinner } from 'react-icons/fa'; // Import spinner icon from react-icons

const LoaderPage = () => {
  return (
    <div className="flex items-center justify-center">
      <div className="text-center">
        {/* Spinning Loader */}
        <FaSpinner className="animate-spin h-5 w-5 text-orange-500 mx-auto mb-4" />

              </div>
    </div>
  );
};

export default LoaderPage;
