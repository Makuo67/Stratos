
import React from 'react';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarProps {
  month: string;
  year: number;
  days: Array<{
    date: number;
    isCurrentMonth: boolean;
    isToday?: boolean;
    events?: Array<{
      name: string;
      color?: string;
    }>;
  }>;
  onPrevMonth?: () => void;
  onNextMonth?: () => void;
  onSelectDate?: (date: number) => void;
  className?: string;
}

const Calendar: React.FC<CalendarProps> = ({
  month,
  year,
  days,
  onPrevMonth,
  onNextMonth,
  onSelectDate,
  className,
}) => {
  const weekdays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  return (
    <div className={cn("w-full bg-white dark:bg-gray-800 rounded-lg shadow-sm", className)}>
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{month} {year}</h2>
          <div className="flex items-center space-x-1">
            <button
              onClick={onPrevMonth}
              className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Previous month"
            >
              <ChevronLeft className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            </button>
            <button
              onClick={onNextMonth}
              className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Next month"
            >
              <ChevronRight className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekdays.map((day) => (
            <div key={day} className="text-center text-xs font-medium text-gray-500 dark:text-gray-400">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, index) => (
            <div
              key={index}
              className={cn(
                "relative h-10 flex items-center justify-center rounded-md text-sm transition-colors",
                day.isCurrentMonth 
                  ? "text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer" 
                  : "text-gray-400 dark:text-gray-600",
                day.isToday && "font-semibold bg-stratos-50 dark:bg-stratos-900/20 text-stratos-600 dark:text-stratos-300",
              )}
              onClick={() => day.isCurrentMonth && onSelectDate && onSelectDate(day.date)}
            >
              {day.date}
              {day.events && day.events.length > 0 && (
                <div className="absolute bottom-1 left-0 right-0 flex justify-center space-x-0.5">
                  {day.events.map((event, eventIndex) => (
                    <span
                      key={eventIndex}
                      className={cn(
                        "h-1 w-1 rounded-full",
                        event.color || "bg-stratos-500"
                      )}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Calendar;
