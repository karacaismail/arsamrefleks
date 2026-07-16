import type { AdminItem, JointDecision } from '../../domain/types';

// Alan bazlı kısa ipuçları — kullanıcıya "buraya ne yazmalıyım" rehberi.
const HINTS: Record<string, string> = {
  title: 'Kısa ve net başlık. Ne hakkında olduğu tek bakışta anlaşılsın.',
  description: 'Kaydın kapsamı: ne, neden, kimin için. 1–2 cümle yeterli.',
  owner: 'Bu işi yürüten kişi/rol (ör. Yönetici, İK, Mali Müşavir).',
  dueDate: 'Hedef tamamlanma/karar tarihi. Timeline bu tarihe göre yayılır.',
  roleScope: 'Bu kayıt kimin alanı? Patron / Yönetici / Ortak / Yalnız Yönetici / Dış Uzman.',
  accountableRole: 'Sonuçtan tek sorumlu (accountable). Her kayıtta tek olmalı.',
  status: 'Nerede: Başlamadı → Devam → Onay/Cevap Bekliyor → Tamamlandı.',
  priority: 'Aciliyet/önem. Yüksek/Kritik olanlar dashboard’a taşınır.',
  timeScope: 'Hangi dönem: toplantı öncesi, ilk 90 gün, aylık, sabit tarih…',
  complianceLevel: 'Hukuk/mali müşavir gerekiyorsa işaretleyin (uyum riski).',
  requiresPatron: 'Karar/onay patrona aitse işaretleyin (yalnız-yönetici olamaz).',
  answer: 'Verilen karar veya patronun cevabı. Net ve uygulanabilir tek cümle.',
  notes: 'Ek bağlam, gerekçe, bağımlılık veya takip notu.',
  evidence: 'Kanıt/belge: dosya adı, URL, mevzuat maddesi veya toplantı kararı referansı.',
};

export function fieldHint(field: string): string {
  return HINTS[field] ?? '';
}

interface Example {
  description: string;
  answer: string;
  notes: string;
  evidence: string;
}

const GENERIC: Example = {
  description: 'Bu kaydın kapsamını yazın: ne yapılacak, neden gerekli, kimi ilgilendiriyor.',
  answer: 'Verilen karar / cevap: net, uygulanabilir tek cümle.',
  notes: 'Ek bağlam, gerekçe, bağımlılık ya da takip notu.',
  evidence: 'Dosya adı, URL, mevzuat maddesi veya toplantı kararı referansı.',
};

const BY_CATEGORY: Array<{ match: RegExp; ex: Example }> = [
  {
    match: /tatil/i,
    ex: {
      description: 'Ulusal bayram ve genel tatil günlerinde şirketin varsayılan politikası (çalışılmaz) ve zorunlu istisnalar tanımlanır.',
      answer: 'Karar: Resmî tatillerde çalışılmaz; yalnız kanunen zorunlu nöbet için, önceden yazılı onay ve mevzuata uygun ilave ücretle.',
      notes: 'Puantaj–bordro–SGK aylık mutabakat; 18 yaş altı genel tatilde çalıştırılmaz.',
      evidence: 'İş Kanunu m.47; İK Tatil Politikası v1; toplantı kararı 15.07.2026',
    },
  },
  {
    match: /ücret|bordro|sgk/i,
    ex: {
      description: 'Ücret, bordro ve SGK bildirimlerinin gerçek kazanç üzerinden ve izlenebilir kanaldan yapılmasını sağlayan politika.',
      answer: 'Karar: Tüm ücretler bordro ve SGK’da gerçek kazançla gösterilir; kayıt dışı ödeme yasaktır (istisnasız).',
      notes: 'Aylık bordro–banka–SGK mutabakatı; mali müşavir kontrolü zorunlu.',
      evidence: '5510 sayılı Kanun; mali müşavir onayı; bordro mutabakat tablosu',
    },
  },
  {
    match: /izin/i,
    ex: {
      description: 'Yönetici izin/çalışma protokolü: yıllık izin, tatil-hafta birleştirme, vekâlet ve bildirim kuralları yazılı hale getirilir.',
      answer: 'Karar: Yıllık izin + tanımlı yönetici izni; birleştirmede X gün önceden bildirim ve vekâlet ataması zorunlu.',
      notes: 'Kritik toplantı/dönemlerde kullanılamaz; çalışanlarda adalet algısı için şeffaf duyuru.',
      evidence: 'Ek yönetici protokolü; iş sözleşmesi maddesi',
    },
  },
  {
    match: /kimlik|marka|brand/i,
    ex: {
      description: 'Kurumsal kimlik/marka dossier çalışmasının dış kaynaktan alınması; kapsam, bütçe ve IP devri belirlenir.',
      answer: 'Karar: 100.000–150.000 TL planlama aralığında, en az 3 teklif; kaynak dosya + IP devri şartıyla.',
      notes: 'Kapsam: logo, tipografi, renk, sosyal medya, sunum, ürün arayüz kılavuzu.',
      evidence: 'Ajans teklifleri; sözleşme taslağı; IP devir maddesi',
    },
  },
  {
    match: /devops/i,
    ex: {
      description: 'Ayrı DevOps ekibi kurulmadan sunucu/CI-CD/operasyonun dış kaynaktan alınması; SLA, erişim ve veri yeri belirlenir.',
      answer: 'Karar: Managed servis; aylık tavan ≈ 2× brüt asgari ücret; SLA, erişim sınırı ve KVKK veri yeri şartıyla.',
      notes: 'ELK yalnız ihtiyaç doğrulanırsa; yedekleme sorumlusu ve sağlayıcı değiştirme planı tanımlı.',
      evidence: 'Sağlayıcı teklifleri; SLA belgesi; KVKK veri işleyen sözleşmesi',
    },
  },
  {
    match: /yan hak|hoş geldin/i,
    ex: {
      description: 'Çalışan yan hakları ve hoş geldin paketi kapsamı, bütçesi ve dağıtımı belirlenir.',
      answer: 'Karar: Kişi başı belirlenen bütçede standart paket; uzaktan çalışana kargo; bütçe kalemi ve vergisel etki netleştirildi.',
      notes: 'Mali müşavir vergisel/bordrosal etki kontrolü.',
      evidence: 'Paket içerik listesi; bütçe onayı',
    },
  },
];

