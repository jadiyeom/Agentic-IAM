import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Activity, ArrowLeft, Bot, Boxes, CornerDownLeft, FileSearch, RotateCcw, Search, User, Users } from 'lucide-react';
import { fetchIdentities, IdentityViewModel, resetDemo } from '../services/iamApi';
import { riskTier, tierStyles } from './ui';

type Item = {
  id: string;
  group: 'Navigate' | 'Identities' | 'Actions';
  label: string;
  hint?: string;
  icon: React.ElementType;
  run: () => void | Promise<void>;
  tone?: string;
};

export const openCommandPalette = () => window.dispatchEvent(new CustomEvent('steerpast:command'));

export const CommandPalette: React.FC = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const [identities, setIdentities] = useState<IdentityViewModel[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen(o => !o);
      }
    };
    const onOpen = () => setOpen(true);
    window.addEventListener('keydown', onKey);
    window.addEventListener('steerpast:command', onOpen);
    return () => { window.removeEventListener('keydown', onKey); window.removeEventListener('steerpast:command', onOpen); };
  }, []);

  useEffect(() => {
    if (!open) return;
    setQuery('');
    setActive(0);
    fetchIdentities().then(setIdentities).catch(() => undefined);
    const t = setTimeout(() => inputRef.current?.focus(), 30);
    return () => clearTimeout(t);
  }, [open]);

  const close = useCallback(() => setOpen(false), []);

  const items = useMemo<Item[]>(() => {
    const go = (to: string) => () => { navigate(to); close(); };
    const nav: Item[] = [
      { id: 'nav-identities', group: 'Navigate', label: 'Identities', icon: Users, run: go('/identities') },
      { id: 'nav-entitlements', group: 'Navigate', label: 'Entitlements', icon: Boxes, run: go('/entitlements') },
      { id: 'nav-audit', group: 'Navigate', label: 'Audit & decisions', icon: FileSearch, run: go('/explain-audit') },
      { id: 'nav-system', group: 'Navigate', label: 'System', icon: Activity, run: go('/system-metrics') },
    ];
    const ids: Item[] = [...identities]
      .sort((a, b) => b.risk.riskScore - a.risk.riskScore)
      .map(vm => {
        const tier = riskTier(vm.risk.riskScore, vm.anomaly);
        return {
          id: `id-${vm.identity.id}`,
          group: 'Identities' as const,
          label: vm.identity.name,
          hint: `${vm.identity.attributes.title} · risk ${vm.risk.riskScore}`,
          icon: vm.identity.attributes.identityType === 'AI_AGENT' ? Bot : User,
          tone: tierStyles[tier].text,
          run: () => { navigate(`/identities?focus=${encodeURIComponent(vm.identity.id)}`); close(); },
        };
      });
    const actions: Item[] = [
      { id: 'act-reset', group: 'Actions', label: 'Reset demo data', hint: 'Restore the seeded identities', icon: RotateCcw, run: async () => { await resetDemo(); close(); window.location.reload(); } },
      { id: 'act-home', group: 'Actions', label: 'Back to steerpast.com', icon: ArrowLeft, run: () => { navigate('/'); close(); } },
    ];
    const q = query.trim().toLowerCase();
    const all = [...nav, ...ids, ...actions];
    return q ? all.filter(i => `${i.label} ${i.hint ?? ''}`.toLowerCase().includes(q)) : all;
  }, [identities, query, navigate, close]);

  useEffect(() => { setActive(0); }, [query]);
  useEffect(() => {
    listRef.current?.querySelector<HTMLElement>(`[data-index="${active}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive(a => Math.min(items.length - 1, a + 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(a => Math.max(0, a - 1)); }
    else if (e.key === 'Enter') { e.preventDefault(); items[active]?.run(); }
    else if (e.key === 'Escape') { e.preventDefault(); close(); }
  };

  let lastGroup = '';

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[80] flex items-start justify-center bg-black/60 px-4 pt-[12vh] backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onMouseDown={e => { if (e.target === e.currentTarget) close(); }}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Command menu"
            className="w-full max-w-[600px] overflow-hidden rounded-2xl border border-white/10 bg-[#0e0f12]/95 shadow-[0_30px_120px_rgba(0,0,0,.7),0_0_0_1px_rgba(255,255,255,.03)] backdrop-blur-xl"
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            onKeyDown={onKeyDown}
          >
            <div className="flex items-center gap-3 border-b border-white/[0.07] px-4">
              <Search className="h-4 w-4 text-white/45" aria-hidden="true" />
              <input
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search identities, pages and actions…"
                aria-label="Search commands"
                role="combobox"
                aria-expanded="true"
                aria-controls="command-list"
                aria-activedescendant={items[active]?.id}
                className="h-14 flex-1 bg-transparent text-[15px] text-white outline-none placeholder:text-white/35 focus-visible:outline-none"
              />
              <kbd className="rounded-md border border-white/10 px-1.5 py-0.5 font-mono text-[10px] text-white/45">esc</kbd>
            </div>
            <ul id="command-list" ref={listRef} role="listbox" className="scroll-quiet max-h-[52vh] overflow-y-auto p-2">
              {items.length === 0 && <li className="px-3 py-10 text-center text-[13px] text-white/45">No results for “{query}”.</li>}
              {items.map((item, i) => {
                const header = item.group !== lastGroup ? item.group : null;
                lastGroup = item.group;
                const Icon = item.icon;
                const isActive = i === active;
                return (
                  <React.Fragment key={item.id}>
                    {header && <li role="presentation" className="px-3 pb-1.5 pt-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">{header}</li>}
                    <li
                      id={item.id}
                      role="option"
                      aria-selected={isActive}
                      data-index={i}
                      onMouseMove={() => setActive(i)}
                      onClick={() => item.run()}
                      className={`relative flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] transition-colors ${isActive ? 'text-white' : 'text-white/70'}`}
                    >
                      {isActive && <motion.span layoutId="cmd-active" className="absolute inset-0 rounded-xl bg-white/[0.07]" transition={{ type: 'spring', stiffness: 500, damping: 40 }} />}
                      <Icon className={`relative h-4 w-4 shrink-0 ${item.tone ?? 'text-white/55'}`} aria-hidden="true" />
                      <span className="relative truncate">{item.label}</span>
                      {item.hint && <span className="relative ml-auto truncate pl-3 text-[11px] text-white/40">{item.hint}</span>}
                      {isActive && <CornerDownLeft className="relative h-3.5 w-3.5 shrink-0 text-white/45" aria-hidden="true" />}
                    </li>
                  </React.Fragment>
                );
              })}
            </ul>
            <div className="flex items-center justify-between border-t border-white/[0.07] px-4 py-2.5 text-[11px] text-white/40">
              <span className="flex items-center gap-2"><kbd className="rounded border border-white/10 px-1 font-mono">↑</kbd><kbd className="rounded border border-white/10 px-1 font-mono">↓</kbd> to move <kbd className="ml-2 rounded border border-white/10 px-1 font-mono">↵</kbd> to open</span>
              <span>Steerpast IAM</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
