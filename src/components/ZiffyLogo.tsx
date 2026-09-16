'use client';

import React from 'react';

interface ZiffyLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const ZiffyLogo: React.FC<ZiffyLogoProps> = ({
  className = '',
  size = 'md',
}) => {
  const textSizes = {
    sm: 'text-base font-semibold tracking-tight',
    md: 'text-xl font-bold tracking-tight',
    lg: 'text-3xl font-bold tracking-tight',
  };

  return (
    <div className={`inline-flex items-center select-none text-white ${className}`}>
      <span className={textSizes[size]}>
        ziffy<span className="text-white/40">.</span>
      </span>
    </div>
  );
};
