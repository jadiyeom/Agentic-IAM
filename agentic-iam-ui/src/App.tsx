import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Dashboard } from './pages/Dashboard';
import { Identities } from './pages/Identities';
import { ExplainAudit } from './pages/ExplainAudit';
import { SystemMetrics } from './pages/SystemMetrics';
import { Login } from './pages/Login';

function RequireAuth({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const isAuthed = localStorage.getItem('trustlens-iam-auth') === 'true';
  if (!isAuthed) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <>{children}</>;
}

const NavBar: React.FC = () => {
  const navigate = useNavigate();
  function handleLogout() {
    localStorage.removeItem('trustlens-iam-auth');
    navigate('/login');
  }
  return (
    <nav className="flex gap-4 px-6 py-4 border-b border-slate-800 bg-slate-900 items-center">
      <span className="text-2xl font-bold text-accent mr-8">TrustLens IAM</span>
      <Link className="text-slate-100 font-semibold hover:text-accent" to="/identities">Identities</Link>
      <Link className="text-slate-100 font-semibold hover:text-accent" to="/explain-audit">Explainability & Audit</Link>
      <Link className="text-slate-100 font-semibold hover:text-accent" to="/system-metrics">System Metrics</Link>
      <Link className="text-slate-100 font-semibold hover:text-accent" to="/dashboard">Dashboard (Legacy)</Link>
      <button
        className="ml-auto bg-danger text-slate-100 font-semibold px-4 py-1 rounded hover:bg-danger/80 transition"
        onClick={handleLogout}
      >
        Logout
      </button>
    </nav>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen bg-slate-950">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/*"
            element={
              <RequireAuth>
                <div>
                  <NavBar />
                  <main>
                    <Routes>
                      <Route path="/identities" element={<Identities />} />
                      <Route path="/explain-audit" element={<ExplainAudit />} />
                      <Route path="/system-metrics" element={<SystemMetrics />} />
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="*" element={<Navigate to="/identities" replace />} />
                    </Routes>
                  </main>
                </div>
              </RequireAuth>
            }
          />
        </Routes>
      </div>
    </Router>
  );
};

export default App;

