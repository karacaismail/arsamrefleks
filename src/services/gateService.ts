import {
  type GovernanceGate,
  type GateCriterion,
  type EvidenceRecord,
  type GovernanceRisk,
  type GateReview,
  EvidenceType,
  CriterionStatus,
  RiskStatus,
  GateStatus,
  GateReviewOutcome,
} from '../domain/governance';
import type { RoleScope } from '../domain/enums';
import { uid, nowISO } from '../domain/util';

// Varsayım / tahmin / hedef gerçek (factual) kanıt sayılmaz.
const NON_FACTUAL = new Set<string>([EvidenceType.ASSUMPTION, EvidenceType.FORECAST, EvidenceType.TARGET]);
export function isFactualEvidence(t: EvidenceType): boolean {
  return !NON_FACTUAL.has(t);
}

export interface PassContext {
  criteria: GateCriterion[];
  evidence: EvidenceRecord[];
  risks: GovernanceRisk[];
  passedGateIds: Set<string>;
}

export interface PassResult {
  ok: boolean;
  reasons: string[];
}

/** Domain kuralları 3–9: bir gate ancak koşullar sağlanınca PASSED olabilir. */
export function gatePassable(gate: GovernanceGate, ctx: PassContext): PassResult {
  const reasons: string[] = [];

  // Rule 6: ön koşul gate geçmeden bağımlı gate geçemez
  for (const p of gate.prerequisiteGateIds) {
    if (!ctx.passedGateIds.has(p)) reasons.push(`Ön koşul kapı geçilmedi: ${p}`);
  }

  // Rule 3 + 5 + 8: zorunlu kriter karşılandı + gerçek kanıt var
  for (const c of ctx.criteria) {
    if (!c.required) continue;
    if (c.status !== CriterionStatus.MET) {
      reasons.push(`Zorunlu kriter karşılanmadı: ${c.title}`);
    }
    if (!c.evidenceId) {
      reasons.push(`Kriter için kanıt eklenmedi: ${c.title}`);
      continue;
    }
    const e = ctx.evidence.find((x) => x.id === c.evidenceId);
    if (!e) {
      reasons.push(`Kanıt bulunamadı: ${c.title}`);
    } else if (!isFactualEvidence(e.type)) {
      reasons.push(`Kriter varsayım/tahmin/hedef ile geçirilemez, gerçek kanıt gerekli: ${c.title}`);
    }
  }

  // Rule 4: açık bloke edici risk kalamaz
  for (const r of ctx.risks) {
    if (r.blocking && r.status !== RiskStatus.CLOSED) {
      reasons.push(`Açık bloke edici risk: ${r.description}`);
    }
  }

  return { ok: reasons.length === 0, reasons };
}

/** Rule 2: gate ön koşul grafiği döngü içermemeli. */
export function hasCycle(gates: GovernanceGate[]): boolean {
  const byId = new Map(gates.map((g) => [g.id, g]));
  const WHITE = 0, GRAY = 1, BLACK = 2;
  const color = new Map<string, number>(gates.map((g) => [g.id, WHITE]));

  const dfs = (id: string): boolean => {
    color.set(id, GRAY);
    const g = byId.get(id);
    if (g) {
      for (const p of g.prerequisiteGateIds) {
        const c = color.get(p);
        if (c === GRAY) return true;
        if (c === WHITE && byId.has(p) && dfs(p)) return true;
      }
    }
    color.set(id, BLACK);
    return false;
  };

  for (const g of gates) {
    if (color.get(g.id) === WHITE && dfs(g.id)) return true;
  }
  return false;
}

/** Rule 7 + 18: yeniden açma gerekçe ve review kaydı üretir (karar geçmişi korunur). */
export function reopenGate(
  gate: GovernanceGate,
  rationale: string,
  reviewerRole: RoleScope,
): { gate: GovernanceGate; review: GateReview } {
  const review: GateReview = {
    id: uid('rev'),
    gateId: gate.id,
    date: nowISO(),
    reviewerRole,
    outcome: GateReviewOutcome.REOPEN,
    rationale,
    evidenceIds: [],
  };
  return { gate: { ...gate, status: GateStatus.REOPENED, updatedAt: nowISO() }, review };
}
