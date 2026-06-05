'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

// ─── Minimalist Monochrome Background ─────────────────────────────────────────
function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-white">
      {/* Very subtle noise texture */}
      <div className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: '200px 200px',
        }}
      />
      
      {/* Base radial gradient for depth */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_100%_100%_at_50%_-20%,rgba(0,0,0,0.03),transparent)]" />

      {/* Floating abstract monochrome shapes */}
      <div
        className="absolute top-[-10%] right-[-5%] w-[800px] h-[800px] rounded-full opacity-[0.02]"
        style={{
          background: 'radial-gradient(circle, rgba(0,0,0,1), transparent 70%)',
          animation: 'floatSlow 20s ease-in-out infinite alternate',
        }}
      />
      <div
        className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full opacity-[0.02]"
        style={{
          background: 'radial-gradient(circle, rgba(0,0,0,1), transparent 70%)',
          animation: 'floatSlow2 25s ease-in-out infinite alternate',
        }}
      />

      <style>{`
        @keyframes floatSlow {
          0%   { transform: translate(0, 0) scale(1); }
          100% { transform: translate(-50px, 50px) scale(1.05); }
        }
        @keyframes floatSlow2 {
          0%   { transform: translate(0, 0) scale(1); }
          100% { transform: translate(50px, -50px) scale(1.1); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        .delay-100 { animation-delay: 100ms; }
        .delay-200 { animation-delay: 200ms; }
        .delay-300 { animation-delay: 300ms; }
        .delay-400 { animation-delay: 400ms; }
        .delay-500 { animation-delay: 500ms; }
        .delay-600 { animation-delay: 600ms; }
        .delay-700 { animation-delay: 700ms; }
        .delay-800 { animation-delay: 800ms; }
        
        .monochrome-card {
          background: white;
          border: 1px solid rgba(0, 0, 0, 0.06);
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .monochrome-card:hover {
          border-color: rgba(0, 0, 0, 0.2);
          transform: translateY(-4px);
          box-shadow: 0 12px 30px -10px rgba(0, 0, 0, 0.08);
        }
        .cta-btn-primary {
          background-color: black;
          color: white;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .cta-btn-primary:hover {
          background-color: #1a1a1a;
          transform: scale(1.02);
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.2);
        }
        .cta-btn-primary:active { transform: scale(0.98); }
        .stat-number { font-variant-numeric: tabular-nums; }
      `}</style>
    </div>
  );
}

// ─── Feature Card ─────────────────────────────────────────────────────────────
function FeatureCard({
  icon,
  label,
  title,
  description,
  delay,
}: {
  icon: React.ReactNode;
  label: string;
  title: string;
  description: string;
  delay: string;
}) {
  return (
    <div className={`monochrome-card rounded-xl p-8 animate-fade-in-up ${delay} group`}>
      <div className="w-10 h-10 mb-6 flex items-center justify-center text-black border border-slate-200 rounded-lg group-hover:bg-slate-50 transition-colors">
        {icon}
      </div>

      <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-slate-400 mb-2">{label}</p>
      <h3 className="text-lg font-bold text-slate-900 mb-3 tracking-tight">{title}</h3>
      <p className="text-sm text-slate-500 leading-relaxed">{description}</p>

      {/* Subtle bottom accent line on hover */}
      <div className="mt-6 h-px w-0 group-hover:w-full transition-all duration-500 bg-black" />
    </div>
  );
}

// ─── Stat Counter ─────────────────────────────────────────────────────────────
function StatItem({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <span className="stat-number text-4xl font-extrabold text-black tracking-tight">{value}</span>
      <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-slate-400">{label}</span>
    </div>
  );
}

