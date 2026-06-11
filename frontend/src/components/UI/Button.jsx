import React from 'react';

const Button = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  disabled = false,
  loading = false,
  className = ''
}) => {
  const baseStyles = 'px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center justify-center gap-2 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed select-none';
  
  const variants = {
    primary: 'bg-fifa-blue hover:bg-blue-600 text-white shadow-lg shadow-blue-500/20 active:scale-95',
    secondary: 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 active:scale-95',
    gold: 'bg-gradient-to-r from-amber-400 via-fifa-gold to-yellow-500 text-slate-950 font-bold shadow-lg shadow-amber-500/20 hover:brightness-110 active:scale-95',
    outline: 'border border-fifa-gold text-fifa-gold hover:bg-fifa-gold hover:text-slate-950 shadow-md shadow-fifa-gold/10 active:scale-95'
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {children}
    </button>
  );
};

export default Button;
