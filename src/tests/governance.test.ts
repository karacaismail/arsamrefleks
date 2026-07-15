import { describe, it, expect } from 'vitest';
import { GATES, GATE_QUESTIONS, GATE_DELIVERABLES, GATE_CRITERIA } from '../data/gates';
import { LOOPS } from '../data/loops';
import { LEGACY_ACTIONS } from '../data/legacy';
import {
  gatePassable,
  hasCycle,
  isFactualEvidence,
  reopenGate,
} from '../services/gateService';
import { migrateStorage, STORAGE_VERSION } from '../services/migration';
import {
  GateStatus,
  EvidenceType,
  EvidenceStrength,
  CriterionStatus,
  MappingType,
  type GovernanceGate,
  type GateCriterion,
  type EvidenceRecord,
  type GovernanceRisk,
} from '../domain/governance';
import { governanceRiskSchema } from '../schemas/governance';
import { RoleScope } from '../domain/enums';

const gate = (over: Partial<GovernanceGate>): GovernanceGate => ({
  id: over.id ?? 'g_test',
  code: over.code ?? 'G1',
  slug: over.slug ?? 'g1',
  order: over.order ?? 1,
  title: over.title ?? 'Test',
  purpose: over.purpose ?? 'x',
  description: over.description ?? '',
  status: over.status ?? GateStatus.IN_PROGRESS,
  progress: over.progress ?? 0,
  evidenceStatus: over.evidenceStatus ?? 'INSUFFICIENT',
  ownerRole: over.ownerRole ?? RoleScope.EXECUTIVE_MANAGER,
  accountableRole: over.accountableRole ?? RoleScope.EXECUTIVE_MANAGER,
  approverRole: over.approverRole ?? RoleScope.JOINT_DECISION,
  startDate: over.startDate ?? null,
  targetDate: over.targetDate ?? null,
  completedDate: over.completedDate ?? null,
  reviewDate: over.reviewDate ?? null,
  prerequisiteGateIds: over.prerequisiteGateIds ?? [],
  nextGateIds: over.nextGateIds ?? [],
  blockingRiskIds: over.blockingRiskIds ?? [],
  questionIds: over.questionIds ?? [],
  deliverableIds: over.deliverableIds ?? [],
  criterionIds: over.criterionIds ?? [],
  evidenceIds: over.evidenceIds ?? [],
  decisionIds: over.decisionIds ?? [],
  legacyActionIds: over.legacyActionIds ?? [],
  createdAt: '2026-07-01T00:00:00.000Z',
  updatedAt: '2026-07-01T00:00:00.000Z',
});

const crit = (over: Partial<GateCriterion>): GateCriterion => ({
  id: over.id ?? 'c1',
  gateId: over.gateId ?? 'g_test',
  title: over.title ?? 'kriter',
  required: over.required ?? true,
  status: over.status ?? CriterionStatus.MET,
  evidenceId: over.evidenceId ?? 'e1',
  notes: over.notes ?? null,
});

const ev = (over: Partial<EvidenceRecord>): EvidenceRecord => ({
  id: over.id ?? 'e1',
  title: over.title ?? 'kanıt',
  type: over.type ?? EvidenceType.BEHAVIORAL_EVIDENCE,
  strength: over.strength ?? EvidenceStrength.STRONG,
  source: over.source ?? 'saha',
  sourceDate: over.sourceDate ?? null,
  collectedDate: over.collectedDate ?? null,
  owner: over.owner ?? 'Yönetici',
  gateId: over.gateId ?? 'g_test',
  criterionId: over.criterionId ?? 'c1',
  supportsClaim: over.supportsClaim ?? null,
  refutesClaim: over.refutesClaim ?? null,
  validUntil: over.validUntil ?? null,
  ref: over.ref ?? null,
  verificationStatus: over.verificationStatus ?? 'VERIFIED',
});

