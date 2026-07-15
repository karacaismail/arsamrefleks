import { PageHeader } from '../../components/PageHeader';
import { ItemManager } from '../shared/ItemManager';
import { ItemKind } from '../../domain/enums';

export function ManagerOperationsPage() {
  return (
    <div className="section-gap">
      <PageHeader
        title="Yönetici Operasyonları"
        desc="Patronu günlük olarak ilgilendirmeyen süreçler yalnız burada yönetilir."
        source="strategy içeriği · MANAGER_ONLY kayıtlar"
      />
      <div className="infobox">
        Bu sayfadaki kayıtlar yalnız yöneticinin alanıdır (MANAGER_ONLY). Bir kayıt patron onayı
        gerektiriyorsa rolü yükseltin — sistem <b>MANAGER_ONLY + patron onayı</b> kombinasyonunu Zod
        domain doğrulaması ile engeller.
      </div>
      <ItemManager
        kind={ItemKind.MANAGER_OPERATION}
        showFilters={['status', 'time', 'priority', 'overdue', 'text']}
      />
    </div>
  );
}
