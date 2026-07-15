interface Props {
  value: string | number;
  label: string;
  tone?: 'gold' | 'alt' | 'good' | 'bad' | 'warn';
  onClick?: () => void;
}

export function KpiCard({ value, label, tone = 'gold', onClick }: Props) {
  const cls = `kpi ${tone === 'gold' ? '' : tone}`.trim();
  const content = (
    <>
      <div className="v">{value}</div>
      <div className="l">{label}</div>
    </>
  );
  if (onClick) {
    return (
      <button type="button" className={cls} onClick={onClick} aria-label={`${label}: ${value}`}>
        {content}
      </button>
    );
  }
  return (
    <div className={cls} role="group" aria-label={`${label}: ${value}`}>
      {content}
    </div>
  );
}
