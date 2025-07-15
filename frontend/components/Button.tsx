import React from 'react';

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children: React.ReactNode;
  className?: string;
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, className = '', ...props }, ref) => (
    <button
      ref={ref}
      className={`!cursor-pointer inline-flex items-center justify-center px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors disabled:opacity-50 ${className}`}
      {...props}
    >
      {children}
    </button>
  )
);
Button.displayName = 'Button'; 