import type { RoleScope } from './enums';

// ---- enums ----
export const GateStatus = {
  NOT_STARTED: 'NOT_STARTED',
  IN_DISCOVERY: 'IN_DISCOVERY',
  IN_PROGRESS: 'IN_PROGRESS',
  WAITING_EVIDENCE: 'WAITING_EVIDENCE',
  WAITING_DECISION: 'WAITING_DECISION',
  WAITING_APPROVAL: 'WAITING_APPROVAL',
  BLOCKED: 'BLOCKED',
  PASSED: 'PASSED',
  REOPENED: 'REOPENED',
  ABANDONED: 'ABANDONED',
} as const;
export type GateStatus = (typeof GateStatus)[keyof typeof GateStatus];

export const GateEvidenceStatus = {
  NONE: 'NONE',
  INSUFFICIENT: 'INSUFFICIENT',
  PARTIAL: 'PARTIAL',
  SUFFICIENT: 'SUFFICIENT',
} as const;
export type GateEvidenceStatus = (typeof GateEvidenceStatus)[keyof typeof GateEvidenceStatus];

export const CriterionStatus = {
  OPEN: 'OPEN',
  MET: 'MET',
  NOT_MET: 'NOT_MET',
  WAIVED: 'WAIVED',
} as const;
export type CriterionStatus = (typeof CriterionStatus)[keyof typeof CriterionStatus];

export const EvidenceType = {
  KNOWN_FACT: 'KNOWN_FACT',
  EXTERNAL_DATA: 'EXTERNAL_DATA',
  OBSERVATION: 'OBSERVATION',
  STAKEHOLDER_STATEMENT: 'STAKEHOLDER_STATEMENT',
  BEHAVIORAL_EVIDENCE: 'BEHAVIORAL_EVIDENCE',
  FINANCIAL_EVIDENCE: 'FINANCIAL_EVIDENCE',
  EXPERT_OPINION: 'EXPERT_OPINION',
  ASSUMPTION: 'ASSUMPTION',
  FORECAST: 'FORECAST',
  TARGET: 'TARGET',
  DECISION: 'DECISION',
} as const;
export type EvidenceType = (typeof EvidenceType)[keyof typeof EvidenceType];

export const EvidenceStrength = {
  WEAK: 'WEAK',
  DIRECTIONAL: 'DIRECTIONAL',
  MODERATE: 'MODERATE',
  STRONG: 'STRONG',
} as const;
export type EvidenceStrength = (typeof EvidenceStrength)[keyof typeof EvidenceStrength];

export const EvidenceVerification = {
  UNVERIFIED: 'UNVERIFIED',
  VERIFIED: 'VERIFIED',
  DISPUTED: 'DISPUTED',
  EXPIRED: 'EXPIRED',
} as const;
export type EvidenceVerification = (typeof EvidenceVerification)[keyof typeof EvidenceVerification];

export const RiskCategory = {
  FOUNDER: 'FOUNDER',
  GOVERNANCE: 'GOVERNANCE',
  MARKET: 'MARKET',
  CUSTOMER: 'CUSTOMER',
  SOLUTION: 'SOLUTION',
  TECHNICAL: 'TECHNICAL',
  FINANCIAL: 'FINANCIAL',
  LEGAL: 'LEGAL',
  COMPLIANCE: 'COMPLIANCE',
  PEOPLE: 'PEOPLE',
  OPERATION: 'OPERATION',
  SECURITY: 'SECURITY',
  REPUTATION: 'REPUTATION',
  ADAPTABILITY: 'ADAPTABILITY',
} as const;
export type RiskCategory = (typeof RiskCategory)[keyof typeof RiskCategory];

export const RiskStatus = {
  OPEN: 'OPEN',
  MITIGATING: 'MITIGATING',
  MONITORED: 'MONITORED',
  CLOSED: 'CLOSED',
  ESCALATED: 'ESCALATED',
} as const;
export type RiskStatus = (typeof RiskStatus)[keyof typeof RiskStatus];

export const LoopDecision = {
  CONTINUE: 'CONTINUE',
  ITERATE: 'ITERATE',
  PIVOT: 'PIVOT',
  STOP: 'STOP',
  ESCALATE: 'ESCALATE',
} as const;
export type LoopDecision = (typeof LoopDecision)[keyof typeof LoopDecision];

export const MappingType = {
  MOVED_EARLIER: 'MOVED_EARLIER',
  MOVED_LATER: 'MOVED_LATER',
  SPLIT: 'SPLIT',
  MERGED: 'MERGED',
  CROSS_CUTTING: 'CROSS_CUTTING',
  UNCHANGED: 'UNCHANGED',
  DEPRECATED_AS_SEQUENCE: 'DEPRECATED_AS_SEQUENCE',
} as const;
export type MappingType = (typeof MappingType)[keyof typeof MappingType];

export const GateReviewOutcome = {
  PASS: 'PASS',
  REOPEN: 'REOPEN',
  HOLD: 'HOLD',
  ABANDON: 'ABANDON',
} as const;
export type GateReviewOutcome = (typeof GateReviewOutcome)[keyof typeof GateReviewOutcome];

