import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline";
  children: React.ReactNode;
}

export const Button = ({ variant = "primary", children, className, ...props }: ButtonProps) => {
  const baseStyles = "px-6 py-3 rounded-full font-medium transition-all active:scale-95";
  
  const variants = {
    primary: "bg-primary text-background hover:opacity-90",
    secondary: "bg-secondary text-background hover:opacity-90",
    outline: "border-2 border-primary text-primary hover:bg-primary hover:text-background",
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`} 
      {...props}
    >
      {children}
    </button>
  );
};
