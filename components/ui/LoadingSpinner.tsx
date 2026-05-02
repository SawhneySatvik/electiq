interface LoadingSpinnerProps {
  size?: number;
  label?: string;
}

export function LoadingSpinner({ size = 20, label }: LoadingSpinnerProps) {
  return (
    <span className="inline-flex items-center gap-2 text-muted text-sm">
      <span
        className="inline-block rounded-full border-2 border-border border-t-accent animate-spin"
        style={{ width: size, height: size }}
      />
      {label && <span>{label}</span>}
    </span>
  );
}

export function SkeletonLine({ className = "" }: { className?: string }) {
  return <div className={`h-3 bg-surface2 rounded animate-pulse-soft ${className}`} />;
}
