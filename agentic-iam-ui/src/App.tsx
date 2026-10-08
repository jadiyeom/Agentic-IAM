import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Identities } from './pages/Identities';
import { ExplainAudit } from './pages/ExplainAudit';
import { SystemMetrics } from './pages/SystemMetrics';
import { Landing } from './pages/Landing';
import Entitlements from './pages/Entitlements';
import { ArrowLeft, Boxes, FileSearch, Users, Activity, LogOut, Command } from 'lucide-react';

function RequireAuth({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const isAuthed = localStorage.getItem('trustlens-iam-auth') === 'true';
  if (!isAuthed) return <Navigate to="/login" state={{ from: location }} replace />;
  return <>{children}</>;
}

const navItems = [
  { to: '/identities', label: 'Identities', icon: Users },
  { to: '/entitlements', label: 'Entitlements', icon: Boxes },
  { to: '/explain-audit', label: 'Audit & decisions', icon: FileSearch },
  { to: '/system-metrics', label: 'System', icon: Activity },
];

const DemoNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const go = (to: string) => navigate(to, { replace: true });

  function exit() {
    localStorage.removeItem('trustlens-iam-auth');
    navigate('/login', { replace: true });
  }

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-[248px] border-r border-white/[0.08] bg-[#08090b] lg:flex lg:flex-col">
      <div className="flex h-16 items-center border-b border-white/[0.07] px-5">
        <button onClick={() => navigate('/login', { replace: true })} className="group flex items-center gap-2.5 text-sm font-semibold text-white">
          <span className="grid h-7 w-7 place-items-center rounded-lg border border-white/10 bg-white/[0.05] transition group-hover:border-white/20 group-hover:bg-white/[0.08]">
            <Command className="h-3.5 w-3.5" />
          </span>
          TrustLens
        </button>
      </div>

      <div className="px-3 pt-6">
        <div className="px-2 pb-2 text-[10px] font-medium uppercase tracking-[0.16em] text-white/25">Workspace</div>
        {navItems.map(({ to, label, icon: Icon }) => {
          const active = location.pathname === to;
          return (
            <button
              key={to}
              onClick={() => go(to)}
              className={`mb-1 flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-[13px] transition-all duration-200 ${
                active
                  ? 'bg-white/[0.09] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,.06)]'
                  : 'text-white/45 hover:bg-white/[0.045] hover:text-white'
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          );
        })}
      </div>

      <div className="mt-auto border-t border-white/[0.07] p-3">
        <button onClick={() => navigate('/login', { replace: true })} className="mb-1 flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-[12px] text-white/50 transition hover:bg-white/[0.045] hover:text-white">
          <ArrowLeft className="h-4 w-4" />
          Back to landing
        </button>
        <button onClick={exit} className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-[12px] text-white/30 transition hover:bg-white/[0.045] hover:text-white">
          <LogOut className="h-4 w-4" />
          Exit demo
        </button>
      </div>
    </aside>
  );
};

const MobileBar: React.FC = () => (
  <div className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-white/[0.08] bg-[#08090b]/90 px-4 backdrop-blur-xl lg:hidden">
    <button onClick={() => window.history.back()} className="flex items-center gap-2 text-sm font-semibold text-white">
      <Command className="h-4 w-4" />
      TrustLens
    </button>
    <Link to="/login" replace className="flex items-center gap-1.5 text-xs text-white/55 hover:text-white">
      <ArrowLeft className="h-3.5 w-3.5" />
      Landing
    </Link>
  </div>
);

const DemoShell: React.FC = () => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-[#08090b] text-white">
      <DemoNav />
      <MobileBar />
      <main className="min-h-screen lg:pl-[248px]">
        <div className="border-b border-white/[0.07] bg-[#08090b]/95 px-5 py-3 backdrop-blur lg:px-8">
          <div className="mx-auto flex max-w-[1480px] items-center justify-between">
            <div className="flex items-center gap-2 text-[11px] text-white/35">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_9px_rgba(52,211,153,.7)]" />
              Live security workspace
            </div>
            <div className="text-[11px] text-white/25">
              {location.pathname === '/identities' ? 'Identity posture' : 'TrustLens workspace'}
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

const App: React.FC = () => (
  <Router>
    <Routes>
      <Route path="/login" element={<Landing />} />
      <Route path="/demo" element={<Navigate to="/identities" replace />} />
      <Route path="/*" element={
        <RequireAuth>
          <DemoShell />
        </RequireAuth>
      } />
    </Routes>
  </Router>
);

export default App;
