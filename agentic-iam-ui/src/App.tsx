import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, NavLink, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Landing } from './pages/Landing';

// Everything past the landing page is split into its own chunk, so the
// marketing page ships without the workspace, charts and tables.
const named = <K extends string>(loader: () => Promise<Record<K, React.ComponentType>>, key: K) =>
  React.lazy(() => loader().then(m => ({ default: m[key] })));
const Identities = named(() => import('./pages/Identities'), 'Identities');
const ExplainAudit = named(() => import('./pages/ExplainAudit'), 'ExplainAudit');
const SystemMetrics = named(() => import('./pages/SystemMetrics'), 'SystemMetrics');
const Claude = named(() => import('./pages/Claude'), 'Claude');
const Security = named(() => import('./pages/Security'), 'Security');
const Company = named(() => import('./pages/Company'), 'Company');
const DemoIntro = named(() => import('./pages/DemoIntro'), 'DemoIntro');
const Privacy = named(() => import('./pages/Privacy'), 'Privacy');
const Terms = named(() => import('./pages/Terms'), 'Terms');
const Entitlements = React.lazy(() => import('./pages/Entitlements'));
const Connectors = named(() => import('./pages/Connectors'), 'default');

const PageFallback: React.FC = () => (
  <div className="flex min-h-[60vh] items-center justify-center" role="status" aria-label="Loading">
    <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/15 border-t-[#b7ff49]" />
  </div>
);
import { ArrowLeft, Boxes, FileSearch, Users, Activity, LogOut, Search, Plug } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { CommandPalette, openCommandPalette } from './components/CommandPalette';

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
  { to: '/connectors', label: 'Live connectors', short: 'Sources', icon: Plug },
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

      <div className="px-3 pt-4">
        <button type="button" onClick={openCommandPalette} className="group flex h-9 w-full items-center gap-2.5 rounded-lg border border-white/[0.08] bg-white/[0.025] px-3 text-[12px] text-white/50 transition hover:border-white/15 hover:text-white/80">
          <Search className="h-3.5 w-3.5" aria-hidden="true" />
          Search
          <kbd className="ml-auto rounded border border-white/10 px-1.5 font-mono text-[10px] text-white/45">⌘K</kbd>
        </button>
      </div>

      <nav aria-label="Workspace" className="px-3 pt-5">
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
      <div className="flex items-center gap-2">
        <button type="button" onClick={openCommandPalette} aria-label="Search" className="grid h-8 w-8 place-items-center rounded-full border border-white/10 text-white/60"><Search className="h-3.5 w-3.5" /></button>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-2.5 py-1 text-[10px] text-white/60">
          <span className="h-1.5 w-1.5 rounded-full bg-[#b7ff49]" />Demo
        </span>
      </div>
    </div>
    <nav aria-label="Workspace" className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-white/[0.08] bg-[#08090b]/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden">
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
  const reduce = useReducedMotion();
  const current = navItems.find(n => n.to === location.pathname);

  return (
    <div className="min-h-screen bg-[#08090b] text-white">
      <a href="#workspace-main" className="skip-link">Skip to content</a>
      <DemoNav />
      <MobileBar />
      <CommandPalette />
      <main id="workspace-main" className="min-h-screen pb-20 lg:pb-0 lg:pl-[248px]">
        <div className="hidden border-b border-white/[0.07] bg-[#08090b]/95 px-8 py-3 backdrop-blur lg:block">
          <div className="mx-auto flex max-w-[1480px] items-center justify-between">
            <div className="flex items-center gap-2 text-[12px] text-white/50">
              <span>Workspace</span><span className="text-white/25">/</span><span className="text-white/80">{current?.label ?? 'Overview'}</span>
            </div>
            <div className="flex items-center gap-4 text-[11px] text-white/50">
              <span className="flex items-center gap-2"><span className="ping-dot h-1.5 w-1.5 rounded-full bg-emerald-400 text-emerald-400" />Agents online · synthetic data</span>
              <button type="button" onClick={openCommandPalette} className="flex items-center gap-2 rounded-md border border-white/10 px-2 py-1 text-white/55 transition hover:border-white/20 hover:text-white"><Search className="h-3 w-3" aria-hidden="true" />Jump to<kbd className="font-mono text-[10px] text-white/40">⌘K</kbd></button>
            </div>
          </div>
        </div>
        <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={location.pathname}
          initial={reduce ? false : { opacity: 0, y: 8, filter: 'blur(4px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={reduce ? undefined : { opacity: 0, y: -4, filter: 'blur(2px)' }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        >
        <React.Suspense fallback={<PageFallback />}>
        <Routes location={location}>
          <Route path="/identities" element={<Identities />} />
          <Route path="/entitlements" element={<Entitlements />} />
          <Route path="/explain-audit" element={<ExplainAudit />} />
          <Route path="/system-metrics" element={<SystemMetrics />} />
          <Route path="/connectors" element={<Connectors />} />
          <Route path="/dashboard" element={<Navigate to="/identities" replace />} />
          <Route path="*" element={<Navigate to="/identities" replace />} />
        </Routes>
        </React.Suspense>
        </motion.div>
        </AnimatePresence>
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
    <React.Suspense fallback={<div className="min-h-screen bg-[#08090a]"><PageFallback /></div>}>
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
    </React.Suspense>
  </Router>
);

export default App;