// ---- entities ----
export interface GovernanceGate {
  id: string;
  code: string; // G0..G12
  slug: string;
  order: number;
  title: string;
  purpose: string;
  description: string;
  status: GateStatus;
  progress: number;
  evidenceStatus: GateEvidenceStatus;
  ownerRole: RoleScope;
  accountableRole: RoleScope;
  approverRole: RoleScope;
  startDate: string | null;
  targetDate: string | null;
  completedDate: string | null;
  reviewDate: string | null;
  prerequisiteGateIds: string[];
  nextGateIds: string[];
  blockingRiskIds: string[];
  questionIds: string[];
  deliverableIds: string[];
  criterionIds: string[];
  evidenceIds: string[];
  decisionIds: string[];
  legacyActionIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface GateQuestion {
  id: string;
  gateId: string;
  question: string;
  reason: string;
  answer: string | null;
  answerOwner: string | null;
  evidenceId: string | null;
  status: string;
  dueDate: string | null;
  notes: string | null;
  role: RoleScope;
}

export interface GateDeliverable {
  id: string;
  gateId: string;
  title: string;
  description: string;
  owner: string;
  status: string;
  version: string;
  canonicalRef: string | null;
  evidenceId: string | null;
  approverRole: RoleScope;
  approvedDate: string | null;
  reviewDate: string | null;
}

export interface GateCriterion {
  id: string;
  gateId: string;
  title: string;
  required: boolean;
  status: CriterionStatus;
  evidenceId: string | null;
  notes: string | null;
}

export interface EvidenceRecord {
  id: string;
  title: string;
  type: EvidenceType;
  strength: EvidenceStrength;
  source: string;
  sourceDate: string | null;
  collectedDate: string | null;
  owner: string;
  gateId: string | null;
  criterionId: string | null;
  supportsClaim: string | null;
  refutesClaim: string | null;
  validUntil: string | null;
  ref: string | null;
  verificationStatus: EvidenceVerification;
}

export interface GovernanceRisk {
  id: string;
  gateId: string | null;
  category: RiskCategory;
  description: string;
  trigger: string | null;
  probability: number; // 1-5
  impact: number; // 1-5
  score: number;
  tolerance: string | null;
  owner: string;
  response: string | null;
  reserve: string | null;
  escalationRule: string | null;
  status: RiskStatus;
  closureEvidenceId: string | null;
  blocking: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LearningLoopStep {
  order: number;
  title: string;
}
export interface LearningLoop {
  id: string;
  code: string; // L1..L4
  title: string;
  description: string;
  steps: LearningLoopStep[];
}

export interface LearningExperiment {
  id: string;
  loopId: string;
  gateId: string | null;
  hypothesis: string;
  riskType: RiskCategory | null;
  test: string;
  expectedEvidence: string;
  successThreshold: string;
  budget: string | null;
  startDate: string | null;
  dueDate: string | null;
  owner: string;
  result: string | null;
  learning: string | null;
  decision: LoopDecision | null;
  nextIteration: string | null;
  status: string;
}

export interface LegacyAction {
  id: string;
  legacyId: string; // '00'..'34'
  legacyOrder: number;
  title: string;
  description: string;
  tools: string[];
  mappedGateIds: string[];
  mappingType: MappingType;
  notes: string | null;
}

export interface GateLegacyMapping {
  id: string;
  gateId: string;
  legacyId: string;
  mappingType: MappingType;
  reason: string;
}

export interface GateReview {
  id: string;
  gateId: string;
  date: string;
  reviewerRole: RoleScope;
  outcome: GateReviewOutcome;
  rationale: string;
  evidenceIds: string[];
}

export interface GovernanceDecision {
  id: string;
  title: string;
  gateId: string | null;
  decisionType: string;
  options: string[];
  managerRecommendation: string;
  investorPosition: string;
  expertOpinion: string;
  decisionOwner: RoleScope;
  approverRole: RoleScope;
  evidenceIds: string[];
  counterArgument: string | null;
  financialImpact: string;
  peopleImpact: string;
  legalImpact: string;
  risk: string | null;
  finalDecision: string | null;
  rationale: string | null;
  date: string | null;
  reviewDate: string | null;
  supersedesDecisionId: string | null;
  createdAt: string;
  updatedAt: string;
}

export const GOV_LABELS = {
  gateStatus: {
    NOT_STARTED: 'Başlamadı',
    IN_DISCOVERY: 'Keşifte',
    IN_PROGRESS: 'Devam',
    WAITING_EVIDENCE: 'Kanıt Bekliyor',
    WAITING_DECISION: 'Karar Bekliyor',
    WAITING_APPROVAL: 'Onay Bekliyor',
    BLOCKED: 'Bloke',
    PASSED: 'Geçildi',
    REOPENED: 'Yeniden Açıldı',
    ABANDONED: 'Terk Edildi',
  } as Record<GateStatus, string>,
  strength: {
    WEAK: 'Zayıf',
    DIRECTIONAL: 'Yön Verici',
    MODERATE: 'Orta',
    STRONG: 'Güçlü',
  } as Record<EvidenceStrength, string>,
} as const;
