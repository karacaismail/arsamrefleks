import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, cleanup, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import axe from 'axe-core';
import { App } from '../app/App';

// ECharts jsdom'da canvas gerektirir -> testte stub'la
vi.mock('echarts', () => ({
  init: () => ({ setOption() {}, resize() {}, dispose() {}, on() {} }),
  graphic: { clipRectByRect: () => ({}) },
}));

const ROUTES: Array<[string, RegExp]> = [
  ['/dashboard', /Dashboard/],
  ['/timeline', /Zaman Çizelgesi/],
  ['/patron/konusulacaklar', /Konuşulacaklar/],
  ['/patron/sorulacaklar', /Sorulacaklar/],
  ['/patron/ortak-kararlar', /Ortak Kararlar/],
  ['/yonetici-operasyonlari', /Yönetici Operasyonları/],
  ['/sorumluluk-matrisi', /Sorumluluk Matrisi/],
  ['/finans-bordro', /Finans & Bordro/],
  ['/ik-calisma-duzeni', /Çalışma Düzeni/],
  ['/tedarik-dis-kaynak', /Tedarik & Dış Kaynak/],
];

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
}

afterEach(() => cleanup());

describe('Routing & yapı', () => {
  // 1) Zorunlu route'lar açılıyor
  it('1. tüm zorunlu route’lar başlıkla açılıyor', () => {
    for (const [path, title] of ROUTES) {
      const { unmount } = renderAt(path);
      const h1 = screen.getByRole('heading', { level: 1 });
      expect(h1.textContent ?? '').toMatch(title);
      unmount();
    }
  });

  // 3) Her ana sayfada tablo veya işlevsel kayıt listesi
  it('3. her sayfada tablo / checklist / filtre var (işlevsel)', () => {
    for (const [path] of ROUTES) {
      const { container, unmount } = renderAt(path);
      const functional = container.querySelector('table.data, .check, .filterbar, .kpi, [role="search"], input[type="checkbox"], textarea');
      expect(functional, `işlevsel öğe yok: ${path}`).toBeTruthy();
      unmount();
    }
  });

  // 2) Dashboard dışı sayfalar landing/hero yapısına dönüşmüyor
  it('2. landing/hero yapısı yok, işlevsel admin yapısı var', () => {
    for (const [path] of ROUTES.filter(([p]) => p !== '/dashboard')) {
      const { container, unmount } = renderAt(path);
      expect(container.querySelector('[class*="hero"]')).toBeNull();
      expect(container.textContent ?? '').not.toMatch(/Nereye gidiyoruz/i);
      const hasData = container.querySelector('table.data, .check, .filterbar, .card');
      expect(hasData, `veri/işlem yapısı yok: ${path}`).toBeTruthy();
      unmount();
    }
  });

  it('sidebar 10 route linki içeriyor', () => {
    renderAt('/dashboard');
    const nav = screen.getByRole('navigation', { name: /Ana menü/i });
    const links = within(nav).getAllByRole('link');
    expect(links.length).toBe(10);
  });

  // 18) Kritik erişilebilirlik testi
  it('18. dashboard kritik erişilebilirlik ihlali içermiyor', async () => {
    const { container } = renderAt('/dashboard');
    const results = await axe.run(container, {
      rules: { 'color-contrast': { enabled: false }, region: { enabled: false } },
    });
    const critical = results.violations.filter((v) => v.impact === 'critical');
    expect(critical.map((v) => v.id)).toEqual([]);
  });
});
