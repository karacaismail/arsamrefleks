import { RoleScope } from '../domain/enums';
import {
  GateStatus,
  GateEvidenceStatus,
  CriterionStatus,
  type GovernanceGate,
  type GateQuestion,
  type GateDeliverable,
  type GateCriterion,
} from '../domain/governance';

const TS = '2026-07-01T00:00:00.000Z';

interface GateDef {
  code: string;
  title: string;
  purpose: string;
  owner: RoleScope;
  accountable: RoleScope;
  approver: RoleScope;
  target: string;
  questions: Array<{ q: string; reason: string; role: RoleScope }>;
  deliverables: string[];
  criteria: Array<{ t: string; required: boolean }>;
}

const M = RoleScope.EXECUTIVE_MANAGER;
const I = RoleScope.INVESTOR_OWNER;
const J = RoleScope.JOINT_DECISION;

const DEFS: GateDef[] = [
  {
    code: 'G0', title: 'Kurucu Uygunluğu', purpose: 'Taraflar, katkılar, beklentiler ve ayrılık senaryosu netleşmeden ilerlememek.',
    owner: I, accountable: J, approver: J, target: '2026-07-31',
    questions: [
      { q: 'Taraflar kim?', reason: 'Kurucu/ortak yapısı net olmalı', role: I },
      { q: 'Katkıları ne (sermaye, zaman, yetkinlik)?', reason: 'Katkı tablosu için', role: I },
      { q: 'Beklentileri uyumlu mu?', reason: 'Beklenti çatışmasını erken görmek', role: J },
      { q: 'Çalışma ilişkisi test edildi mi?', reason: 'Uyumun kanıtı', role: J },
      { q: 'Ayrılık senaryosu konuşuldu mu?', reason: 'Vesting/ayrılma ilkeleri', role: J },
    ],
    deliverables: ['Kurucu mutabakat notu', 'Katkı tablosu', 'Rol taslağı', 'Sermaye ve zaman taahhüdü', 'Ayrılma/uyuşmazlık ilkeleri'],
    criteria: [
      { t: 'Kurucu mutabakatı yazılı', required: true },
      { t: 'Rol ve katkı netleşti', required: true },
      { t: 'Ayrılık/vesting ilkeleri tanımlı', required: true },
    ],
  },
  {
    code: 'G1', title: 'Geçici Amaç, Değerler ve Kırmızı Çizgiler', purpose: 'Neden var olduğumuzun geçici ifadesi ve asla ihlal edilmeyecek sınırlar.',
    owner: M, accountable: J, approver: I, target: '2026-08-20',
    questions: [
      { q: 'Geçici amaç nedir?', reason: 'Yön için geçici çerçeve', role: J },
      { q: 'Hangi değerler pazarlıksız?', reason: 'Non-negotiable değerler', role: J },
      { q: 'Kırmızı çizgiler (asla yapılmayacaklar) neler?', reason: 'Uyum ve etik sınır', role: I },
      { q: 'Yasal/etik sınırlar tanımlı mı?', reason: 'Kayıt dışı ödeme vb. yasak', role: M },
    ],
    deliverables: ['Geçici amaç bildirimi', 'Değerler listesi', 'Kırmızı çizgiler tablosu'],
    criteria: [
      { t: 'Kırmızı çizgiler yazılı ve onaylı', required: true },
      { t: 'Değerler tanımlı', required: true },
    ],
  },
  {
    code: 'G2', title: 'Bağlam ve Sistem Haritası', purpose: 'Dış bağlam, paydaşlar ve sistem sınırlarını görünür kılmak.',
    owner: M, accountable: M, approver: J, target: '2026-09-15',
    questions: [
      { q: 'PESTEL / dış bağlam nedir?', reason: 'Makro etkenler', role: M },
      { q: 'Paydaşlar ve ilişkileri?', reason: 'Paydaş haritası', role: M },
      { q: 'Sistem sınırları ve bağımlılıklar?', reason: 'Bağımlılık riski', role: M },
      { q: 'Düzenleyici çerçeve?', reason: 'Yasal bağlam', role: M },
    ],
    deliverables: ['Bağlam analizi (PESTEL)', 'Paydaş haritası', 'Sistem haritası'],
    criteria: [
      { t: 'Sistem haritası çıkarıldı', required: true },
      { t: 'Kritik bağımlılıklar listelendi', required: true },
    ],
  },
  {
    code: 'G3', title: 'Problem Keşfi', purpose: 'Gerçek kullanıcı/segmentte gerçek problemi kanıtla keşfetmek.',
    owner: M, accountable: M, approver: J, target: '2026-10-15',
    questions: [
      { q: 'Kimin, hangi problemi?', reason: 'Segment + problem', role: M },
      { q: 'Problem ne sıklıkta / ne kadar acı?', reason: 'Önem/aciliyet', role: M },
      { q: 'Mevcut çözüm/alternatif ne?', reason: 'Rekabet/ikame', role: M },
      { q: 'Hedef segment kim?', reason: 'Segment netliği', role: M },
    ],
    deliverables: ['Problem keşif notları', 'Segment tanımı', 'Görüşme kayıtları'],
    criteria: [
      { t: 'Yeterli gerçek görüşme yapıldı (kanıt)', required: true },
      { t: 'Problem netleşti', required: true },
    ],
  },
  {
    code: 'G4', title: 'Problem ve Fırsat Tezi', purpose: 'Problemi ve fırsatı, riskli varsayımlarıyla birlikte tezleştirmek.',
    owner: M, accountable: M, approver: J, target: '2026-11-10',
    questions: [
      { q: 'Problem tezi nedir?', reason: 'Net tez', role: M },
      { q: 'Fırsatın büyüklüğü?', reason: 'TAM/SAM/SOM', role: M },
      { q: 'Neden şimdi?', reason: 'Zamanlama', role: M },
      { q: 'Riskli/öldürücü varsayımlar?', reason: 'Kill-risk listesi', role: M },
    ],
    deliverables: ['Problem/fırsat tezi', 'Riskli varsayım listesi'],
    criteria: [
      { t: 'Tez kanıtla desteklendi', required: true },
      { t: 'Öldürücü varsayımlar tanımlı', required: true },
    ],
  },
  {
    code: 'G5', title: 'Değer Üretme Modeli', purpose: 'Kime, hangi değeri, nasıl ürettiğimizi tanımlamak.',
    owner: M, accountable: M, approver: J, target: '2026-12-05',
    questions: [
      { q: 'Hangi değer, kime, nasıl üretilecek?', reason: 'Değer önerisi', role: M },
      { q: 'Değer önerisi net mi?', reason: 'Netlik', role: M },
      { q: 'Değer zinciri nasıl?', reason: 'Üretim modeli', role: M },
    ],
    deliverables: ['Değer önerisi tuvali', 'Değer üretim modeli'],
    criteria: [
      { t: 'Değer önerisi tanımlı', required: true },
      { t: 'Hedef segmentle eşleşti', required: true },
    ],
  },
  {
    code: 'G6', title: 'Ön Fizibilite ve Öldürücü Riskler', purpose: 'Teknik/ekonomik/yasal fizibilite ve işi bitirebilecek riskleri test etmek.',
    owner: M, accountable: M, approver: J, target: '2027-01-10',
    questions: [
      { q: 'Teknik/ekonomik/yasal fizibilite?', reason: 'Yapılabilirlik', role: M },
      { q: 'Öldürücü riskler neler?', reason: 'Kill-risk', role: M },
      { q: 'Kaynak yeterli mi?', reason: 'Kaynak/nakit', role: J },
      { q: 'Nakit / runway ne kadar?', reason: 'Sürdürülebilirlik', role: J },
    ],
    deliverables: ['Ön fizibilite raporu', 'Öldürücü risk listesi'],
    criteria: [
      { t: 'Öldürücü riskler değerlendirildi', required: true },
      { t: 'Fizibilite olumlu (kanıt)', required: true },
    ],
  },
  {
    code: 'G7', title: 'Yönetişim Mimarisi', purpose: 'Karar hakları, yetki sınırları ve raporlama ritmini kurmak.',
    owner: M, accountable: J, approver: I, target: '2027-02-10',
    questions: [
      { q: 'Karar hakları / yetki matrisi?', reason: 'RACI', role: J },
      { q: 'Patron–yönetici sınırı nerede?', reason: 'Yetki ayrımı', role: J },
      { q: 'Kurul / raporlama ritmi?', reason: 'Yönetişim ritmi', role: M },
      { q: 'İmza / harcama limitleri?', reason: 'Eşikler', role: I },
    ],
    deliverables: ['Yetki matrisi (RACI)', 'Karar hakları belgesi', 'Raporlama düzeni'],
    criteria: [
      { t: 'Yetki matrisi onaylı', required: true },
      { t: 'Eskalasyon kuralları yazılı', required: true },
    ],
  },
  {
    code: 'G8', title: 'Kimlik: Vizyon, Misyon ve Değerler', purpose: 'Kalıcı kimliği (V/M/D) ve marka çerçevesini tanımlamak.',
    owner: M, accountable: M, approver: I, target: '2027-03-05',
    questions: [
      { q: 'Vizyon nedir?', reason: 'Uzun vade yön', role: I },
      { q: 'Misyon nedir?', reason: 'Ne yapıyoruz', role: M },
      { q: 'Kalıcı değerler?', reason: 'Kültür temeli', role: J },
      { q: 'Marka kimliği kapsamı?', reason: 'Kurumsal kimlik tedariki', role: M },
    ],
    deliverables: ['Vizyon/Misyon/Değerler belgesi', 'Marka kimliği brief'],
    criteria: [
      { t: 'V/M/D onaylı', required: true },
      { t: 'Kırmızı çizgilerle tutarlı', required: true },
    ],
  },
  {
    code: 'G9', title: 'Stratejik Tercihler', purpose: 'Nerede oynayacağımızı ve nasıl kazanacağımızı seçmek.',
    owner: M, accountable: M, approver: I, target: '2027-04-05',
    questions: [
      { q: 'Nerede oynayacağız (pazar/segment)?', reason: 'Where to play', role: J },
      { q: 'Nasıl kazanacağız?', reason: 'How to win', role: J },
      { q: 'Neyi yapmayacağız?', reason: 'Kapsam dışı', role: M },
      { q: 'Rekabet avantajı nedir?', reason: 'Savunulabilirlik', role: M },
    ],
    deliverables: ['Stratejik tercihler belgesi', 'Where-to-play / How-to-win'],
    criteria: [
      { t: 'Tercihler kanıtla desteklendi', required: true },
      { t: 'Kapsam dışı net', required: true },
    ],
  },
  {
    code: 'G10', title: 'İş Modeli ve Operating Model', purpose: 'Gelir/fiyat/kanal/maliyet ve nasıl işleyeceğini tasarlamak.',
    owner: M, accountable: M, approver: J, target: '2027-05-10',
    questions: [
      { q: 'Gelir / fiyat / kanal / maliyet?', reason: 'İş modeli', role: M },
      { q: 'Birim ekonomisi nasıl?', reason: 'Ekonomi', role: M },
      { q: 'Operating model (nasıl işleyecek)?', reason: 'Operasyon', role: M },
      { q: 'Dış kaynak modeli (DevOps vb.)?', reason: 'Tedarik kararı', role: J },
    ],
    deliverables: ['İş modeli tuvali', 'Birim ekonomisi', 'Operating model'],
    criteria: [
      { t: 'Birim ekonomisi pozitif yol haritası (kanıt)', required: true },
      { t: 'Operating model tanımlı', required: true },
    ],
  },
  {
    code: 'G11', title: 'Kültür, İletişim ve İşbirliği Sistemi', purpose: 'Stratejiyi besleyen kültür, iletişim ve işbirliği düzenini kurmak.',
    owner: M, accountable: M, approver: J, target: '2027-06-05',
    questions: [
      { q: 'Kültür ilkeleri neler?', reason: 'Kültür temeli', role: M },
      { q: 'İletişim ritmi / kanalları?', reason: 'İletişim', role: M },
      { q: 'İşbirliği / karar süreçleri?', reason: 'Sinerji', role: M },
      { q: 'Çalışan hakları / uyum?', reason: 'Bordro/tatil/izin uyumu', role: M },
    ],
    deliverables: ['Kültür ilkeleri', 'İletişim planı', 'İşbirliği sistemi'],
    criteria: [
      { t: 'Kültür ilkeleri yayımlandı', required: true },
      { t: 'İletişim ritmi kuruldu', required: true },
    ],
  },
  {
    code: 'G12', title: 'Stratejik Plan, Bütçe ve Deney Portföyü', purpose: 'Planı, bütçeyi ve öğrenme/deney portföyünü ölçülebilir hale getirmek.',
    owner: M, accountable: M, approver: I, target: '2027-07-10',
    questions: [
      { q: '90 gün / yıllık plan nedir?', reason: 'Plan', role: M },
      { q: 'Bütçe ve kaynak?', reason: 'Bütçe onayı', role: I },
      { q: 'Deney portföyü / OKR?', reason: 'Öğrenme portföyü', role: M },
      { q: 'Başarı ölçütleri?', reason: 'Ölçülebilirlik', role: J },
    ],
    deliverables: ['Stratejik plan', 'Bütçe', 'Deney portföyü'],
    criteria: [
      { t: 'Bütçe onaylı', required: true },
      { t: 'Ölçülebilir hedefler tanımlı', required: true },
    ],
  },
];

