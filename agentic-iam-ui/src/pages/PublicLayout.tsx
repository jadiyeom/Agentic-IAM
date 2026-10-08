import React from 'react';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const demo = () => localStorage.setItem('steerpast-iam-auth', 'true');

const SteerpastMark = ({ className = 'h-7 w-7' }: { className?: string }) => (
  <img src="/steerpast-logo.png" alt="" aria-hidden="true" className={`shrink-0 rounded-[9px] object-cover ${className}`} />
);

export const PublicLayout: React.FC<{ eyebrow: string; title: string; intro: string; children: React.ReactNode }> = ({ eyebrow, title, intro, children }) => (
  <div className="min-h-screen bg-[#08090a] text-[#eeeae0]">
    <header className="sticky top-0 z-50 border-b border-white/[0.08] bg-[#08090a]/90 backdrop-blur-xl">
      <nav className="mx-auto flex h-[68px] max-w-[1160px] items-center justify-between px-5 lg:px-8">
        <Link to="/" className="flex items-center gap-2.5 text-[14px] font-semibold tracking-[-0.02em]">
          <SteerpastMark className="h-7 w-7" />
          Steerpast <span className="text-white/30">IAM</span>
        </Link>
        <div className="hidden items-center gap-6 text-[12px] text-white/45 md:flex">
          <Link to="/" className="hover:text-white">Product</Link>
          <Link to="/claude" className="hover:text-white">Claude</Link>
          <Link to="/security" className="hover:text-white">Security</Link>
          <Link to="/company" className="hover:text-white">Company</Link>
        </div>
        <Link to="/demo" onClick={demo} className="inline-flex h-9 items-center gap-1.5 rounded-full bg-[#b7ff49] px-4 text-[12px] font-semibold text-[#08090a]">
          View demo <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </nav>
    </header>

    <main>
      <section className="mx-auto max-w-[1000px] px-5 pb-20 pt-24 lg:px-8 lg:pt-32">
        <div className="max-w-3xl">
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/25">{eyebrow}</div>
          <h1 className="mt-5 font-serif text-5xl font-medium leading-[.98] tracking-[-0.045em] sm:text-6xl">{title}</h1>
          <p className="mt-6 text-[15px] leading-7 text-white/40">{intro}</p>
        </div>
        <div className="mt-14">{children}</div>
      </section>
    </main>

    <footer className="border-t border-white/[0.08]">
      <div className="mx-auto flex max-w-[1160px] flex-col gap-6 px-5 py-8 text-[10px] text-white/22 sm:flex-row sm:items-center sm:justify-between lg:px-8">
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
