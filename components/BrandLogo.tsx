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
      width={520}
      height={373}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      decoding="async"
      style={{ "--logo-ratio": "520 / 373" } as CSSProperties}
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
      width={520}
      height={295}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      decoding="async"
    />
  );
}
