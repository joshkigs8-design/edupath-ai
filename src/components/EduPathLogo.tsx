import React from "react";

interface EduPathLogoProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  showWordmark?: boolean;
  className?: string;
  variant?: "default" | "white";
}

export function EduPathLogoIcon({
  size = 32,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="EduPath AI Logo"
    >
      <defs>
        <linearGradient id="logoBgGrad" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0F52FF" />
          <stop offset="100%" stopColor="#0A2D8C" />
        </linearGradient>
        <linearGradient id="logoEmeraldGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#34D399" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
        <linearGradient id="logoFacetGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#D9E6FF" />
        </linearGradient>
        <filter id="logoGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Rounded squircle backdrop */}
      <rect width="64" height="64" rx="16" fill="url(#logoBgGrad)" />
      <rect
        x="0.75"
        y="0.75"
        width="62.5"
        height="62.5"
        rx="15.25"
        stroke="#FFFFFF"
        strokeOpacity="0.22"
        strokeWidth="1.5"
      />

      {/* Top Cap Diamond Facet */}
      <path d="M32 14 L50 24 L32 34 L14 24 Z" fill="url(#logoFacetGrad)" />

      {/* Left Shaded Facet */}
      <path d="M14 24 L32 34 L32 46 L14 36 Z" fill="#93C5FD" fillOpacity="0.95" />

      {/* Right Shaded Facet */}
      <path d="M32 34 L50 24 L50 36 L32 46 Z" fill="#3B82F6" />

      {/* Ascending Compass Apex (Emerald Pulse) */}
      <path d="M42 16 L52 14 L50 24 Z" fill="url(#logoEmeraldGrad)" filter="url(#logoGlow)" />
      <circle cx="50" cy="15" r="2.5" fill="#A7F3D0" />

      {/* Forward Tier Foundation */}
      <path d="M24 43 L32 48 L40 43 L40 48 L32 53 L24 48 Z" fill="url(#logoEmeraldGrad)" />
    </svg>
  );
}

export function EduPathLogo({
  size = "md",
  showWordmark = true,
  className = "",
  variant = "default",
}: EduPathLogoProps) {
  const pixelSize = {
    xs: 24,
    sm: 28,
    md: 34,
    lg: 42,
    xl: 52,
  }[size];

  const textClasses = {
    xs: "text-sm",
    sm: "text-base",
    md: "text-lg",
    lg: "text-2xl",
    xl: "text-3xl",
  }[size];

  const isWhite = variant === "white";

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <EduPathLogoIcon size={pixelSize} />
      {showWordmark && (
        <span
          className={`font-display font-extrabold tracking-tight select-none ${textClasses} ${
            isWhite ? "text-white" : "text-[#0B0F19]"
          }`}
        >
          EduPath
          <span className="text-[#0F52FF]">.AI</span>
        </span>
      )}
    </div>
  );
}

export default EduPathLogo;
