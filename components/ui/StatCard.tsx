interface StatCardProps {
  value: string | number;
  label: string;
  subtitle?: string;
}

export function StatCard({ value, label, subtitle }: StatCardProps) {
  return (
    <div className="bg-surface border border-border rounded-xl p-6 hover:border-accent/40 transition-colors">
      <div className="font-display text-4xl font-bold tracking-tight text-text mb-1">{value}</div>
      <div className="text-sm font-medium text-text/90">{label}</div>
      {subtitle && <div className="text-xs text-muted mt-1">{subtitle}</div>}
    </div>
  );
}
