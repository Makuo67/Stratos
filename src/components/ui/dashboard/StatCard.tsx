
import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: ReactNode;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'neutral';
  };
  className?: string;
  onClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  description,
  icon,
  trend,
  className,
  onClick,
}) => {
  return (
    <div 
      className={cn(
        "bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm card-hover",
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
          <div className="mt-1 flex items-baseline">
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">{value}</p>
            {trend && (
              <span className={cn(
                "ml-2 text-xs font-medium",
                trend.direction === 'up' ? 'text-green-600 dark:text-green-400' : 
                trend.direction === 'down' ? 'text-red-600 dark:text-red-400' : 
                'text-gray-500 dark:text-gray-400'
              )}>
                {trend.direction === 'up' ? '↑' : trend.direction === 'down' ? '↓' : '→'}
                {' '}{Math.abs(trend.value)}%
              </span>
            )}
          </div>
          {description && <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{description}</p>}
        </div>
        {icon && (
          <div className="p-2 rounded-lg bg-stratos-50 dark:bg-stratos-900/20 text-stratos-600 dark:text-stratos-300">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
