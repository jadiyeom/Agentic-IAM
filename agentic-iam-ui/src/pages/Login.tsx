import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (username === 'security admin' && password === '12345678') {
      localStorage.setItem('trustlens-iam-auth', 'true');
      navigate('/identities');
    } else {
      setError('Invalid credentials.');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-accent/10 to-slate-900">
      <div className="flex w-full max-w-3xl rounded-xl shadow-2xl overflow-hidden border border-slate-800 bg-slate-900">
        {/* Left side: Value proposition */}
        <div className="hidden md:flex flex-col justify-center items-start px-8 py-12 w-1/2 bg-slate-950">
          <div className="text-3xl font-bold text-accent mb-2">TrustLens IAM</div>
          <div className="text-lg font-semibold text-slate-100 mb-4">AI-Driven Identity Risk Intelligence</div>
          <p className="text-slate-300 mb-6">Autonomous Identity Governance<br/>Continuous risk evaluation powered by AI.</p>
          <div className="mt-8 text-xs text-slate-400">Zero-Trust • Continuous Monitoring • Explainable AI</div>
        </div>
        {/* Right side: Login card */}
        <div className="flex flex-col justify-center items-center px-8 py-12 w-full md:w-1/2">
          <form onSubmit={handleSubmit} className="w-full max-w-xs bg-slate-900 p-8 rounded-xl shadow-lg border border-slate-800">
            <h2 className="text-lg font-semibold text-slate-100 mb-4">Login</h2>
            <div className="mb-4">
              <label className="block text-slate-300 text-sm mb-1">Username</label>
              <input
                className="w-full rounded px-3 py-2 bg-slate-800 text-slate-100 border border-slate-700 focus:outline-accent"
                value={username}
                onChange={e => setUsername(e.target.value)}
                autoFocus
                placeholder="security admin"
              />
            </div>
            <div className="mb-4">
              <label className="block text-slate-300 text-sm mb-1">Password</label>
              <input
                type="password"
                className="w-full rounded px-3 py-2 bg-slate-800 text-slate-100 border border-slate-700 focus:outline-accent"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="12345678"
              />
            </div>
            {error && <div className="mb-2 text-danger text-xs">{error}</div>}
            <button
              type="submit"
              className="w-full bg-accent text-slate-900 font-semibold py-2 rounded hover:bg-accent/90 transition"
            >
              Login
            </button>
            <div className="mt-4 text-xs text-slate-400 text-center">
              Zero-Trust • Continuous Monitoring • Explainable AI
            </div>
            <div className="mt-6 flex flex-col gap-2">
              <button
                type="button"
                className="w-full bg-slate-800 text-slate-200 font-semibold py-2 rounded border border-slate-700 hover:bg-slate-700 transition"
                disabled
              >
                Sign in with SSO (Demo)
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
