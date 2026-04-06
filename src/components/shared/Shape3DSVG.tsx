type Shape3DKind = "cube" | "cuboid" | "cylinder" | "ball" | "prism";

const COLORS: Record<Shape3DKind, { fill: string; stroke: string; accent: string }> = {
  cube: { fill: "#60a5fa", stroke: "#1d4ed8", accent: "#93c5fd" },
  cuboid: { fill: "#f87171", stroke: "#b91c1c", accent: "#fca5a5" },
  ball: { fill: "#fb923c", stroke: "#c2410c", accent: "#fdba74" },
  cylinder: { fill: "#4ade80", stroke: "#15803d", accent: "#86efac" },
  prism: { fill: "#c084fc", stroke: "#7e22ce", accent: "#d8b4fe" },
};

export function Shape3DSVG({
  shape,
  className = "h-24 w-24",
}: {
  shape: Shape3DKind;
  className?: string;
}) {
  const color = COLORS[shape];

  return (
    <svg
      viewBox="0 0 120 120"
      className={className}
      role="img"
      aria-label={shape}
    >
      {shape === "ball" && (
        <>
          <circle cx="60" cy="60" r="34" fill={color.fill} stroke={color.stroke} strokeWidth="4" />
          <circle cx="48" cy="48" r="12" fill={color.accent} opacity="0.8" />
        </>
      )}

      {shape === "cylinder" && (
        <>
          <ellipse cx="60" cy="28" rx="26" ry="10" fill={color.accent} stroke={color.stroke} strokeWidth="4" />
          <rect x="34" y="28" width="52" height="48" fill={color.fill} stroke={color.stroke} strokeWidth="4" />
          <ellipse cx="60" cy="76" rx="26" ry="10" fill={color.fill} stroke={color.stroke} strokeWidth="4" />
        </>
      )}

      {shape === "cube" && (
        <>
          <polygon points="32,42 64,26 92,42 60,58" fill={color.accent} stroke={color.stroke} strokeWidth="4" />
          <polygon points="32,42 32,78 60,94 60,58" fill={color.fill} stroke={color.stroke} strokeWidth="4" />
          <polygon points="60,58 92,42 92,78 60,94" fill={color.accent} stroke={color.stroke} strokeWidth="4" />
        </>
      )}

      {shape === "cuboid" && (
        <>
          <polygon points="26,44 66,28 98,40 58,56" fill={color.accent} stroke={color.stroke} strokeWidth="4" />
          <polygon points="26,44 26,78 58,92 58,56" fill={color.fill} stroke={color.stroke} strokeWidth="4" />
          <polygon points="58,56 98,40 98,74 58,92" fill={color.accent} stroke={color.stroke} strokeWidth="4" />
        </>
      )}

      {shape === "prism" && (
        <>
          <polygon points="32,68 56,34 56,86" fill={color.fill} stroke={color.stroke} strokeWidth="4" />
          <polygon points="56,34 86,42 86,94 56,86" fill={color.accent} stroke={color.stroke} strokeWidth="4" />
          <polygon points="32,68 62,76 86,42 56,34" fill={color.accent} stroke={color.stroke} strokeWidth="4" />
        </>
      )}
    </svg>
  );
}

export type { Shape3DKind };