describe('Stratejik yönetişim domain (Iterasyon 1)', () => {
  it('3. G0–G12 eksiksiz ve benzersiz', () => {
    expect(GATES.length).toBe(13);
    const codes = GATES.map((g) => g.code);
    expect(new Set(codes).size).toBe(13);
    for (let i = 0; i <= 12; i++) expect(codes).toContain(`G${i}`);
  });

  it('4. her gate’in soru + çıktı + geçiş kriteri var', () => {
    for (const g of GATES) {
      expect(GATE_QUESTIONS.filter((q) => q.gateId === g.id).length, `${g.code} soru`).toBeGreaterThan(0);
      expect(GATE_DELIVERABLES.filter((d) => d.gateId === g.id).length, `${g.code} çıktı`).toBeGreaterThan(0);
      expect(GATE_CRITERIA.filter((c) => c.gateId === g.id).length, `${g.code} kriter`).toBeGreaterThan(0);
    }
  });

  it('domain: gate sırası döngü içermez (acyclic) ve order artan', () => {
    expect(hasCycle(GATES)).toBe(false);
    const ordered = [...GATES].sort((a, b) => a.order - b.order);
    ordered.forEach((g, i) => expect(g.order).toBe(i));
  });

  it('5. ön koşul geçmeden bağımlı gate geçemez', () => {
    const g1 = gate({ id: 'g1', prerequisiteGateIds: ['g0'] });
    const res = gatePassable(g1, { criteria: [crit({})], evidence: [ev({})], risks: [], passedGateIds: new Set() });
    expect(res.ok).toBe(false);
    expect(res.reasons.join(' ')).toMatch(/ön koşul/i);
  });

  it('6. eksik kanıtla gate geçemez', () => {
    const g1 = gate({ id: 'g1' });
    const res = gatePassable(g1, {
      criteria: [crit({ evidenceId: null })],
      evidence: [],
      risks: [],
      passedGateIds: new Set(),
    });
    expect(res.ok).toBe(false);
    expect(res.reasons.join(' ')).toMatch(/kanıt/i);
  });

  it('7. açık bloke edici riskle gate geçemez', () => {
    const g1 = gate({ id: 'g1' });
    const risk: GovernanceRisk = {
      id: 'r1', gateId: 'g1', category: 'MARKET', description: 'x', trigger: null,
      probability: 4, impact: 5, score: 20, tolerance: null, owner: 'Yönetici',
      response: null, reserve: null, escalationRule: null, status: 'OPEN',
      closureEvidenceId: null, blocking: true, createdAt: '', updatedAt: '',
    };
    const res = gatePassable(g1, { criteria: [crit({})], evidence: [ev({})], risks: [risk], passedGateIds: new Set() });
    expect(res.ok).toBe(false);
    expect(res.reasons.join(' ')).toMatch(/risk/i);
  });

  it('tüm koşullar sağlanınca gate geçebilir', () => {
    const g1 = gate({ id: 'g1', prerequisiteGateIds: ['g0'] });
    const res = gatePassable(g1, {
      criteria: [crit({ status: CriterionStatus.MET, evidenceId: 'e1' })],
      evidence: [ev({ id: 'e1', type: EvidenceType.BEHAVIORAL_EVIDENCE })],
      risks: [],
      passedGateIds: new Set(['g0']),
    });
    expect(res.ok).toBe(true);
    expect(res.reasons).toEqual([]);
  });

  it('8. dört öğrenme döngüsü mevcut (L1–L4)', () => {
    expect(LOOPS.length).toBe(4);
    expect(LOOPS.map((l) => l.code).sort()).toEqual(['L1', 'L2', 'L3', 'L4']);
  });

  it('9. eski 00–34 maddelerinin tamamı eşlenmiş', () => {
    expect(LEGACY_ACTIONS.length).toBe(35);
    for (let i = 0; i <= 34; i++) {
      const id = String(i).padStart(2, '0');
      const a = LEGACY_ACTIONS.find((x) => x.legacyId === id);
      expect(a, `legacy ${id}`).toBeDefined();
      const mapped =
        (a!.mappedGateIds.length > 0) ||
        a!.mappingType === MappingType.CROSS_CUTTING ||
        a!.mappingType === MappingType.DEPRECATED_AS_SEQUENCE;
      expect(mapped, `legacy ${id} eşlenmemiş`).toBe(true);
    }
  });

  it('10. risk her gate’e bağlanabilir', () => {
    for (const g of GATES) {
      const r = {
        id: `r_${g.code}`, gateId: g.id, category: 'GOVERNANCE', description: 'x', trigger: null,
        probability: 3, impact: 3, score: 9, tolerance: null, owner: 'Yönetici', response: null,
        reserve: null, escalationRule: null, status: 'OPEN', closureEvidenceId: null,
        blocking: false, createdAt: '2026-07-01T00:00:00.000Z', updatedAt: '2026-07-01T00:00:00.000Z',
      };
      expect(() => governanceRiskSchema.parse(r)).not.toThrow();
    }
  });

  it('11. kanıt türü ve gücü ayrı alanlar', () => {
    const e = ev({ type: EvidenceType.EXTERNAL_DATA, strength: EvidenceStrength.MODERATE });
    expect(e.type).toBe('EXTERNAL_DATA');
    expect(e.strength).toBe('MODERATE');
    expect(Object.values(EvidenceType)).not.toContain('MODERATE');
  });

  it('12. varsayım gerçek kanıt gibi kullanılamaz', () => {
    expect(isFactualEvidence(EvidenceType.ASSUMPTION)).toBe(false);
    expect(isFactualEvidence(EvidenceType.FORECAST)).toBe(false);
    expect(isFactualEvidence(EvidenceType.TARGET)).toBe(false);
    expect(isFactualEvidence(EvidenceType.BEHAVIORAL_EVIDENCE)).toBe(true);
    const g1 = gate({ id: 'g1' });
    const res = gatePassable(g1, {
      criteria: [crit({ evidenceId: 'e1' })],
      evidence: [ev({ id: 'e1', type: EvidenceType.ASSUMPTION })],
      risks: [],
      passedGateIds: new Set(),
    });
    expect(res.ok).toBe(false);
    expect(res.reasons.join(' ')).toMatch(/varsay|kanıt/i);
  });

  it('18. gate yeniden açma karar geçmişini korur (review üretir)', () => {
    const g = gate({ id: 'g1', status: GateStatus.PASSED });
    const { gate: reopened, review } = reopenGate(g, 'Yeni kanıt çelişkisi', RoleScope.JOINT_DECISION);
    expect(reopened.status).toBe(GateStatus.REOPENED);
    expect(review.rationale).toMatch(/çelişki/i);
    expect(review.gateId).toBe('g1');
  });

  it('14. localStorage v1 → v2 migration veri kaybetmez', () => {
    const v1 = {
      'arsam.items.v1': JSON.stringify([{ id: 'x1', checked: true, answer: 'evet' }]),
      'arsam.decisions.v1': JSON.stringify([{ id: 'd1', finalDecision: 'onay' }]),
    };
    const out = migrateStorage(v1);
    expect(out.storageVersion).toBe(STORAGE_VERSION);
    expect(out.items.find((i: any) => i.id === 'x1')?.checked).toBe(true);
    expect(out.items.find((i: any) => i.id === 'x1')?.answer).toBe('evet');
    expect(out.decisions.find((d: any) => d.id === 'd1')?.finalDecision).toBe('onay');
    // yeni bağlantı alanları güvenli default
    expect(out.items.find((i: any) => i.id === 'x1')).toHaveProperty('gateIds');
  });
});
