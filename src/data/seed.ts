import type { AdminItem, JointDecision } from '../domain/types';
import {
  RoleScope,
  TimeScope,
  Status,
  Priority,
  ComplianceLevel,
  SourceType,
  ItemKind,
} from '../domain/enums';
import { nowISO, moneyTR } from '../domain/util';
import { twoGrossMinWageCeiling } from './panel';

type ItemSeed = Partial<AdminItem> &
  Pick<AdminItem, 'id' | 'title' | 'kind' | 'category' | 'roleScope' | 'timeScope'>;

function item(p: ItemSeed): AdminItem {
  const ts = nowISO();
  return {
    id: p.id,
    kind: p.kind,
    title: p.title,
    description: p.description ?? '',
    category: p.category,
    roleScope: p.roleScope,
    timeScope: p.timeScope,
    owner: p.owner ?? 'Yönetici',
    accountableRole: p.accountableRole ?? p.roleScope,
    status: p.status ?? Status.NOT_STARTED,
    priority: p.priority ?? Priority.MEDIUM,
    dueDate: p.dueDate ?? null,
    requiresPatron: p.requiresPatron ?? false,
    requiresExternalExpert: p.requiresExternalExpert ?? false,
    complianceLevel: p.complianceLevel ?? ComplianceLevel.NORMAL,
    legalReference: p.legalReference ?? null,
    sourceType: p.sourceType ?? SourceType.STRATEGY_CONTENT,
    sourceRef: p.sourceRef ?? null,
    decision: p.decision ?? null,
    answer: p.answer ?? null,
    notes: p.notes ?? null,
    evidence: p.evidence ?? null,
    createdAt: ts,
    updatedAt: ts,
    checked: p.checked ?? false,
    asked: p.asked ?? false,
    answered: p.answered ?? false,
    reason: p.reason ?? null,
    risk: p.risk ?? null,
    expectedAnswerType: p.expectedAnswerType ?? null,
    financialImpact: p.financialImpact ?? null,
    recommendation: p.recommendation ?? null,
    patronAction: p.patronAction ?? null,
    meetingDate: p.meetingDate ?? null,
  };
}

const q = (
  id: string,
  category: string,
  title: string,
  extra: Partial<AdminItem> = {},
): AdminItem =>
  item({
    id,
    kind: ItemKind.PATRON_QUESTION,
    category,
    title,
    roleScope: RoleScope.INVESTOR_OWNER,
    accountableRole: RoleScope.INVESTOR_OWNER,
    timeScope: TimeScope.FIRST_MEETING,
    requiresPatron: true,
    priority: Priority.HIGH,
    expectedAnswerType: 'Evet / Hayır + gerekçe',
    ...extra,
  });

// ---------- /patron/konusulacaklar ----------
const discussions: AdminItem[] = [
  item({
    id: 'disc_brand_1',
    kind: ItemKind.PATRON_DISCUSSION,
    category: 'Kurumsal Kimlik',
    title: 'Kurumsal kimlik ve marka kimliği tasarımı dışarıdan yaptırılacak',
    description:
      'Brand dossier, marka kılavuzu ve temel kurumsal materyaller kapsamda olacak. Planlama varsayımı 100.000–150.000 TL aralığıdır; bu rakam kesin teklif değildir, teklif alınarak doğrulanacaktır.',
    roleScope: RoleScope.INVESTOR_OWNER,
    timeScope: TimeScope.FIRST_MEETING,
    requiresPatron: true,
    priority: Priority.HIGH,
    reason: 'Marka kimliği uzmanlık işi; içeride kapasite yok.',
    financialImpact: 'Planlama aralığı: 100.000–150.000 TL (teklifle doğrulanacak)',
    recommendation: 'En az 3 ajanstan teklif al, IP devri şartıyla sözleşme yap.',
    patronAction: 'Bütçe tavanı ve onayı',
    sourceType: SourceType.STRATEGY_CONTENT,
  }),
  item({
    id: 'disc_devops_1',
    kind: ItemKind.PATRON_DISCUSSION,
    category: 'DevOps',
    title: 'Ayrı DevOps ekibi kurulmayacak; operasyon dışarıdan alınacak',
    description:
      'Sunucu yönetimi, CI/CD, log yönetimi ve operasyon desteği dışarıdan alınacak. ELK/Logstash/OpenSearch yalnız gerçek ihtiyaç doğrulanırsa kapsamlanacak. Kesin kapsam, SLA, güvenlik sorumluluğu, erişim yönetimi ve teklif patrona bildirilecek.',
    roleScope: RoleScope.INVESTOR_OWNER,
    timeScope: TimeScope.FIRST_MEETING,
    requiresPatron: true,
    priority: Priority.HIGH,
    reason: 'Erken aşamada tam zamanlı DevOps ekibi maliyeti gereksiz.',
    financialImpact: `Aylık hedef maliyet ≈ iki brüt asgari ücret tavanı (${moneyTR(twoGrossMinWageCeiling())})`,
    recommendation: 'Managed servis + dış operasyon; ELK ancak ihtiyaç doğrulanırsa.',
    patronAction: 'Model ve bütçe onayı',
    sourceType: SourceType.STRATEGY_CONTENT,
  }),
];

