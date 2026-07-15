import { useMemo, useState } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { PageHeader } from '../../components/PageHeader';
import { DataTable } from '../../components/DataTable';
import { ItemDrawer } from '../../components/ItemDrawer';
import { StatusBadge } from '../../components/Badge';
import { useItems, itemsStore } from '../../services/store';
import { byKind } from '../../services/selectors';
import { ItemKind } from '../../domain/enums';
import { formatTR } from '../../domain/util';
import type { AdminItem } from '../../domain/types';

export function PatronDiscussionsPage() {
  const items = useItems();
  const rows = useMemo(() => byKind(items, ItemKind.PATRON_DISCUSSION), [items]);
  const [editing, setEditing] = useState<AdminItem | null>(null);

  const columns: ColumnDef<AdminItem, any>[] = [
    { header: 'Konu', accessorKey: 'title', cell: (c) => <strong>{c.row.original.title}</strong> },
    { header: 'Özet', accessorKey: 'description', cell: (c) => <span className="m">{c.row.original.description}</span> },
    { header: 'Neden', accessorKey: 'reason', cell: (c) => c.row.original.reason ?? '—' },
    { header: 'Mali Etki', accessorKey: 'financialImpact', cell: (c) => c.row.original.financialImpact ?? '—' },
    { header: 'Öneri', accessorKey: 'recommendation', cell: (c) => c.row.original.recommendation ?? '—' },
    { header: 'Patron Aksiyonu', accessorKey: 'patronAction', cell: (c) => c.row.original.patronAction ?? '—' },
    { header: 'Toplantı', accessorKey: 'meetingDate', cell: (c) => formatTR(c.row.original.meetingDate ?? null) },
    { header: 'Durum', accessorKey: 'status', cell: (c) => <StatusBadge s={c.row.original.status} /> },
    {
      id: 'actions',
      header: '',
      cell: (c) => (
        <button className="btn sm" onClick={(e) => { e.stopPropagation(); setEditing(c.row.original); }}>
          Düzenle
        </button>
      ),
    },
  ];

  return (
    <div className="section-gap">
      <PageHeader
        title="Patronla Konuşulacaklar"
        desc="Patrona bildirilecek planlar, maliyet tahminleri, operasyon modeli, dış kaynak kullanımı, riskler ve yönetici önerileri. (Bu sayfa soru sorma sayfası değildir.)"
        source="strategy içeriği · PATRON_DISCUSSION"
      />
      <div className="infobox">
        Bu kayıtlar yöneticinin hazırlayıp patrona <b>bildireceği</b> konulardır. Soru soracaksanız{' '}
        <b>Patron → Sorulacaklar</b> sayfasını kullanın.
      </div>
      <DataTable data={rows} columns={columns} onRowClick={setEditing} emptyText="Konu yok." />
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
