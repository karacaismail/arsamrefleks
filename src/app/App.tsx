import { Routes, Route, Navigate } from 'react-router-dom';
import { AdminLayout } from '../layouts/AdminLayout';
import { DashboardPage } from '../features/dashboard/DashboardPage';
import { TimelinePage } from '../features/timeline/TimelinePage';
import { PatronDiscussionsPage } from '../features/patron-discussions/PatronDiscussionsPage';
import { PatronQuestionsPage } from '../features/patron-questions/PatronQuestionsPage';
import { JointDecisionsPage } from '../features/joint-decisions/JointDecisionsPage';
import { ManagerOperationsPage } from '../features/manager-operations/ManagerOperationsPage';
import { ResponsibilitiesPage } from '../features/responsibilities/ResponsibilitiesPage';
import { FinancePayrollPage } from '../features/payroll-compliance/FinancePayrollPage';
import { IkWorkOrderPage } from '../features/holidays-leave/IkWorkOrderPage';
import { ProcurementPage } from '../features/procurement/ProcurementPage';

export function App() {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/timeline" element={<TimelinePage />} />
        <Route path="/patron/konusulacaklar" element={<PatronDiscussionsPage />} />
        <Route path="/patron/sorulacaklar" element={<PatronQuestionsPage />} />
        <Route path="/patron/ortak-kararlar" element={<JointDecisionsPage />} />
        <Route path="/yonetici-operasyonlari" element={<ManagerOperationsPage />} />
        <Route path="/sorumluluk-matrisi" element={<ResponsibilitiesPage />} />
        <Route path="/finans-bordro" element={<FinancePayrollPage />} />
        <Route path="/ik-calisma-duzeni" element={<IkWorkOrderPage />} />
        <Route path="/tedarik-dis-kaynak" element={<ProcurementPage />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
}
