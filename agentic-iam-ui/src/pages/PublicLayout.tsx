import React from 'react';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { Link, NavLink } from 'react-router-dom';

const demo = () => localStorage.setItem('steerpast-iam-auth', 'true');

const SteerpastMark = ({ className = 'h-7 w-7' }: { className?: string }) => (
  <img src="/steerpast-logo.png" alt="" aria-hidden="true" className={`shrink-0 rounded-[9px] object-cover ${className}`} />
);

const publicLinks = [
  ['/', 'Product'],
  ['/claude', 'Claude'],
  ['/security', 'Security'],
  ['/company', 'Company'],
] as const;

export const PublicLayout: React.FC<{ eyebrow: string; title: string; intro: string; children: React.ReactNode }> = ({ eyebrow, title, intro, children }) => (
  <div className="min-h-screen bg-[#08090a] text-[#eeeae0]">
    <a href="#main" className="skip-link">Skip to content</a>
    <header className="sticky top-0 z-50 border-b border-white/[0.08] bg-[#08090a]/90 backdrop-blur-xl">
      <nav className="mx-auto flex h-[68px] max-w-[1160px] items-center justify-between px-5 lg:px-8">
        <Link to="/" className="flex items-center gap-2.5 text-[14px] font-semibold tracking-[-0.02em]">
          <SteerpastMark className="h-7 w-7" />
          Steerpast <span className="text-white/50">IAM</span>
        </Link>
        <div className="hidden items-center gap-1 text-[12px] md:flex">
          {publicLinks.map(([to, label]) => (
            <NavLink key={to} to={to} end className={({ isActive }) => `rounded-full px-3 py-1.5 transition hover:text-white ${isActive ? 'bg-white/[0.07] text-white' : 'text-white/60'}`}>{label}</NavLink>
          ))}
        </div>
        <Link to="/demo" onClick={demo} className="inline-flex h-9 items-center gap-1.5 rounded-full bg-[#b7ff49] px-4 text-[12px] font-semibold text-[#08090a]">
          View demo <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </nav>
      <div className="scroll-quiet flex gap-1 overflow-x-auto border-t border-white/[0.06] px-5 py-2 text-[12px] md:hidden">
        {publicLinks.map(([to, label]) => (
          <NavLink key={to} to={to} end className={({ isActive }) => `shrink-0 rounded-full px-3 py-1.5 ${isActive ? 'bg-white/[0.08] text-white' : 'text-white/60'}`}>{label}</NavLink>
        ))}
      </div>
    </header>

    <main id="main">
      <section className="mx-auto max-w-[1000px] px-5 pb-20 pt-24 lg:px-8 lg:pt-32">
        <div className="max-w-3xl">
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/45">{eyebrow}</div>
          <h1 className="mt-5 font-serif text-[44px] font-medium leading-[1.02] tracking-[-0.035em] sm:text-6xl sm:leading-[.98]">{title}</h1>
          <p className="mt-6 text-[15px] leading-7 text-white/60">{intro}</p>
        </div>
        <div className="mt-14">{children}</div>
      </section>
    </main>

    <footer className="border-t border-white/[0.08]">
      <div className="mx-auto flex max-w-[1160px] flex-col gap-6 px-5 py-8 text-[10px] text-white/45 sm:flex-row sm:items-center sm:justify-between lg:px-8">
        <div className="flex items-center gap-2 text-white/55"><SteerpastMark className="h-6 w-6"/>Steerpast IAM</div>
        <div className="flex flex-wrap items-center gap-5">
          <Link to="/" className="hover:text-white/55">Product</Link>
          <Link to="/claude" className="hover:text-white/55">Claude</Link>
          <Link to="/security" className="hover:text-white/55">Security</Link>
          <Link to="/company" className="hover:text-white/55">Company</Link>
          <a href={'mailto:' + ['omjadiye','steerpast.com'].join('@')} className="inline-flex items-center gap-1 hover:text-white/55">Contact <ArrowUpRight className="h-3 w-3"/></a>
          <span>© 2026 Steerpast</span>
        </div>
      </div>
    </footer>
  </div>
);
