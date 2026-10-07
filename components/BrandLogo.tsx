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
      src="/vac-logo-original.svg"
      alt={alt}
      width={441}
      height={441}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      decoding="async"
      style={{ "--logo-ratio": "1 / 1" } as CSSProperties}
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
      src="/eastern-university-logo-original.svg"
      alt={alt}
      width={300}
      height={216}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      decoding="async"
    />
  );
}
