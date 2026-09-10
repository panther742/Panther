import React from 'react';

interface PantherLogoProps {
  className?: string;
  size?: number;
}

export const PantherLogo: React.FC<PantherLogoProps> = ({ className = '', size = 38 }) => {
  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="transition-transform duration-300 hover:scale-105"
      >
        <defs>
          <linearGradient id="pantherBlueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#5FFFF7" />
            <stop offset="40%" stopColor="#00D8FF" />
            <stop offset="100%" stopColor="#007BFF" />
          </linearGradient>
          <linearGradient id="pantherShieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0E1628" />
            <stop offset="100%" stopColor="#060B16" />
          </linearGradient>
          <linearGradient id="eyeBlueGlow" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#5FFFF7" />
          </linearGradient>
          <filter id="blueGlowFilter" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer Shield Container with Electric Blue Border Accent */}
        <rect width="100" height="100" rx="26" fill="url(#pantherShieldGrad)" />
        <rect x="1.5" y="1.5" width="97" height="97" rx="24.5" stroke="url(#pantherBlueGrad)" strokeWidth="1.5" strokeOpacity="0.6" fill="none" />

        {/* Panther Geometric Silhouette Head */}
        <path
          d="M 22 26 L 36 38 L 42 28 L 50 34 L 58 28 L 64 38 L 78 26 L 74 48 L 84 56 L 68 76 L 50 88 L 32 76 L 16 56 L 26 48 Z"
          fill="url(#pantherBlueGrad)"
          filter="url(#blueGlowFilter)"
        />

        {/* Inner Shadows / Facets for 3D depth */}
        <path
          d="M 50 34 L 36 38 L 50 56 L 64 38 Z"
          fill="#060B16"
          fillOpacity="0.5"
        />
        <path
          d="M 50 56 L 32 76 L 50 88 L 68 76 Z"
          fill="#0E1628"
          fillOpacity="0.7"
        />

        {/* Piercing Cyan Panther Eyes */}
        <polygon points="32,50 42,54 36,58" fill="url(#eyeBlueGlow)" />
        <polygon points="68,50 58,54 64,58" fill="url(#eyeBlueGlow)" />

        {/* Snout Accent */}
        <polygon points="50,66 45,61 55,61" fill="#FFFFFF" fillOpacity="0.95" />
      </svg>
    </div>
  );
};


