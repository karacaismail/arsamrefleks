// localStorage sürümlü migration — mevcut veri sessizce silinmez.
export const STORAGE_VERSION = 2;

export interface MigrationResult {
  storageVersion: number;
  items: any[];
  decisions: any[];
  errors: string[];
}

const V2_ITEM_LINKS = {
  gateIds: [] as string[],
  governanceDecisionIds: [] as string[],
  riskIds: [] as string[],
  evidenceIds: [] as string[],
  deliverableIds: [] as string[],
};
const V2_DECISION_LINKS = { gateIds: [] as string[] };

/**
 * v1 (mevcut admin kayıtları) → v2 (stratejik yönetişim bağlantıları eklenmiş).
 * Mevcut cevaplar/checklist/kararlar korunur; yeni alanlara güvenli default atanır.
 * Bozuk veri kaybı yerine hata listesi döner (çağıran export sunabilir).
 */
export function migrateStorage(raw: Record<string, string | null>): MigrationResult {
  const errors: string[] = [];
  const parse = (key: string): any[] => {
    const s = raw[key];
    if (s == null) return [];
    try {
      const v = JSON.parse(s);
      return Array.isArray(v) ? v : [];
    } catch {
      errors.push(`Bozuk veri: ${key} (korunması için export edin)`);
      return [];
    }
  };

  const items = parse('arsam.items.v1').map((i) => ({ ...V2_ITEM_LINKS, ...i }));
  const decisions = parse('arsam.decisions.v1').map((d) => ({ ...V2_DECISION_LINKS, ...d }));

  return { storageVersion: STORAGE_VERSION, items, decisions, errors };
}

/** Migration'ı localStorage üzerinde uygular; başarısızsa mevcut veriyi korur. */
export function runStorageMigration(storage: Storage): MigrationResult | null {
  try {
    const current = Number(storage.getItem('arsam.storageVersion') ?? '1');
    if (current >= STORAGE_VERSION) return null;
    const raw: Record<string, string | null> = {
      'arsam.items.v1': storage.getItem('arsam.items.v1'),
      'arsam.decisions.v1': storage.getItem('arsam.decisions.v1'),
    };
    const res = migrateStorage(raw);
    if (res.errors.length === 0) {
      storage.setItem('arsam.items.v1', JSON.stringify(res.items));
      storage.setItem('arsam.decisions.v1', JSON.stringify(res.decisions));
      storage.setItem('arsam.storageVersion', String(STORAGE_VERSION));
    }
    return res;
  } catch {
    return null;
  }
}
