
import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';

interface WeatherCardProps {
  temperature: number;
  tempUnit?: '°C' | '°F';
  condition: string;
  location: string;
  updatedAt: Date;
  icon: ReactNode;
  extraInfo?: Array<{
    label: string;
    value: string | number;
    icon?: ReactNode;
  }>;
  className?: string;
}

const WeatherCard: React.FC<WeatherCardProps> = ({
  temperature,
  tempUnit = '°C',
  condition,
  location,
  updatedAt,
  icon,
  extraInfo,
  className,
}) => {
  const updatedTimeAgo = formatDistanceToNow(updatedAt, { addSuffix: true });

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Current Weather Conditions</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Updated {updatedTimeAgo}
            </p>
          </div>
          <div className="text-stratos-500 dark:text-stratos-400">
            {icon}
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row md:items-end gap-4 mb-4">
          <div>
            <div className="text-5xl font-bold text-gray-900 dark:text-white">
              {temperature}{tempUnit}
            </div>
            <p className="text-lg text-gray-700 dark:text-gray-300">{condition}</p>
          </div>
          <div className="flex-1">
            <p className="text-base text-gray-600 dark:text-gray-400">
              {location}
            </p>
          </div>
        </div>
        
        {extraInfo && extraInfo.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
            {extraInfo.map((info, i) => (
              <div key={i} className="flex flex-col">
                <div className="flex items-center text-gray-500 dark:text-gray-400 mb-1">
                  {info.icon && <span className="mr-1">{info.icon}</span>}
                  <span className="text-xs">{info.label}</span>
                </div>
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {info.value}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WeatherCard;
