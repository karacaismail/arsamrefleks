import { useMemo } from 'react';
import { PageHeader } from '../../components/PageHeader';
import { KpiCard } from '../../components/KpiCard';
import { EChart } from '../../components/EChart';
import { panelData } from '../../data/panel';
import { moneyTR } from '../../domain/util';

interface SampleRow {
  person: string;
  brut: number;
  employer: number;
  sgkBase: number;
  bank: number;
  payrollTotal: number;
}

export function FinancePayrollPage() {
  const gross = panelData.params.grossMinWage2026;
  const net = panelData.params.netMinWage2026;

  // SAMPLE_DATA — gerçek personel değildir. Sadece uyum kontrolü örneğidir.
  const sample: SampleRow[] = useMemo(
    () => [
      { person: 'Örnek Personel A', brut: gross, employer: Math.round(gross * 1.34), sgkBase: gross, bank: net, payrollTotal: net },
      { person: 'Örnek Personel B', brut: gross * 2, employer: Math.round(gross * 2 * 1.34), sgkBase: gross * 2, bank: Math.round(net * 1.9), payrollTotal: Math.round(net * 1.9) },
      // Kasıtlı uyumsuzluk: bordro/SGK gerçek kazancı yansıtmıyor (banka ödemesi beklenenden düşük)
      { person: 'Örnek Personel C', brut: gross * 3, employer: Math.round(gross * 3 * 1.34), sgkBase: gross, bank: Math.round(net * 1.1), payrollTotal: gross },
    ],
    [gross, net],
  );

  const diff = (r: SampleRow) => Math.abs(r.bank + 0 - r.payrollTotal);
  const flagged = (r: SampleRow) => r.sgkBase < r.brut; // SGK matrahı gerçek brütün altında => açıklanamayan fark

  const yearly = panelData.yearly;
  const payrollOption = {
    grid: { left: 64, right: 20, top: 20, bottom: 34 },
    tooltip: { trigger: 'axis' as const, formatter: (ps: any) => `${ps[0].axisValue}<br/>Bordro: ${moneyTR(ps[0].value)}` },
    xAxis: { type: 'category' as const, data: yearly.map((y) => y.year.replace('.0', '')), axisLabel: { color: '#33475b' } },
    yAxis: { type: 'value' as const, axisLabel: { color: '#33475b', formatter: (v: number) => `${(v / 1e6).toFixed(0)}M` }, splitLine: { lineStyle: { color: '#eef2f6' } } },
    series: [{ type: 'bar' as const, data: yearly.map((y) => y.payroll), itemStyle: { color: '#0e2740', borderRadius: [4, 4, 0, 0] } }],
  };

  return (
    <div className="section-gap">
      <PageHeader
        title="Finans & Bordro"
        desc="Brüt ücret, işveren maliyeti, SGK matrahı, banka ödemesi, bordro toplamı ve uyumsuzluk kontrolü. Gerçek personel verisi yoktur; örnekler SAMPLE_DATA etiketlidir."
        source="panel_data.json (yıllık bordro, kanonik) + SAMPLE_DATA örnek kontrol"
      />

      <div className="warnbox">
        Bu ekran hukuk veya mali müşavir <b>yerine karar vermez</b>. Uyumsuzluk tespitleri{' '}
        <b>LEGAL_EXPERT_REQUIRED</b> etiketiyle uzmana taşınır.
      </div>

      <div className="kpis">
        <KpiCard value={moneyTR(yearly.reduce((a, y) => a + y.payroll, 0))} label="Toplam Bordro (78 ay, plan)" />
        <KpiCard tone="alt" value={panelData.kpis.peakHeadcount} label="Zirve Kadro (plan)" />
        <KpiCard value={moneyTR(gross)} label="2026 Brüt Asgari Ücret" />
        <KpiCard value={moneyTR(net)} label="2026 Net Asgari Ücret" />
      </div>

      <div className="card">
        <h2>Yıllık Bordro (kanonik — plan)</h2>
        <EChart option={payrollOption} height={300} ariaLabel="Yıllık bordro grafiği" />
      </div>

      <div className="card">
        <h2>
          Bordro / SGK Uyum Kontrolü <span className="sample-tag">SAMPLE_DATA</span>
        </h2>
        <p className="m" style={{ color: 'var(--muted)' }}>
          Kontrol: <b>banka ödemesi + kayıtlı diğer ödeme</b> ile <b>bordro ve SGK bildirimi</b> arasında
          açıklanamayan fark varsa kırmızı işaretlenir.
        </p>
        <div className="tbl-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>Personel</th>
                <th>Brüt</th>
                <th>İşveren Maliyeti</th>
                <th>SGK Matrahı</th>
                <th>Banka Ödemesi</th>
                <th>Bordro Toplamı</th>
                <th>Fark / Durum</th>
              </tr>
            </thead>
            <tbody>
              {sample.map((r) => (
                <tr key={r.person} style={flagged(r) ? { background: '#fdf0ef' } : undefined}>
                  <td>{r.person}</td>
                  <td>{moneyTR(r.brut)}</td>
                  <td>{moneyTR(r.employer)}</td>
                  <td>{moneyTR(r.sgkBase)}</td>
                  <td>{moneyTR(r.bank)}</td>
                  <td>{moneyTR(r.payrollTotal)}</td>
                  <td>
                    {flagged(r) ? (
                      <span className="badge legal">Açıklanamayan fark → LEGAL_EXPERT_REQUIRED</span>
                    ) : (
                      <span className="badge g">Uyumlu ({moneyTR(diff(r))})</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
