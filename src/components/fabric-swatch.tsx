export function FabricSwatch({ hex, className = "h-full w-full" }: { hex: string; className?: string }) {
  const uid = hex.replace("#", "");

  return (
    <svg
      viewBox="0 0 300 400"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <pattern id={`weave-${uid}`} width="10" height="10" patternUnits="userSpaceOnUse">
          <rect width="10" height="10" fill={hex} />
          <line x1="0" y1="2.5" x2="10" y2="2.5" stroke="rgba(255,255,255,0.09)" strokeWidth="1" />
          <line x1="0" y1="7.5" x2="10" y2="7.5" stroke="rgba(255,255,255,0.09)" strokeWidth="1" />
          <line x1="2.5" y1="0" x2="2.5" y2="10" stroke="rgba(0,0,0,0.09)" strokeWidth="1" />
          <line x1="7.5" y1="0" x2="7.5" y2="10" stroke="rgba(0,0,0,0.09)" strokeWidth="1" />
        </pattern>
        <linearGradient id={`depth-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(255,255,255,0.12)" />
          <stop offset="55%" stopColor="rgba(0,0,0,0)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.32)" />
        </linearGradient>
        <linearGradient id={`shimmer-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="rgba(255,255,255,0)" />
          <stop offset="42%" stopColor="rgba(255,255,255,0.09)" />
          <stop offset="58%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
      </defs>

      {/* Woven fabric body */}
      <rect width="300" height="400" fill={`url(#weave-${uid})`} />
      <rect width="300" height="400" fill={`url(#depth-${uid})`} />
      <rect width="300" height="400" fill={`url(#shimmer-${uid})`} />

      {/* Zari border band */}
      <rect x="0" y="318" width="300" height="82" fill="rgba(0,0,0,0.22)" />
      <line x1="0" y1="321" x2="300" y2="321" stroke="#d4af37" strokeWidth="2" />
      <line x1="0" y1="325" x2="300" y2="325" stroke="#d4af37" strokeWidth="0.7" opacity="0.55" />
      <line x1="0" y1="395" x2="300" y2="395" stroke="#d4af37" strokeWidth="2" />
      <line x1="0" y1="391" x2="300" y2="391" stroke="#d4af37" strokeWidth="0.7" opacity="0.55" />

      {/* Diamond motifs along border */}
      {[22, 68, 114, 150, 186, 232, 278].map((x) => (
        <g key={x} transform={`translate(${x},358)`}>
          <polygon points="0,-17 13,0 0,17 -13,0" fill="#d4af37" opacity="0.9" />
          <polygon points="0,-9 7,0 0,9 -7,0" fill="rgba(255,240,140,0.55)" />
        </g>
      ))}

      {/* Dot separators between diamonds */}
      {[45, 91, 132, 168, 209, 255].map((x) => (
        <circle key={x} cx={x} cy={358} r="3.5" fill="#d4af37" opacity="0.6" />
      ))}

      {/* Thin vertical accent lines in border */}
      {[45, 91, 132, 168, 209, 255].map((x) => (
        <line key={x} x1={x} y1="327" x2={x} y2="388" stroke="#d4af37" strokeWidth="0.5" opacity="0.3" />
      ))}
    </svg>
  );
}
