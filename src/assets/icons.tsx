import * as React from "react";

interface CursorProps extends React.SVGProps<SVGSVGElement> {
  color?: string;
}

export const Cursor = ({ color = "#fff", ...props }: CursorProps) => (
  <svg width={15} height={15} viewBox="0 0 24 24" fill={color} xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="m3 3 7 19 2.051-6.154a6 6 0 0 1 3.795-3.795L22 10z" stroke={color} strokeWidth={2} strokeLinejoin="round" />
  </svg>
);
