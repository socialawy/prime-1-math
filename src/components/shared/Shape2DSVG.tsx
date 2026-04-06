type Shape2DKind = "square" | "circle" | "triangle" | "rectangle";

export function Shape2DSVG({
  shape,
  className = "h-16 w-16",
}: {
  shape: Shape2DKind;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      role="img"
      aria-label={shape}
    >
      {shape === "square" && (
        <rect x="20" y="20" width="60" height="60" rx="4" fill="#dbeafe" stroke="#1d4ed8" strokeWidth="6" />
      )}
      {shape === "circle" && (
        <circle cx="50" cy="50" r="30" fill="#ffedd5" stroke="#c2410c" strokeWidth="6" />
      )}
      {shape === "triangle" && (
        <polygon points="50,18 82,78 18,78" fill="#ede9fe" stroke="#7e22ce" strokeWidth="6" />
      )}
      {shape === "rectangle" && (
        <rect x="14" y="28" width="72" height="44" rx="4" fill="#fee2e2" stroke="#b91c1c" strokeWidth="6" />
      )}
    </svg>
  );
}

export type { Shape2DKind };
