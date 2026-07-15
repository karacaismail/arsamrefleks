import { PageHeader } from '../../components/PageHeader';
import { ItemManager } from '../shared/ItemManager';
import { ItemKind } from '../../domain/enums';

// Resmî tatiller yıl bazlı veri kaynağıdır — koda sonsuz gömülmez, güncellenebilir.
const HOLIDAYS_2026 = [
  { date: '2026-01-01', name: 'Yılbaşı' },
  { date: '2026-04-23', name: 'Ulusal Egemenlik ve Çocuk Bayramı' },
  { date: '2026-05-01', name: 'Emek ve Dayanışma Günü' },
  { date: '2026-05-19', name: 'Atatürk’ü Anma, Gençlik ve Spor Bayramı' },
  { date: '2026-07-15', name: 'Demokrasi ve Millî Birlik Günü' },
  { date: '2026-08-30', name: 'Zafer Bayramı' },
  { date: '2026-10-29', name: 'Cumhuriyet Bayramı' },
];

export function IkWorkOrderPage() {
  return (
    <div className="section-gap">
      <PageHeader
        title="İK ve Çalışma Düzeni"
        desc="Resmî tatil takvimi, çalışma/çalışmama kararı, izin, yönetici izin protokolü, uzaktan çalışma, vekâlet, hoş geldin paketi ve fazla mesai."
        source="strategy içeriği · İK iş emirleri"
      />
      <div className="infobox">
        Resmî tatiller <b>yıl bazlı</b> bir veri kaynağıdır (koda sabit/sonsuz gömülmez). Yıl
        değiştikçe güncellenir. Aşağıda 2026 kaynağı gösterilir; ilave ücret ve onay kuralları için
        <b> Patron → Sorulacaklar</b> checklist’lerine bakın.
      </div>

      <div className="card">
        <h2>Resmî Tatil Takvimi — 2026 (güncellenebilir kaynak)</h2>
        <div className="tbl-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>Tarih</th>
                <th>Tatil</th>
                <th>Varsayılan Politika</th>
              </tr>
            </thead>
            <tbody>
              {HOLIDAYS_2026.map((h) => (
                <tr key={h.date}>
                  <td>{h.date.split('-').reverse().join('.')}</td>
                  <td>{h.name}</td>
                  <td>
                    <span className="badge g">Çalışılmaz (varsayılan)</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ItemManager kind={ItemKind.IK_WORK_ORDER} showFilters={['status', 'time', 'text']} />
    </div>
  );
}
