import React from 'react';

interface ApproveButtonProps {
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

export default function ApproveButton({ 
  onClick, 
  children, 
  className = '', 
  disabled = false 
}: ApproveButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        bg-green-50 
        text-green-700 
        border 
        border-green-600 
        rounded-md 
        px-4 
        py-2 
        font-medium 
        transition-colors 
        focus:outline-none 
        focus:ring-2 
        focus:ring-green-500 
        focus:ring-offset-2
        flex 
        items-center 
        gap-2
        hover:bg-green-100
        disabled:opacity-50 
        disabled:cursor-not-allowed
        ${className}
      `}
    >
      {/* Checkmark icon in circular background */}
      <div className="w-5 h-5 rounded-full bg-green-700 flex items-center justify-center flex-shrink-0">
        <svg 
          className="w-3 h-3 text-white" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={3} 
            d="M5 13l4 4L19 7" 
          />
        </svg>
      </div>
      <span>{children}</span>
    </button>
  );
}
