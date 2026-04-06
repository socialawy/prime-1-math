import logoSrc from "../assets/prime1-logo.webp";

interface AppLogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZE_CLASSES: Record<NonNullable<AppLogoProps["size"]>, string> = {
  sm: "h-12 w-12",
  md: "h-16 w-16",
  lg: "h-24 w-24",
};

export function AppLogo({ size = "md", className = "" }: AppLogoProps) {
  return (
    <img
      src={logoSrc}
      alt="Prime 1 Math logo"
      className={`${SIZE_CLASSES[size]} rounded-2xl object-cover shadow-sm ${className}`.trim()}
    />
  );
}