// ─── Main Landing Page ────────────────────────────────────────────────────────
export default function LandingPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const features = [
    {
      label: 'Core Feature',
      title: 'Fault-Tolerant AI Search',
      description:
        'Our multi-fallback engine understands natural language, handles typos, and returns relevant products—even under ambiguous queries.',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
      ),
      delay: 'delay-200',
    },
    {
      label: 'Inventory',
      title: 'Real-Time Stock Sync',
      description:
        "Live data is streamed to the AI on every request. The assistant knows exactly what's in stock per size and SKU, preventing oversells.",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
        </svg>
      ),
      delay: 'delay-400',
    },
    {
      label: 'Commerce',
      title: 'Seamless Checkout',
      description:
        'From discovery to order confirmation in a single conversation. The AI handles cart management and checkout with zero friction.',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
        </svg>
      ),
      delay: 'delay-600',
    },
  ];

  if (!mounted) return null;

  return (
    <>
      <AnimatedBackground />

      {/* ── Floating nav bar (Full Width) ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-6">
        <div className="flex items-center gap-3">
          {/* Logo mark */}
          <div className="w-8 h-8 bg-black flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="text-[13px] font-bold text-black tracking-widest uppercase">TechDojo Store</span>
        </div>
        <Link
          href="/store"
          className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 hover:text-black transition-colors duration-200"
        >
          Enter Store
        </Link>
      </nav>

      {/* ── Main scroll container ── */}
      <main className="relative min-h-screen flex flex-col items-center">

        {/* ════════════════════════════════════════
            HERO SECTION
        ════════════════════════════════════════ */}
        <section className="flex flex-col items-center justify-center min-h-screen px-6 text-center pt-20 w-full max-w-5xl">

          {/* Eyebrow chip */}
          <div className="animate-fade-in-up delay-100 mb-8 border border-slate-200 px-4 py-1.5 rounded-full flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-black rounded-full animate-pulse" />
            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500">Powered by Vercel AI SDK</span>
          </div>

          {/* Main headline */}
          <h1 className="animate-fade-in-up delay-200 text-6xl sm:text-7xl lg:text-[6rem] font-black leading-[0.95] tracking-tighter text-black">
            The Future of<br />Conversational<br />Commerce
          </h1>

          {/* Sub-headline */}
          <p className="animate-fade-in-up delay-400 mt-8 text-base sm:text-lg text-slate-500 max-w-2xl leading-relaxed font-medium">
            Search products, check live stock, manage your cart, and checkout — entirely
            through natural language. No menus. No filters. Just conversation.
          </p>

          {/* CTA Button */}
          <div className="animate-fade-in-up delay-500 mt-12">
            <Link
              id="cta-explore-store"
              href="/store"
              className="cta-btn-primary inline-flex items-center gap-3 px-10 py-5 rounded-none font-bold text-[11px] uppercase tracking-[0.2em]"
            >
              Explore The Store
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>

          {/* Stats row */}
          <div className="animate-fade-in-up delay-700 mt-24 flex items-center gap-12 sm:gap-20 flex-wrap justify-center border-t border-slate-100 pt-12 w-full max-w-3xl">
            <StatItem value="100%" label="AI-Driven" />
            <div className="h-10 w-px bg-slate-200 hidden sm:block" />
            <StatItem value="0" label="Friction" />
            <div className="h-10 w-px bg-slate-200 hidden sm:block" />
            <StatItem value="∞" label="Possibilities" />
          </div>

        </section>

        {/* ════════════════════════════════════════
            FEATURES SECTION
        ════════════════════════════════════════ */}
        <section className="px-6 pb-32 pt-16 max-w-6xl w-full">

          {/* Section header */}
          <div className="text-center mb-16 animate-fade-in-up delay-100">
            <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-slate-400 mb-4">Core Capabilities</p>
            <h2 className="text-3xl sm:text-4xl font-black text-black tracking-tight">
              Engineered for Intelligence
            </h2>
          </div>

          {/* 3-column card grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((f) => (
              <FeatureCard key={f.title} {...f} />
            ))}
          </div>

          {/* Bottom CTA strip */}
          <div className="mt-20 border border-slate-200 rounded-none p-10 flex flex-col sm:flex-row items-center justify-between gap-8 animate-fade-in-up delay-700 bg-slate-50">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-2">Ready to experience it?</p>
              <p className="text-2xl font-black text-black tracking-tight">Start shopping with AI today.</p>
            </div>
            <Link
              id="cta-bottom-enter-store"
              href="/store"
              className="flex-shrink-0 inline-flex items-center gap-3 px-8 py-4 font-bold text-[10px] uppercase tracking-[0.2em] text-black border-2 border-black hover:bg-black hover:text-white transition-colors"
            >
              Enter Store
            </Link>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer className="w-full border-t border-slate-100 py-10 px-8 mt-auto">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-black flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-black">TechDojo AI</span>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-6 text-center">
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">© 2026 Bangladesh</p>
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">Built on Next.js</p>
            </div>
          </div>
        </footer>

      </main>
    </>
  );
}
