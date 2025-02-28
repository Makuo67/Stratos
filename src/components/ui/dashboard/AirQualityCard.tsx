import React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Gauge from "./Gauge";

interface AirQualityCardProps {
  index: number;
  indicators: Array<{
    name: string;
    value: number;
    max: number;
    unit: string;
    status?: "good" | "moderate" | "unhealthy";
  }>;
  className?: string;
}

const AirQualityCard: React.FC<AirQualityCardProps> = ({
  index,
  indicators,
  className,
}) => {
  const getIndexLabel = () => {
    if (index <= 50) return "Good";
    if (index <= 100) return "Moderate";
    if (index <= 150) return "Unhealthy for Sensitive Groups";
    if (index <= 200) return "Unhealthy";
    if (index <= 300) return "Very Unhealthy";
    return "Hazardous";
  };

  const getStatusClass = (status?: "good" | "moderate" | "unhealthy") => {
    if (status === "good")
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
    if (status === "moderate")
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
    if (status === "unhealthy")
      return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
    return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
  };

  const getIndicatorPercent = (value: number, max: number) => {
    return Math.min(100, (value / max) * 100);
  };

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-3">
        <CardTitle>Air Quality Index</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <Gauge
            value={index}
            min={0}
            max={300}
            label="AQI"
            colorScale={["#10B981", "#F59E0B", "#EF4444"]}
            size="lg"
            className="flex-shrink-0"
          />
          <div className="space-y-4 w-full max-w-md">
            <div className="text-center md:text-left">
              <span
                className={cn(
                  "px-2 py-1 rounded-full text-xs font-medium",
                  index <= 50
                    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                    : index <= 100
                    ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                    : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                )}
              >
                {getIndexLabel()}
              </span>
            </div>

            <div className="space-y-3">
              {indicators.map((indicator, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      {indicator.name}
                    </span>
                    <span
                      className={cn(
                        "text-xs px-1.5 py-0.5 rounded",
                        getStatusClass(indicator.status)
                      )}
                    >
                      {indicator.value} {indicator.unit}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full progress-bar-animate",
                        indicator.status === "good"
                          ? "bg-green-500"
                          : indicator.status === "moderate"
                          ? "bg-yellow-500"
                          : "bg-red-500"
                      )}
                      style={{
                        width: `${getIndicatorPercent(
                          indicator.value,
                          indicator.max
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AirQualityCard;
