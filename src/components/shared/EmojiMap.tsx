const EMOJI_GROUPS: Array<{ keys: string[]; emoji: string; label: string }> = [
  { keys: ["apple"], emoji: "🍎", label: "apple" },
  { keys: ["gift-box", "gift", "box"], emoji: "🎁", label: "gift box" },
  { keys: ["tennis-ball", "football", "ball", "sphere"], emoji: "⚽", label: "ball" },
  { keys: ["cheese-wedge", "cheese"], emoji: "🧀", label: "cheese" },
  { keys: ["juice-box", "juice"], emoji: "🧃", label: "juice box" },
  { keys: ["cup", "mug"], emoji: "🥤", label: "cup" },
  { keys: ["bird"], emoji: "🐦", label: "bird" },
  { keys: ["pencil"], emoji: "✏️", label: "pencil" },
  { keys: ["book"], emoji: "📘", label: "book" },
  { keys: ["cube"], emoji: "🧊", label: "cube" },
  { keys: ["cuboid"], emoji: "📦", label: "cuboid" },
  { keys: ["cylinder"], emoji: "🥫", label: "cylinder" },
  { keys: ["prism"], emoji: "🔺", label: "prism" },
  { keys: ["triangle"], emoji: "🔺", label: "triangle" },
  { keys: ["square"], emoji: "🟦", label: "square" },
  { keys: ["rectangle"], emoji: "▭", label: "rectangle" },
  { keys: ["star"], emoji: "⭐", label: "star" },
  { keys: ["stick"], emoji: "🪵", label: "stick" },
  { keys: ["block"], emoji: "🧱", label: "block" },
  { keys: ["container", "bottle"], emoji: "🫙", label: "container" },
  { keys: ["clock", "time"], emoji: "🕒", label: "clock" },
];

function findEmojiGroup(hint: string) {
  const normalized = hint.trim().toLowerCase();
  return EMOJI_GROUPS.find((group) =>
    group.keys.some((key) => normalized.includes(key)),
  );
}

export function getContextEmoji(hint?: string): string | null {
  if (!hint) return null;
  return findEmojiGroup(hint)?.emoji ?? "✨";
}

export function AssetIcon({
  hint,
  size = "md",
}: {
  hint?: string;
  size?: "sm" | "md" | "lg";
}) {
  if (!hint) return null;

  const emoji = getContextEmoji(hint);
  if (!emoji) return null;

  const sizeClass =
    size === "sm" ? "text-2xl" : size === "lg" ? "text-5xl" : "text-4xl";

  return (
    <span
      className={`${sizeClass} inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 shadow-sm`}
      aria-hidden="true"
      title={hint}
    >
      {emoji}
    </span>
  );
}

export function ContextHintBadge({ hint }: { hint?: string }) {
  if (!hint) return null;

  const emoji = getContextEmoji(hint);
  const label = findEmojiGroup(hint)?.label ?? hint;

  return (
    <div className="mb-4 flex items-center gap-3 rounded-2xl border border-amber-100 bg-amber-50/70 px-4 py-3 text-left">
      <span className="text-2xl" aria-hidden="true">
        {emoji}
      </span>
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
