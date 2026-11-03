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
      className={`shrink-0 transition-transform duration-300 hover:scale-105 ${className}`}
      aria-label="EduPath AI Logo"
    >
      <defs>
        <linearGradient id="logoBgGrad" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#2563EB" />
          <stop offset="50%" stopColor="#1D4ED8" />
          <stop offset="100%" stopColor="#090D16" />
        </linearGradient>

        <linearGradient id="logoRimGrad" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#93C5FD" stopOpacity="0.8" />
          <stop offset="50%" stopColor="#3B82F6" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#10B981" stopOpacity="0.6" />
        </linearGradient>

        <linearGradient id="logoEmeraldGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#34D399" />
          <stop offset="50%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>

        <linearGradient id="logoCapTopGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#E0E7FF" />
        </linearGradient>

        <filter id="logoEmeraldGlow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Rounded squircle backdrop */}
      <rect width="64" height="64" rx="16" fill="url(#logoBgGrad)" />
      <rect
        x="1"
        y="1"
        width="62"
        height="62"
        rx="15"
        stroke="url(#logoRimGrad)"
        strokeWidth="1.5"
      />

      {/* Inner ambient glow */}
      <circle cx="32" cy="18" r="18" fill="#60A5FA" fillOpacity="0.12" />

      {/* Mortarboard Diamond Top Facet */}
      <path d="M32 13 L51 23.5 L32 34 L13 23.5 Z" fill="url(#logoCapTopGrad)" />

      {/* Left Shaded Facet */}
      <path d="M13 23.5 L32 34 L32 46.5 L13 36 Z" fill="#60A5FA" fillOpacity="0.95" />

      {/* Right Shaded Facet */}
      <path d="M32 34 L51 23.5 L51 36 L32 46.5 Z" fill="#1D4ED8" />

      {/* Ascending Compass Apex (Emerald Beacon) */}
      <path d="M43 15 L53 13 L51 23.5 Z" fill="url(#logoEmeraldGrad)" filter="url(#logoEmeraldGlow)" />
      <circle cx="51.5" cy="14" r="2.75" fill="#A7F3D0" />
      <circle cx="51.5" cy="14" r="1.2" fill="#FFFFFF" />

      {/* Forward Trajectory Foundation */}
      <path d="M22 43.5 L32 49 L42 43.5 L42 48.5 L32 54 L22 48.5 Z" fill="url(#logoEmeraldGrad)" />
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
    sm: 30,
    md: 36,
    lg: 44,
    xl: 56,
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
    <div className={`inline-flex items-center gap-2.5 group ${className}`}>
      <EduPathLogoIcon size={pixelSize} />
      {showWordmark && (
        <span
          className={`font-display font-extrabold tracking-tight select-none ${textClasses} ${
            isWhite ? "text-white" : "text-slate-900"
          }`}
        >
          EduPath
          <span className="bg-gradient-to-r from-blue-600 to-emerald-500 bg-clip-text text-transparent">
            .AI
          </span>
        </span>
      )}
    </div>
  );
}

export default EduPathLogo;
