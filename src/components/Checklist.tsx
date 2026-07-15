import type { ReactNode } from 'react';
import type { AdminItem } from '../domain/types';
import { ComplianceLevel } from '../domain/enums';
import { ComplianceBadge } from './Badge';

interface Props {
  items: AdminItem[];
  onToggle: (id: string, checked: boolean) => void;
  renderMeta?: (i: AdminItem) => ReactNode;
  emptyText?: string;
}

export function Checklist({ items, onToggle, renderMeta, emptyText }: Props) {
  if (!items.length) return <div className="empty">{emptyText ?? 'Kayıt yok.'}</div>;
  return (
    <div>
      {items.map((i) => (
        <div
          key={i.id}
          className={`check ${i.checked ? 'done' : ''} ${
            i.complianceLevel === ComplianceLevel.PROHIBITED ? 'prohibited' : ''
          }`}
        >
          <input
            type="checkbox"
            checked={!!i.checked}
            disabled={i.complianceLevel === ComplianceLevel.PROHIBITED}
            onChange={(e) => onToggle(i.id, e.target.checked)}
            aria-label={i.title}
          />
          <div>
            <div className="t">{i.title}</div>
            {i.description && <div className="m">{i.description}</div>}
            {renderMeta ? <div className="m">{renderMeta(i)}</div> : null}
          </div>
          <div>
            <ComplianceBadge c={i.complianceLevel} />
          </div>
        </div>
      ))}
    </div>
  );
}
