import { useMemo, useState } from 'react';
import { PageHeader } from '../../components/PageHeader';
import { ComplianceBadge } from '../../components/Badge';
import { useItems, itemsStore, convertQuestionToDecision } from '../../services/store';
import { byKind } from '../../services/selectors';
import { ItemKind, ComplianceLevel } from '../../domain/enums';
import type { AdminItem } from '../../domain/types';

function QuestionCard({ q }: { q: AdminItem }) {
  const [answer, setAnswer] = useState(q.answer ?? '');
  const [converted, setConverted] = useState(false);
  const prohibited = q.complianceLevel === ComplianceLevel.PROHIBITED;

  return (
    <div
      className="card"
      style={prohibited ? { borderLeft: '6px solid var(--bad)', background: '#fdf5f4' } : undefined}
    >
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <strong style={{ fontSize: '1.02rem' }}>{q.title}</strong>
        <ComplianceBadge c={q.complianceLevel} />
      </div>
      {q.description && <p className="m" style={{ color: 'var(--muted)', marginTop: 6 }}>{q.description}</p>}
      <div className="m" style={{ color: 'var(--muted)', fontSize: '.9rem', marginTop: 4 }}>
        {q.reason && <>Neden: {q.reason} · </>}
        {q.risk && <>Risk: {q.risk} · </>}
        {q.expectedAnswerType && <>Beklenen cevap: {q.expectedAnswerType}</>}
      </div>

      {prohibited ? (
        <div className="warnbox" role="alert" style={{ marginTop: 10 }}>
          Bu bir seçenek/optimizasyon değildir. <b>YASAK — uygulanmayacak.</b>{' '}
          {q.legalReference && <>Dayanak: {q.legalReference}.</>}
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', gap: 18, margin: '10px 0', flexWrap: 'wrap' }}>
            <label className="chk" style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <input
                type="checkbox"
                checked={!!q.asked}
                onChange={(e) => itemsStore.update(q.id, { asked: e.target.checked })}
              />
              Soruldu mu?
            </label>
            <label className="chk" style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <input
                type="checkbox"
                checked={!!q.answered}
                onChange={(e) => itemsStore.update(q.id, { answered: e.target.checked, checked: e.target.checked })}
              />
              Cevaplandı mı?
            </label>
          </div>
          <div className="field">
            <label htmlFor={`ans-${q.id}`}>Patronun cevabı</label>
            <textarea
              id={`ans-${q.id}`}
              value={answer}
              placeholder="Patronun cevabını buraya yazın…"
              onChange={(e) => setAnswer(e.target.value)}
              onBlur={() => itemsStore.update(q.id, { answer: answer || null })}
            />
          </div>
          <div className="field">
            <label htmlFor={`ev-${q.id}`}>Kanıt / belge</label>
            <input
              id={`ev-${q.id}`}
              defaultValue={q.evidence ?? ''}
              onBlur={(e) => itemsStore.update(q.id, { evidence: e.target.value || null })}
            />
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <button
              className="btn gold sm"
              onClick={() => {
                convertQuestionToDecision(q.id);
                setConverted(true);
              }}
            >
              Ortak karara dönüştür
            </button>
            {converted && <span className="badge g">Ortak karara eklendi ✓</span>}
          </div>
        </>
      )}
    </div>
  );
}

export function PatronQuestionsPage() {
  const items = useItems();
  const questions = useMemo(() => byKind(items, ItemKind.PATRON_QUESTION), [items]);
  const categories = useMemo(() => Array.from(new Set(questions.map((q) => q.category))), [questions]);

  return (
    <div className="section-gap">
      <PageHeader
        title="Patrona Sorulacaklar"
        desc="İşaretlenebilir checklist. Her soru: neden, risk, beklenen cevap, patronun cevabı, soruldu/cevaplandı, kanıt, takip ve ortak karara dönüştürme."
        source="strategy içeriği · PATRON_QUESTION (kalıcı: localStorage)"
      />
      <div className="warnbox">
        <b>Kayıt dışı ücret</b> maddesi bir optimizasyon yöntemi olarak sunulmaz;{' '}
        <b>PROHIBITED</b> (kırmızı uyum ihlali) olarak kodlanmıştır ve işaretlenemez.
      </div>
      {categories.map((cat) => (
        <div key={cat} className="section-gap">
          <h2 style={{ marginTop: 8 }}>{cat}</h2>
          {questions
            .filter((q) => q.category === cat)
            .map((q) => (
              <QuestionCard key={q.id} q={q} />
            ))}
        </div>
      ))}
    </div>
  );
}
