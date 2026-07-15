import { useSyncExternalStore } from 'react';
import { LocalStorageRepository, type Repository } from '../repositories/repository';
import {
  adminItemArraySchema,
  jointDecisionArraySchema,
  adminItemSchema,
  jointDecisionSchema,
} from '../schemas/schemas';
import type { AdminItem, JointDecision } from '../domain/types';
import { seedItems, seedDecisions } from '../data/seed';
import { nowISO, uid } from '../domain/util';
import { Status } from '../domain/enums';

/** Reaktif koleksiyon — repository arkasında; UI localStorage'a dokunmaz. */
class Collection<T extends { id: string }> {
  private data: T[];
  private listeners = new Set<() => void>();

  constructor(
    private readonly repo: Repository<T>,
    private readonly validate: (x: T) => T,
  ) {
    this.data = repo.list();
  }

  subscribe = (l: () => void): (() => void) => {
    this.listeners.add(l);
    return () => {
      this.listeners.delete(l);
    };
  };

  getSnapshot = (): T[] => this.data;

  private refresh(): void {
    this.data = this.repo.list();
    this.listeners.forEach((l) => l());
  }

  all(): T[] {
    return this.data;
  }
  get(id: string): T | undefined {
    return this.repo.get(id);
  }
  create(x: T): T {
    const v = this.validate(x);
    this.repo.create(v);
    this.refresh();
    return v;
  }
  update(id: string, patch: Partial<T>): T {
    const cur = this.repo.get(id);
    if (!cur) throw new Error(`Kayıt bulunamadı: ${id}`);
    const next = this.validate({ ...cur, ...patch, id, updatedAt: nowISO() } as T);
    this.repo.update(id, next);
    this.refresh();
    return next;
  }
  remove(id: string): void {
    this.repo.remove(id);
    this.refresh();
  }
  reset(seed: T[]): void {
    this.repo.replaceAll(seed);
    this.refresh();
  }
}

const itemsRepo = new LocalStorageRepository<AdminItem>(
  'arsam.items.v1',
  adminItemArraySchema,
  seedItems,
);
const decisionsRepo = new LocalStorageRepository<JointDecision>(
  'arsam.decisions.v1',
  jointDecisionArraySchema,
  seedDecisions,
);

export const itemsStore = new Collection<AdminItem>(itemsRepo, (x) => adminItemSchema.parse(x));
export const decisionsStore = new Collection<JointDecision>(decisionsRepo, (x) =>
  jointDecisionSchema.parse(x),
);

export function useItems(): AdminItem[] {
  return useSyncExternalStore(itemsStore.subscribe, itemsStore.getSnapshot);
}
export function useDecisions(): JointDecision[] {
  return useSyncExternalStore(decisionsStore.subscribe, decisionsStore.getSnapshot);
}

/** Patron cevabını ortak karara dönüştür. */
export function convertQuestionToDecision(itemId: string): JointDecision | undefined {
  const it = itemsStore.get(itemId);
  if (!it) return undefined;
  const jd: JointDecision = {
    id: uid('jd'),
    decisionId: `D-Q-${it.id}`,
    title: it.title,
    category: it.category,
    options: ['Onayla', 'Reddet'],
    managerRecommendation: it.recommendation ?? '',
    investorPosition: it.answer ?? '',
    financialImpact: it.financialImpact ?? '',
    peopleImpact: '',
    legalImpact: it.legalReference ?? '',
    deadline: it.dueDate,
    decisionStatus: Status.WAITING_APPROVAL,
    finalDecision: null,
    decisionRationale: null,
    evidence: it.evidence,
    reviewDate: null,
    createdAt: nowISO(),
    updatedAt: nowISO(),
  };
  decisionsStore.create(jd);
  itemsStore.update(itemId, {
    answered: true,
    notes: `${it.notes ?? ''} [Ortak karara dönüştürüldü: ${jd.decisionId}]`.trim(),
  } as Partial<AdminItem>);
  return jd;
}
