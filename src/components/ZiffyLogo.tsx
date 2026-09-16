'use client';

import React from 'react';

interface ZiffyLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export const ZiffyLogo: React.FC<ZiffyLogoProps> = ({
  className = '',
  size = 'md',
  showText = true,
}) => {
  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-11 h-11',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl',
  };

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Stylized Owl Logo Mark with #FF4FA3 & #00C2CB gradients */}
      <div className={`relative flex items-center justify-center rounded-xl bg-[#232323] border border-[#2E2E2E] shadow-sm ${iconSizes[size]}`}>
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-[75%] h-[75%]"
        >
          {/* Owl Ears & Body silhouette */}
          <path
            d="M7 6L11 11H21L25 6V18C25 23.5228 20.9706 28 16 28C11.0294 28 7 23.5228 7 18V6Z"
            fill="#1B1B1B"
            stroke="#00C2CB"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          {/* Left Owl Eye with Pink Pupil */}
          <circle cx="12" cy="16" r="3.5" fill="#2E2E2E" stroke="#FF4FA3" strokeWidth="1.2" />
          <circle cx="12" cy="16" r="1.5" fill="#FF4FA3" />
          {/* Right Owl Eye with Pink Pupil */}
          <circle cx="20" cy="16" r="3.5" fill="#2E2E2E" stroke="#FF4FA3" strokeWidth="1.2" />
          <circle cx="20" cy="16" r="1.5" fill="#FF4FA3" />
          {/* Owl Beak */}
          <path
            d="M16 18L14.5 21H17.5L16 18Z"
            fill="#00C2CB"
          />
        </svg>
      </div>

      {showText && (
        <span className={`font-bold tracking-tight text-white ${textSizes[size]}`}>
          ziffy<span className="text-[#FF4FA3]">.</span>
        </span>
      )}
    </div>
  );
};
