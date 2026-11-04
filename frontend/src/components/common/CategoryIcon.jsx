import React from 'react';
import {
  ShoppingBag,
  Fuel,
  Utensils,
  Zap,
  HeartPulse,
  Briefcase,
  Store,
  Wallet,
  Tag,
  CircleDollarSign
} from 'lucide-react';

const ICON_MAP = {
  groceries: ShoppingBag,
  travel: Fuel,
  food: Utensils,
  bills: Zap,
  health: HeartPulse,
  shopping: ShoppingBag,
  salary: Briefcase,
  business: Store,
  other: Wallet,
};

const COLOR_MAP = {
  groceries: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  travel: 'bg-amber-100 text-amber-700 border-amber-200',
  food: 'bg-rose-100 text-rose-700 border-rose-200',
  bills: 'bg-purple-100 text-purple-700 border-purple-200',
  health: 'bg-pink-100 text-pink-700 border-pink-200',
  shopping: 'bg-blue-100 text-blue-700 border-blue-200',
  salary: 'bg-teal-100 text-teal-700 border-teal-200',
  business: 'bg-green-100 text-green-700 border-green-200',
  other: 'bg-slate-100 text-slate-700 border-slate-200',
};

export default function CategoryIcon({ category = 'other', size = 'md', className = '' }) {
  const IconComponent = ICON_MAP[category] || Wallet;
  const colorClass = COLOR_MAP[category] || COLOR_MAP.other;

  const sizeClasses = {
    sm: 'w-8 h-8 rounded-lg p-1.5',
    md: 'w-12 h-12 rounded-2xl p-2.5',
    lg: 'w-16 h-16 rounded-3xl p-3.5',
  };

  const iconSizes = {
    sm: 18,
    md: 26,
    lg: 34,
  };

  return (
    <div className={`flex items-center justify-center border shadow-sm ${sizeClasses[size] || sizeClasses.md} ${colorClass} ${className}`}>
      <IconComponent size={iconSizes[size] || iconSizes.md} strokeWidth={2.2} />
    </div>
  );
}

