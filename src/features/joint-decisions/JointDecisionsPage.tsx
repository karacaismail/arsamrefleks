import { useMemo, useState } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { PageHeader } from '../../components/PageHeader';
import { DataTable } from '../../components/DataTable';
import { StatusBadge } from '../../components/Badge';
import { useDecisions, decisionsStore } from '../../services/store';
import { LABELS, Status } from '../../domain/enums';
import { formatTR } from '../../domain/util';
import type { JointDecision } from '../../domain/types';

function DecisionDrawer({ d, onClose }: { d: JointDecision; onClose: () => void }) {
  const [draft, setDraft] = useState<JointDecision>({ ...d });
  const set = <K extends keyof JointDecision>(k: K, v: JointDecision[K]) =>
    setDraft((x) => ({ ...x, [k]: v }));
  return (
    <div className="overlay" onClick={onClose}>
      <div className="drawer" role="dialog" aria-modal="true" aria-label={`Karar: ${d.title}`} onClick={(e) => e.stopPropagation()}>
        <button className="close" aria-label="Kapat" onClick={onClose}>×</button>
        <h2>{draft.decisionId} · Ortak Karar</h2>
        <p className="desc" style={{ color: 'var(--muted)' }}>{draft.title}</p>
        <div className="field"><label>Yönetici Önerisi</label><textarea value={draft.managerRecommendation} onChange={(e) => set('managerRecommendation', e.target.value)} /></div>
        <div className="field"><label>Yatırımcı Pozisyonu</label><textarea value={draft.investorPosition} onChange={(e) => set('investorPosition', e.target.value)} /></div>
        <div className="row">
          <div className="field"><label>Mali Etki</label><input value={draft.financialImpact} onChange={(e) => set('financialImpact', e.target.value)} /></div>
          <div className="field"><label>İnsan Etkisi</label><input value={draft.peopleImpact} onChange={(e) => set('peopleImpact', e.target.value)} /></div>
        </div>
        <div className="row">
          <div className="field"><label>Hukuki Etki</label><input value={draft.legalImpact} onChange={(e) => set('legalImpact', e.target.value)} /></div>
          <div className="field"><label>Son Tarih</label><input type="date" value={draft.deadline ?? ''} onChange={(e) => set('deadline', e.target.value || null)} /></div>
        </div>
        <div className="row">
          <div className="field">
            <label>Karar Durumu</label>
            <select value={draft.decisionStatus} onChange={(e) => set('decisionStatus', e.target.value as Status)}>
              {Object.values(Status).map((s) => <option key={s} value={s}>{LABELS.status[s]}</option>)}
            </select>
          </div>
          <div className="field"><label>Gözden Geçirme</label><input type="date" value={draft.reviewDate ?? ''} onChange={(e) => set('reviewDate', e.target.value || null)} /></div>
        </div>
        <div className="field"><label>Nihai Karar</label><textarea value={draft.finalDecision ?? ''} onChange={(e) => set('finalDecision', e.target.value || null)} /></div>
        <div className="field"><label>Gerekçe</label><textarea value={draft.decisionRationale ?? ''} onChange={(e) => set('decisionRationale', e.target.value || null)} /></div>
        <div className="foot">
          <button className="btn primary" onClick={() => { decisionsStore.update(d.id, draft); onClose(); }}>Kaydet</button>
          <button className="btn" onClick={onClose}>İptal</button>
        </div>
      </div>
    </div>
  );
}

export function JointDecisionsPage() {
  const decisions = useDecisions();
  const [editing, setEditing] = useState<JointDecision | null>(null);
  const rows = useMemo(() => decisions, [decisions]);

  const columns: ColumnDef<JointDecision, any>[] = [
    { header: '#', accessorKey: 'decisionId' },
    { header: 'Karar', accessorKey: 'title', cell: (c) => <strong>{c.row.original.title}</strong> },
    { header: 'Kategori', accessorKey: 'category' },
    { header: 'Yönetici Önerisi', accessorKey: 'managerRecommendation', cell: (c) => <span className="m">{c.row.original.managerRecommendation || '—'}</span> },
    { header: 'Mali Etki', accessorKey: 'financialImpact', cell: (c) => c.row.original.financialImpact || '—' },
    { header: 'Son Tarih', accessorKey: 'deadline', cell: (c) => formatTR(c.row.original.deadline) },
    { header: 'Durum', accessorKey: 'decisionStatus', cell: (c) => <StatusBadge s={c.row.original.decisionStatus} /> },
    { header: 'Nihai Karar', accessorKey: 'finalDecision', cell: (c) => c.row.original.finalDecision || '—' },
    {
      id: 'actions', header: '',
      cell: (c) => <button className="btn sm" onClick={(e) => { e.stopPropagation(); setEditing(c.row.original); }}>Karar Ver</button>,
    },
  ];

  return (
    <div className="section-gap">
      <PageHeader
        title="Ortak Kararlar"
        desc="Yalnız birlikte verilmesi gereken kararlar (bütçe, limitler, kadro, ücret bantları, tatil, tedarik, DevOps, riskler, 90 gün ölçütleri). Sorulacaklar sayfasının kopyası değildir."
        source="strategy içeriği · JointDecision"
      />
      <DataTable data={rows} columns={columns} onRowClick={setEditing} emptyText="Karar yok." />
      {editing && <DecisionDrawer d={editing} onClose={() => setEditing(null)} />}
    </div>
  );
}
