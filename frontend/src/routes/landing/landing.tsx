import { lazy, Suspense, useEffect, useState } from "react";
import { Link } from "react-router";
import {
  FiArrowRight,
  FiBarChart2,
  FiBox,
  FiClock,
  FiFilter,
  FiGithub,
  FiMap,
} from "react-icons/fi";
import Logo from "@/components/layout/Logo";
import SiteFooter from "@/components/layout/SiteFooter";
import TiltCard from "@/components/layout/TiltCard";
import { GITHUB_URL } from "@/components/layout/constants";
import { useCityPoints } from "@/components/feature/City3D/useCityPoints";
import { MAP_ATTRIBUTION } from "@/components/feature/City3D/constants";
import { fetchSummary } from "@/lib/api";
import { MOCK_SUMMARY } from "@/lib/api.mocks";
import { useCountUp } from "@/hooks/useCountUp";
import type { Summary } from "@/types/api";
import { FEATURES, PIPELINE } from "./data";

const City3D = lazy(() => import("@/components/feature/City3D/City3D"));

const FEATURE_ICONS = [FiBox, FiFilter, FiClock, FiBarChart2];

const HeroStat = ({ value, label }: { value: number; label: string }) => {
  const shown = useCountUp(value);
  return (
    <div>
      <div className="font-display text-2xl font-semibold text-white tabular-nums sm:text-3xl">
        {shown.toLocaleString()}
      </div>
      <div className="mt-1 text-xs uppercase tracking-wider text-slate-400">{label}</div>
    </div>
  );
};

export default function Landing() {
  const { points } = useCityPoints({ applyFilters: false });
  const [summary, setSummary] = useState<Summary>(MOCK_SUMMARY);

  useEffect(() => {
    fetchSummary().then(setSummary);
  }, []);

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-ink">
      {/* Hero: the live 3D city sits behind everything */}
      <section className="relative h-[100svh] min-h-[640px]">
        <div className="absolute inset-0 z-0">
          <Suspense fallback={null}>
            {points.length > 0 && (
              <City3D points={points} autoRotate interactive={false} attributionPosition="none" />
            )}
          </Suspense>
        </div>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_70%_40%,transparent_20%,rgba(5,7,13,0.85)_75%)]"
        />
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-ink/50 lg:hidden" />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 w-full bg-linear-to-r from-ink/90 via-ink/40 to-transparent lg:w-2/3"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-linear-to-t from-ink to-transparent"
        />

        <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Logo />
          <nav className="glass flex items-center gap-1 rounded-full p-1 text-sm">
            <Link
              to="/dashboard"
              className="rounded-full px-4 py-1.5 text-slate-300 transition hover:bg-white/10 hover:text-white"
            >
              Dashboard
            </Link>
            <Link
              to="/dashboard/city"
              className="rounded-full px-4 py-1.5 text-slate-300 transition hover:bg-white/10 hover:text-white"
            >
              3D City
            </Link>
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noreferrer"
              aria-label="Source on GitHub"
              className="rounded-full px-3 py-1.5 text-slate-300 transition hover:bg-white/10 hover:text-white"
            >
              <FiGithub />
            </a>
          </nav>
        </header>

        <div className="relative z-10 mx-auto flex h-[calc(100%-80px)] max-w-7xl items-center px-6 pb-16">
          <div className="max-w-xl animate-rise">
            <span className="glass inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium text-cyan-200">
              <span className="relative flex size-2">
                <span className="absolute inset-0 rounded-full bg-cyan-400 [animation:pulse-ring_1.8s_ease-out_infinite]" />
                <span className="relative size-2 rounded-full bg-cyan-400" />
              </span>
              Built on NYC Open Data
            </span>
            <h1 className="mt-6 text-5xl font-semibold leading-[1.05] text-white sm:text-7xl">
              Watch the city&apos;s <span className="text-gradient">complaints rise</span> in 3D.
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-slate-300">
              Every 311 request, plotted on a living map of New York. The taller the column, the
              more people called. See which blocks need attention and how fast the city responds.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                to="/dashboard/city"
                className="group inline-flex items-center gap-2 rounded-full bg-linear-to-r from-cyan-400 to-blue-500 px-6 py-3 font-semibold text-ink shadow-[0_10px_40px_-10px_rgba(34,211,238,0.8)] transition hover:brightness-110"
              >
                Explore the 3D city
                <FiArrowRight className="transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                to="/dashboard"
                className="glass inline-flex items-center gap-2 rounded-full px-6 py-3 font-semibold text-white transition hover:bg-white/10"
              >
                <FiMap /> Open dashboard
              </Link>
            </div>

            <div className="glass mt-12 grid max-w-md grid-cols-3 gap-6 rounded-2xl px-6 py-5">
              <HeroStat value={summary.totalComplaints} label="Complaints" />
              <HeroStat value={summary.complaintsByAgency.length} label="Agencies" />
              <HeroStat value={summary.complaintsByBorough.length} label="Boroughs" />
            </div>
          </div>
        </div>

        <p className="absolute bottom-2 right-3 z-10 text-[10px] text-slate-500">
          {MAP_ATTRIBUTION}
        </p>
        <p className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2 text-xs uppercase tracking-[0.3em] text-slate-500">
          Scroll
        </p>
      </section>

      {/* Features */}
      <section className="relative overflow-hidden">
        <div className="aurora" aria-hidden />
        <div className="relative mx-auto max-w-7xl px-6 py-24">
          <p className="text-sm font-semibold uppercase tracking-widest text-cyan-300">
            What you can do
          </p>
          <h2 className="mt-3 max-w-2xl text-4xl font-semibold text-white sm:text-5xl">
            From millions of calls to one clear picture.
          </h2>
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((feature, i) => {
              const Icon = FEATURE_ICONS[i];
              return (
                <TiltCard key={feature.title} className="p-6">
                  <span className="grid size-11 place-items-center rounded-xl bg-white/5 text-xl text-cyan-300 ring-1 ring-white/10">
                    <Icon />
                  </span>
                  <h3 className="mt-5 text-lg font-semibold text-white">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-400">
                    {feature.description}
                  </p>
                </TiltCard>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-7xl px-6 pb-28">
        <p className="text-sm font-semibold uppercase tracking-widest text-violet-300">
          Under the hood
        </p>
        <h2 className="mt-3 text-4xl font-semibold text-white sm:text-5xl">How the data flows</h2>
        <ol className="mt-12 grid gap-4 md:grid-cols-5">
          {PIPELINE.map((step, i) => (
            <li key={step.title} className="glass relative rounded-2xl p-5">
              <span className="font-display text-sm text-slate-500">0{i + 1}</span>
              <h3 className="mt-2 font-semibold text-white">{step.title}</h3>
              <p className="mt-1 text-sm text-slate-400">{step.description}</p>
              {i < PIPELINE.length - 1 && (
                <FiArrowRight
                  aria-hidden
                  className="absolute -right-3.5 top-1/2 z-10 hidden -translate-y-1/2 text-cyan-300/70 md:block"
                />
              )}
            </li>
          ))}
        </ol>
      </section>

      <SiteFooter />
    </div>
  );
}
