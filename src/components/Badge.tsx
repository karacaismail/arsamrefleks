import { LABELS, Status, ComplianceLevel, RoleScope, Priority } from '../domain/enums';

export function StatusBadge({ s }: { s: Status }) {
  const cls =
    s === Status.COMPLETED || s === Status.APPROVED
      ? 'g'
      : s === Status.REJECTED || s === Status.BLOCKED
        ? 'b'
        : s === Status.IN_PROGRESS
          ? 'n'
          : 's';
  return <span className={`badge ${cls}`}>{LABELS.status[s]}</span>;
}

export function ComplianceBadge({ c }: { c: ComplianceLevel }) {
  if (c === ComplianceLevel.PROHIBITED)
    return <span className="badge prohibited">{LABELS.compliance[c]}</span>;
  if (c === ComplianceLevel.LEGAL_EXPERT_REQUIRED)
    return <span className="badge legal">{LABELS.compliance[c]}</span>;
  const cls =
    c === ComplianceLevel.NON_NEGOTIABLE ? 'b' : c === ComplianceLevel.REVIEW_REQUIRED ? 'y' : 's';
  return <span className={`badge ${cls}`}>{LABELS.compliance[c]}</span>;
}

const ROLE_COLOR: Record<RoleScope, string> = {
  INVESTOR_OWNER: '#c0392b',
  EXECUTIVE_MANAGER: '#1f8a5b',
  JOINT_DECISION: '#c8992f',
  MANAGER_ONLY: '#1f8a8a',
  EXTERNAL_EXPERT: '#7d3ca5',
};

export function RoleBadge({ r }: { r: RoleScope }) {
  return (
    <span className="badge s">
      <span className="dot" style={{ background: ROLE_COLOR[r] }} />
      {LABELS.role[r]}
    </span>
  );
}

export function roleColor(r: RoleScope): string {
  return ROLE_COLOR[r];
}

export function PriorityBadge({ p }: { p: Priority }) {
  const cls = p === Priority.CRITICAL ? 'b' : p === Priority.HIGH ? 'y' : 's';
  return <span className={`badge ${cls}`}>{LABELS.priority[p]}</span>;
}
