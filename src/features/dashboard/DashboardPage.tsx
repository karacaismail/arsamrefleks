import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/PageHeader';
import { KpiCard } from '../../components/KpiCard';
import { DataTable } from '../../components/DataTable';
import { StatusBadge, RoleBadge } from '../../components/Badge';
import { useItems, useDecisions } from '../../services/store';
import { dashboardSummary } from '../../services/selectors';
import { panelData } from '../../data/panel';
import { LABELS } from '../../domain/enums';
import { formatTR, moneyTR } from '../../domain/util';
import type { AdminItem } from '../../domain/types';

export function DashboardPage() {
  const nav = useNavigate();
  const items = useItems();
  const decisions = useDecisions();
  const s = dashboardSummary(items, decisions);

  const upcomingCols = [
    { header: 'İş', accessorKey: 'title', cell: (c: any) => <strong>{c.row.original.title}</strong> },
    { header: 'Rol', accessorKey: 'roleScope', cell: (c: any) => <RoleBadge r={c.row.original.roleScope} /> },
    { header: 'Son Tarih', accessorKey: 'dueDate', cell: (c: any) => formatTR(c.row.original.dueDate) },
    { header: 'Durum', accessorKey: 'status', cell: (c: any) => <StatusBadge s={c.row.original.status} /> },
  ];

  return (
    <div className="section-gap">
      <PageHeader
        title="Dashboard"
        desc="Cevap bekleyen patron soruları, ortak kararlar, geciken işler, uyum riskleri ve ilk 90 gün ilerlemesi. KPI kartına tıklayın → filtreli sayfaya gidin."
        source="panel_data.json (kanonik) + yönetim kayıtları"
      />

      <div className="kpis">
        <KpiCard tone="bad" value={s.waitingPatronAnswers} label="Cevap Bekleyen Patron Sorusu" onClick={() => nav('/patron/sorulacaklar?patron=1')} />
        <KpiCard tone="warn" value={s.waitingJointDecisions} label="Bekleyen Ortak Karar" onClick={() => nav('/patron/ortak-kararlar')} />
        <KpiCard tone="bad" value={s.overdueManagerWork} label="Geciken Yönetici İşi" onClick={() => nav('/yonetici-operasyonlari?overdue=1')} />
        <KpiCard tone="bad" value={s.redComplianceRisks} label="Kırmızı Uyum Riski" onClick={() => nav('/finans-bordro')} />
      </div>

      <div className="kpis">
        <KpiCard tone="good" value={`%${s.progress90.pct}`} label={`İlk 90 Gün (${s.progress90.done}/${s.progress90.total})`} onClick={() => nav('/timeline')} />
        <KpiCard tone="alt" value={panelData.kpis.peakHeadcount} label="Zirve Kadro (plan)" onClick={() => nav('/sorumluluk-matrisi')} />
        <KpiCard value={moneyTR(panelData.kpis.startCapital)} label="Başlangıç Sermaye" />
        <KpiCard tone="warn" value={moneyTR(panelData.kpis.cashLow)} label="Nakit Dibi (plan)" />
      </div>

      {s.prohibited.length > 0 && (
        <div className="warnbox" role="alert">
          <b>YASAK / uyum ihlali maddesi ({s.prohibited.length}):</b> {s.prohibited.map((p) => p.title).join(' · ')} —
          bu bir optimizasyon değildir; <b>PROHIBITED</b> olarak kodlanmıştır.
        </div>
      )}

      <div className="grid2">
        <div className="card">
          <h2>Yaklaşan Son Tarihler</h2>
          <DataTable data={s.upcomingDeadlines as AdminItem[]} columns={upcomingCols as any} emptyText="Yaklaşan son tarih yok." />
        </div>
        <div className="card">
          <h2>Rol Bazlı Açık İş</h2>
          <div className="tbl-wrap">
            <table className="data">
              <thead><tr><th>Rol</th><th>Açık İş</th></tr></thead>
              <tbody>
                {Object.entries(s.openByRole).map(([r, n]) => (
                  <tr key={r}><td>{LABELS.role[r as keyof typeof LABELS.role]}</td><td><strong>{n}</strong></td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
