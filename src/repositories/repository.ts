import type { z } from 'zod';

export interface Entity {
  id: string;
}

export interface Repository<T extends Entity> {
  list(): T[];
  get(id: string): T | undefined;
  create(item: T): T;
  update(id: string, patch: Partial<T>): T;
  remove(id: string): void;
  replaceAll(items: T[]): void;
}

/** In-memory Storage fallback (test / SSR ortamı). */
class MemoryStorage {
  private m = new Map<string, string>();
  getItem(k: string): string | null {
    return this.m.has(k) ? (this.m.get(k) as string) : null;
  }
  setItem(k: string, v: string): void {
    this.m.set(k, v);
  }
  removeItem(k: string): void {
    this.m.delete(k);
  }
}

function safeStorage(): Pick<Storage, 'getItem' | 'setItem' | 'removeItem'> {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const t = '__arsam_probe__';
      window.localStorage.setItem(t, '1');
      window.localStorage.removeItem(t);
      return window.localStorage;
    }
  } catch {
    /* localStorage engelli — memory'ye düş */
  }
  return new MemoryStorage();
}

/**
 * localStorage tabanlı, Zod ile doğrulanan repository.
 * UI bu sınıfı doğrudan kullanmaz; service katmanı arkasındadır.
 */
export class LocalStorageRepository<T extends Entity> implements Repository<T> {
  private storage = safeStorage();

  constructor(
    private readonly key: string,
    private readonly schema: z.ZodType<T[]>,
    private readonly seed: () => T[],
  ) {
    this.ensure();
  }

  private ensure(): void {
    const raw = this.storage.getItem(this.key);
    if (raw == null) {
      this.write(this.seed());
      return;
    }
    try {
      const parsed = this.schema.parse(JSON.parse(raw));
      this.write(parsed);
    } catch {
      // bozuk/eski veri => seed'e sıfırla (kanonik yeniden üretim)
      this.write(this.seed());
    }
  }

  private read(): T[] {
    const raw = this.storage.getItem(this.key);
    if (raw == null) return [];
    try {
      return this.schema.parse(JSON.parse(raw));
    } catch {
      return [];
    }
  }

  private write(items: T[]): void {
    this.storage.setItem(this.key, JSON.stringify(items));
  }

  list(): T[] {
    return this.read();
  }

  get(id: string): T | undefined {
    return this.read().find((x) => x.id === id);
  }

  create(item: T): T {
    const items = this.read();
    items.push(item);
    this.write(items);
    return item;
  }

  update(id: string, patch: Partial<T>): T {
    const items = this.read();
    const idx = items.findIndex((x) => x.id === id);
    if (idx < 0) throw new Error(`Kayıt bulunamadı: ${id}`);
    const next = { ...items[idx], ...patch, id } as T;
    items[idx] = next;
    this.write(items);
    return next;
  }

  remove(id: string): void {
    this.write(this.read().filter((x) => x.id !== id));
  }

  replaceAll(items: T[]): void {
    this.write(items);
  }
}
