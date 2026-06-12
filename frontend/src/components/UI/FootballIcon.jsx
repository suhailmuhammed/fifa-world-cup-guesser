import React from 'react';

const FootballIcon = ({ className = "h-6 w-6" }) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 100 100" 
      className={className}
    >
      {/* Outer Ball Shape & Shading */}
      <circle cx="50" cy="50" r="46" fill="#ffffff" stroke="#0f172a" strokeWidth="2.5" />
      
      {/* Modern curved accents & panel styling */}
      {/* Central panel */}
      <path 
        d="M50,33 L66,45 L60,65 L40,65 L34,45 Z" 
        fill="#0f172a" 
        stroke="#ffffff" 
        strokeWidth="1.5" 
        strokeLinejoin="round" 
      />

      {/* Dynamic Swooshes with gradients */}
      {/* Top golden swoop */}
      <path 
        d="M50,12 C62,12 76,20 80,32 C68,28 58,30 50,33 C42,30 32,28 20,32 C24,20 38,12 50,12 Z" 
        fill="url(#trionda-gold)" 
      />

      {/* Left blue swoop */}
      <path 
        d="M12,50 C12,38 20,26 34,45 C29,52 30,60 40,65 C28,68 18,62 12,50 Z" 
        fill="url(#trionda-blue)" 
      />

      {/* Right red swoop */}
      <path 
        d="M88,50 C88,38 80,26 66,45 C71,52 70,60 60,65 C72,68 82,62 88,50 Z" 
        fill="url(#trionda-red)" 
      />

      {/* Bottom golden swoop */}
      <path 
        d="M50,88 C38,88 28,80 40,65 C50,69 50,69 60,65 C72,80 62,88 50,88 Z" 
        fill="url(#trionda-gold)" 
      />

      {/* Stitch panel lines */}
      <path d="M50,4 L50,12" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M4,50 L12,50" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M96,50 L88,50" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M50,96 L50,88" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" />

      {/* Gradients */}
      <defs>
        <linearGradient id="trionda-gold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>
        <linearGradient id="trionda-blue" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>
        <linearGradient id="trionda-red" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ef4444" />
          <stop offset="100%" stopColor="#b91c1c" />
        </linearGradient>
      </defs>
    </svg>
  );
};

export default FootballIcon;
