
import React, { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface ChartContainerProps {
  title: string;
  description?: string;
  className?: string;
  children: ReactNode;
  action?: ReactNode;
}

const ChartContainer: React.FC<ChartContainerProps> = ({
  title,
  description,
  className,
  children,
  action,
}) => {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-lg font-semibold">{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </div>
        {action && <div>{action}</div>}
      </CardHeader>
      <CardContent className="pb-4">
        <div className="chart-container w-full">
          {children}
        </div>
      </CardContent>
    </Card>
  );
};

export default ChartContainer;
