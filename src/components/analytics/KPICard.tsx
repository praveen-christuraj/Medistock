import { ArrowUpRight, ArrowDownRight, Minus, LucideIcon } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  previousValue?: number;
  changePercent?: number;
  trend?: 'up' | 'down' | 'neutral';
  icon?: LucideIcon;
  prefix?: string;
  suffix?: string;
  colorClass?: string;
  size?: 'sm' | 'md' | 'lg';
  showComparison?: boolean;
}

export default function KPICard({
  title,
  value,
  previousValue,
  changePercent,
  trend = 'neutral',
  icon: Icon,
  prefix = '',
  suffix = '',
  colorClass = 'bg-white',
  size = 'md',
  showComparison = true
}: KPICardProps) {
  const sizeClasses = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6'
  };

  const valueSizeClasses = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl'
  };

  const iconSizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up': return 'text-green-600 bg-green-50';
      case 'down': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'up': return <ArrowUpRight className="w-4 h-4" />;
      case 'down': return <ArrowDownRight className="w-4 h-4" />;
      default: return <Minus className="w-4 h-4" />;
    }
  };

  const formatValue = (val: number | string) => {
    if (typeof val === 'number') {
      if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
      if (val >= 1000) return `${(val / 1000).toFixed(1)}K`;
      return val.toFixed(val % 1 !== 0 ? 2 : 0);
    }
    return val;
  };

  return (
    <div className={`${colorClass} rounded-2xl ${sizeClasses[size]} shadow-sm border border-gray-100 hover:shadow-md transition-shadow`}>
      <div className="flex items-start justify-between">
        {Icon && (
          <div className={`${iconSizeClasses[size]} rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
        )}
        {showComparison && changePercent !== undefined && (
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getTrendColor()}`}>
            {getTrendIcon()}
            <span>{Math.abs(changePercent).toFixed(1)}%</span>
          </div>
        )}
      </div>
      
      <div className={Icon ? 'mt-4' : ''}>
        <p className={`${valueSizeClasses[size]} font-bold text-gray-900`}>
          {prefix}{formatValue(value)}{suffix}
        </p>
        <p className="text-sm text-gray-500 mt-1">{title}</p>
        
        {showComparison && previousValue !== undefined && (
          <p className="text-xs text-gray-400 mt-1">
            vs {prefix}{formatValue(previousValue)}{suffix} prev period
          </p>
        )}
      </div>
    </div>
  );
}
