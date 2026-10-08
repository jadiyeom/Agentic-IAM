import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, NavLink, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Identities } from './pages/Identities';
import { ExplainAudit } from './pages/ExplainAudit';
import { SystemMetrics } from './pages/SystemMetrics';
import { Landing } from './pages/Landing';
import { Claude } from './pages/Claude';
import { Security } from './pages/Security';
import { Company } from './pages/Company';
import { DemoIntro } from './pages/DemoIntro';
import { Privacy } from './pages/Privacy';
import { Terms } from './pages/Terms';
import Entitlements from './pages/Entitlements';
import { ArrowLeft, Boxes, FileSearch, Users, Activity, LogOut } from 'lucide-react';

function RequireAuth({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const isAuthed = localStorage.getItem('steerpast-iam-auth') === 'true';
  if (!isAuthed) return <Navigate to="/" state={{ from: location }} replace />;
  return <>{children}</>;
}

const navItems = [
  { to: '/identities', label: 'Identities', short: 'Identities', icon: Users },
  { to: '/entitlements', label: 'Entitlements', short: 'Roles', icon: Boxes },
  { to: '/explain-audit', label: 'Audit & decisions', short: 'Audit', icon: FileSearch },
  { to: '/system-metrics', label: 'System', short: 'System', icon: Activity },
];

const DemoNav: React.FC = () => {
  const navigate = useNavigate();

  function exit() {
    localStorage.removeItem('steerpast-iam-auth');
    navigate('/', { replace: true });
  }

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-[248px] border-r border-white/[0.08] bg-[#08090b] lg:flex lg:flex-col">
      <div className="flex h-16 items-center border-b border-white/[0.07] px-5">
        <Link to="/" className="group flex items-center gap-2.5 text-sm font-semibold text-white">
          <img src="/steerpast-logo.png" alt="" aria-hidden="true" className="h-8 w-8 rounded-[10px] object-cover transition group-hover:scale-[1.03]" />
          Steerpast <span className="font-normal text-white/45">IAM</span>
        </Link>
      </div>

      <nav aria-label="Workspace" className="px-3 pt-6">
        <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/40">Workspace</div>
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `relative mb-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] transition-colors duration-200 ${
              isActive
                ? 'bg-white/[0.07] text-white before:absolute before:left-0 before:top-2 before:h-[calc(100%-16px)] before:w-[2px] before:rounded-full before:bg-[#b7ff49]'
                : 'text-white/55 hover:bg-white/[0.04] hover:text-white'
            }`}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="mx-3 mt-6 rounded-xl border border-white/[0.07] bg-white/[0.02] p-3.5">
        <div className="flex items-center gap-2 text-[12px] font-medium text-white/80"><span className="h-1.5 w-1.5 rounded-full bg-[#b7ff49]" />Demo workspace</div>
        <p className="mt-1.5 text-[11px] leading-5 text-white/50">Synthetic identities. Changes reset when the service restarts.</p>
      </div>

      <div className="mt-auto border-t border-white/[0.07] p-3">
        <Link to="/" className="mb-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[12px] text-white/55 transition hover:bg-white/[0.04] hover:text-white">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to steerpast.com
        </Link>
        <button onClick={exit} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[12px] text-white/45 transition hover:bg-white/[0.04] hover:text-white">
          <LogOut className="h-4 w-4" aria-hidden="true" />
          Exit demo
        </button>
      </div>
    </aside>
  );
};

const MobileBar: React.FC = () => (
  <>
    <div className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-white/[0.08] bg-[#08090b]/90 px-4 backdrop-blur-xl lg:hidden">
      <Link to="/" className="flex items-center gap-2 text-sm font-semibold text-white">
        <img src="/steerpast-logo.png" alt="" aria-hidden="true" className="h-7 w-7 rounded-[9px] object-cover" />
        Steerpast <span className="font-normal text-white/45">IAM</span>
      </Link>
      <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-2.5 py-1 text-[10px] text-white/60">
        <span className="h-1.5 w-1.5 rounded-full bg-[#b7ff49]" />Demo
      </span>
    </div>
    <nav aria-label="Workspace" className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-white/[0.08] bg-[#08090b]/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden">
      {navItems.map(({ to, short, icon: Icon }) => (
        <NavLink key={to} to={to} className={({ isActive }) => `flex flex-col items-center gap-1 py-2.5 text-[10px] transition ${isActive ? 'text-[#b7ff49]' : 'text-white/55'}`}>
          <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
          {short}
        </NavLink>
      ))}
    </nav>
  </>
);

const DemoShell: React.FC = () => {
  const location = useLocation();
  const current = navItems.find(n => n.to === location.pathname);

  return (
    <div className="min-h-screen bg-[#08090b] text-white">
      <a href="#workspace-main" className="skip-link">Skip to content</a>
      <DemoNav />
      <MobileBar />
      <main id="workspace-main" className="min-h-screen pb-20 lg:pb-0 lg:pl-[248px]">
        <div className="hidden border-b border-white/[0.07] bg-[#08090b]/95 px-8 py-3 backdrop-blur lg:block">
          <div className="mx-auto flex max-w-[1480px] items-center justify-between">
            <div className="flex items-center gap-2 text-[12px] text-white/50">
              <span>Workspace</span><span className="text-white/25">/</span><span className="text-white/80">{current?.label ?? 'Overview'}</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-white/50">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_9px_rgba(52,211,153,.7)]" />
              Agents online · synthetic data
            </div>
          </div>
        </div>
        <Routes>
          <Route path="/identities" element={<Identities />} />
          <Route path="/entitlements" element={<Entitlements />} />
          <Route path="/explain-audit" element={<ExplainAudit />} />
          <Route path="/system-metrics" element={<SystemMetrics />} />
          <Route path="/dashboard" element={<Navigate to="/identities" replace />} />
          <Route path="*" element={<Navigate to="/identities" replace />} />
        </Routes>
      </main>
    </div>
  );
};

const ScrollToTop: React.FC = () => {
  const { pathname, hash } = useLocation();
  React.useEffect(() => { if (!hash) window.scrollTo(0, 0); }, [pathname, hash]);
  return null;
};

const App: React.FC = () => (
  <Router>
    <ScrollToTop />
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Navigate to="/" replace />} />
      <Route path="/claude" element={<Claude />} />
      <Route path="/security" element={<Security />} />
      <Route path="/company" element={<Company />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/demo" element={<DemoIntro />} />
      <Route path="/*" element={
        <RequireAuth>
          <DemoShell />
        </RequireAuth>
      } />
    </Routes>
  </Router>
);

export default App;
