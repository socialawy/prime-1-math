import { resolveAsset } from "../../assets/assetManifest";

/** Returns the emoji for a hint, or null if unknown. */
export function getContextEmoji(hint?: string): string | null {
  if (!hint) return null;
  return resolveAsset(hint)?.emoji ?? null;
}

/** Returns true if the hint resolves to anything in the unified ASSET_MAP. */
export function isKnownHint(hint: string): boolean {
  return resolveAsset(hint) !== null;
}

export function AssetIcon({
  hint,
  size = "md",
}: {
  hint?: string;
  size?: "sm" | "md" | "lg";
}) {
  if (!hint) return null;

  const entry = resolveAsset(hint);
  if (!entry) return null;

  const containerSizes = {
    sm: "h-10 w-10 min-w-[2.5rem]",
    md: "h-14 w-14 min-w-[3.5rem]",
    lg: "h-20 w-20 min-w-[5rem]",
  };

  const textSizes = {
    sm: "text-2xl",
    md: "text-4xl",
    lg: "text-5xl",
  };

  return (
    <span
      className={`${containerSizes[size]} ${textSizes[size]} inline-flex items-center justify-center rounded-2xl bg-amber-50 shadow-sm overflow-hidden`}
      aria-hidden="true"
      title={hint}
    >
      {entry.img ? (
        <img
          src={entry.img}
          alt={entry.label}
          className="h-full w-full object-contain p-1"
          onError={(e) => {
            // Fall back to emoji if image fails to load
            const span = e.currentTarget.parentElement;
            if (span) {
              e.currentTarget.remove();
              span.textContent = entry.emoji;
            }
          }}
        />
      ) : (
        entry.emoji
      )}
    </span>
  );
}

export function ContextHintBadge({ hint }: { hint?: string }) {
  if (!hint) return null;

  const entry = resolveAsset(hint);
  const label = entry?.label ?? hint;

  return (
    <div className="mb-4 flex items-center gap-3 rounded-2xl border border-amber-100 bg-amber-50/70 px-4 py-3 text-left">
      <AssetIcon hint={hint} size="sm" />
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-700">
          Real-world hint
        </p>
        <p className="text-sm font-medium text-slate-700">
          Like a {label}
        </p>
      </div>
    </div>
  );
}
