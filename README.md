# ARSAM.NET — Yönetim, Karar ve Sorumluluk Admin Paneli

TypeScript + Vite + React + React Router + ECharts + TanStack Table + Zod ile geliştirilmiş,
route'lara ayrılmış gerçek bir admin uygulaması. Landing/sunum sitesi değildir.

## Çalıştırma
```bash
npm install
npm run dev        # geliştirme
npm run build      # üretim (dist/)
npm run typecheck  # tsc --noEmit (strict)
npm run lint       # eslint
npm run test       # vitest (18 kriter)
```

## Route'lar
`/dashboard`, `/timeline`, `/patron/konusulacaklar`, `/patron/sorulacaklar`,
`/patron/ortak-kararlar`, `/yonetici-operasyonlari`, `/sorumluluk-matrisi`,
`/finans-bordro`, `/ik-calisma-duzeni`, `/tedarik-dis-kaynak`.

Yönlendirme HashRouter iledir (GitHub Pages alt-yolunda derin bağlantılar sorunsuz çalışır).

## Mimari
- `src/domain` — enum + tipler + util
- `src/schemas` — Zod runtime doğrulama (MANAGER_ONLY patron onayı isteyemez; kayıt dışı ücret PROHIBITED)
- `src/repositories` — localStorage repository (arayüz arkasında; UI doğrudan storage kullanmaz)
- `src/services` — reaktif store + seçiciler + soru→karar dönüştürme
- `src/data` — `panelData.json` (Masterplan v16 JSON'undan türetilmiş kanonik veri) + seed
- `src/components`, `src/layouts`, `src/features/*`, `src/routes`

## Veri kanonikliği
Finansal sayılar `src/data/panelData.json` içindedir (koda gömülmez). Kaynak JSON tabloları elle
değiştirilmez; yeni türetilmiş veri generator (`_build_paneldata.py`) ile üretilir.

## Yayın (GitHub Pages)
`main` dalına her push'ta `.github/workflows/deploy.yml` derleyip Pages'e otomatik yayınlar.
Pages kaynağı: **GitHub Actions**.
