import { useMemo, useState } from 'react';
import * as echarts from 'echarts';
import { PageHeader } from '../../components/PageHeader';
import { FilterBar } from '../../components/FilterBar';
import { EChart } from '../../components/EChart';
import { useItems } from '../../services/store';
import { applyFilter, type ItemFilter } from '../../services/selectors';
import { RoleScope, TimeScope, LABELS } from '../../domain/enums';
import { roleColor } from '../../components/Badge';
import type { AdminItem } from '../../domain/types';

const START = Date.UTC(2026, 6, 1); // 2026-07-01
const DAY = 86400000;

function dayRange(it: AdminItem): [number, number] {
  switch (it.timeScope) {
    case TimeScope.PRE_MEETING:
      return [0, 3];
    case TimeScope.FIRST_MEETING:
      return [0, 4];
    case TimeScope.DAY_0_30:
      return [0, 30];
    case TimeScope.DAY_31_60:
      return [30, 60];
    case TimeScope.DAY_61_90:
      return [60, 90];
    case TimeScope.MONTHLY:
    case TimeScope.QUARTERLY:
      return [0, 95];
    case TimeScope.YEARLY:
    case TimeScope.ONGOING:
      return [0, 110];
    case TimeScope.FIXED_DATE: {
      if (it.dueDate) {
        const d = Math.round((Date.parse(it.dueDate) - START) / DAY);
        return [Math.max(d - 2, 0), d + 3];
      }
      return [0, 6];
    }
    default:
      return [0, 10];
  }
}

export function TimelinePage() {
  const items = useItems();
  const [filter, setFilter] = useState<ItemFilter>({ role: 'ALL', status: 'ALL' });

  const filtered = useMemo(
    () => applyFilter(items, filter).slice(0, 60),
    [items, filter],
  );

  const categories = useMemo(() => Array.from(new Set(items.map((i) => i.category))), [items]);

  const option = useMemo<echarts.EChartsOption>(() => {
    const rows = filtered.map((i) => i.title.slice(0, 42));
    const data = filtered.map((it, idx) => {
      const [s, e] = dayRange(it);
      return { value: [idx, s, e], itemStyle: { color: roleColor(it.roleScope) }, name: it.title };
    });
    return {
      grid: { left: 260, right: 24, top: 10, bottom: 60 },
      tooltip: {
        formatter: (p: any) =>
          `<b>${p.name}</b><br/>${LABELS.role[filtered[p.value[0]].roleScope]}<br/>Gün ${p.value[1]}–${p.value[2]}`,
      },
      xAxis: {
        type: 'value',
        min: 0,
        max: 110,
        interval: 10,
        name: 'Gün (0 = 1 Tem 2026)',
        nameLocation: 'middle',
        nameGap: 34,
        axisLabel: { color: '#33475b' },
        splitLine: { lineStyle: { color: '#eef2f6' } },
      },
      yAxis: {
        type: 'category',
        data: rows,
        inverse: true,
        axisLabel: { color: '#33475b', fontSize: 11, width: 240, overflow: 'truncate' },
      },
      dataZoom: [
        { type: 'inside', yAxisIndex: 0, filterMode: 'none' },
        { type: 'slider', yAxisIndex: 0, width: 14, right: 4, filterMode: 'none' },
        { type: 'slider', xAxisIndex: 0, height: 22, bottom: 18, handleSize: '160%' },
      ],
      series: [
        {
          type: 'custom',
          renderItem: (params: any, api: any) => {
            const cat = api.value(0);
            const start = api.coord([api.value(1), cat]);
            const end = api.coord([api.value(2), cat]);
            const h = Math.max(api.size([0, 1])[1] * 0.55, 10);
            const rect = echarts.graphic.clipRectByRect(
              { x: start[0], y: start[1] - h / 2, width: Math.max(end[0] - start[0], 4), height: h },
              { x: params.coordSys.x, y: params.coordSys.y, width: params.coordSys.width, height: params.coordSys.height },
            );
            return rect && { type: 'rect', shape: { ...rect, r: 3 }, style: api.style() };
          },
          encode: { x: [1, 2], y: 0 },
          data,
        },
      ],
    };
  }, [filtered]);

  const phase = (t: TimeScope) => items.filter((i) => i.timeScope === t);

  return (
    <div className="section-gap">
      <PageHeader
        title="Zaman Çizelgesi (Gantt)"
        desc="Y ekseni: iş ve sorumluluklar. X ekseni: zaman. Renkler role göre. Rol, kategori, durum, dönem, öncelik, patron onayı ve gecikme ile filtreleyin."
        source="Tüm yönetim kayıtları (timeScope → gün aralığı)"
      />
      <FilterBar
        filter={filter}
        onChange={setFilter}
        show={['role', 'category', 'status', 'time', 'priority', 'patron', 'overdue', 'text']}
        categories={categories}
      />
      <div className="card">
        <div className="legend" style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 8 }}>
          {Object.values(RoleScope).map((r) => (
            <span key={r} style={{ fontSize: '.9rem', color: 'var(--muted)' }}>
              <span className="dot" style={{ background: roleColor(r) }} />
              {LABELS.role[r]}
            </span>
          ))}
        </div>
        <EChart option={option} height={Math.max(filtered.length * 26 + 130, 320)} ariaLabel="Sorumluluk zaman çizelgesi Gantt grafiği" />
      </div>

      <div className="kpis">
        {[TimeScope.DAY_0_30, TimeScope.DAY_31_60, TimeScope.DAY_61_90].map((t) => (
          <div className="card" key={t}>
            <h2>{LABELS.time[t]}</h2>
            <ul style={{ margin: '6px 0 0 18px', padding: 0 }}>
              {phase(t).map((i) => (
                <li key={i.id} style={{ marginBottom: 4 }}>
                  {i.title}
                </li>
              ))}
              {phase(t).length === 0 && <li style={{ color: 'var(--muted)' }}>—</li>}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
