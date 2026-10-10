import type { CSSProperties } from "react";

export function VacLogo({
  className = "",
  alt = "Visual Archive Club",
  priority = false
}: {
  className?: string;
  alt?: string;
  priority?: boolean;
}) {
  return (
    <img
      className={"vac-logo-asset " + className}
      src="/vac-logo.webp"
      alt={alt}
      width={220}
      height={157}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      decoding="async"
      style={{ "--logo-ratio": "220 / 157" } as CSSProperties}
    />
  );
}

export function EuLogo({
  className = "",
  alt = "Eastern University",
  priority = false
}: {
  className?: string;
  alt?: string;
  priority?: boolean;
}) {
  return (
    <img
      className={"eu-logo-asset " + className}
      src="/eastern-university-logo.webp"
      alt={alt}
      width={220}
      height={125}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      decoding="async"
    />
  );
}
