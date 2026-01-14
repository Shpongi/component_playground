import React from 'react';
import Link from 'next/link';

interface CreateButtonProps {
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'small';
  href?: string;
}

export default function CreateButton({ 
  onClick, 
  children, 
  className = '', 
  disabled = false,
  variant = 'primary',
  href
}: CreateButtonProps) {
  const baseClasses = "inline-flex items-center gap-2 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variantClasses = {
    primary: "px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-blue-500 text-sm",
    secondary: "px-3 py-1.5 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 focus:ring-blue-500 text-sm",
    small: "px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 focus:ring-blue-500 text-xs"
  };

  const buttonClasses = `${baseClasses} ${variantClasses[variant]} ${className}`;

  const plusIcon = (
    <svg 
      className="w-4 h-4" 
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24"
    >
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={2} 
        d="M12 4v16m8-8H4" 
      />
    </svg>
  );

  if (href) {
    return (
      <Link href={href} className={buttonClasses}>
        {plusIcon}
        <span>{children}</span>
      </Link>
    );
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={buttonClasses}
    >
      {plusIcon}
      <span>{children}</span>
    </button>
  );
}
