import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;
  iconColor?: string;
}

export function StatCard({ title, value, change, changeType = 'neutral', icon: Icon, iconColor = 'text-emerald-600' }: StatCardProps) {
  const changeColors = {
    positive: 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/30',
    negative: 'text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/30',
    neutral: 'text-slate-600 bg-slate-50 dark:text-slate-400 dark:bg-slate-700',
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{title}</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{value}</p>
          {change && (
            <p className={`text-xs font-medium mt-2 px-2 py-1 rounded-full inline-block ${changeColors[changeType]}`}>
              {change}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg bg-slate-50 dark:bg-slate-700 ${iconColor}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}
