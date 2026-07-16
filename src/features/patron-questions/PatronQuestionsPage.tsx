import { useMemo, useState } from 'react';
import { PageHeader } from '../../components/PageHeader';
import { ComplianceBadge } from '../../components/Badge';
import { useItems, itemsStore, convertQuestionToDecision } from '../../services/store';
import { byKind } from '../../services/selectors';
import { ItemKind, ComplianceLevel } from '../../domain/enums';
import type { AdminItem } from '../../domain/types';
import { exampleContent, fieldHint } from '../shared/fieldGuidance';

function QuestionCard({ q }: { q: AdminItem }) {
  const [answer, setAnswer] = useState(q.answer ?? '');
  const [evidence, setEvidence] = useState(q.evidence ?? '');
  const [converted, setConverted] = useState(false);
  const prohibited = q.complianceLevel === ComplianceLevel.PROHIBITED;
  const ex = exampleContent(q);

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
            <span className="fhint">{fieldHint('answer')}</span>
            <textarea
              id={`ans-${q.id}`}
              value={answer}
              placeholder={ex.answer}
              onChange={(e) => setAnswer(e.target.value)}
              onBlur={() => itemsStore.update(q.id, { answer: answer || null })}
            />
          </div>
          <div className="field">
            <label htmlFor={`ev-${q.id}`}>Kanıt / belge</label>
            <span className="fhint">{fieldHint('evidence')}</span>
            <input
              id={`ev-${q.id}`}
              value={evidence}
              placeholder={ex.evidence}
              onChange={(e) => setEvidence(e.target.value)}
              onBlur={() => itemsStore.update(q.id, { evidence: evidence || null })}
            />
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              className="btn sm"
              onClick={() => {
                const na = answer || ex.answer;
                const ne = evidence || ex.evidence;
                setAnswer(na);
                setEvidence(ne);
                itemsStore.update(q.id, { answer: na, evidence: ne });
              }}
            >
              Örnek doldur
            </button>
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
      <div className="infobox">
        <b>Ne yazmalıyım?</b> Her soru için: <b>Soruldu/Cevaplandı</b>’yı işaretle, <b>Patronun cevabı</b>nı
        yaz, <b>Kanıt</b> ekle; gerekirse <b>Ortak karara dönüştür</b>. Emin değilsen ilgili kartta{' '}
        <b>Örnek doldur</b>’a bas — kategoriye uygun taslağı koyar, düzenlersin.
      </div>
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
