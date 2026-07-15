import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { ItemDrawer } from '../components/ItemDrawer';
import { exampleContent, fieldHint } from '../features/shared/fieldGuidance';
import { ItemKind, RoleScope, TimeScope, Status, Priority, ComplianceLevel, SourceType } from '../domain/enums';
import type { AdminItem } from '../domain/types';

const sample: AdminItem = {
  id: 'x1', kind: ItemKind.IK_WORK_ORDER, title: 'Şirketin çalışma/çalışmama kararı',
  description: '', category: 'İK / Çalışma Düzeni', roleScope: RoleScope.EXECUTIVE_MANAGER,
  timeScope: TimeScope.DAY_31_60, owner: 'Yönetici', accountableRole: RoleScope.EXECUTIVE_MANAGER,
  status: Status.NOT_STARTED, priority: Priority.MEDIUM, dueDate: '2026-07-15', requiresPatron: false,
  requiresExternalExpert: false, complianceLevel: ComplianceLevel.NORMAL, legalReference: null,
  sourceType: SourceType.STRATEGY_CONTENT, sourceRef: null, decision: null, answer: null, notes: null,
  evidence: null, createdAt: '', updatedAt: '',
};

afterEach(() => cleanup());

describe('Form yönergeleri ve örnek içerik', () => {
  it('exampleContent tüm alanlar için dolu örnek üretir', () => {
    const ex = exampleContent(sample);
    expect(ex.description.length).toBeGreaterThan(10);
    expect(ex.answer.length).toBeGreaterThan(10);
    expect(ex.notes.length).toBeGreaterThan(5);
    expect(ex.evidence.length).toBeGreaterThan(3);
  });

  it('fieldHint bilinen alanlar için ipucu döner', () => {
    expect(fieldHint('answer').length).toBeGreaterThan(5);
    expect(fieldHint('evidence').length).toBeGreaterThan(5);
  });

  it('drawer yönerge kutusu + placeholder + Örnek doldur içerir; buton alanları doldurur', () => {
    render(<ItemDrawer item={sample} onClose={() => {}} onSave={() => {}} />);
    // yönerge kutusu
    expect(screen.getByText(/ne yazmal/i)).toBeInTheDocument();
    // açıklama placeholder
    const desc = document.getElementById('f-desc') as HTMLTextAreaElement;
    expect(desc.getAttribute('placeholder')?.length ?? 0).toBeGreaterThan(10);
    // örnek doldur butonu doldurur
    expect((document.getElementById('f-desc') as HTMLTextAreaElement).value).toBe('');
    fireEvent.click(screen.getByText(/Örnek doldur/i));
    expect((document.getElementById('f-desc') as HTMLTextAreaElement).value.length).toBeGreaterThan(10);
    expect((document.getElementById('f-answer') as HTMLTextAreaElement).value.length).toBeGreaterThan(10);
  });
});
