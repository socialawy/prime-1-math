type Shape3DKind = "cube" | "cuboid" | "cylinder" | "ball" | "prism";

const COLORS: Record<Shape3DKind, { fill: string; stroke: string; accent: string; dark: string }> = {
  cube: { fill: "#60a5fa", stroke: "#1d4ed8", accent: "#93c5fd", dark: "#3b82f6" },
  cuboid: { fill: "#f87171", stroke: "#b91c1c", accent: "#fca5a5", dark: "#ef4444" },
  ball: { fill: "#fb923c", stroke: "#c2410c", accent: "#fdba74", dark: "#f97316" },
  cylinder: { fill: "#4ade80", stroke: "#15803d", accent: "#86efac", dark: "#22c55e" },
  prism: { fill: "#c084fc", stroke: "#7e22ce", accent: "#d8b4fe", dark: "#a855f7" },
};

export function Shape3DSVG({
  shape,
  className = "h-24 w-24",
}: {
  shape: Shape3DKind;
  className?: string;
}) {
  const c = COLORS[shape];

  return (
    <svg
      viewBox="0 0 120 120"
      className={className}
      role="img"
      aria-label={shape}
    >
      {shape === "ball" && (
        <>
          <circle cx="60" cy="62" r="36" fill={c.fill} stroke={c.stroke} strokeWidth="3" />
          <ellipse cx="48" cy="48" rx="14" ry="10" fill={c.accent} opacity="0.7" transform="rotate(-20 48 48)" />
        </>
      )}

      {shape === "cylinder" && (
        <>
          {/* Body: left and right edges */}
          <path
            d={`M 34 32 L 34 80 A 26 10 0 0 0 86 80 L 86 32`}
            fill={c.fill}
            stroke={c.stroke}
            strokeWidth="3"
          />
          {/* Bottom ellipse */}
          <ellipse cx="60" cy="80" rx="26" ry="10" fill={c.dark} stroke={c.stroke} strokeWidth="3" />
          {/* Top ellipse */}
          <ellipse cx="60" cy="32" rx="26" ry="10" fill={c.accent} stroke={c.stroke} strokeWidth="3" />
        </>
      )}

      {shape === "cube" && (
        <>
          {/* Front face */}
          <polygon points="28,48 60,64 60,98 28,82" fill={c.fill} stroke={c.stroke} strokeWidth="3" />
          {/* Right face */}
          <polygon points="60,64 92,48 92,82 60,98" fill={c.dark} stroke={c.stroke} strokeWidth="3" />
          {/* Top face */}
          <polygon points="28,48 60,32 92,48 60,64" fill={c.accent} stroke={c.stroke} strokeWidth="3" />
        </>
      )}

      {shape === "cuboid" && (
        <>
          {/* Front face (wider) */}
          <polygon points="20,48 62,62 62,98 20,84" fill={c.fill} stroke={c.stroke} strokeWidth="3" />
          {/* Right face (narrower) */}
          <polygon points="62,62 96,48 96,84 62,98" fill={c.dark} stroke={c.stroke} strokeWidth="3" />
          {/* Top face */}
          <polygon points="20,48 56,32 96,48 62,62" fill={c.accent} stroke={c.stroke} strokeWidth="3" />
        </>
      )}

      {shape === "prism" && (
        <>
          {/* Front triangular face — clearly visible */}
          <polygon points="18,90 44,28 70,90" fill={c.fill} stroke={c.stroke} strokeWidth="3" />
          {/* Right rectangular face — depth going right */}
          <polygon points="70,90 44,28 82,20 108,82" fill={c.dark} stroke={c.stroke} strokeWidth="3" />
          {/* Top edge — connecting front top to back top */}
          <line x1="44" y1="28" x2="82" y2="20" stroke={c.stroke} strokeWidth="3" />
          {/* Bottom edge — connecting front bottom-right to back bottom-right */}
          <line x1="70" y1="90" x2="108" y2="82" stroke={c.stroke} strokeWidth="3" />
          {/* Re-stroke front triangle edges for clarity */}
          <polygon points="18,90 44,28 70,90" fill="none" stroke={c.stroke} strokeWidth="3" />
        </>
      )}

      {/* Shape label */}
      <text
        x="60"
        y="114"
        textAnchor="middle"
        fontSize="11"
        fontWeight="bold"
        fill={c.stroke}
      >
        {shape === "ball" ? "Sphere" : shape.charAt(0).toUpperCase() + shape.slice(1)}
      </text>
    </svg>
  );
}

export type { Shape3DKind };
