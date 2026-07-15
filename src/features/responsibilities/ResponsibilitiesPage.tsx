import { PageHeader } from '../../components/PageHeader';
import { ItemManager } from '../shared/ItemManager';
import { ItemKind } from '../../domain/enums';
import { useItems } from '../../services/store';
import { responsibilityWarnings } from '../../services/selectors';

export function ResponsibilitiesPage() {
  const items = useItems();
  const warnings = responsibilityWarnings(items);

  return (
    <div className="section-gap">
      <PageHeader
        title="Sorumluluk Matrisi (RACI)"
        desc="Her sorumluluğun tek bir nihai sorumlusu (accountable) olur. Sahipsiz ve çakışan kayıtlar uyarı üretir."
        source="strategy içeriği · sorumluluk seed"
      />
      <div className="infobox">
        <b>Sütunlar:</b> Patron/Yatırımcı · Yönetici · Ortak Karar · Dış Uzman · Bilgilendirilecek.
        “Rol” sütunu nihai sorumluyu (accountable) gösterir — RACI’de her satırda tek A olur.
      </div>
      {warnings.length > 0 ? (
        <div className="warnbox" role="alert">
          <b>Tutarlılık uyarıları:</b>
          <ul style={{ margin: '6px 0 0 18px' }}>
            {warnings.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="infobox">Çakışma/sahipsiz kayıt yok — her sorumluluğun tek accountable sahibi var.</div>
      )}
      <ItemManager kind={ItemKind.RESPONSIBILITY} showFilters={['role', 'status', 'time', 'text']} />
    </div>
  );
}
