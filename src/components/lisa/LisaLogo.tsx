
import React from "react";
import { Headphones } from "lucide-react";

interface LisaLogoProps {
  size?: "sm" | "md" | "lg";
}

const LisaLogo = ({ size = "md" }: LisaLogoProps) => {
  const sizeClasses = {
    sm: "text-xl",
    md: "text-2xl",
    lg: "text-3xl",
  };

  const iconSizes = {
    sm: { width: 16, height: 16 },
    md: { width: 24, height: 24 },
    lg: { width: 32, height: 32 },
  };

  return (
    <div className="flex items-center">
      <Headphones 
        className="mr-2 text-purple-400"
        width={iconSizes[size].width}
        height={iconSizes[size].height}
      />
      <span className={`font-semibold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600 ${sizeClasses[size]}`}>
        LISA AI
      </span>
    </div>
  );
};

export default LisaLogo;
