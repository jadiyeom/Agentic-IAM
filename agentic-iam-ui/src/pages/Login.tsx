import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, LoaderCircle, LockKeyhole } from 'lucide-react';
import { authConfigured, supabase } from '../auth';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const synthetic = params.get('mode') === 'synthetic';
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!supabase) return;
    setBusy(true); setError(''); setMessage('');
    try {
      const result = mode === 'signin'
        ? await supabase.auth.signInWithPassword({ email: email.trim(), password })
        : await supabase.auth.signUp({ email: email.trim(), password });
      if (result.error) throw result.error;
      if (mode === 'signup' && !result.data.session) {
        setMessage('Account created. Check your email to confirm your address, then sign in.');
        setMode('signin');
        return;
      }
      if (synthetic) localStorage.setItem('steerpast-iam-demo-mode', 'synthetic');
      navigate('/identities', { replace: true });
    } catch (err: any) {
      setError(err?.message || 'Authentication failed. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return <main className="grain relative flex min-h-screen items-center justify-center overflow-hidden bg-[#08090b] px-5 py-12 text-white">
    <div aria-hidden="true" className="aurora pointer-events-none" />
    <section className="relative w-full max-w-md rounded-[24px] border border-white/[0.1] bg-[#101113]/95 p-7 shadow-2xl sm:p-9">
      <Link to="/demo" className="inline-flex items-center gap-2 text-[12px] text-white/50 transition hover:text-white"><ArrowLeft className="h-3.5 w-3.5"/>Back to demo choices</Link>
      <div className="mt-7 flex items-center gap-3"><img src="/steerpast-logo.png" alt="" className="h-11 w-11 rounded-xl object-cover"/><div><p className="text-[13px] font-semibold">Steerpast <span className="font-normal text-white/45">IAM</span></p><p className="mt-1 text-[10px] text-white/45">Secure workspace access</p></div></div>
      <h1 className="mt-7 font-serif text-3xl tracking-tight">{mode === 'signin' ? 'Welcome back.' : 'Create your account.'}</h1>
      <p className="mt-2 text-[12px] leading-5 text-white/55">{synthetic ? 'Sign in to open the synthetic identity-security demo.' : 'Sign in to access your identity-security workspace.'}</p>
      {!authConfigured ? <div role="alert" className="mt-5 rounded-xl border border-amber-200/20 bg-amber-200/[0.05] p-3 text-[12px] leading-5 text-amber-100/80">Authentication is not configured yet. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Vercel, and configure SUPABASE_URL and SUPABASE_ANON_KEY for the backend.</div> : <form onSubmit={submit} className="mt-6 space-y-4">
        <label className="block text-[11px] text-white/65">Email address<input autoComplete="email" required type="email" value={email} onChange={e=>setEmail(e.target.value)} className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-black/30 px-3 text-[13px] text-white outline-none focus:border-[#b7ff49]/60" placeholder="you@company.com"/></label>
        <label className="block text-[11px] text-white/65">Password<input autoComplete={mode === 'signin' ? 'current-password' : 'new-password'} required minLength={8} type="password" value={password} onChange={e=>setPassword(e.target.value)} className="mt-2 h-11 w-full rounded-xl border border-white/10 bg-black/30 px-3 text-[13px] text-white outline-none focus:border-[#b7ff49]/60" placeholder="At least 8 characters"/></label>
        {error && <p role="alert" className="rounded-lg border border-red-300/20 bg-red-300/[0.05] p-3 text-[11px] leading-5 text-red-200">{error}</p>}
        {message && <p role="status" className="rounded-lg border border-emerald-300/20 bg-emerald-300/[0.05] p-3 text-[11px] leading-5 text-emerald-100">{message}</p>}
        <button disabled={busy} type="submit" className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-[#b7ff49] px-5 text-[13px] font-semibold text-[#08090a] transition hover:bg-[#d0ff88] disabled:opacity-50">{busy?<LoaderCircle className="h-4 w-4 animate-spin"/>:<LockKeyhole className="h-4 w-4"/>}{busy?'Please wait…':mode==='signin'?'Sign in':'Create account'}</button>
        <button type="button" onClick={()=>{setMode(mode==='signin'?'signup':'signin');setError('');setMessage('');}} className="w-full py-2 text-[11px] text-white/55 hover:text-white">{mode==='signin'?"Don't have an account? Create one":"Already have an account? Sign in"}</button>
      </form>}
      <p className="mt-6 border-t border-white/[0.07] pt-4 text-[10px] leading-5 text-white/35">Use a strong, unique password. Access tokens are verified by the backend; a browser-only flag cannot grant API access.</p>
    </section>
  </main>;
};

export default Login;
