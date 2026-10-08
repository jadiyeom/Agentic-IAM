import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Dashboard } from './pages/Dashboard';
import { Identities } from './pages/Identities';
import { ExplainAudit } from './pages/ExplainAudit';
import { SystemMetrics } from './pages/SystemMetrics';
import { Landing } from './pages/Landing';
import Entitlements from './pages/Entitlements';
import { ArrowLeft, BarChart3, Boxes, FileSearch, Users, Activity, LogOut } from 'lucide-react';

function RequireAuth({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const isAuthed = localStorage.getItem('trustlens-iam-auth') === 'true';
  if (!isAuthed) return <Navigate to="/login" state={{ from: location }} replace />;
  return <>{children}</>;
}

const NavBar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  function handleLogout() {
    localStorage.removeItem('trustlens-iam-auth');
    navigate('/login');
  }
  const items = [
    { to:'/identities', label:'Identities', icon:Users },
    { to:'/entitlements', label:'Entitlements', icon:Boxes },
    { to:'/explain-audit', label:'Audit & decisions', icon:FileSearch },
    { to:'/system-metrics', label:'System', icon:Activity },
  ];
  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 border-r border-white/[0.08] bg-[#08090b] lg:flex lg:flex-col">
      <div className="flex h-16 items-center border-b border-white/[0.07] px-5">
        <Link to="/login" className="flex items-center gap-2.5 text-sm font-semibold text-white">
          <span className="grid h-7 w-7 place-items-center rounded-lg border border-white/15 bg-white/[0.06]"><span className="text-[11px]">TL</span></span>
          TrustLens
        </Link>
      </div>
      <div className="px-3 pt-5">
        <div className="px-2 pb-2 text-[10px] font-medium uppercase tracking-[0.16em] text-white/25">Workspace</div>
        {items.map(({to,label,icon:Icon}) => {
          const active=location.pathname===to;
          return <Link key={to} to={to} className={`mb-1 flex items-center gap-3 rounded-md px-3 py-2.5 text-[13px] transition ${active?'bg-white/[0.08] text-white':'text-white/45 hover:bg-white/[0.04] hover:text-white'}`}><Icon className="h-4 w-4" />{label}</Link>
        })}
      </div>
      <div className="mt-auto border-t border-white/[0.07] p-3">
        <Link to="/login" className="mb-1 flex items-center gap-3 rounded-md px-3 py-2.5 text-[12px] text-white/45 hover:bg-white/[0.04] hover:text-white"><ArrowLeft className="h-4 w-4" />Back to landing</Link>
        <button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-[12px] text-white/35 hover:bg-white/[0.04] hover:text-white"><LogOut className="h-4 w-4" />Exit demo</button>
      </div>
    </aside>
  );
};

const MobileBar: React.FC = () => {
  const navigate=useNavigate();
  return <div className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-white/[0.08] bg-[#08090b]/90 px-4 backdrop-blur lg:hidden">
    <Link to="/login" className="text-sm font-semibold">TrustLens</Link>
    <button onClick={()=>navigate('/login')} className="flex items-center gap-1.5 text-xs text-white/50"><ArrowLeft className="h-3.5 w-3.5"/>Landing</button>
  </div>
}

const App: React.FC = () => (
  <Router>
    <div className="min-h-screen bg-[#08090b] text-white">
      <Routes>
        <Route path="/login" element={<Landing />} />
        <Route path="/*" element={
          <RequireAuth>
            <div className="min-h-screen">
              <NavBar />
              <MobileBar />
              <main className="min-h-screen lg:pl-60">
                <div className="border-b border-white/[0.07] bg-[#08090b] px-5 py-3 lg:px-8">
                  <div className="mx-auto flex max-w-[1400px] items-center justify-between">
                    <div className="flex items-center gap-2 text-[11px] text-white/30"><Activity className="h-3.5 w-3.5 text-emerald-400"/>Live security workspace</div>
                    <div className="text-[11px] text-white/25">{location.pathname === '/identities' ? 'Identity posture' : 'TrustLens workspace'}</div>
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
          </RequireAuth>
        } />
      </Routes>
    </div>
  </Router>
);

export default App;