const gates: GovernanceGate[] = [];
const questions: GateQuestion[] = [];
const deliverables: GateDeliverable[] = [];
const criteria: GateCriterion[] = [];

DEFS.forEach((def, n) => {
  const id = `gate_g${n}`;
  const qIds: string[] = [];
  const dIds: string[] = [];
  const cIds: string[] = [];

  def.questions.forEach((q, i) => {
    const qid = `q_g${n}_${i}`;
    qIds.push(qid);
    questions.push({
      id: qid, gateId: id, question: q.q, reason: q.reason, answer: null, answerOwner: null,
      evidenceId: null, status: 'NOT_STARTED', dueDate: null, notes: null, role: q.role,
    });
  });
  def.deliverables.forEach((t, i) => {
    const did = `d_g${n}_${i}`;
    dIds.push(did);
    deliverables.push({
      id: did, gateId: id, title: t, description: '', owner: 'Yönetici', status: 'NOT_STARTED',
      version: 'v0', canonicalRef: null, evidenceId: null, approverRole: def.approver, approvedDate: null, reviewDate: null,
    });
  });
  def.criteria.forEach((c, i) => {
    const cid = `c_g${n}_${i}`;
    cIds.push(cid);
    criteria.push({
      id: cid, gateId: id, title: c.t, required: c.required, status: CriterionStatus.OPEN, evidenceId: null, notes: null,
    });
  });

  gates.push({
    id, code: def.code, slug: def.code.toLowerCase(), order: n, title: def.title, purpose: def.purpose, description: '',
    status: n === 0 ? GateStatus.IN_PROGRESS : GateStatus.NOT_STARTED,
    progress: n === 0 ? 40 : 0,
    evidenceStatus: n === 0 ? GateEvidenceStatus.PARTIAL : GateEvidenceStatus.NONE,
    ownerRole: def.owner, accountableRole: def.accountable, approverRole: def.approver,
    startDate: n === 0 ? '2026-07-01' : null,
    targetDate: def.target, completedDate: null, reviewDate: null,
    prerequisiteGateIds: n === 0 ? [] : [`gate_g${n - 1}`],
    nextGateIds: n === 12 ? [] : [`gate_g${n + 1}`],
    blockingRiskIds: [], questionIds: qIds, deliverableIds: dIds, criterionIds: cIds,
    evidenceIds: [], decisionIds: [], legacyActionIds: [],
    createdAt: TS, updatedAt: TS,
  });
});

export const GATES: GovernanceGate[] = gates;
export const GATE_QUESTIONS: GateQuestion[] = questions;
export const GATE_DELIVERABLES: GateDeliverable[] = deliverables;
export const GATE_CRITERIA: GateCriterion[] = criteria;

export function gateByCode(code: string): GovernanceGate | undefined {
  return GATES.find((g) => g.code === code);
}
export function gateIdByCode(code: string): string | undefined {
  return gateByCode(code)?.id;
}
