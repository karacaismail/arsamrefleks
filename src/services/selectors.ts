import type { AdminItem, JointDecision } from '../domain/types';
import {
  ItemKind,
  RoleScope,
  Status,
  ComplianceLevel,
  TimeScope,
  Priority,
  OPEN_STATUSES,
} from '../domain/enums';
import { isOverdue } from '../domain/util';

export interface ItemFilter {
  kind?: ItemKind;
  role?: RoleScope | 'ALL';
  status?: Status | 'ALL';
  timeScope?: TimeScope | 'ALL';
  priority?: Priority | 'ALL';
  requiresPatron?: boolean;
  overdueOnly?: boolean;
  category?: string | 'ALL';
  text?: string;
}

const isCompleted = (i: AdminItem): boolean =>
  i.status === Status.COMPLETED || i.status === Status.APPROVED || i.checked === true;

export function byKind(items: AdminItem[], kind: ItemKind): AdminItem[] {
  return items.filter((i) => i.kind === kind);
}

export function overdueItems(items: AdminItem[]): AdminItem[] {
  return items.filter((i) => isOverdue(i.dueDate, isCompleted(i)));
}

export function applyFilter(items: AdminItem[], f: ItemFilter): AdminItem[] {
  return items.filter((i) => {
    if (f.kind && i.kind !== f.kind) return false;
    if (f.role && f.role !== 'ALL' && i.roleScope !== f.role) return false;
    if (f.status && f.status !== 'ALL' && i.status !== f.status) return false;
    if (f.timeScope && f.timeScope !== 'ALL' && i.timeScope !== f.timeScope) return false;
    if (f.priority && f.priority !== 'ALL' && i.priority !== f.priority) return false;
    if (f.category && f.category !== 'ALL' && i.category !== f.category) return false;
    if (f.requiresPatron != null && i.requiresPatron !== f.requiresPatron) return false;
    if (f.overdueOnly && !isOverdue(i.dueDate, isCompleted(i))) return false;
    if (f.text) {
      const t = f.text.toLocaleLowerCase('tr');
      const hay = `${i.title} ${i.description} ${i.category}`.toLocaleLowerCase('tr');
      if (!hay.includes(t)) return false;
    }
    return true;
  });
}

export interface DashboardSummary {
  waitingPatronAnswers: number;
  waitingJointDecisions: number;
  overdueManagerWork: number;
  redComplianceRisks: number;
  upcomingDeadlines: AdminItem[];
  progress90: { total: number; done: number; pct: number };
  openByRole: Record<RoleScope, number>;
  prohibited: AdminItem[];
}

export function dashboardSummary(
  items: AdminItem[],
  decisions: JointDecision[],
): DashboardSummary {
  const waitingPatronAnswers = items.filter(
    (i) => i.kind === ItemKind.PATRON_QUESTION && i.requiresPatron && i.answered !== true,
  ).length;

  const waitingJointDecisions = decisions.filter(
    (d) => d.decisionStatus === Status.WAITING_APPROVAL || d.decisionStatus === Status.WAITING_ANSWER,
  ).length;

  const overdueManagerWork = items.filter(
    (i) =>
      (i.kind === ItemKind.MANAGER_OPERATION || i.kind === ItemKind.IK_WORK_ORDER) &&
      isOverdue(i.dueDate, isCompleted(i)),
  ).length;

  const redComplianceRisks = items.filter(
    (i) =>
      i.complianceLevel === ComplianceLevel.PROHIBITED ||
      i.complianceLevel === ComplianceLevel.LEGAL_EXPERT_REQUIRED,
  ).length;

  const phases: TimeScope[] = [TimeScope.DAY_0_30, TimeScope.DAY_31_60, TimeScope.DAY_61_90];
  const ninety = items.filter((i) => phases.includes(i.timeScope));
  const done = ninety.filter(isCompleted).length;
  const progress90 = {
    total: ninety.length,
    done,
    pct: ninety.length ? Math.round((done / ninety.length) * 100) : 0,
  };

  const upcomingDeadlines = items
    .filter((i) => i.dueDate && OPEN_STATUSES.includes(i.status))
    .sort((a, b) => (a.dueDate! < b.dueDate! ? -1 : 1))
    .slice(0, 8);

  const openByRole = Object.values(RoleScope).reduce(
    (acc, r) => {
      acc[r] = items.filter((i) => i.roleScope === r && OPEN_STATUSES.includes(i.status)).length;
      return acc;
    },
    {} as Record<RoleScope, number>,
  );

  const prohibited = items.filter((i) => i.complianceLevel === ComplianceLevel.PROHIBITED);

  return {
    waitingPatronAnswers,
    waitingJointDecisions,
    overdueManagerWork,
    redComplianceRisks,
    upcomingDeadlines,
    progress90,
    openByRole,
    prohibited,
  };
}

/** Sorumluluk matrisi tutarlılık kontrolü: sahipsiz veya çakışan accountable. */
export function responsibilityWarnings(items: AdminItem[]): string[] {
  const out: string[] = [];
  const resp = byKind(items, ItemKind.RESPONSIBILITY);
  for (const r of resp) {
    if (!r.accountableRole) out.push(`Sahipsiz sorumluluk: ${r.title}`);
    if (r.roleScope === RoleScope.MANAGER_ONLY && r.requiresPatron)
      out.push(`Çakışma (MANAGER_ONLY + patron onayı): ${r.title}`);
  }
  return out;
}
