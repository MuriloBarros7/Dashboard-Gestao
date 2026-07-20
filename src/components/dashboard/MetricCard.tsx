interface MetricCardProps {
  title: string;
  value: number;
}

/**
 * Componente de apresentação para exibição de cards de métricas e indicadores numéricos (KPIs).
 * Recebe um título e um valor numérico para renderização padronizada nos painéis do Dashboard.
 */
export function MetricCard({ title, value }: MetricCardProps) {
  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm">
      <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
      <div className="mt-2 text-3xl font-bold">{value}</div>
    </div>
  );
}
