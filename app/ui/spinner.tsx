"use client";

type SpinnerProps = {
  className?: string;
  label?: string;
  size?: "sm" | "md" | "lg";
};

const sizeClasses: Record<NonNullable<SpinnerProps["size"]>, string> = {
  sm: "h-4 w-4 border-2",
  md: "h-5 w-5 border-2",
  lg: "h-10 w-10 border-[3px]",
};

export function Spinner({
  className = "",
  label = "Loading",
  size = "md",
}: SpinnerProps) {
  return (
    <span
      aria-label={label}
      aria-live="polite"
      aria-busy="true"
      className={`inline-block animate-spin rounded-full border-current border-t-transparent ${sizeClasses[size]} ${className}`}
      role="status"
    />
  );
}