// ---------- /patron/sorulacaklar — Ücret, bordro, SGK ----------
const payroll: AdminItem[] = [
  q('q_pay_1', 'Ücret & Bordro', 'Tüm çalışanların gerçek brüt ücretleri iş sözleşmesinde eksiksiz yer alacak mı?', {
    complianceLevel: ComplianceLevel.REVIEW_REQUIRED,
    requiresExternalExpert: true,
    risk: 'Eksik sözleşme = iş hukuku ve SGK riski',
  }),
  q('q_pay_2', 'Ücret & Bordro', 'Tüm ücret ve ücrete bağlı ödemeler bordroda doğru gösterilecek mi?', {
    complianceLevel: ComplianceLevel.REVIEW_REQUIRED,
    requiresExternalExpert: true,
  }),
  q('q_pay_3', 'Ücret & Bordro', 'SGK prime esas kazanç bildirimleri fiilen ödenen gerçek kazanç üzerinden mi yapılacak?', {
    complianceLevel: ComplianceLevel.LEGAL_EXPERT_REQUIRED,
    requiresExternalExpert: true,
    legalReference: '5510 sayılı Kanun (prime esas kazanç)',
  }),
  q('q_pay_prohibited', 'Ücret & Bordro',
    'Gerçek ücretin bir kısmını SGK’ya eksik bildirip kalan kısmını elden, kişisel hesaptan veya gayriresmî kanaldan ödeme.',
    {
      description:
        'Bu bir optimizasyon yöntemi DEĞİLDİR. Kayıt dışı ödeme; iş hukuku, SGK ve vergi mevzuatına aykırı bir uyum ihlalidir ve kesinlikle yasaklanır.',
      complianceLevel: ComplianceLevel.PROHIBITED,
      priority: Priority.CRITICAL,
      requiresExternalExpert: true,
      legalReference: '5510 sayılı Kanun; VUK; İş Kanunu',
      expectedAnswerType: 'YASAK — uygulanmayacak',
      risk: 'İdari para cezası, gecikme zammı, cezai sorumluluk',
    }),
  q('q_pay_4', 'Ücret & Bordro',
    'Ücretin bir kısmını asgari ücret gösterip kalanını elden/kayıt dışı ödeme kesin olarak yasaklanacak mı?', {
    complianceLevel: ComplianceLevel.NON_NEGOTIABLE,
    priority: Priority.CRITICAL,
  }),
  q('q_pay_5', 'Ücret & Bordro', 'Tüm ücret ödemeleri resmî ve izlenebilir ödeme kanallarından mı yapılacak?'),
  q('q_pay_6', 'Ücret & Bordro', 'Bordro, banka ödemesi, sözleşme ve SGK bildirimi aylık mutabık tutulacak mı?', {
    complianceLevel: ComplianceLevel.REVIEW_REQUIRED,
  }),
  q('q_pay_7', 'Ücret & Bordro', 'Bordro süreci mali müşavir/bordro uzmanı tarafından kontrol edilecek mi?', {
    requiresExternalExpert: true,
  }),
  q('q_pay_8', 'Ücret & Bordro', 'Prim, ikramiye, bonus ve yan hakların bordro/SGK uygulaması yazılılaştırılacak mı?'),
  q('q_pay_9', 'Ücret & Bordro',
    'Kayıt dışı ödeme talimatı gelirse yöneticinin uygulamayı durdurma ve yazılı eskalasyon yetkisi olacak mı?', {
    complianceLevel: ComplianceLevel.NON_NEGOTIABLE,
  }),
  q('q_pay_10', 'Ücret & Bordro', 'Bu politika istisnasız ve yazılı bir şirket ilkesi olacak mı?', {
    complianceLevel: ComplianceLevel.NON_NEGOTIABLE,
  }),
];

