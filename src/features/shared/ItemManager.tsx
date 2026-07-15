import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { ColumnDef } from '@tanstack/react-table';
import type { AdminItem } from '../../domain/types';
import type { ItemKind } from '../../domain/enums';
import { LABELS } from '../../domain/enums';
import { useItems, itemsStore } from '../../services/store';
import { applyFilter, type ItemFilter } from '../../services/selectors';
import { formatTR, isOverdue } from '../../domain/util';
import { DataTable } from '../../components/DataTable';
import { FilterBar } from '../../components/FilterBar';
import { ItemDrawer } from '../../components/ItemDrawer';
import { StatusBadge, RoleBadge, PriorityBadge, ComplianceBadge } from '../../components/Badge';

type FilterKey = 'role' | 'status' | 'time' | 'priority' | 'patron' | 'overdue' | 'text' | 'category';

interface Props {
  kind: ItemKind;
  showFilters?: FilterKey[];
  initialFilter?: ItemFilter;
  extraColumns?: ColumnDef<AdminItem, any>[];
}

export function ItemManager({ kind, showFilters, initialFilter, extraColumns }: Props) {
  const items = useItems();
  const [sp] = useSearchParams();
  const queryFilter: Partial<ItemFilter> = {};
  if (sp.get('overdue') === '1') queryFilter.overdueOnly = true;
  if (sp.get('patron') === '1') queryFilter.requiresPatron = true;
  if (sp.get('role')) queryFilter.role = sp.get('role') as ItemFilter['role'];
  if (sp.get('status')) queryFilter.status = sp.get('status') as ItemFilter['status'];
  const [filter, setFilter] = useState<ItemFilter>({
    kind,
    role: 'ALL',
    status: 'ALL',
    ...initialFilter,
    ...queryFilter,
  });
  const [editing, setEditing] = useState<AdminItem | null>(null);

  const rows = useMemo(() => applyFilter(items, { ...filter, kind }), [items, filter, kind]);
  const categories = useMemo(
    () => Array.from(new Set(items.filter((i) => i.kind === kind).map((i) => i.category))),
    [items, kind],
  );

  const columns = useMemo<ColumnDef<AdminItem, any>[]>(
    () => [
      {
        header: 'Başlık',
        accessorKey: 'title',
        cell: (c) => {
          const it = c.row.original;
          const over = isOverdue(it.dueDate, it.status === 'COMPLETED' || it.checked === true);
          return (
            <div>
              <strong>{it.title}</strong>
              {over && <span className="badge b" style={{ marginLeft: 6 }}>Gecikmiş</span>}
              {it.description && <div className="m" style={{ color: 'var(--muted)', fontSize: '.88rem' }}>{it.description.slice(0, 90)}{it.description.length > 90 ? '…' : ''}</div>}
            </div>
          );
        },
      },
      { header: 'Rol', accessorKey: 'roleScope', cell: (c) => <RoleBadge r={c.row.original.roleScope} /> },
      { header: 'Zaman', accessorKey: 'timeScope', cell: (c) => LABELS.time[c.row.original.timeScope] },
      { header: 'Öncelik', accessorKey: 'priority', cell: (c) => <PriorityBadge p={c.row.original.priority} /> },
      { header: 'Sahip', accessorKey: 'owner' },
      { header: 'Son Tarih', accessorKey: 'dueDate', cell: (c) => formatTR(c.row.original.dueDate) },
      { header: 'Durum', accessorKey: 'status', cell: (c) => <StatusBadge s={c.row.original.status} /> },
      { header: 'Uyum', accessorKey: 'complianceLevel', cell: (c) => <ComplianceBadge c={c.row.original.complianceLevel} /> },
      ...(extraColumns ?? []),
      {
        id: 'actions',
        header: '',
        cell: (c) => (
          <button className="btn sm" onClick={(e) => { e.stopPropagation(); setEditing(c.row.original); }}>
            Düzenle
          </button>
        ),
      },
    ],
    [extraColumns],
  );

  return (
    <>
      <FilterBar filter={filter} onChange={setFilter} show={showFilters} categories={categories} />
      <DataTable data={rows} columns={columns} onRowClick={setEditing} emptyText="Kayıt yok." />
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
    </>
  );
}
