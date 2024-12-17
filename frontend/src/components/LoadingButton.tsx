// /components/LoadingButton.tsx

"use client";

import React from "react";
import LoadingSpinner from "@/components/ButtonSpinner";

interface LoadingButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading: boolean;
  loadingText?: string;
  children: React.ReactNode;
}

const LoadingButton: React.FC<LoadingButtonProps> = ({
  isLoading,
  loadingText = "Loading...",
  children,
  disabled,
  ...props
}) => {
  return (
    <button
      {...props}
      disabled={isLoading || disabled}
      className={`flex justify-center items-center ${props.className} ${
        isLoading ? "cursor-not-allowed opacity-50" : ""
      }`}
    >
      {isLoading ? (
        <>
          <LoadingSpinner /> <span className="ml-2">{loadingText}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
};

export default LoadingButton;
