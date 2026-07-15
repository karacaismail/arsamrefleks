import { useMemo, useState } from 'react';
import * as echarts from 'echarts';
import { PageHeader } from '../../components/PageHeader';
import { FilterBar } from '../../components/FilterBar';
import { EChart } from '../../components/EChart';
import { useItems } from '../../services/store';
import { applyFilter, type ItemFilter } from '../../services/selectors';
import { RoleScope, TimeScope, Priority, LABELS } from '../../domain/enums';
import { roleColor } from '../../components/Badge';
import { GATES } from '../../data/gates';

const START = Date.UTC(2026, 6, 1); // 2026-07-01 = gün 0
const DAY = 86400000;
const MON = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
const GATE_COLOR = '#0e2740';

function dayOf(iso: string): number {
  const s = iso.length === 10 ? `${iso}T00:00:00Z` : iso;
  return Math.round((Date.parse(s) - START) / DAY);
}
function dayLabel(d: number): string {
  const dt = new Date(START + d * DAY);
  return `${MON[dt.getUTCMonth()]} ${String(dt.getUTCFullYear()).slice(2)}`;
}

const DUR: Record<Priority, number> = { CRITICAL: 21, HIGH: 14, MEDIUM: 10, LOW: 7 };

/** Tarihsiz kayıtların yerleşeceği zaman bandı (gün) — timeScope’a göre. */
function bandOf(t: TimeScope): [number, number] {
  switch (t) {
    case TimeScope.PRE_MEETING:
    case TimeScope.FIRST_MEETING:
      return [0, 90];
    case TimeScope.DAY_0_30:
      return [0, 30];
    case TimeScope.DAY_31_60:
      return [30, 60];
    case TimeScope.DAY_61_90:
      return [60, 90];
    case TimeScope.MONTHLY:
    case TimeScope.QUARTERLY:
      return [0, 120];
    case TimeScope.YEARLY:
    case TimeScope.ONGOING:
      return [0, 200];
    default:
      return [0, 60];
  }
}

interface Bar {
  name: string;
  start: number;
  end: number;
  color: string;
  meta: string;
}

