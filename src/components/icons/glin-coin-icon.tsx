import React from 'react';

interface GlinCoinIconProps {
  className?: string;
  size?: number;
}

export const GlinCoinIcon: React.FC<GlinCoinIconProps> = ({ className = "", size = 24 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="glinGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#9333ea', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#ec4899', stopOpacity: 1 }} />
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r="30" fill="url(#glinGradient)" opacity="0.9"/>
      <path d="M32 16 L42 24 L42 40 L32 48 L22 40 L22 24 Z" fill="white" opacity="0.9"/>
      <path d="M32 22 L38 26 L38 38 L32 42 L26 38 L26 26 Z" fill="url(#glinGradient)"/>
      <circle cx="32" cy="32" r="3" fill="white"/>
    </svg>
  );
};