export function exampleContent(item: AdminItem): Example {
  const cat = `${item.category} ${item.title}`;
  const hit = BY_CATEGORY.find((b) => b.match.test(cat));
  return hit ? hit.ex : GENERIC;
}

// ---- Ortak Karar (JointDecision) yönergeleri ----
const DECISION_HINTS: Record<string, string> = {
  managerRecommendation: 'Yöneticinin önerdiği seçenek ve kısa gerekçe.',
  investorPosition: 'Patron/yatırımcının bu karara bakışı veya beklentisi.',
  financialImpact: 'Mali etki: tutar, aralık veya aylık maliyet.',
  peopleImpact: 'İnsan/ekip etkisi: kadro, rol, moral.',
  legalImpact: 'Hukuki/uyum etkisi ve gereken uzman kontrolü.',
  finalDecision: 'Verilen nihai karar. Net ve uygulanabilir tek cümle.',
  rationale: 'Kararın gerekçesi: hangi kanıt/argümanla verildi.',
};
export function decisionHint(field: string): string {
  return DECISION_HINTS[field] ?? '';
}

export interface DecisionExample {
  managerRecommendation: string;
  investorPosition: string;
  financialImpact: string;
  finalDecision: string;
  rationale: string;
}

const DECISION_GENERIC: DecisionExample = {
  managerRecommendation: 'Öneri: [seçenek] — çünkü [kısa gerekçe].',
  investorPosition: 'Patron görüşü: [onay / çekince / şart].',
  financialImpact: 'Mali etki: [tutar/aralık veya aylık maliyet].',
  finalDecision: 'Nihai karar: [ne yapılacak], [ne zaman], [kim sorumlu].',
  rationale: 'Gerekçe: [kullanılan kanıt/argüman] ışığında bu karar verildi.',
};

const DECISION_BY_CAT: Array<{ match: RegExp; ex: DecisionExample }> = [
  {
    match: /bütçe|limit|kaynak/i,
    ex: {
      managerRecommendation: 'Öneri: Model bütçesini onayla; aylık takip paneliyle sapmaları izle.',
      investorPosition: 'Patron: Yıllık tavan ve aylık yakma sınırı belirlenmeli.',
      financialImpact: 'Başlangıç sermayesi 40 M₺; aylık yakma tavanı belirlenecek.',
      finalDecision: 'Nihai karar: Yıllık bütçe X ₺ onaylandı; limit üstü harcama patron onayına tabi.',
      rationale: 'Nakit disiplini ve şeffaf takip için eşikli model.',
    },
  },
  {
    match: /marka|kimlik|tedarik/i,
    ex: {
      managerRecommendation: 'Öneri: Dış kaynak; en az 3 teklif, IP devir şartıyla.',
      investorPosition: 'Patron: Bütçe tavanı ve nihai onay bende.',
      financialImpact: '100.000–150.000 TL planlama aralığı (teklifle doğrulanacak).',
      finalDecision: 'Nihai karar: [ajans] ile, [tutar] bütçe, [tarih] teslim; IP şirkete devredilir.',
      rationale: 'Uzmanlık işi; içeride kapasite yok, marka kritik.',
    },
  },
  {
    match: /devops/i,
    ex: {
      managerRecommendation: 'Öneri: Managed servis; ayrı DevOps ekibi kurulmaz.',
      investorPosition: 'Patron: SLA, erişim sınırı ve maliyet tavanı netleşmeli.',
      financialImpact: 'Aylık tavan ≈ 2× brüt asgari ücret.',
      finalDecision: 'Nihai karar: [sağlayıcı] ile SLA’lı dış operasyon; ELK ihtiyaç doğrulanırsa.',
      rationale: 'Erken aşamada tam zamanlı DevOps maliyeti gereksiz.',
    },
  },
];

export function decisionExample(d: JointDecision): DecisionExample {
  const cat = `${d.category} ${d.title}`;
  const hit = DECISION_BY_CAT.find((b) => b.match.test(cat));
  return hit ? hit.ex : DECISION_GENERIC;
}
