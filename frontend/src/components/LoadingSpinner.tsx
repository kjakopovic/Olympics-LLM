import React from "react";

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex flex-col justify-center items-center py-10">
      <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-accent mb-4"></div>
      <p className="text-lg font-jakarta text-primary-600">Loading...</p>
    </div>
  );
};

export default LoadingSpinner;
