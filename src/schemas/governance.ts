import { z } from 'zod';
import { roleScopeSchema } from './schemas';
import {
  GateStatus,
  GateEvidenceStatus,
  CriterionStatus,
  EvidenceType,
  EvidenceStrength,
  EvidenceVerification,
  RiskCategory,
  RiskStatus,
  LoopDecision,
  MappingType,
} from '../domain/governance';

export const gateStatusSchema = z.nativeEnum(GateStatus);
export const criterionStatusSchema = z.nativeEnum(CriterionStatus);
export const evidenceTypeSchema = z.nativeEnum(EvidenceType);
export const evidenceStrengthSchema = z.nativeEnum(EvidenceStrength);
export const riskCategorySchema = z.nativeEnum(RiskCategory);
export const riskStatusSchema = z.nativeEnum(RiskStatus);
export const loopDecisionSchema = z.nativeEnum(LoopDecision);
export const mappingTypeSchema = z.nativeEnum(MappingType);

export const governanceGateSchema = z.object({
  id: z.string().min(1),
  code: z.string().regex(/^G(1[0-2]|[0-9])$/, 'G0–G12 bekleniyor'),
  slug: z.string().min(1),
  order: z.number().int().min(0).max(12),
  title: z.string().min(1),
  purpose: z.string(),
  description: z.string(),
  status: gateStatusSchema,
  progress: z.number().min(0).max(100),
  evidenceStatus: z.nativeEnum(GateEvidenceStatus),
  ownerRole: roleScopeSchema,
  accountableRole: roleScopeSchema,
  approverRole: roleScopeSchema,
  startDate: z.string().nullable(),
  targetDate: z.string().nullable(),
  completedDate: z.string().nullable(),
  reviewDate: z.string().nullable(),
  prerequisiteGateIds: z.array(z.string()),
  nextGateIds: z.array(z.string()),
  blockingRiskIds: z.array(z.string()),
  questionIds: z.array(z.string()),
  deliverableIds: z.array(z.string()),
  criterionIds: z.array(z.string()),
  evidenceIds: z.array(z.string()),
  decisionIds: z.array(z.string()),
  legacyActionIds: z.array(z.string()),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const gateCriterionSchema = z.object({
  id: z.string(),
  gateId: z.string(),
  title: z.string().min(1),
  required: z.boolean(),
  status: criterionStatusSchema,
  evidenceId: z.string().nullable(),
  notes: z.string().nullable(),
});

export const evidenceRecordSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  type: evidenceTypeSchema,
  strength: evidenceStrengthSchema,
  source: z.string(),
  sourceDate: z.string().nullable(),
  collectedDate: z.string().nullable(),
  owner: z.string(),
  gateId: z.string().nullable(),
  criterionId: z.string().nullable(),
  supportsClaim: z.string().nullable(),
  refutesClaim: z.string().nullable(),
  validUntil: z.string().nullable(),
  ref: z.string().nullable(),
  verificationStatus: z.nativeEnum(EvidenceVerification),
});

export const governanceRiskSchema = z.object({
  id: z.string(),
  gateId: z.string().nullable(),
  category: riskCategorySchema,
  description: z.string().min(1),
  trigger: z.string().nullable(),
  probability: z.number().int().min(1).max(5),
  impact: z.number().int().min(1).max(5),
  score: z.number(),
  tolerance: z.string().nullable(),
  owner: z.string(),
  response: z.string().nullable(),
  reserve: z.string().nullable(),
  escalationRule: z.string().nullable(),
  status: riskStatusSchema,
  closureEvidenceId: z.string().nullable(),
  blocking: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const legacyActionSchema = z.object({
  id: z.string(),
  legacyId: z.string().regex(/^\d{2}$/),
  legacyOrder: z.number().int(),
  title: z.string().min(1),
  description: z.string(),
  tools: z.array(z.string()),
  mappedGateIds: z.array(z.string()),
  mappingType: mappingTypeSchema,
  notes: z.string().nullable(),
});

export const governanceGateArraySchema = z.array(governanceGateSchema);
export const governanceRiskArraySchema = z.array(governanceRiskSchema);
export const evidenceRecordArraySchema = z.array(evidenceRecordSchema);