// ---------- Resmî tatil ----------
const holiday: AdminItem[] = [
  q('q_hol_1', 'Resmî Tatil', 'Ulusal bayram ve genel tatil günlerinde esas politika “çalışmama” olacak mı?', {
    legalReference: '2429 sayılı Kanun; 4857 sayılı İş Kanunu m.47',
  }),
  q('q_hol_2', 'Resmî Tatil', 'Tatil çalışması yalnız kanuni ve gerçekten zorunlu operasyonlarda mı uygulanacak?'),
  q('q_hol_3', 'Resmî Tatil', 'Sözleşmede hüküm yoksa çalışanın önceden yazılı onayı alınacak mı?', {
    complianceLevel: ComplianceLevel.REVIEW_REQUIRED,
    legalReference: '4857 m.47',
  }),
  q('q_hol_4', 'Resmî Tatil', 'Tatil günü çalışana mevzuata uygun ilave günlük ücret ödenecek mi?', {
    complianceLevel: ComplianceLevel.LEGAL_EXPERT_REQUIRED,
    requiresExternalExpert: true,
  }),
  q('q_hol_5', 'Resmî Tatil', 'Tatil çalışması karşılığı yalnız izin verip ilave ücreti ortadan kaldırma yasaklanacak mı?', {
    complianceLevel: ComplianceLevel.NON_NEGOTIABLE,
  }),
  q('q_hol_6', 'Resmî Tatil', 'Tatil çalışma planı önceden İK ve yönetici onayına bağlanacak mı?'),
  q('q_hol_7', 'Resmî Tatil', 'Tatil günü çalışma kayıtları, puantaj ve bordro aylık mutabık tutulacak mı?'),
  q('q_hol_8', 'Resmî Tatil', '18 yaşından küçük çalışanların genel tatil çalışması engellenecek mi?', {
    complianceLevel: ComplianceLevel.NON_NEGOTIABLE,
    legalReference: '4857; Çocuk ve Genç İşçi Yönetmeliği',
  }),
  q('q_hol_9', 'Resmî Tatil', 'Tatil dönemlerinde yalnız nöbetçi/zorunlu ekip modeli mi kullanılacak?'),
  q('q_hol_10', 'Resmî Tatil', 'Tatil çalışma ihlallerini çalışanların güvenle bildirebileceği kanal olacak mı?'),
];

