'use client';

import { Users, Building2, ClipboardList, DollarSign, CalendarClock, TrendingUp } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: { value: number; label: string };
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red';
}

const colorClasses = {
  blue: 'bg-blue-500/10 text-blue-600 border-blue-200',
  green: 'bg-green-500/10 text-green-600 border-green-200',
  purple: 'bg-purple-500/10 text-purple-600 border-purple-200',
  orange: 'bg-orange-500/10 text-orange-600 border-orange-200',
  red: 'bg-red-500/10 text-red-600 border-red-200',
};

export default function StatCard({ label, value, icon, trend, color }: StatCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-warm-steel/20 p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-warm-steel/60">{label}</p>
          <p className="text-3xl font-bold text-concrete mt-1">{value}</p>
          {trend && (
            <p className="text-xs mt-2 flex items-center gap-1 text-green-600">
              <TrendingUp className="w-3 h-3" aria-hidden="true" />
              <span>{trend.value > 0 ? '+' : ''}{trend.value}% {trend.label}</span>
            </p>
          )}
        </div>
        <div className={`p-3 rounded-xl border ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

export const StatCardSkeleton = () => (
  <div className="bg-white rounded-2xl border border-warm-steel/20 p-6 shadow-sm animate-pulse">
    <div className="h-4 bg-warm-steel/10 rounded w-3/4 mb-4" />
    <div className="h-8 bg-warm-steel/10 rounded w-1/2 mb-2" />
    <div className="h-4 bg-warm-steel/10 rounded w-1/4" />
  </div>
);