import React from 'react';

interface DeleteButtonProps {
  onClick?: (e?: React.MouseEvent<HTMLButtonElement>) => void;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'small';
  title?: string;
}

export default function DeleteButton({ 
  onClick, 
  children, 
  className = '', 
  disabled = false,
  variant = 'primary',
  title
}: DeleteButtonProps) {
  const baseClasses = "inline-flex items-center gap-2 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variantClasses = {
    primary: "px-4 py-2 bg-white text-red-600 border border-red-600 rounded-md hover:bg-red-50 focus:ring-red-500 text-sm",
    secondary: "px-3 py-1.5 bg-white text-red-600 border border-red-600 rounded-md hover:bg-red-50 focus:ring-red-500 text-sm",
    small: "px-2 py-1 bg-white text-red-600 border border-red-600 rounded hover:bg-red-50 focus:ring-red-500 text-xs"
  };

  const buttonClasses = `${baseClasses} ${variantClasses[variant]} ${className}`;

  // No entry/stop icon (circle with diagonal line)
  const voidIcon = (
    <svg 
      className="w-4 h-4" 
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24"
    >
      <circle cx="12" cy="12" r="10" strokeWidth="2" />
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth="2" 
        d="M6 6l12 12" 
      />
    </svg>
  );

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={buttonClasses}
      title={title}
    >
      {voidIcon}
      <span>{children}</span>
    </button>
  );
}