// ---------- Üst yönetici izin ve tatil birleştirme ----------
const managerLeave: AdminItem[] = [
  q('q_ml_1', 'Yönetici İzin', 'Üst yönetici için yıllık izin dışında ilave yönetici izin günleri olacak mı?', {
    description: 'Yazılı yönetici çalışma ve izin protokolü olarak ele alınır; “sınırsız ayrıcalık” değildir.',
  }),
  q('q_ml_2', 'Yönetici İzin', 'Bayram/resmî tatili hafta ile birleştirme yetkim olacak mı?'),
  q('q_ml_3', 'Yönetici İzin', '15 Temmuz sonrası perşembe–cuma günlerini izin/uzaktan çalışma kullanabilir miyim?'),
  q('q_ml_4', 'Yönetici İzin', 'Bu günler yıllık izinden mi düşecek, idari izin mi, ücretli yönetici izni mi?', {
    expectedAnswerType: 'Kategori seçimi',
  }),
  q('q_ml_5', 'Yönetici İzin', 'Önceden kaç gün bildirim yapmam gerekiyor?', { expectedAnswerType: 'Gün sayısı' }),
  q('q_ml_6', 'Yönetici İzin', 'Ben yokken vekâlet edecek kişi kim olacak?', { expectedAnswerType: 'İsim' }),
  q('q_ml_7', 'Yönetici İzin', 'Hangi kritik toplantı ve dönemlerde bu hak kullanılamayacak?'),
  q('q_ml_8', 'Yönetici İzin', 'Acil durumlarda erişilebilirlik yükümlülüğüm ne olacak?'),
  q('q_ml_9', 'Yönetici İzin', 'Bu düzenleme iş sözleşmemde/ek yönetici protokolünde yazılı olacak mı?', {
    complianceLevel: ComplianceLevel.REVIEW_REQUIRED,
  }),
  q('q_ml_10', 'Yönetici İzin', 'Çalışanlarda adaletsizlik algısı oluşmaması için hangi yönetişim kuralları uygulanacak?'),
];

// ---------- Çalışan yan hakları / hoş geldin paketi ----------
const benefits: AdminItem[] = [
  q('q_ben_1', 'Yan Haklar', 'Her yeni çalışana hoş geldin paketi verilecek mi?'),
  q('q_ben_2', 'Yan Haklar', 'Paket bütçesi kişi başı ne kadar olacak?', {
    expectedAnswerType: 'Tutar',
    financialImpact: 'Model varsayımı: kişi başı hoş geldin birim maliyeti (kanonik: officeCosts.hosgeldin)',
  }),
  q('q_ben_3', 'Yan Haklar', 'Paket herkese standart mı, role göre farklı mı olacak?'),
  q('q_ben_4', 'Yan Haklar', 'İçeriğinde bilgisayar/ekipman dışında hangi hediyeler bulunacak?'),
  q('q_ben_5', 'Yan Haklar', 'Uzaktan çalışanlara paket nasıl ulaştırılacak?'),
  q('q_ben_6', 'Yan Haklar', 'Paket maliyeti hangi bütçe kalemine yazılacak?'),
  q('q_ben_7', 'Yan Haklar', 'Vergisel ve bordrosal etkisi mali müşavir tarafından kontrol edilecek mi?', {
    requiresExternalExpert: true,
    complianceLevel: ComplianceLevel.REVIEW_REQUIRED,
  }),
];

// ---------- Kurumsal kimlik ----------
const brand: AdminItem[] = [
  q('q_brand_1', 'Kurumsal Kimlik', 'Marka kimliği çalışmasının dışarıdan alınmasını onaylıyor musunuz?'),
  q('q_brand_2', 'Kurumsal Kimlik', '100.000–150.000 TL planlama aralığını kabul ediyor musunuz?', {
    financialImpact: '100.000–150.000 TL (planlama varsayımı, kesin teklif değil)',
    priority: Priority.HIGH,
  }),
  q('q_brand_3', 'Kurumsal Kimlik', 'Nihai bütçe tavanı nedir?', { expectedAnswerType: 'Tutar' }),
  q('q_brand_4', 'Kurumsal Kimlik', 'En az kaç teklif alınmalı?', { expectedAnswerType: 'Sayı' }),
  q('q_brand_5', 'Kurumsal Kimlik', 'Brand dossier kapsamında hangi teslimler zorunlu?'),
  q('q_brand_6', 'Kurumsal Kimlik', 'Logo, tipografi, renk, sosyal medya, sunum ve ürün arayüz kılavuzu kapsamda mı?'),
  q('q_brand_7', 'Kurumsal Kimlik', 'Kaynak dosyalar ve fikrî mülkiyet hakları şirkete devredilecek mi?', {
    complianceLevel: ComplianceLevel.REVIEW_REQUIRED,
    risk: 'IP devri yoksa marka şirkete ait olmaz',
  }),
  q('q_brand_8', 'Kurumsal Kimlik', 'Nihai onay sahibi kim?', { expectedAnswerType: 'İsim/rol' }),
  q('q_brand_9', 'Kurumsal Kimlik', 'Teslim tarihi nedir?', { expectedAnswerType: 'Tarih' }),
];