export function TimelinePage() {
  const items = useItems();
  const [filter, setFilter] = useState<ItemFilter>({ role: 'ALL', status: 'ALL' });

  const filtered = useMemo(() => applyFilter(items, filter).slice(0, 45), [items, filter]);
  const categories = useMemo(() => Array.from(new Set(items.map((i) => i.category))), [items]);

  const bars = useMemo<Bar[]>(() => {
    // Kapı yol haritası: gerçek startDate/targetDate ile yayılan çubuklar (staggered).
    const gateBars: Bar[] = GATES.map((g, n) => {
      const start = g.startDate ? dayOf(g.startDate) : n > 0 && GATES[n - 1].targetDate ? dayOf(GATES[n - 1].targetDate!) : 0;
      const end = g.targetDate ? dayOf(g.targetDate) : start + 21;
      return { name: `${g.code} · ${g.title}`, start, end: Math.max(end, start + 5), color: GATE_COLOR, meta: `Kapı · ${LABELS.role[g.ownerRole]}` };
    });
    // Tarihsiz kayıtları bandları içinde kademeli yay (pragmatik oto-yerleşim):
    // sıra → farklı pozisyon, öncelik → farklı uzunluk. Gerçek tarih girilince o kullanılır.
    const undated = filtered.filter((it) => !it.dueDate);
    const bandCount: Record<string, number> = {};
    undated.forEach((it) => {
      const k = bandOf(it.timeScope).join('-');
      bandCount[k] = (bandCount[k] ?? 0) + 1;
    });
    const bandSeen: Record<string, number> = {};
    const itemBars: Bar[] = filtered.map((it) => {
      const dur = DUR[it.priority] ?? 10;
      const color = roleColor(it.roleScope);
      const name = it.title.slice(0, 46);
      const meta = LABELS.role[it.roleScope];
      if (it.dueDate) {
        const e = dayOf(it.dueDate);
        return { name, start: Math.max(e - dur, 0), end: Math.max(e, 1), color, meta };
      }
      const [b0, b1] = bandOf(it.timeScope);
      const key = `${b0}-${b1}`;
      const n = bandCount[key] ?? 1;
      const k = (bandSeen[key] = (bandSeen[key] ?? -1) + 1);
      const usable = Math.max(b1 - b0 - dur, 1);
      const start = b0 + (n > 1 ? Math.round((k * usable) / (n - 1)) : 0);
      return { name, start, end: start + dur, color, meta };
    });
    return [...gateBars, ...itemBars];
  }, [filtered]);

  const maxDay = useMemo(() => Math.max(120, ...bars.map((b) => b.end)) + 10, [bars]);

  const option = useMemo<echarts.EChartsOption>(() => {
    const rows = bars.map((b) => b.name);
    const data = bars.map((b, idx) => ({
      value: [idx, b.start, b.end],
      name: b.name,
      meta: b.meta,
      itemStyle: { color: b.color },
    }));
    return {
      grid: { left: 270, right: 24, top: 10, bottom: 62 },
      tooltip: {
        formatter: (p: any) =>
          `<b>${p.name}</b><br/>${p.data.meta}<br/>${dayLabel(p.value[1])} → ${dayLabel(p.value[2])} (${p.value[2] - p.value[1]} gün)`,
      },
      xAxis: {
        type: 'value',
        min: 0,
        max: maxDay,
        interval: 30,
        axisLabel: { color: '#33475b', formatter: (v: number) => dayLabel(v) },
        splitLine: { lineStyle: { color: '#eef2f6' } },
      },
      yAxis: {
        type: 'category',
        data: rows,
        inverse: true,
        axisLabel: { color: '#33475b', fontSize: 11, width: 250, overflow: 'truncate' },
      },
      dataZoom: [
        { type: 'inside', yAxisIndex: 0, filterMode: 'none' },
        { type: 'slider', yAxisIndex: 0, width: 16, right: 4, filterMode: 'none' },
        { type: 'slider', xAxisIndex: 0, height: 26, bottom: 16, handleSize: '160%',
          handleStyle: { color: '#c8992f', borderColor: GATE_COLOR }, moveHandleSize: 14,
          labelFormatter: (v: number) => dayLabel(Math.round(v)) },
      ],
      series: [
        {
          type: 'custom',
          renderItem: (params: any, api: any) => {
            const cat = api.value(0);
            const s = api.coord([api.value(1), cat]);
            const e = api.coord([api.value(2), cat]);
            const h = Math.max(api.size([0, 1])[1] * 0.6, 9);
            const rect = echarts.graphic.clipRectByRect(
              { x: s[0], y: s[1] - h / 2, width: Math.max(e[0] - s[0], 3), height: h },
              { x: params.coordSys.x, y: params.coordSys.y, width: params.coordSys.width, height: params.coordSys.height },
            );
            return rect && { type: 'rect', shape: { ...rect, r: 3 }, style: api.style() };
          },
          encode: { x: [1, 2], y: 0 },
          data,
        },
      ],
    };
  }, [bars, maxDay]);

  const phase = (t: TimeScope) => items.filter((i) => i.timeScope === t);

  return (
    <div className="section-gap">
      <PageHeader
        title="Zaman Çizelgesi (Gantt)"
        desc="Üstte kapı yol haritası (G0–G12, gerçek planlanan tarihlerle yayılan çubuklar); altta iş kayıtları gerçek son tarih + süreye göre. Rol renkleri; rol/kategori/durum/dönem/öncelik/patron onayı/gecikme filtreleri."
        source="Kapılar (gerçek tarih) + yönetim kayıtları (dueDate / faz)"
      />
      <div className="infobox">
        Çubuklar artık <b>gerçek süre</b> gösterir: kapılar planlanan tarihlerle yayılır; iş kayıtları
        son tarih + öncelik süresine göre uzar. Tarihi olmayan <b>ilk-toplantı checklist</b> kayıtları
        başlangıçta kümelenir — düzenleyip son tarih verildikçe zamana yayılırlar.
      </div>
      <FilterBar
        filter={filter}
        onChange={setFilter}
        show={['role', 'category', 'status', 'time', 'priority', 'patron', 'overdue', 'text']}
        categories={categories}
      />
      <div className="card">
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 8 }}>
          <span style={{ fontSize: '.9rem', color: 'var(--muted)' }}>
            <span className="dot" style={{ background: GATE_COLOR }} /> Kapı (G0–G12)
          </span>
          {Object.values(RoleScope).map((r) => (
            <span key={r} style={{ fontSize: '.9rem', color: 'var(--muted)' }}>
              <span className="dot" style={{ background: roleColor(r) }} /> {LABELS.role[r]}
            </span>
          ))}
        </div>
        <EChart option={option} height={Math.max(bars.length * 24 + 140, 360)} ariaLabel="Kapı ve sorumluluk zaman çizelgesi Gantt grafiği" />
      </div>

      <div className="kpis">
        {[TimeScope.DAY_0_30, TimeScope.DAY_31_60, TimeScope.DAY_61_90].map((t) => (
          <div className="card" key={t}>
            <h2>{LABELS.time[t]}</h2>
            <ul style={{ margin: '6px 0 0 18px', padding: 0 }}>
              {phase(t).map((i) => (
                <li key={i.id} style={{ marginBottom: 4 }}>{i.title}</li>
              ))}
              {phase(t).length === 0 && <li style={{ color: 'var(--muted)' }}>—</li>}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
