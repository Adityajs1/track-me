'use client';

import React from 'react';

interface ZiffyLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  color?: string;
}

export const ZiffyLogo: React.FC<ZiffyLogoProps> = ({
  className = '',
  size = 'md',
  color,
}) => {
  const textSizes = {
    sm: 'text-base font-semibold tracking-tight',
    md: 'text-xl font-bold tracking-tight',
    lg: 'text-3xl font-bold tracking-tight',
  };

  const colorClass = color || (className.includes('text-') ? '' : 'text-white');

  return (
    <div className={`inline-flex items-center select-none ${colorClass} ${className}`}>
      <span className={textSizes[size]}>
        ziffy<span className="opacity-50">.</span>
      </span>
    </div>
  );
};
