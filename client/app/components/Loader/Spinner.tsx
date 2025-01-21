import React from 'react';

const Spinner: React.FC = () => {
  return (
    <div className="flex items-center justify-center">
      <div className="spinner w-8 h-8 border-4 border-t-[#37a39a] border-gray-300 rounded-full animate-spin"></div>
    </div>
  );
};

export default Spinner;
