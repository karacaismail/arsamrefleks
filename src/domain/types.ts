import type {
  RoleScope,
  TimeScope,
  Status,
  Priority,
  ComplianceLevel,
  SourceType,
  ItemKind,
} from './enums';

/** Ortak yönetim kaydı — tüm sorumluluk/soru/tartışma/operasyon kayıtları. */
export interface AdminItem {
  id: string;
  kind: ItemKind;
  title: string;
  description: string;
  category: string;
  roleScope: RoleScope;
  timeScope: TimeScope;
  owner: string;
  accountableRole: RoleScope;
  status: Status;
  priority: Priority;
  dueDate: string | null; // ISO yyyy-mm-dd
  requiresPatron: boolean;
  requiresExternalExpert: boolean;
  complianceLevel: ComplianceLevel;
  legalReference: string | null;
  sourceType: SourceType;
  sourceRef: string | null;
  decision: string | null;
  answer: string | null;
  notes: string | null;
  evidence: string | null;
  createdAt: string;
  updatedAt: string;

  // İsteğe bağlı — sayfaya özgü alanlar
  checked?: boolean; // checklist
  asked?: boolean; // patron sorusu soruldu mu
  answered?: boolean; // cevaplandı mı
  reason?: string | null; // neden konuşuluyor / neden soruluyor
  risk?: string | null;
  expectedAnswerType?: string | null;
  financialImpact?: string | null;
  recommendation?: string | null;
  patronAction?: string | null;
  meetingDate?: string | null;
}

/** Ortak karar kaydı — /patron/ortak-kararlar */
export interface JointDecision {
  id: string;
  decisionId: string;
  title: string;
  category: string;
  options: string[];
  managerRecommendation: string;
  investorPosition: string;
  financialImpact: string;
  peopleImpact: string;
  legalImpact: string;
  deadline: string | null;
  decisionStatus: Status;
  finalDecision: string | null;
  decisionRationale: string | null;
  evidence: string | null;
  reviewDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export type AnyRecord = AdminItem | JointDecision;
