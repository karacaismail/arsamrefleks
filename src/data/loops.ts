import type { LearningLoop } from '../domain/governance';

const steps = (arr: string[]) => arr.map((title, i) => ({ order: i, title }));

export const LOOPS: LearningLoop[] = [
  {
    id: 'loop_l1', code: 'L1', title: 'Problem Öğrenme Döngüsü',
    description: 'Problemin gerçekliğini saha kanıtıyla öğrenmek.',
    steps: steps(['Problem hipotezi', 'Saha araştırması', 'Kanıt', 'Segment/problem revizyonu']),
  },
  {
    id: 'loop_l2', code: 'L2', title: 'Çözüm Öğrenme Döngüsü',
    description: 'Değer önerisini prototip/MVP ve kullanım kanıtıyla öğrenmek.',
    steps: steps(['Değer önerisi', 'Prototip/MVP', 'Kullanım kanıtı', 'Çözüm revizyonu']),
  },
  {
    id: 'loop_l3', code: 'L3', title: 'İş Modeli Öğrenme Döngüsü',
    description: 'Fiyat/kanal/maliyet hipotezini ticari deneyle öğrenmek.',
    steps: steps(['Fiyat/kanal/maliyet hipotezi', 'Ticari deney', 'Ödeme ve ekonomi', 'İş modeli revizyonu']),
  },
  {
    id: 'loop_l4', code: 'L4', title: 'Strateji ve Yönetişim Öğrenme Döngüsü',
    description: 'Stratejik tercihleri performans/risk/paydaş sonucuyla öğrenmek.',
    steps: steps(['Stratejik tercih', 'Performans/risk/paydaş sonucu', 'Yönetim değerlendirmesi', 'Strateji/yönetişim değişikliği']),
  },
];

export function loopByCode(code: string): LearningLoop | undefined {
  return LOOPS.find((l) => l.code === code);
}
