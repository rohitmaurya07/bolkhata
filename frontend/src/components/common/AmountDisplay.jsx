import React from 'react';

export default function AmountDisplay({
  amount = 0,
  type = 'neutral',
  currencySymbol = '₹',
  size = 'md',
  showSign = false,
  className = ''
}) {
  const formatted = Math.abs(Number(amount) || 0).toLocaleString('en-IN');

  const sizeClasses = {
    sm: 'text-lg font-semibold',
    md: 'text-2xl font-bold',
    lg: 'text-4xl font-extrabold tracking-tight',
    xl: 'text-5xl font-black tracking-tight',
  };

  const typeClasses = {
    expense: 'text-rose-600',
    income: 'text-emerald-600',
    neutral: 'text-slate-900',
    balance: Number(amount) >= 0 ? 'text-emerald-700' : 'text-rose-600',
  };

  const sign = showSign
    ? type === 'expense'
      ? '-'
      : type === 'income'
      ? '+'
      : Number(amount) < 0
      ? '-'
      : ''
    : '';

  return (
    <span className={`inline-flex items-baseline font-sans ${sizeClasses[size] || sizeClasses.md} ${typeClasses[type] || typeClasses.neutral} ${className}`}>
      {sign}
      <span className="text-[0.85em] font-medium mr-0.5">{currencySymbol}</span>
      {formatted}
    </span>
  );
}

