'use client';

interface BadgeProps {
  variant?: 'default' | 'secondary' | 'destructive' | 'success' | 'warning' | 'outline';
  className?: string;
  children: React.ReactNode;
}

const variants = {
  default: 'bg-warm-steel/10 text-warm-steel/70',
  secondary: 'bg-gray-100 text-gray-700',
  destructive: 'bg-red-50 text-red-700',
  success: 'bg-green-50 text-green-700',
  warning: 'bg-orange-50 text-orange-700',
  outline: 'border border-warm-steel/20 text-warm-steel/70 bg-transparent',
};

export default function Badge({ variant = 'default', className = '', children }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}