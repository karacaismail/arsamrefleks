import raw from './panelData.json';

// Kanonik veri (Masterplan v16 JSON'undan türetildi). Sayılar burada, HTML'de değil.
export interface PanelData {
  meta: { axis: string[]; labels: string[]; months: number };
  kpis: {
    totalRevenue78: number;
    totalRevenueYear: number;
    totalNetYear: number;
    avgNetMargin: number;
    peakHeadcount: number;
    startCapital: number;
    finalCash: number;
    cashLow: number;
    breakevenMonth: string;
  };
  yearly: Array<{
    year: string;
    revenue: number;
    payroll: number;
    totalExpense: number;
    net: number;
    headcount: number;
    cashEnd: number;
  }>;
  monthly: {
    revenue: (number | null)[];
    headcount: (number | null)[];
    payrollGross: (number | null)[];
    newHires: (number | null)[];
    netProxy: (number | null)[];
    cashProxy: (number | null)[];
  };
  officeCosts: {
    kira: number | null;
    depozito: number | null;
    temizlik: number | null;
    hosgeldin: number | null;
    capexBilgisayar: number | null;
    source: string;
  };
  cockpit: Record<string, number>;
  params: { grossMinWage2026: number; netMinWage2026: number };
}

export const panelData = raw as unknown as PanelData;

/** İki brüt asgari ücret tavanı (DevOps varsayımı) — PARAMETRELER'den türetilir, hardcode değil. */
export function twoGrossMinWageCeiling(): number {
  return panelData.params.grossMinWage2026 * 2;
}
