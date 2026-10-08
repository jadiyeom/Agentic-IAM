import React from 'react';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const demo = () => localStorage.setItem('steerpast-iam-auth', 'true');

const SteerpastMark = ({ className = 'h-7 w-7' }: { className?: string }) => (
  <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
    <defs><linearGradient id="public-mark" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#f4ffd0"/><stop offset="0.48" stopColor="#b7ff49"/><stop offset="1" stopColor="#00ed4f"/></linearGradient></defs>
    <path fill="url(#public-mark)" d="M5 4h31c14 0 23 10 23 24 0 12-7 20-18 24l-1-8c7-3 10-8 10-16 0-8-5-13-14-13H16c-7 0-10 3-11 9V4Z"/>
    <path fill="#050505" d="M5 28c3-7 8-10 16-10h16c4 0 7 2 7 5s-2 5-7 5H20c-3 0-5 1-5 3 0 2 2 3 6 4l15 5c5 2 8 5 8 9 0 4-3 7-8 9L5 60l26-17c3-2 3-4 0-5l-18-6c-6-2-9-6-8-10v6Z"/>
  </svg>
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
