import React from 'react';
import { cn } from '@/lib/utils';
import { ItemCondition, ListingStatus } from '@/types';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'condition' | 'status' | 'outline' | 'success' | 'warning' | 'danger';
  condition?: ItemCondition;
  status?: ListingStatus;
  className?: string;
}

export function Badge({ children, variant = 'default', condition, status, className }: BadgeProps) {
  let colorClasses = 'bg-slate-100 text-slate-700';

  if (condition) {
    switch (condition) {
      case 'Brand New':
        colorClasses = 'bg-emerald-50 text-emerald-700 border border-emerald-200';
        break;
      case 'Like New':
        colorClasses = 'bg-teal-50 text-teal-700 border border-teal-200';
        break;
      case 'Excellent':
        colorClasses = 'bg-blue-50 text-blue-700 border border-blue-200';
        break;
      case 'Good':
        colorClasses = 'bg-amber-50 text-amber-700 border border-amber-200';
        break;
      case 'Fair':
        colorClasses = 'bg-slate-100 text-slate-700 border border-slate-200';
        break;
    }
  } else if (status) {
    switch (status) {
      case 'active':
      case 'approved':
        colorClasses = 'bg-emerald-100 text-emerald-800';
        break;
      case 'pending':
        colorClasses = 'bg-amber-100 text-amber-800 border border-amber-200';
        break;
      case 'rejected':
      case 'removed':
        colorClasses = 'bg-rose-100 text-rose-800 border border-rose-200';
        break;
      case 'sold':
        colorClasses = 'bg-purple-100 text-purple-800';
        break;
      default:
        colorClasses = 'bg-slate-200 text-slate-700';
    }
  } else {
    switch (variant) {
      case 'success':
        colorClasses = 'bg-emerald-100 text-emerald-800';
        break;
      case 'warning':
        colorClasses = 'bg-amber-100 text-amber-800';
        break;
      case 'danger':
        colorClasses = 'bg-rose-100 text-rose-800';
        break;
      case 'outline':
        colorClasses = 'border border-slate-200 text-slate-600 bg-white';
        break;
      default:
        colorClasses = 'bg-slate-100 text-slate-700';
    }
  }

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium shrink-0',
        colorClasses,
        className
      )}
    >
      {children}
    </span>
  );
}