// ---------- DevOps dış kaynak ----------
const devops: AdminItem[] = [
  q('q_dev_1', 'DevOps', 'Ayrı bir DevOps ekibi kurulmamasını onaylıyor musunuz?'),
  q('q_dev_2', 'DevOps', 'Sunucu ve CI/CD operasyonunu dış kaynaktan almamızı onaylıyor musunuz?'),
  q('q_dev_3', 'DevOps', `Aylık bütçe tavanı ≈ iki brüt asgari ücret (${moneyTR(twoGrossMinWageCeiling())}) kabul ediliyor mu?`, {
    financialImpact: `Aylık tavan ≈ ${moneyTR(twoGrossMinWageCeiling())} (2× brüt asgari ücret, PARAMETRELER’den)`,
    priority: Priority.HIGH,
  }),
  q('q_dev_4', 'DevOps', 'Sağlayıcının erişim yetkileri nasıl sınırlandırılacak?', {
    complianceLevel: ComplianceLevel.REVIEW_REQUIRED,
  }),
  q('q_dev_5', 'DevOps', 'SLA, olay müdahale ve çalışma saatleri ne olacak?', { expectedAnswerType: 'SLA' }),
  q('q_dev_6', 'DevOps', 'Yedekleme ve geri dönüş sorumlusu kim olacak?'),
  q('q_dev_7', 'DevOps', 'Log ve kişisel veriler nerede tutulacak?', {
    complianceLevel: ComplianceLevel.LEGAL_EXPERT_REQUIRED,
    requiresExternalExpert: true,
    legalReference: '6698 KVKK',
  }),
  q('q_dev_8', 'DevOps', 'Erişim kapatma ve sağlayıcı değiştirme planı olacak mı?'),
  q('q_dev_9', 'DevOps', 'ELK/Logstash/OpenSearch gerçekten gerekli mi, daha düşük maliyetli çözüm yeterli mi?'),
  q('q_dev_10', 'DevOps', 'Güvenlik ihlali ve servis kesintisinde sorumluluk sınırı ne olacak?', {
    complianceLevel: ComplianceLevel.REVIEW_REQUIRED,
  }),
];

// ---------- /yonetici-operasyonlari ----------
const operations: AdminItem[] = [
  'Günlük iş dağılımı',
  'Sprint ve proje takibi',
  'Stand-up ve ekip toplantıları',
  'Onaylanmış bütçe içindeki küçük satın almalar',
  'Aday görüşme organizasyonu',
  'Oryantasyon',
  'İzin takvimi operasyonu',
  'Ekipman teslimi',
  'Hesap açma ve kapatma',
  'Dokümantasyon',
  'Performans görüşmeleri',
  'Tedarikçi günlük takibi',
  'İç rapor hazırlığı',
  'Risk ve sorunların ilk müdahalesi',
].map((t, i) =>
  item({
    id: `op_${i + 1}`,
    kind: ItemKind.MANAGER_OPERATION,
    category: 'Operasyon',
    title: t,
    roleScope: RoleScope.MANAGER_ONLY,
    accountableRole: RoleScope.EXECUTIVE_MANAGER,
    timeScope: TimeScope.ONGOING,
    requiresPatron: false,
    status: Status.IN_PROGRESS,
  }),
);

