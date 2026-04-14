/**
 * Unified Asset Map
 *
 * Single source of truth for every contextHint key in the app.
 * Each entry has an emoji fallback and an optional image path.
 * AssetIcon prefers img > emoji.
 *
 * Images in public/assets/ are served at the root path /assets/.
 */

export interface AssetEntry {
  emoji: string;
  label: string;
  img?: string;
}

export const ASSET_MAP: Record<string, AssetEntry> = {
  // ── Mascot ────────────────────────────────────────────
  "mascot-happy":     { emoji: "😺", label: "mascot", img: "/assets/mascot/mascot-happy.webp" },
  "mascot-thinking":  { emoji: "🤔", label: "mascot", img: "/assets/mascot/mascot-thinking.webp" },
  "mascot-celebrate": { emoji: "🎉", label: "mascot", img: "/assets/mascot/mascot-celebrate.webp" },

  // ── Containers & Capacity ─────────────────────────────
  "jug":          { emoji: "🫗", label: "jug",          img: "/assets/containers/jug.webp" },
  "pitcher":      { emoji: "🫗", label: "pitcher",      img: "/assets/containers/jug.webp" },
  "bottle":       { emoji: "🫙", label: "bottle",       img: "/assets/containers/bottle.webp" },
  "box":          { emoji: "🎁", label: "box",          img: "/assets/containers/box.webp" },
  "bucket":       { emoji: "🪣", label: "bucket",       img: "/assets/containers/bucket.webp" },
  "bowl":         { emoji: "🥣", label: "bowl",         img: "/assets/containers/bowl.webp" },
  "pot":          { emoji: "🍲", label: "pot",          img: "/assets/containers/pot.webp" },
  "cup":          { emoji: "🥤", label: "cup",          img: "/assets/containers/cup.webp" },
  "mug":          { emoji: "🥤", label: "mug",          img: "/assets/containers/cup.webp" },
  "vase":         { emoji: "🏺", label: "vase",         img: "/assets/containers/vase.webp" },
  "teapot":       { emoji: "🫖", label: "teapot",       img: "/assets/containers/teapot.webp" },
  "watering-can": { emoji: "🚿", label: "watering can", img: "/assets/containers/watering-can.webp" },
  "watering can": { emoji: "🚿", label: "watering can", img: "/assets/containers/watering-can.webp" },
  "gas-can":      { emoji: "⛽", label: "gas can",      img: "/assets/containers/gas-can.webp" },
  "gas can":      { emoji: "⛽", label: "gas can",      img: "/assets/containers/gas-can.webp" },
  "container":    { emoji: "🫙", label: "container" },
  "beaker":       { emoji: "🧪", label: "beaker" },

  // ── 3D Shapes ─────────────────────────────────────────
  "cuboid":   { emoji: "📦", label: "cuboid",   img: "/assets/shapes/cuboid.webp" },
  "cylinder": { emoji: "🥫", label: "cylinder", img: "/assets/shapes/cylinder.webp" },
  "prism":    { emoji: "🔺", label: "prism",    img: "/assets/shapes/prism.webp" },
  "cube":     { emoji: "🧊", label: "cube" },
  "sphere":   { emoji: "⚽", label: "sphere" },
  "cone":     { emoji: "🔺", label: "cone" },

  // ── 2D Shapes ─────────────────────────────────────────
  "triangle":  { emoji: "🔺", label: "triangle" },
  "square":    { emoji: "🟦", label: "square" },
  "rectangle": { emoji: "▭",  label: "rectangle" },
  "circle":    { emoji: "🔵", label: "circle" },
  "pentagon":  { emoji: "⬠",  label: "pentagon" },

  // ── Animals ───────────────────────────────────────────
  "dog":  { emoji: "🐕", label: "dog" },
  "cat":  { emoji: "🐱", label: "cat" },
  "bird": { emoji: "🐦", label: "bird" },
  "fish": { emoji: "🐟", label: "fish" },

  // ── Food & Drink ──────────────────────────────────────
  "apple":       { emoji: "🍎", label: "apple" },
  "orange":      { emoji: "🍊", label: "orange" },
  "banana":      { emoji: "🍌", label: "banana" },
  "cake":        { emoji: "🎂", label: "cake" },
  "cookie":      { emoji: "🍪", label: "cookie" },
  "candy":       { emoji: "🍬", label: "candy" },
  "sweet":       { emoji: "🍬", label: "sweet" },
  "egg":         { emoji: "🥚", label: "egg" },
  "cheese":      { emoji: "🧀", label: "cheese" },
  "cheese-wedge":{ emoji: "🧀", label: "cheese" },
  "juice":       { emoji: "🧃", label: "juice box" },
  "juice-box":   { emoji: "🧃", label: "juice box" },

  // ── School & Stationery ───────────────────────────────
  "pencil":  { emoji: "✏️",  label: "pencil" },
  "book":    { emoji: "📘", label: "book" },
  "sticker": { emoji: "🏷️",  label: "sticker" },

  // ── Toys & Play ───────────────────────────────────────
  "gift":        { emoji: "🎁", label: "gift box" },
  "gift-box":    { emoji: "🎁", label: "gift box" },
  "ball":        { emoji: "⚽", label: "ball" },
  "tennis-ball": { emoji: "🎾", label: "ball" },
  "football":    { emoji: "⚽", label: "ball" },
  "marble":      { emoji: "🔮", label: "marble" },
  "toy":         { emoji: "🧸", label: "toy" },

  // ── Nature ────────────────────────────────────────────
  "flower": { emoji: "🌸", label: "flower" },
  "tree":   { emoji: "🌳", label: "tree" },

  // ── Counting & Place Value ────────────────────────────
  "star":     { emoji: "⭐", label: "star" },
  "stick":    { emoji: "🪵", label: "stick" },
  "bundle":   { emoji: "🪵", label: "bundle" },
  "block":    { emoji: "🧱", label: "block" },
  "hundreds chart": { emoji: "🔢", label: "hundreds chart" },
  "grid":     { emoji: "📐", label: "area grid" },
  "area":     { emoji: "📐", label: "area grid" },

  // ── Objects from flash data ───────────────────────────
  "tent":    { emoji: "⛺", label: "tent" },
  "tissue":  { emoji: "🧻", label: "tissue box" },
  "boat":    { emoji: "⛵", label: "boat" },
  "castle":  { emoji: "🏰", label: "castle" },
  "cart":    { emoji: "🛒", label: "cart" },

  // ── Time ──────────────────────────────────────────────
  "clock": { emoji: "🕒", label: "clock" },
  "time":  { emoji: "🕒", label: "clock" },
};

/**
 * Look up an asset entry by hint string.
 * Normalises to lowercase and tries the full string, then each word.
 */
export function resolveAsset(hint: string): AssetEntry | null {
  const normalized = hint.trim().toLowerCase();

  // Exact match
  const exact = ASSET_MAP[normalized];
  if (exact) return exact;

  // Try matching on any word in the hint (e.g. "tissue box" matches "tissue")
  for (const key of Object.keys(ASSET_MAP)) {
    if (normalized.includes(key)) return ASSET_MAP[key]!;
  }

  return null;
}

/**
 * Returns the image path for a given hint, or null.
 * Kept for backward-compat with any direct callers.
 */
export function getAssetPath(hint: string): string | null {
  return resolveAsset(hint)?.img ?? null;
}
