import { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { NAV, GROUPS } from '../routes/config';
import { useItems, useDecisions } from '../services/store';
import { dashboardSummary } from '../services/selectors';

export function AdminLayout() {
  const [open, setOpen] = useState(false);
  const loc = useLocation();
  const items = useItems();
  const decisions = useDecisions();
  const sum = dashboardSummary(items, decisions);

  const counts: Record<string, { n: number; bad?: boolean }> = {
    '/dashboard': { n: sum.redComplianceRisks, bad: true },
    '/patron/sorulacaklar': { n: sum.waitingPatronAnswers },
    '/patron/ortak-kararlar': { n: sum.waitingJointDecisions },
    '/yonetici-operasyonlari': { n: sum.overdueManagerWork, bad: sum.overdueManagerWork > 0 },
  };

  const active = NAV.find((n) => loc.pathname.startsWith(n.path));

  return (
    <div className="shell">
      <nav className={`sidebar ${open ? 'open' : ''}`} aria-label="Ana menü">
        <div className="brand">
          ARSAM<span className="dot">.</span>NET <span style={{ fontWeight: 400, fontSize: '.8rem' }}>Admin</span>
        </div>
        {GROUPS.map((g) => (
          <div key={g}>
            <div className="grp">{g}</div>
            {NAV.filter((n) => n.group === g).map((n) => (
              <NavLink
                key={n.path}
                to={n.path}
                className={({ isActive }) => (isActive ? 'active' : '')}
                onClick={() => setOpen(false)}
              >
                {n.label}
                {counts[n.path] && counts[n.path].n > 0 && (
                  <span className={`cnt ${counts[n.path].bad ? 'bad' : ''}`}>{counts[n.path].n}</span>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      <div className={`backdrop ${open ? 'show' : ''}`} onClick={() => setOpen(false)} />

      <div className="main">
        <div className="topbar">
          <button className="menu" aria-label="Menü" onClick={() => setOpen((o) => !o)}>
            ☰
          </button>
          <nav className="crumb" aria-label="Breadcrumb">
            <span>{active?.group ?? 'Genel'}</span> / <b>{active?.label ?? 'Dashboard'}</b>
          </nav>
          <div className="spacer" />
          <span className="pill-user">Yönetici görünümü</span>
        </div>
        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
