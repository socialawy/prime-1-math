const EMOJI_GROUPS: Array<{ keys: string[]; emoji: string; label: string }> = [
  // Animals
  { keys: ["dog"], emoji: "🐕", label: "dog" },
  { keys: ["cat"], emoji: "🐱", label: "cat" },
  { keys: ["bird"], emoji: "🐦", label: "bird" },
  { keys: ["fish"], emoji: "🐟", label: "fish" },
  // Food & drink
  { keys: ["apple"], emoji: "🍎", label: "apple" },
  { keys: ["orange"], emoji: "🍊", label: "orange" },
  { keys: ["banana"], emoji: "🍌", label: "banana" },
  { keys: ["cake"], emoji: "🎂", label: "cake" },
  { keys: ["cookie"], emoji: "🍪", label: "cookie" },
  { keys: ["candy", "candies", "sweet"], emoji: "🍬", label: "candy" },
  { keys: ["egg"], emoji: "🥚", label: "egg" },
  { keys: ["cheese-wedge", "cheese"], emoji: "🧀", label: "cheese" },
  { keys: ["juice-box", "juice"], emoji: "🧃", label: "juice box" },
  { keys: ["cup", "mug"], emoji: "🥤", label: "cup" },
  // School & stationery
  { keys: ["pencil"], emoji: "✏️", label: "pencil" },
  { keys: ["book"], emoji: "📘", label: "book" },
  { keys: ["sticker"], emoji: "🏷️", label: "sticker" },
  // Toys & play
  { keys: ["gift-box", "gift", "box"], emoji: "🎁", label: "gift box" },
  { keys: ["tennis-ball", "football", "ball", "sphere"], emoji: "⚽", label: "ball" },
  { keys: ["marble"], emoji: "🔮", label: "marble" },
  { keys: ["toy"], emoji: "🧸", label: "toy" },
  // Nature
  { keys: ["flower"], emoji: "🌸", label: "flower" },
  { keys: ["tree"], emoji: "🌳", label: "tree" },
  // Shapes & 3D
  { keys: ["cube"], emoji: "🧊", label: "cube" },
  { keys: ["cuboid"], emoji: "📦", label: "cuboid" },
  { keys: ["cylinder"], emoji: "🥫", label: "cylinder" },
  { keys: ["prism"], emoji: "🔺", label: "prism" },
  { keys: ["triangle"], emoji: "🔺", label: "triangle" },
  { keys: ["square"], emoji: "🟦", label: "square" },
  { keys: ["rectangle"], emoji: "▭", label: "rectangle" },
  { keys: ["circle"], emoji: "🔵", label: "circle" },
  { keys: ["pentagon"], emoji: "⬠", label: "pentagon" },
  // Counting & place value
  { keys: ["star"], emoji: "⭐", label: "star" },
  { keys: ["stick", "bundle"], emoji: "🪵", label: "stick" },
  { keys: ["block"], emoji: "🧱", label: "block" },
  { keys: ["hundreds chart"], emoji: "🔢", label: "hundreds chart" },
  { keys: ["grid", "area"], emoji: "📐", label: "area grid" },
  // Containers & capacity
  { keys: ["container", "bottle"], emoji: "🫙", label: "container" },
  { keys: ["bucket"], emoji: "🪣", label: "bucket" },
  { keys: ["vase"], emoji: "🏺", label: "vase" },
  { keys: ["teapot"], emoji: "🫖", label: "teapot" },
  { keys: ["pitcher", "jug"], emoji: "🫗", label: "pitcher" },
  { keys: ["watering-can", "watering can"], emoji: "🚿", label: "watering can" },
  { keys: ["gas can", "gas-can"], emoji: "⛽", label: "gas can" },
  // Objects from flash data
  { keys: ["tent"], emoji: "⛺", label: "tent" },
  { keys: ["tissue"], emoji: "🧻", label: "tissue box" },
  { keys: ["boat"], emoji: "⛵", label: "boat" },
  { keys: ["castle"], emoji: "🏰", label: "castle" },
  { keys: ["cart"], emoji: "🛒", label: "cart" },
  // Time
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
  return findEmojiGroup(hint)?.emoji ?? null;
}

/** Returns true if the hint matches a known emoji group. */
export function isKnownHint(hint: string): boolean {
  return findEmojiGroup(hint) !== undefined;
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
