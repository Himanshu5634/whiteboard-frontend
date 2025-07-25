import * as React from "react";

// The original Logo component
export const Logo = ({ className }: { className?: string }) => {
  return (
    <svg 
      className={className}
      viewBox="0 0 100 100" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#8A2BE2', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#4A90E2', stopOpacity: 1 }} />
        </linearGradient>
      </defs>
      <path 
        d="M20,80 Q50,20 80,50" 
        stroke="url(#logoGradient)" 
        strokeWidth="12" 
        fill="none" 
        strokeLinecap="round"
      />
      <path 
        d="M20,50 Q50,80 80,20" 
        stroke="url(#logoGradient)" 
        strokeWidth="12" 
        fill="none" 
        strokeLinecap="round"
      />
    </svg>
  );
};

// --- NEW: The Cursor component you provided ---
interface CursorProps extends React.SVGProps<SVGSVGElement> {
  color?: string;
}

export const Cursor = ({ color = "#fff", ...props }: CursorProps) => (
  <svg width={15} height={15} viewBox="0 0 24 24" fill={color} xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="m3 3 7 19 2.051-6.154a6 6 0 0 1 3.795-3.795L22 10z" stroke={color} strokeWidth={2} strokeLinejoin="round" />
  </svg>
);

// We no longer have a default export, so we export components individually.
