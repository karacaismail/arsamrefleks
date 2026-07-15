import type { ItemFilter } from '../services/selectors';
import { LABELS, RoleScope, Status, TimeScope, Priority } from '../domain/enums';

type FilterKey = 'role' | 'status' | 'time' | 'priority' | 'patron' | 'overdue' | 'text' | 'category';

interface Props {
  filter: ItemFilter;
  onChange: (f: ItemFilter) => void;
  show?: FilterKey[];
  categories?: string[];
}

const DEFAULT: FilterKey[] = ['role', 'status', 'time', 'priority', 'overdue', 'text'];

export function FilterBar({ filter, onChange, show = DEFAULT, categories }: Props) {
  const set = (patch: Partial<ItemFilter>) => onChange({ ...filter, ...patch });
  const has = (k: FilterKey) => show.includes(k);

  return (
    <div className="filterbar" role="search" aria-label="Filtreler">
      {has('role') && (
        <label>
          Rol
          <select
            value={filter.role ?? 'ALL'}
            onChange={(e) => set({ role: e.target.value as RoleScope | 'ALL' })}
          >
            <option value="ALL">Tümü</option>
            {Object.values(RoleScope).map((r) => (
              <option key={r} value={r}>
                {LABELS.role[r]}
              </option>
            ))}
          </select>
        </label>
      )}
      {has('status') && (
        <label>
          Durum
          <select
            value={filter.status ?? 'ALL'}
            onChange={(e) => set({ status: e.target.value as Status | 'ALL' })}
          >
            <option value="ALL">Tümü</option>
            {Object.values(Status).map((s) => (
              <option key={s} value={s}>
                {LABELS.status[s]}
              </option>
            ))}
          </select>
        </label>
      )}
      {has('time') && (
        <label>
          Zaman Dönemi
          <select
            value={filter.timeScope ?? 'ALL'}
            onChange={(e) => set({ timeScope: e.target.value as TimeScope | 'ALL' })}
          >
            <option value="ALL">Tümü</option>
            {Object.values(TimeScope).map((t) => (
              <option key={t} value={t}>
                {LABELS.time[t]}
              </option>
            ))}
          </select>
        </label>
      )}
      {has('priority') && (
        <label>
          Öncelik
          <select
            value={filter.priority ?? 'ALL'}
            onChange={(e) => set({ priority: e.target.value as Priority | 'ALL' })}
          >
            <option value="ALL">Tümü</option>
            {Object.values(Priority).map((p) => (
              <option key={p} value={p}>
                {LABELS.priority[p]}
              </option>
            ))}
          </select>
        </label>
      )}
      {has('category') && categories && (
        <label>
          Kategori
          <select
            value={filter.category ?? 'ALL'}
            onChange={(e) => set({ category: e.target.value })}
          >
            <option value="ALL">Tümü</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
      )}
      {has('patron') && (
        <label className="chk">
          <input
            type="checkbox"
            checked={filter.requiresPatron === true}
            onChange={(e) => set({ requiresPatron: e.target.checked ? true : undefined })}
          />
          Patron Onayı
        </label>
      )}
      {has('overdue') && (
        <label className="chk">
          <input
            type="checkbox"
            checked={filter.overdueOnly === true}
            onChange={(e) => set({ overdueOnly: e.target.checked })}
          />
          Gecikmiş İşler
        </label>
      )}
      {has('text') && (
        <label>
          Ara
          <input
            type="search"
            placeholder="Başlık / açıklama…"
            value={filter.text ?? ''}
            onChange={(e) => set({ text: e.target.value })}
          />
        </label>
      )}
    </div>
  );
}