// ---------- /sorumluluk-matrisi ----------
const responsibilities: AdminItem[] = [
  ['Sermaye & hisse yapısı', RoleScope.INVESTOR_OWNER, TimeScope.FIXED_DATE],
  ['Yıllık bütçe tavanı onayı', RoleScope.JOINT_DECISION, TimeScope.YEARLY],
  ['Org şeması & görev tanımları', RoleScope.EXECUTIVE_MANAGER, TimeScope.DAY_0_30],
  ['İşe alım (C-level altı)', RoleScope.MANAGER_ONLY, TimeScope.ONGOING],
  ['İşten çıkarma (kıdemli)', RoleScope.JOINT_DECISION, TimeScope.ONGOING],
  ['İK politikaları (hukuk kontrolü)', RoleScope.EXTERNAL_EXPERT, TimeScope.DAY_31_60],
  ['Ofis kurulumu', RoleScope.EXECUTIVE_MANAGER, TimeScope.DAY_31_60],
  ['Kriz yönetimi (ihlal/dava/basın)', RoleScope.JOINT_DECISION, TimeScope.ONGOING],
  ['Teknoloji & mimari', RoleScope.MANAGER_ONLY, TimeScope.ONGOING],
  ['Bordro & SGK uyumu', RoleScope.EXTERNAL_EXPERT, TimeScope.MONTHLY],
].map(([t, role, time], i) =>
  item({
    id: `resp_${i + 1}`,
    kind: ItemKind.RESPONSIBILITY,
    category: 'Sorumluluk',
    title: t as string,
    roleScope: role as RoleScope,
    accountableRole: role as RoleScope,
    timeScope: time as TimeScope,
    requiresPatron: role === RoleScope.INVESTOR_OWNER || role === RoleScope.JOINT_DECISION,
  }),
);

// ---------- /ik-calisma-duzeni ----------
const ikOrders: AdminItem[] = [
  ['Resmî tatil takvimi (yıl bazlı, güncellenebilir)', ComplianceLevel.REVIEW_REQUIRED],
  ['Şirketin çalışma/çalışmama kararı', ComplianceLevel.NORMAL],
  ['Tatil nöbet planı', ComplianceLevel.NORMAL],
  ['İlave ücret kontrolü', ComplianceLevel.LEGAL_EXPERT_REQUIRED],
  ['Yıllık izin planı', ComplianceLevel.NORMAL],
  ['Yönetici izin protokolü', ComplianceLevel.REVIEW_REQUIRED],
  ['Uzaktan çalışma politikası', ComplianceLevel.NORMAL],
  ['Vekâlet düzeni', ComplianceLevel.NORMAL],
  ['Hoş geldin paketi', ComplianceLevel.NORMAL],
  ['Fazla mesai politikası', ComplianceLevel.LEGAL_EXPERT_REQUIRED],
].map(([t, c], i) =>
  item({
    id: `ik_${i + 1}`,
    kind: ItemKind.IK_WORK_ORDER,
    category: 'İK / Çalışma Düzeni',
    title: t as string,
    roleScope: RoleScope.EXECUTIVE_MANAGER,
    accountableRole: RoleScope.EXECUTIVE_MANAGER,
    timeScope: TimeScope.DAY_31_60,
    complianceLevel: c as ComplianceLevel,
    requiresExternalExpert: c === ComplianceLevel.LEGAL_EXPERT_REQUIRED,
  }),
);

