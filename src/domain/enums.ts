// Domain enums — tek kaynak. UI ve şemalar buradan türetilir.

export const RoleScope = {
  INVESTOR_OWNER: 'INVESTOR_OWNER',
  EXECUTIVE_MANAGER: 'EXECUTIVE_MANAGER',
  JOINT_DECISION: 'JOINT_DECISION',
  MANAGER_ONLY: 'MANAGER_ONLY',
  EXTERNAL_EXPERT: 'EXTERNAL_EXPERT',
} as const;
export type RoleScope = (typeof RoleScope)[keyof typeof RoleScope];

export const TimeScope = {
  PRE_MEETING: 'PRE_MEETING',
  FIRST_MEETING: 'FIRST_MEETING',
  DAY_0_30: 'DAY_0_30',
  DAY_31_60: 'DAY_31_60',
  DAY_61_90: 'DAY_61_90',
  MONTHLY: 'MONTHLY',
  QUARTERLY: 'QUARTERLY',
  YEARLY: 'YEARLY',
  FIXED_DATE: 'FIXED_DATE',
  ONGOING: 'ONGOING',
} as const;
export type TimeScope = (typeof TimeScope)[keyof typeof TimeScope];

export const Status = {
  NOT_STARTED: 'NOT_STARTED',
  WAITING_ANSWER: 'WAITING_ANSWER',
  WAITING_APPROVAL: 'WAITING_APPROVAL',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  IN_PROGRESS: 'IN_PROGRESS',
  BLOCKED: 'BLOCKED',
  COMPLETED: 'COMPLETED',
} as const;
export type Status = (typeof Status)[keyof typeof Status];

export const Priority = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL',
} as const;
export type Priority = (typeof Priority)[keyof typeof Priority];

export const ComplianceLevel = {
  NORMAL: 'NORMAL',
  REVIEW_REQUIRED: 'REVIEW_REQUIRED',
  LEGAL_EXPERT_REQUIRED: 'LEGAL_EXPERT_REQUIRED',
  NON_NEGOTIABLE: 'NON_NEGOTIABLE',
  PROHIBITED: 'PROHIBITED',
} as const;
export type ComplianceLevel = (typeof ComplianceLevel)[keyof typeof ComplianceLevel];

export const SourceType = {
  MANUAL: 'MANUAL',
  EXCEL_MODEL: 'EXCEL_MODEL',
  STRATEGY_CONTENT: 'STRATEGY_CONTENT',
  LEGAL_REQUIREMENT: 'LEGAL_REQUIREMENT',
  SAMPLE_DATA: 'SAMPLE_DATA',
} as const;
export type SourceType = (typeof SourceType)[keyof typeof SourceType];

export const ItemKind = {
  RESPONSIBILITY: 'RESPONSIBILITY',
  PATRON_DISCUSSION: 'PATRON_DISCUSSION',
  PATRON_QUESTION: 'PATRON_QUESTION',
  MANAGER_OPERATION: 'MANAGER_OPERATION',
  IK_WORK_ORDER: 'IK_WORK_ORDER',
  PROCUREMENT: 'PROCUREMENT',
  RISK: 'RISK',
} as const;
export type ItemKind = (typeof ItemKind)[keyof typeof ItemKind];

// Human-readable Turkish labels
export const LABELS = {
  role: {
    INVESTOR_OWNER: 'Patron / Yatırımcı',
    EXECUTIVE_MANAGER: 'Yönetici',
    JOINT_DECISION: 'Ortak Karar',
    MANAGER_ONLY: 'Yalnız Yönetici',
    EXTERNAL_EXPERT: 'Dış Uzman',
  } as Record<RoleScope, string>,
  time: {
    PRE_MEETING: 'Toplantı Öncesi',
    FIRST_MEETING: 'İlk Toplantı',
    DAY_0_30: '0–30 Gün',
    DAY_31_60: '31–60 Gün',
    DAY_61_90: '61–90 Gün',
    MONTHLY: 'Aylık',
    QUARTERLY: 'Çeyreklik',
    YEARLY: 'Yıllık',
    FIXED_DATE: 'Sabit Tarih',
    ONGOING: 'Sürekli',
  } as Record<TimeScope, string>,
  status: {
    NOT_STARTED: 'Başlamadı',
    WAITING_ANSWER: 'Cevap Bekliyor',
    WAITING_APPROVAL: 'Onay Bekliyor',
    APPROVED: 'Onaylandı',
    REJECTED: 'Reddedildi',
    IN_PROGRESS: 'Devam Ediyor',
    BLOCKED: 'Bloke',
    COMPLETED: 'Tamamlandı',
  } as Record<Status, string>,
  priority: {
    LOW: 'Düşük',
    MEDIUM: 'Orta',
    HIGH: 'Yüksek',
    CRITICAL: 'Kritik',
  } as Record<Priority, string>,
  compliance: {
    NORMAL: 'Normal',
    REVIEW_REQUIRED: 'İnceleme Gerekli',
    LEGAL_EXPERT_REQUIRED: 'Hukuk/Mali Müşavir Gerekli',
    NON_NEGOTIABLE: 'Pazarlıksız',
    PROHIBITED: 'YASAK — Uyum İhlali',
  } as Record<ComplianceLevel, string>,
} as const;

export const OPEN_STATUSES: Status[] = [
  Status.NOT_STARTED,
  Status.WAITING_ANSWER,
  Status.WAITING_APPROVAL,
  Status.IN_PROGRESS,
  Status.BLOCKED,
];
