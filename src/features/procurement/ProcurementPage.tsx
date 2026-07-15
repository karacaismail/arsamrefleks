import { useMemo, useState } from 'react';
import { PageHeader } from '../../components/PageHeader';
import { StatusBadge, ComplianceBadge } from '../../components/Badge';
import { ItemDrawer } from '../../components/ItemDrawer';
import { useItems, itemsStore } from '../../services/store';
import { byKind } from '../../services/selectors';
import { ItemKind } from '../../domain/enums';
import { formatTR } from '../../domain/util';
import type { AdminItem } from '../../domain/types';

const FIELD_ROWS: Array<[string, (i: AdminItem) => string]> = [
  ['Kapsam', (i) => i.description || '—'],
  ['Bütçe alt/üst', (i) => i.financialImpact || 'belirlenecek'],
  ['Öneri', (i) => i.recommendation || '—'],
  ['Teklifler', (i) => i.notes || 'belirlenecek (en az 3 teklif)'],
  ['Tedarikçi', (i) => (i.answer ? i.answer : 'belirlenecek')],
  ['SLA / Güvenlik', () => 'belirlenecek (SLA, erişim sınırı, KVKK veri yeri)'],
  ['Fikrî Mülkiyet', (i) => (i.category.includes('Kimlik') ? 'Kaynak dosya + IP şirkete devredilir' : 'Sözleşmede tanımlanacak')],
  ['Onay Sahibi', () => 'Ortak karar (yönetici hazırlar, patron onaylar)'],
  ['Başlangıç / Bitiş', (i) => formatTR(i.dueDate)],
];

export function ProcurementPage() {
  const items = useItems();
  const packages = useMemo(() => byKind(items, ItemKind.PROCUREMENT), [items]);
  const [editing, setEditing] = useState<AdminItem | null>(null);

  return (
    <div className="section-gap">
      <PageHeader
        title="Tedarik & Dış Kaynak"
        desc="İki başlangıç paketi: (A) Kurumsal Kimlik / Brand Dossier, (B) DevOps & Sunucu Operasyon Desteği. Kapsam, bütçe, SLA, güvenlik, IP, onay ve sözleşme durumu."
        source="strategy içeriği · PROCUREMENT"
      />
      <div className="grid2">
        {packages.map((p) => (
          <div className="card" key={p.id}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
              <h2>{p.title}</h2>
              <StatusBadge s={p.status} />
            </div>
            <div style={{ margin: '6px 0' }}>
              <ComplianceBadge c={p.complianceLevel} />
            </div>
            <div className="tbl-wrap">
              <table className="data">
                <tbody>
                  {FIELD_ROWS.map(([label, val]) => (
                    <tr key={label}>
                      <th style={{ width: 150, textAlign: 'left' }}>{label}</th>
                      <td>{val(p)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ marginTop: 12 }}>
              <button className="btn primary sm" onClick={() => setEditing(p)}>
                Düzenle
              </button>
            </div>
          </div>
        ))}
      </div>
      {editing && (
        <ItemDrawer
          item={editing}
          onClose={() => setEditing(null)}
          onSave={(patch) => {
            itemsStore.update(editing.id, patch);
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}
