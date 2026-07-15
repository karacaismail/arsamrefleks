import { useState } from 'react';
import type { AdminItem } from '../domain/types';
import {
  LABELS,
  RoleScope,
  Status,
  Priority,
  ComplianceLevel,
  TimeScope,
} from '../domain/enums';
import { fieldHint, exampleContent } from '../features/shared/fieldGuidance';

interface Props {
  item: AdminItem;
  onClose: () => void;
  onSave: (patch: Partial<AdminItem>) => void;
}

export function ItemDrawer({ item, onClose, onSave }: Props) {
  const [draft, setDraft] = useState<AdminItem>({ ...item });
  const set = <K extends keyof AdminItem>(k: K, v: AdminItem[K]) =>
    setDraft((d) => ({ ...d, [k]: v }));

  const ex = exampleContent(item);
  const fillExample = () =>
    setDraft((d) => ({
      ...d,
      description: d.description || ex.description,
      answer: d.answer || ex.answer,
      notes: d.notes || ex.notes,
      evidence: d.evidence || ex.evidence,
    }));

  const managerConflict = draft.roleScope === RoleScope.MANAGER_ONLY && draft.requiresPatron;

  return (
    <div className="overlay" onClick={onClose}>
      <div
        className="drawer"
        role="dialog"
        aria-modal="true"
        aria-label={`Düzenle: ${item.title}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="close" onClick={onClose} aria-label="Kapat">
          ×
        </button>
        <h2>Kayıt Düzenle</h2>
        <p className="desc" style={{ color: 'var(--muted)' }}>
          {LABELS.role[item.roleScope]} · {item.category}
        </p>

        <div className="infobox" style={{ marginTop: 8 }}>
          <b>Ne yazmalıyım?</b> Bu kaydın kararını, sahibini, son tarihini ve kanıtını girin. Emin
          değilseniz{' '}
          <button type="button" className="btn gold sm" onClick={fillExample}>
            Örnek doldur
          </button>{' '}
          — kategoriye uygun taslağı yerleştirir; düzenleyip kaydedersiniz.
        </div>

        {managerConflict && (
          <div className="warnbox" role="alert">
            MANAGER_ONLY bir kayıt patron onayı gerektiremez. Rolü yükseltin ya da “Patron Onayı”nı
            kaldırın.
          </div>
        )}

        <div className="field">
          <label htmlFor="f-title">Başlık</label>
          <input id="f-title" value={draft.title} onChange={(e) => set('title', e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="f-desc">Açıklama</label>
          <span className="fhint">{fieldHint('description')}</span>
          <textarea
            id="f-desc"
            value={draft.description}
            placeholder={ex.description}
            onChange={(e) => set('description', e.target.value)}
          />
        </div>
        <div className="row">
          <div className="field">
            <label htmlFor="f-owner">Sahip</label>
            <input id="f-owner" value={draft.owner} onChange={(e) => set('owner', e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="f-due">Son Tarih</label>
            <input
              id="f-due"
              type="date"
              value={draft.dueDate ?? ''}
              onChange={(e) => set('dueDate', e.target.value || null)}
            />
          </div>
        </div>
        <div className="row">
          <div className="field">
            <label htmlFor="f-role">Rol Kapsamı</label>
            <select
              id="f-role"
              value={draft.roleScope}
              onChange={(e) => set('roleScope', e.target.value as RoleScope)}
            >
              {Object.values(RoleScope).map((r) => (
                <option key={r} value={r}>
                  {LABELS.role[r]}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="f-acc">Nihai Sorumlu</label>
            <select
              id="f-acc"
              value={draft.accountableRole}
              onChange={(e) => set('accountableRole', e.target.value as RoleScope)}
            >
              {Object.values(RoleScope).map((r) => (
                <option key={r} value={r}>
                  {LABELS.role[r]}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="row">
          <div className="field">
            <label htmlFor="f-status">Durum</label>
            <select
              id="f-status"
              value={draft.status}
              onChange={(e) => set('status', e.target.value as Status)}
            >
              {Object.values(Status).map((s) => (
                <option key={s} value={s}>
                  {LABELS.status[s]}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="f-prio">Öncelik</label>
            <select
              id="f-prio"
              value={draft.priority}
              onChange={(e) => set('priority', e.target.value as Priority)}
            >
              {Object.values(Priority).map((p) => (
                <option key={p} value={p}>
                  {LABELS.priority[p]}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="row">
          <div className="field">
            <label htmlFor="f-time">Zaman Dönemi</label>
            <select
              id="f-time"
              value={draft.timeScope}
              onChange={(e) => set('timeScope', e.target.value as TimeScope)}
            >
              {Object.values(TimeScope).map((t) => (
                <option key={t} value={t}>
                  {LABELS.time[t]}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="f-comp">Uyum Seviyesi</label>
            <select
              id="f-comp"
              value={draft.complianceLevel}
              onChange={(e) => set('complianceLevel', e.target.value as ComplianceLevel)}
            >
              {Object.values(ComplianceLevel).map((c) => (
                <option key={c} value={c}>
                  {LABELS.compliance[c]}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="field">
          <label className="chk" style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
            <input
              type="checkbox"
              checked={draft.requiresPatron}
              onChange={(e) => set('requiresPatron', e.target.checked)}
            />
            Patron onayı gerekiyor
          </label>
        </div>
        <div className="field">
          <label htmlFor="f-answer">Cevap / Karar</label>
          <span className="fhint">{fieldHint('answer')}</span>
          <textarea
            id="f-answer"
            value={draft.answer ?? ''}
            placeholder={ex.answer}
            onChange={(e) => set('answer', e.target.value || null)}
          />
        </div>
        <div className="field">
          <label htmlFor="f-notes">Not</label>
          <span className="fhint">{fieldHint('notes')}</span>
          <textarea
            id="f-notes"
            value={draft.notes ?? ''}
            placeholder={ex.notes}
            onChange={(e) => set('notes', e.target.value || null)}
          />
        </div>
        <div className="field">
          <label htmlFor="f-ev">Kanıt / Belge</label>
          <span className="fhint">{fieldHint('evidence')}</span>
          <input
            id="f-ev"
            value={draft.evidence ?? ''}
            placeholder={ex.evidence}
            onChange={(e) => set('evidence', e.target.value || null)}
          />
        </div>

        <div className="foot">
          <button
            className="btn primary"
            disabled={managerConflict}
            onClick={() => onSave(draft)}
          >
            Kaydet
          </button>
          <button className="btn" onClick={onClose}>
            İptal
          </button>
        </div>
      </div>
    </div>
  );
}
