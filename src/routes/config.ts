export interface NavEntry {
  path: string;
  label: string;
  group: string;
}

export const NAV: NavEntry[] = [
  { path: '/dashboard', label: 'Dashboard', group: 'Genel' },
  { path: '/timeline', label: 'Zaman Çizelgesi', group: 'Genel' },
  { path: '/patron/konusulacaklar', label: 'Konuşulacaklar', group: 'Patron' },
  { path: '/patron/sorulacaklar', label: 'Sorulacaklar', group: 'Patron' },
  { path: '/patron/ortak-kararlar', label: 'Ortak Kararlar', group: 'Patron' },
  { path: '/yonetici-operasyonlari', label: 'Yönetici Operasyonları', group: 'Yönetim' },
  { path: '/sorumluluk-matrisi', label: 'Sorumluluk Matrisi', group: 'Yönetim' },
  { path: '/finans-bordro', label: 'Finans & Bordro', group: 'Uyum & Finans' },
  { path: '/ik-calisma-duzeni', label: 'İK Çalışma Düzeni', group: 'Uyum & Finans' },
  { path: '/tedarik-dis-kaynak', label: 'Tedarik & Dış Kaynak', group: 'Uyum & Finans' },
];

export const GROUPS = ['Genel', 'Patron', 'Yönetim', 'Uyum & Finans'];
