import { describe, it, expect } from 'vitest';
import { adminItemSchema, adminItemArraySchema } from '../schemas/schemas';
import { seedItems, seedDecisions } from '../data/seed';
import { RoleScope, TimeScope, ComplianceLevel, ItemKind } from '../domain/enums';
import { applyFilter, dashboardSummary, byKind } from '../services/selectors';
import { twoGrossMinWageCeiling, panelData } from '../data/panel';
import { LocalStorageRepository } from '../repositories/repository';
import { itemsStore, decisionsStore, convertQuestionToDecision } from '../services/store';

describe('Domain & veri kümeleri', () => {
  // 4) Konuşulacaklar / Sorulacaklar / Ortak Kararlar ayrı veri kümeleri
  it('4. patron veri kümeleri ayrı ve çakışmasız', () => {
    const items = seedItems();
    const disc = byKind(items, ItemKind.PATRON_DISCUSSION);
    const ques = byKind(items, ItemKind.PATRON_QUESTION);
    const decisions = seedDecisions();
    expect(disc.length).toBeGreaterThan(0);
    expect(ques.length).toBeGreaterThan(0);
    expect(decisions.length).toBeGreaterThan(0);
    const discIds = new Set(disc.map((d) => d.id));
    expect(ques.some((q) => discIds.has(q.id))).toBe(false);
  });

  // 5) MANAGER_ONLY patron onayı isteyemez
  it('5. MANAGER_ONLY + requiresPatron şema tarafından reddedilir', () => {
    const op = seedItems().find((i) => i.roleScope === RoleScope.MANAGER_ONLY)!;
    expect(() => adminItemSchema.parse({ ...op, requiresPatron: true })).toThrow();
    expect(() => adminItemSchema.parse({ ...op, requiresPatron: false })).not.toThrow();
  });

  // 6) Kayıt dışı ücret maddesi PROHIBITED
  it('6. kayıt dışı ücret maddesi PROHIBITED', () => {
    const prohibited = seedItems().filter((i) => i.complianceLevel === ComplianceLevel.PROHIBITED);
    expect(prohibited.length).toBeGreaterThan(0);
    expect(prohibited.some((p) => /elden|kayıt dışı|gayriresmî|eksik bildir/i.test(p.title + p.description))).toBe(true);
  });

  // 7) Tatil çalışması checklist'i gerekli uyum maddelerini içeriyor
  it('7. resmî tatil checklist uyum maddeleri', () => {
    const hol = seedItems().filter((i) => i.category === 'Resmî Tatil');
    const text = hol.map((h) => h.title).join(' ');
    expect(hol.length).toBeGreaterThanOrEqual(8);
    expect(/ilave.*ücret|ilave günlük ücret/i.test(text)).toBe(true);
    expect(/18 yaş|On sekiz/i.test(text)).toBe(true);
    expect(/önceden yazılı onay/i.test(text)).toBe(true);
  });

  // 8) Yönetici izin protokolü checklist'i mevcut
  it('8. yönetici izin protokolü checklist mevcut', () => {
    const ml = seedItems().filter((i) => i.category === 'Yönetici İzin');
    expect(ml.length).toBeGreaterThanOrEqual(8);
    expect(ml.some((m) => /vekâlet|birleştir|idari izin/i.test(m.title))).toBe(true);
  });

  // 9) Hoş geldin paketi checklist'i mevcut
  it('9. hoş geldin paketi checklist mevcut', () => {
    const ben = seedItems().filter((i) => i.category === 'Yan Haklar');
    expect(ben.some((b) => /hoş geldin/i.test(b.title))).toBe(true);
  });

  // 10) Marka kimliği 100.000–150.000 TL aralığı
  it('10. marka kimliği 100.000–150.000 TL gösterir', () => {
    const found = seedItems().some(
      (i) => /100\.000.?150\.000/.test((i.financialImpact ?? '') + i.description + i.title),
    );
    expect(found).toBe(true);
  });

  // 11) DevOps iki brüt asgari ücret tavanı
  it('11. DevOps tavanı = 2 × brüt asgari ücret (kanonik)', () => {
    expect(twoGrossMinWageCeiling()).toBe(panelData.params.grossMinWage2026 * 2);
    const devops = seedItems().filter((i) => i.category === 'DevOps');
    expect(devops.some((d) => /asgari ücret/i.test((d.financialImpact ?? '') + d.title))).toBe(true);
  });

  // 12) Timeline rol ve zaman filtresi
  it('12. filtre rol ve zaman dönemi uyguluyor', () => {
    const items = seedItems();
    const onlyManager = applyFilter(items, { role: RoleScope.MANAGER_ONLY });
    expect(onlyManager.length).toBeGreaterThan(0);
    expect(onlyManager.every((i) => i.roleScope === RoleScope.MANAGER_ONLY)).toBe(true);
    const only30 = applyFilter(items, { timeScope: TimeScope.DAY_0_30 });
    expect(only30.every((i) => i.timeScope === TimeScope.DAY_0_30)).toBe(true);
  });

  // 13) Checklist durumu refresh (reload) sonrası korunur
  it('13. checklist durumu localStorage ile kalıcı', () => {
    const q = byKind(itemsStore.all(), ItemKind.PATRON_QUESTION).find(
      (x) => x.complianceLevel !== ComplianceLevel.PROHIBITED,
    )!;
    itemsStore.update(q.id, { checked: true });
    const reloaded = new LocalStorageRepository('arsam.items.v1', adminItemArraySchema, () => []);
    expect(reloaded.get(q.id)?.checked).toBe(true);
  });

  // 14) Patron cevabı ortak karara dönüştürülebiliyor
  it('14. patron cevabı ortak karara dönüşür', () => {
    const before = decisionsStore.all().length;
    const q = byKind(itemsStore.all(), ItemKind.PATRON_QUESTION).find(
      (x) => x.complianceLevel !== ComplianceLevel.PROHIBITED,
    )!;
    const jd = convertQuestionToDecision(q.id);
    expect(jd).toBeDefined();
    expect(decisionsStore.all().length).toBe(before + 1);
    expect(itemsStore.get(q.id)?.answered).toBe(true);
  });

  // 15) Gecikmiş işler dashboard'a yansıyor
  it('15. gecikmiş işler dashboard özetine yansır', () => {
    const s = dashboardSummary(seedItems(), seedDecisions());
    expect(s.overdueManagerWork).toBeGreaterThan(0);
  });
});