// ---------- /tedarik-dis-kaynak ----------
const procurement: AdminItem[] = [
  item({
    id: 'proc_brand',
    kind: ItemKind.PROCUREMENT,
    category: 'Tedarik / Dış Kaynak',
    title: 'A. Kurumsal Kimlik / Brand Dossier',
    description:
      'Kapsam: logo, tipografi, renk sistemi, sosyal medya, sunum ve ürün arayüz kılavuzu, brand dossier. Kapsam dışı: kampanya prodüksiyonu. IP şirkete devredilir.',
    roleScope: RoleScope.JOINT_DECISION,
    accountableRole: RoleScope.EXECUTIVE_MANAGER,
    timeScope: TimeScope.FIRST_MEETING,
    requiresPatron: true,
    financialImpact: '100.000–150.000 TL (alt/üst planlama)',
    recommendation: 'En az 3 teklif; IP devir + kaynak dosya şartı.',
    priority: Priority.HIGH,
  }),
  item({
    id: 'proc_devops',
    kind: ItemKind.PROCUREMENT,
    category: 'Tedarik / Dış Kaynak',
    title: 'B. DevOps ve Sunucu Operasyon Desteği',
    description:
      'Kapsam: sunucu yönetimi, CI/CD, izleme, log, olay müdahale. Kapsam dışı: ürün geliştirme. ELK yalnız ihtiyaç doğrulanırsa.',
    roleScope: RoleScope.JOINT_DECISION,
    accountableRole: RoleScope.EXECUTIVE_MANAGER,
    timeScope: TimeScope.FIRST_MEETING,
    requiresPatron: true,
    financialImpact: `Aylık tavan ≈ ${moneyTR(twoGrossMinWageCeiling())} (2× brüt asgari ücret)`,
    recommendation: 'Managed servis; SLA, erişim sınırı, KVKK veri yeri şartı.',
    priority: Priority.HIGH,
    complianceLevel: ComplianceLevel.REVIEW_REQUIRED,
  }),
];

// ---------- /risks ----------
const risks: AdminItem[] = [
  ['Yetkisiz sorumluluk (yetki yazılı değil)', Priority.CRITICAL, RoleScope.JOINT_DECISION],
  ['Nakit tükenmesi / runway kısalması', Priority.HIGH, RoleScope.EXECUTIVE_MANAGER],
  ['Kanuni temsilci mali sorumluluğu', Priority.CRITICAL, RoleScope.JOINT_DECISION],
  ['Kayıt dışı ücret baskısı', Priority.CRITICAL, RoleScope.EXTERNAL_EXPERT],
  ['KVKK / VERBİS uyumsuzluğu', Priority.HIGH, RoleScope.EXTERNAL_EXPERT],
  ['IP / hesap sahipliği şahsi hesaplarda', Priority.HIGH, RoleScope.EXECUTIVE_MANAGER],
  ['Kur riski (gelir TL, gider USD)', Priority.MEDIUM, RoleScope.EXECUTIVE_MANAGER],
].map(([t, p, role], i) =>
  item({
    id: `risk_${i + 1}`,
    kind: ItemKind.RISK,
    category: 'Risk',
    title: t as string,
    roleScope: role as RoleScope,
    accountableRole: role as RoleScope,
    timeScope: TimeScope.ONGOING,
    priority: p as Priority,
    status: Status.IN_PROGRESS,
    complianceLevel:
      (t as string).includes('temsilci') || (t as string).includes('Kayıt dışı')
        ? ComplianceLevel.LEGAL_EXPERT_REQUIRED
        : ComplianceLevel.REVIEW_REQUIRED,
  }),
);

// overdue örneği (dashboard'a yansısın)
const overdueSamples: AdminItem[] = [
  item({
    id: 'op_overdue_1',
    kind: ItemKind.MANAGER_OPERATION,
    category: 'Operasyon',
    title: 'Yetki matrisi taslağını hazırla ve gönder',
    roleScope: RoleScope.MANAGER_ONLY,
    accountableRole: RoleScope.EXECUTIVE_MANAGER,
    timeScope: TimeScope.DAY_0_30,
    dueDate: '2026-07-10',
    status: Status.IN_PROGRESS,
    priority: Priority.HIGH,
  }),
  item({
    id: 'op_overdue_2',
    kind: ItemKind.IK_WORK_ORDER,
    category: 'İK / Çalışma Düzeni',
    title: 'OSGB (İSG) ve mali müşavir anlaşması',
    roleScope: RoleScope.EXECUTIVE_MANAGER,
    accountableRole: RoleScope.EXECUTIVE_MANAGER,
    timeScope: TimeScope.DAY_0_30,
    dueDate: '2026-07-12',
    status: Status.NOT_STARTED,
    priority: Priority.HIGH,
    requiresExternalExpert: true,
    complianceLevel: ComplianceLevel.REVIEW_REQUIRED,
  }),
];

