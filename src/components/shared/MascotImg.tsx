import { resolveAsset } from "../../assets/assetManifest";

type MascotPose = "happy" | "thinking" | "celebrate";

export function MascotImg({
  pose,
  size = 80,
  className = "",
}: {
  pose: MascotPose;
  size?: number;
  className?: string;
}) {
  const entry = resolveAsset(`mascot-${pose}`);
  if (!entry?.img) return null;

  return (
    <img
      src={entry.img}
      alt={`Mascot ${pose}`}
      width={size}
      height={size}
      className={`object-contain ${className}`}
    />
  );
}
