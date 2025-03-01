import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface GaugeProps {
  value: number;
  min?: number;
  max?: number;
  label?: string;
  size?: "sm" | "md" | "lg";
  colorScale?: string[];
  className?: string;
  animated?: boolean;
}

const Gauge: React.FC<GaugeProps> = ({
  value,
  min = 0,
  max = 100,
  label,
  size = "md",
  colorScale = ["#10B981", "#F59E0B", "#EF4444"],
  className,
  animated = true,
}) => {
  const [currentValue, setCurrentValue] = useState(min);

  useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => {
        setCurrentValue(value);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setCurrentValue(value);
    }
  }, [value, animated]);

  const sizeMap = {
    sm: {
      width: 120,
      height: 120,
      fontSize: 20,
      strokeWidth: 8,
    },
    md: {
      width: 160,
      height: 160,
      fontSize: 24,
      strokeWidth: 10,
    },
    lg: {
      width: 200,
      height: 200,
      fontSize: 30,
      strokeWidth: 12,
    },
  };

  const { width, height, fontSize, strokeWidth } = sizeMap[size];
  const radius = (width - strokeWidth) / 2;
  const circumference = radius * Math.PI;
  const halfCircumference = circumference / 2;
  const arcLength = ((currentValue - min) / (max - min)) * halfCircumference;

  // Calculate color based on value
  let color = colorScale[0];
  const normalizedValue = (currentValue - min) / (max - min);

  if (normalizedValue >= 0.8) {
    color = colorScale[2]; // High value (usually red)
    } else if (normalizedValue >= 0.5) {
    color = colorScale[1]; // Medium value (usually yellow/orange)
  }

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <svg width={width} height={height / 2 + 20} className="overflow-visible">
        <circle
          className="gauge-background"
          cx={width / 2}
          cy={height / 2}
          r={radius}
          strokeWidth={strokeWidth}
          stroke="#E5E7EB"
          strokeDasharray={`${halfCircumference} ${halfCircumference}`}
          transform={`rotate(-180 ${width / 2} ${height / 2})`}
        />
        <circle
          className="gauge-value"
          cx={width / 2}
          cy={height / 2}
          r={radius}
          strokeWidth={strokeWidth}
          stroke={color}
          strokeDasharray={`${arcLength} ${circumference}`}
          strokeDashoffset={halfCircumference}
          strokeLinecap="round"
          transform={`rotate(-180 ${width / 2} ${height / 2})`}
          style={{
            transition: animated ? "stroke-dasharray 0.5s ease-in-out" : "none",
          }}
        />
        <text
          x={width / 2}
          y={height / 2 + 5}
          fontSize={fontSize}
          fontWeight="bold"
          textAnchor="middle"
          // fill="currentColor"
          fill="#60A5FA"
          // className="text-gray-900 dark:text-white"
          className="text-blue-400"
        >
          {Math.round(currentValue)}
        </text>
        {label && (
          <text
            x={width / 2}
            y={height / 2 + fontSize + 10}
            fontSize={fontSize * 0.5}
            textAnchor="middle"
            // fill="currentColor"
            fill="#93C5FD"
            // className="text-gray-500 dark:text-gray-400"
            className="text-blue-300"
          >
            {label}
          </text>
        )}
      </svg>
    </div>
  );
};

export default Gauge;