export function seedItems(): AdminItem[] {
  return [
    ...discussions,
    ...payroll,
    ...holiday,
    ...managerLeave,
    ...benefits,
    ...brand,
    ...devops,
    ...operations,
    ...responsibilities,
    ...ikOrders,
    ...procurement,
    ...risks,
    ...overdueSamples,
  ];
}

// ---------- /patron/ortak-kararlar ----------
const dec = (
  id: string,
  decisionId: string,
  title: string,
  category: string,
  extra: Partial<JointDecision> = {},
): JointDecision => {
  const ts = nowISO();
  return {
    id,
    decisionId,
    title,
    category,
    options: extra.options ?? ['Onayla', 'Revize et', 'Reddet'],
    managerRecommendation: extra.managerRecommendation ?? '',
    investorPosition: extra.investorPosition ?? '',
    financialImpact: extra.financialImpact ?? '',
    peopleImpact: extra.peopleImpact ?? '',
    legalImpact: extra.legalImpact ?? '',
    deadline: extra.deadline ?? '2026-07-31',
    decisionStatus: extra.decisionStatus ?? Status.WAITING_APPROVAL,
    finalDecision: extra.finalDecision ?? null,
    decisionRationale: extra.decisionRationale ?? null,
    evidence: extra.evidence ?? null,
    reviewDate: extra.reviewDate ?? null,
    createdAt: ts,
    updatedAt: ts,
  };
};

export function seedDecisions(): JointDecision[] {
  return [
    dec('jd_budget', 'D-01', 'Yıllık ve aylık bütçe', 'Finans', {
      managerRecommendation: 'Model bütçesini onayla, aylık takip paneli ile izle.',
      financialImpact: 'Başlangıç sermayesi 40 M₺; yıllık gider planı',
    }),
    dec('jd_limits', 'D-02', 'Harcama onay limitleri', 'Yetki', {
      managerRecommendation: 'Eşikli model: limit altı yönetici, üstü patron onayı.',
    }),
    dec('jd_headcount', 'D-03', 'Kadro planı', 'İK', {
      peopleImpact: '16 → 149 kişi ölçekleme',
    }),
    dec('jd_bands', 'D-04', 'Ücret bantları', 'İK', {
      legalImpact: 'Bordro/SGK uyumu; mali müşavir kontrolü',
    }),
    dec('jd_manager_leave', 'D-05', 'Yönetici ücret ve izin protokolü', 'Sözleşme', {
      managerRecommendation: 'Yazılı yönetici protokolü; şeffaf yönetişim.',
    }),
    dec('jd_hire_fire', 'D-06', 'İşe alma ve işten çıkarma yetkileri', 'Yetki'),
    dec('jd_holiday', 'D-07', 'Resmî tatil politikası', 'İK', {
      legalImpact: '4857 m.47 ilave ücret',
    }),
    dec('jd_benefits', 'D-08', 'Yan haklar ve hoş geldin paketi', 'İK'),
    dec('jd_office', 'D-09', 'Ofis modeli', 'Operasyon'),
    dec('jd_brand', 'D-10', 'Kurumsal kimlik tedariki', 'Tedarik', {
      financialImpact: '100.000–150.000 TL',
    }),
    dec('jd_devops', 'D-11', 'DevOps dış kaynak modeli', 'Tedarik', {
      financialImpact: `Aylık ≈ ${moneyTR(twoGrossMinWageCeiling())}`,
    }),
    dec('jd_contracts', 'D-12', 'Büyük sözleşmeler', 'Hukuk'),
    dec('jd_risk', 'D-13', 'Risk kabulü', 'Risk'),
    dec('jd_okr', 'D-14', 'İlk 90 gün başarı ölçütleri', 'Strateji', {
      managerRecommendation: 'Ölçülebilir 3 çıktı; “şirketi toparla” gibi ifadeler kabul edilmez.',
    }),
  ];
}
