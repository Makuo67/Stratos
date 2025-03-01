import React from "react";

interface LogoProps {
  variant?: "default" | "icon" | "full";
  size?: "sm" | "md" | "lg";
  className?: string;
}

const Logo: React.FC<LogoProps> = ({
  variant = "default",
  size = "md",
  className = "",
}) => {
  const sizeClasses = {
    sm: variant === "icon" ? "h-8 w-8" : "h-8",
    md: variant === "icon" ? "h-10 w-10" : "h-10",
    lg: variant === "icon" ? "h-12 w-12" : "h-12",
  };

  const renderLogo = () => {
    // Icon-only version
    if (variant === "icon") {
      return (
        <div className={`relative ${sizeClasses[size]} ${className}`}>
          <svg
            viewBox="0 0 40 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="20" cy="20" r="20" fill="url(#gradient)" />
            <path
              d="M13 20C13 17.2386 15.2386 15 18 15H22C24.7614 15 27 17.2386 27 20V25C27 27.7614 24.7614 30 22 30H18C15.2386 30 13 27.7614 13 25V20Z"
              fill="white"
            />
            <path
              d="M16 13C16 11.3431 17.3431 10 19 10H21C22.6569 10 24 11.3431 24 13V15H16V13Z"
              fill="white"
            />
            <defs>
              <linearGradient
                id="gradient"
                x1="0"
                y1="0"
                x2="40"
                y2="40"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#1865eb" />
                <stop offset="1" stopColor="#3183f5" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      );
    }

    // Full text version (default or full)
    return (
      <div className={`flex items-center ${className}`}>
        <div className={`relative ${sizeClasses.sm} mr-2`}>
          <svg
            viewBox="0 0 40 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="20" cy="20" r="20" fill="url(#gradient)" />
            <path
              d="M13 20C13 17.2386 15.2386 15 18 15H22C24.7614 15 27 17.2386 27 20V25C27 27.7614 24.7614 30 22 30H18C15.2386 30 13 27.7614 13 25V20Z"
              fill="white"
            />
            <path
              d="M16 13C16 11.3431 17.3431 10 19 10H21C22.6569 10 24 11.3431 24 13V15H16V13Z"
              fill="white"
            />
            <defs>
              <linearGradient
                id="gradient"
                x1="0"
                y1="0"
                x2="40"
                y2="40"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#1865eb" />
                <stop offset="1" stopColor="#3183f5" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        {/* <span className={`font-semibold text-stratos-800 dark:text-stratos-200 ${sizeClasses[size]} text-xl`}>
          Stratos
        </span> */}
        <span className={`text-white ${sizeClasses[size]} text-xl`}>
          Stratos
        </span>
      </div>
    );
  };

  return renderLogo();
};

export default Logo;
