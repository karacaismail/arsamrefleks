export function uid(prefix = 'id'): string {
  const g = globalThis as unknown as { crypto?: { randomUUID?: () => string } };
  if (g.crypto?.randomUUID) return `${prefix}_${g.crypto.randomUUID().slice(0, 8)}`;
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function nowISO(): string {
  return new Date().toISOString();
}

export function isOverdue(dueDate: string | null, completed: boolean): boolean {
  if (!dueDate || completed) return false;
  return dueDate < todayISO();
}

export function formatTR(dateISO: string | null): string {
  if (!dateISO) return '—';
  const [y, m, d] = dateISO.split('-');
  if (!y || !m) return dateISO;
  return d ? `${d}.${m}.${y}` : `${m}.${y}`;
}

export function moneyTR(n: number | null | undefined): string {
  if (n == null || Number.isNaN(n)) return '—';
  const a = Math.abs(n);
  const f = (x: number, d: number) =>
    x.toLocaleString('tr-TR', { minimumFractionDigits: d, maximumFractionDigits: d });
  if (a >= 1e9) return `${f(n / 1e9, 1)} Mr ₺`;
  if (a >= 1e6) return `${f(n / 1e6, 1)} M ₺`;
  if (a >= 1e3) return `${f(n / 1e3, 0)} B ₺`;
  return `${f(n, 0)} ₺`;
}
