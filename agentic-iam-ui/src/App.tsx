import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Identities } from './pages/Identities';
import { ExplainAudit } from './pages/ExplainAudit';
import { SystemMetrics } from './pages/SystemMetrics';
import { Landing } from './pages/Landing';
import Entitlements from './pages/Entitlements';
import { ArrowLeft, Boxes, FileSearch, Users, Activity, LogOut, Command, Circle } from 'lucide-react';

function RequireAuth({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const isAuthed = localStorage.getItem('steerpast-iam-auth') === 'true';
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
  const exit = () => { localStorage.removeItem('steerpast-iam-auth'); navigate('/login', { replace: true }); };

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-[252px] border-r border-white/[0.08] bg-[#08090b] lg:flex lg:flex-col">
      <div className="flex h-16 items-center border-b border-white/[0.07] px-5">
        <button onClick={() => navigate('/login', { replace: true })} className="group flex items-center gap-2.5 text-[14px] font-semibold tracking-[-0.02em] text-white">
          <span className="grid h-7 w-7 place-items-center rounded-md border border-white/10 bg-white/[0.05] transition group-hover:border-white/20 group-hover:bg-white/[0.09]"><Command className="h-3.5 w-3.5" /></span>
          Steerpast <span className="text-white/35">IAM</span>
        </button>
      </div>
      <div className="px-3 pt-6">
        <div className="mb-2 flex items-center justify-between px-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/25">
          <span>Workspace</span><span className="font-mono text-[9px] normal-case tracking-normal text-white/15">demo</span>
        </div>
        {navItems.map(({ to, label, icon: Icon }) => {
          const active = location.pathname === to;
          return (
            <Link key={to} to={to} replace className={`mb-1 flex items-center gap-3 rounded-md px-3 py-2.5 text-[13px] transition-all duration-150 ${active ? 'bg-white/[0.08] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,.06)]' : 'text-white/45 hover:bg-white/[0.045] hover:text-white'}`}>
              <Icon className="h-4 w-4" />{label}
            </Link>
          );
        })}
      </div>
      <div className="mt-auto p-3">
        <div className="mb-3 rounded-lg border border-white/[0.07] bg-white/[0.02] p-3">
          <div className="flex items-center gap-2 text-[11px] text-white/55"><Circle className="h-2 w-2 fill-emerald-400 text-emerald-400" /> Evaluation engine online</div>
          <div className="mt-1 text-[10px] text-white/25">6 agents · policy graph active</div>
        </div>
        <button onClick={() => navigate('/login', { replace: true })} className="mb-1 flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-[12px] text-white/50 transition hover:bg-white/[0.045] hover:text-white"><ArrowLeft className="h-4 w-4" />Back to landing</button>
        <button onClick={exit} className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-[12px] text-white/30 transition hover:bg-white/[0.045] hover:text-white"><LogOut className="h-4 w-4" />Exit demo</button>
      </div>
    </aside>
  );
};

const MobileBar: React.FC = () => (
  <div className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-white/[0.08] bg-[#08090b]/90 px-4 backdrop-blur-xl lg:hidden">
    <Link to="/identities" replace className="flex items-center gap-2 text-sm font-semibold text-white"><Command className="h-4 w-4" />Steerpast IAM</Link>
    <Link to="/login" replace className="flex items-center gap-1.5 text-xs text-white/55 hover:text-white"><ArrowLeft className="h-3.5 w-3.5" />Landing</Link>
  </div>
);

const DemoShell: React.FC = () => {
  const location = useLocation();
  const page = navItems.find(item => item.to === location.pathname);
  return (
    <div className="min-h-screen bg-[#08090b] text-white">
      <DemoNav /><MobileBar />
      <main className="min-h-screen lg:pl-[252px]">
        <div className="border-b border-white/[0.07] bg-[#08090b]/90 px-5 py-2.5 backdrop-blur-xl lg:px-8">
          <div className="mx-auto flex max-w-[1480px] items-center justify-between">
            <div className="flex items-center gap-2 text-[11px] text-white/35"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_9px_rgba(52,211,153,.65)]" />Live security workspace</div>
            <div className="text-[11px] text-white/25">{page?.label ?? 'Steerpast IAM'} <span className="mx-2 text-white/10">/</span> continuous evaluation</div>
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
      <Route path="/*" element={<RequireAuth><DemoShell /></RequireAuth>} />
    </Routes>
  </Router>
);

export default App;
