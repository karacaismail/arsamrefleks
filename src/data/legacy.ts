import { MappingType, type LegacyAction, type GateLegacyMapping } from '../domain/governance';

const g = (n: number) => `gate_g${n}`;

interface Raw {
  title: string;
  gates: number[];
  type: MappingType;
  notes?: string;
}

// Eski 00–34 Girişimci Aksiyon Planı → 13 kapı modeline eşleme.
// Sıra artık kanonik değil; her madde ilgili kapılara veya cross-cutting alana bağlanır.
const RAW: Raw[] = [
  { title: 'PESTEL Analizi', gates: [2], type: MappingType.MOVED_EARLIER },
  { title: 'Girişimci Niyeti', gates: [0, 1], type: MappingType.SPLIT },
  { title: 'Vizyon / Misyon / Değerler', gates: [1, 8], type: MappingType.SPLIT },
  { title: 'Problem Tanımı', gates: [3, 4], type: MappingType.SPLIT },
  { title: 'İş Fikri', gates: [4], type: MappingType.MOVED_LATER, notes: 'Öğrenme döngüleriyle (L1–L2) test edilir' },
  { title: 'Değer Önerisi', gates: [5], type: MappingType.UNCHANGED, notes: 'L2 ile öğrenilir' },
  { title: 'Pazar Analizi', gates: [2, 3, 4], type: MappingType.SPLIT },
  { title: 'Rakip Analizi', gates: [2, 3, 4], type: MappingType.SPLIT },
  { title: 'Müşteri Analizi', gates: [2, 3, 4], type: MappingType.SPLIT },
  { title: 'Ön Doğrulama', gates: [3], type: MappingType.MOVED_EARLIER, notes: 'L1 problem öğrenme' },
  { title: 'Strateji', gates: [9], type: MappingType.MOVED_LATER },
  { title: 'Risk Analizi', gates: [], type: MappingType.CROSS_CUTTING, notes: 'Tüm kapılarda kesişen risk yönetimi' },
  { title: 'Kaynak Planı', gates: [12], type: MappingType.MOVED_LATER },
  { title: 'Hedefler', gates: [12], type: MappingType.MOVED_LATER },
  { title: 'Yol Haritası (Roadmap)', gates: [12], type: MappingType.MOVED_LATER },
  { title: 'MVP', gates: [], type: MappingType.CROSS_CUTTING, notes: 'L1 + L2 + L3 deneyleri' },
  { title: 'Test', gates: [], type: MappingType.CROSS_CUTTING, notes: 'L1 + L2 + L3' },
  { title: 'Ölçüm ve Analiz', gates: [], type: MappingType.CROSS_CUTTING, notes: 'Öğrenme döngüleri' },
  { title: 'Öğrenme', gates: [], type: MappingType.CROSS_CUTTING, notes: 'Öğrenme döngüleri' },
  { title: 'İterasyon', gates: [], type: MappingType.CROSS_CUTTING, notes: 'Öğrenme döngüleri' },
  { title: 'Pivot', gates: [], type: MappingType.CROSS_CUTTING, notes: 'L1 + L2 + L3 karar noktası' },
  { title: 'Şirket Kurma', gates: [], type: MappingType.CROSS_CUTTING, notes: 'Sabit sıra değil; yükümlülük tetikleyicisi' },
  { title: 'Problem-Çözüm Uyumu (Fit)', gates: [], type: MappingType.CROSS_CUTTING, notes: 'L1 + L2 gate review' },
  { title: 'Ürün-Pazar Uyumu (Fit)', gates: [], type: MappingType.CROSS_CUTTING, notes: 'L2 + L3 gate review' },
  { title: 'Ödeme Altyapısı', gates: [10], type: MappingType.MOVED_LATER, notes: 'L3' },
  { title: 'Fiyatlandırma', gates: [10], type: MappingType.MOVED_LATER, notes: 'L3' },
  { title: 'Kanal Stratejisi', gates: [10], type: MappingType.MOVED_LATER, notes: 'L3' },
  { title: 'Satış', gates: [10], type: MappingType.MOVED_LATER },
  { title: 'Gelir Modeli', gates: [10], type: MappingType.MOVED_LATER },
  { title: 'Maliyet ve Birim Ekonomisi', gates: [10], type: MappingType.MOVED_LATER },
  { title: 'Ürün Geliştirme', gates: [], type: MappingType.CROSS_CUTTING, notes: 'L2 çözüm öğrenme' },
  { title: 'Büyüme (Growth)', gates: [12], type: MappingType.MOVED_LATER, notes: 'G12 sonrası deney portföyü' },
  { title: 'Ölçekleme (Scale)', gates: [10, 12], type: MappingType.MOVED_LATER },
  { title: 'Operating System', gates: [7, 10, 11], type: MappingType.MERGED },
  { title: 'Çıkış (Exit)', gates: [0], type: MappingType.CROSS_CUTTING, notes: 'G0 beklenti + sonraki stratejik karar' },
];

export const LEGACY_ACTIONS: LegacyAction[] = RAW.map((r, i) => ({
  id: `legacy_${String(i).padStart(2, '0')}`,
  legacyId: String(i).padStart(2, '0'),
  legacyOrder: i,
  title: r.title,
  description: '',
  tools: [],
  mappedGateIds: r.gates.map(g),
  mappingType: r.type,
  notes: r.notes ?? null,
}));

// Kapı → eski plan eşleşmeleri (gate detail "Eski Plan Eşlemesi" sekmesi için)
export const GATE_LEGACY_MAPPINGS: GateLegacyMapping[] = LEGACY_ACTIONS.flatMap((a) =>
  a.mappedGateIds.map((gid) => ({
    id: `glm_${a.legacyId}_${gid}`,
    gateId: gid,
    legacyId: a.legacyId,
    mappingType: a.mappingType,
    reason: a.notes ?? a.mappingType,
  })),
);

export function legacyForGate(gateId: string): LegacyAction[] {
  return LEGACY_ACTIONS.filter((a) => a.mappedGateIds.includes(gateId));
}
