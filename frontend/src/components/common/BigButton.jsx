import React from 'react';

export default function BigButton({
  children,
  onClick,
  icon: Icon,
  variant = 'primary', // 'primary', 'expense', 'income', 'outline'
  size = 'lg',
  className = '',
  disabled = false,
  type = 'button',
}) {
  const baseStyles = 'relative flex items-center justify-center gap-3 font-extrabold rounded-2xl shadow-sm transition-all duration-150 select-none cursor-pointer active:scale-98 disabled:opacity-50 disabled:pointer-events-none';

  const sizeStyles = {
    md: 'py-3 px-4 text-base',
    lg: 'py-4 px-6 text-lg min-h-[58px]',
    xl: 'py-5 px-6 text-xl min-h-[66px]',
  };

  const variantStyles = {
    primary: 'bg-brand-600 hover:bg-brand-700 text-white shadow-brand-500/25',
    expense: 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-2 border-rose-200 active:bg-rose-200',
    income: 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-2 border-emerald-200 active:bg-emerald-200',
    outline: 'bg-white hover:bg-slate-50 text-slate-800 border-2 border-warm-300 active:bg-warm-200',
    danger: 'bg-rose-600 hover:bg-rose-700 text-white',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${sizeStyles[size] || sizeStyles.lg} ${variantStyles[variant] || variantStyles.primary} ${className}`}
    >
      {Icon && <Icon size={24} strokeWidth={2.4} />}
      <span>{children}</span>
    </button>
  );
}

