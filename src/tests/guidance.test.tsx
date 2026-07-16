import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
vi.mock('echarts', () => ({
  init: () => ({ setOption() {}, resize() {}, dispose() {}, on() {} }),
  graphic: { clipRectByRect: () => ({}) },
}));
import { App } from '../app/App';
import { decisionExample, decisionHint } from '../features/shared/fieldGuidance';
import { seedDecisions } from '../data/seed';

afterEach(() => cleanup());

describe('Yönerge her yerde', () => {
  it('decisionExample + decisionHint dolu', () => {
    const ex = decisionExample(seedDecisions()[0]);
    expect(ex.managerRecommendation.length).toBeGreaterThan(8);
    expect(ex.finalDecision.length).toBeGreaterThan(8);
    expect(ex.rationale.length).toBeGreaterThan(8);
    expect(decisionHint('finalDecision').length).toBeGreaterThan(5);
  });

  it('Sorulacaklar sayfasında yönerge + placeholder + Örnek doldur', () => {
    render(<MemoryRouter initialEntries={['/patron/sorulacaklar']}><App /></MemoryRouter>);
    expect(screen.getAllByText(/Örnek doldur/i).length).toBeGreaterThan(0);
    const areas = Array.from(document.querySelectorAll('textarea'));
    expect(areas.some((a) => (a.getAttribute('placeholder')?.length ?? 0) > 10)).toBe(true);
  });

  it('Ortak Kararlar drawer’ında yönerge + Örnek doldur', () => {
    render(<MemoryRouter initialEntries={['/patron/ortak-kararlar']}><App /></MemoryRouter>);
    fireEvent.click(screen.getAllByText(/Karar Ver/i)[0]);
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText(/ne yazmal/i)).toBeInTheDocument();
    expect(within(dialog).getByText(/Örnek doldur/i)).toBeInTheDocument();
  });
});
