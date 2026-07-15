import { z } from 'zod';
import {
  RoleScope,
  TimeScope,
  Status,
  Priority,
  ComplianceLevel,
  SourceType,
  ItemKind,
} from '../domain/enums';

export const roleScopeSchema = z.nativeEnum(RoleScope);
export const timeScopeSchema = z.nativeEnum(TimeScope);
export const statusSchema = z.nativeEnum(Status);
export const prioritySchema = z.nativeEnum(Priority);
export const complianceSchema = z.nativeEnum(ComplianceLevel);
export const sourceTypeSchema = z.nativeEnum(SourceType);
export const itemKindSchema = z.nativeEnum(ItemKind);

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'yyyy-mm-dd bekleniyor');

export const adminItemSchema = z
  .object({
    id: z.string().min(1),
    kind: itemKindSchema,
    title: z.string().min(1),
    description: z.string(),
    category: z.string().min(1),
    roleScope: roleScopeSchema,
    timeScope: timeScopeSchema,
    owner: z.string(),
    accountableRole: roleScopeSchema,
    status: statusSchema,
    priority: prioritySchema,
    dueDate: isoDate.nullable(),
    requiresPatron: z.boolean(),
    requiresExternalExpert: z.boolean(),
    complianceLevel: complianceSchema,
    legalReference: z.string().nullable(),
    sourceType: sourceTypeSchema,
    sourceRef: z.string().nullable(),
    decision: z.string().nullable(),
    answer: z.string().nullable(),
    notes: z.string().nullable(),
    evidence: z.string().nullable(),
    createdAt: z.string(),
    updatedAt: z.string(),
    checked: z.boolean().optional(),
    asked: z.boolean().optional(),
    answered: z.boolean().optional(),
    reason: z.string().nullable().optional(),
    risk: z.string().nullable().optional(),
    expectedAnswerType: z.string().nullable().optional(),
    financialImpact: z.string().nullable().optional(),
    recommendation: z.string().nullable().optional(),
    patronAction: z.string().nullable().optional(),
    meetingDate: z.string().nullable().optional(),
  })
  .superRefine((val, ctx) => {
    // Domain kuralı: MANAGER_ONLY bir kayıt patron onayı isteyemez.
    if (val.roleScope === RoleScope.MANAGER_ONLY && val.requiresPatron) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['requiresPatron'],
        message: 'MANAGER_ONLY kayıt patron onayı gerektiremez (roleScope’u yükseltin).',
      });
    }
  });

export type AdminItemInput = z.infer<typeof adminItemSchema>;

export const jointDecisionSchema = z.object({
  id: z.string().min(1),
  decisionId: z.string().min(1),
  title: z.string().min(1),
  category: z.string().min(1),
  options: z.array(z.string()),
  managerRecommendation: z.string(),
  investorPosition: z.string(),
  financialImpact: z.string(),
  peopleImpact: z.string(),
  legalImpact: z.string(),
  deadline: isoDate.nullable(),
  decisionStatus: statusSchema,
  finalDecision: z.string().nullable(),
  decisionRationale: z.string().nullable(),
  evidence: z.string().nullable(),
  reviewDate: isoDate.nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type JointDecisionInput = z.infer<typeof jointDecisionSchema>;

export const adminItemArraySchema = z.array(adminItemSchema);
export const jointDecisionArraySchema = z.array(jointDecisionSchema);
