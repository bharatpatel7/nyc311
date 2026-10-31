import { useState } from "react";
import { FiDownload, FiExternalLink, FiFileText } from "react-icons/fi";
import { cn } from "@/lib/util";
import { Panel } from "./components";
import { FINDINGS, PIPELINE, REPORT_FILES, REPORT_PAGES } from "./insights.data";

const EMBED_URL = import.meta.env.VITE_POWERBI_EMBED_URL as string | undefined;

/**
 * Power BI report page. Embeds a live "Publish to web" report when
 * VITE_POWERBI_EMBED_URL is set; otherwise shows the exported report pages
 * with the .pbix and PDF available to download.
 */
export default function DashboardInsights() {
  const [active, setActive] = useState(0);

  if (EMBED_URL) {
    return (
      <Panel className="h-[calc(100vh-150px)] min-h-[560px]">
        <iframe
          title="NYC 311 Power BI report"
          src={EMBED_URL}
          className="h-full w-full border-0"
          allowFullScreen
        />
      </Panel>
    );
  }

  const page = REPORT_PAGES[active];

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
      <Panel className="flex flex-col">
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 pt-5">
          <div
            role="tablist"
            aria-label="Report pages"
            className="flex gap-1 rounded-full bg-white/5 p-1"
          >
            {REPORT_PAGES.map((p, i) => (
              <button
                key={p.title}
                type="button"
                role="tab"
                aria-selected={i === active}
                onClick={() => setActive(i)}
                className={cn(
                  "rounded-full px-3.5 py-1.5 text-sm font-medium transition",
                  i === active ? "bg-white text-ink" : "text-slate-300 hover:bg-white/10"
                )}
              >
                {p.title}
              </button>
            ))}
          </div>
          <a
            href={page.src}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-cyan-300"
          >
            Full size <FiExternalLink aria-hidden />
          </a>
        </div>
        <p className="px-5 pt-3 text-sm text-slate-400">{page.caption}</p>
        <div className="p-5">
          <a href={page.src} target="_blank" rel="noreferrer" className="block">
            <img
              src={page.src}
              alt={`Power BI report page: ${page.title}. ${page.caption}`}
              className="w-full rounded-xl bg-white shadow-[0_30px_80px_-30px_rgba(0,0,0,0.8)] ring-1 ring-white/10"
            />
          </a>
        </div>
      </Panel>

      <div className="grid content-start gap-4">
        <Panel className="p-5">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/10 px-2.5 py-1 text-xs font-medium text-amber-300 ring-1 ring-amber-400/30">
            Built in Power BI Desktop
          </span>
          <h1 className="mt-3 text-xl font-semibold text-white">Power BI insights</h1>
          <p className="mt-1.5 text-sm leading-relaxed text-slate-400">
            A three-page report on a star schema in Azure SQL Database, with DAX measures for
            response times and closure rates.
          </p>
          <div className="mt-4 grid gap-2">
            {REPORT_FILES.map(({ label, href, detail, kind }) => (
              <a
                key={href}
                href={href}
                download
                className="glass flex items-center gap-3 rounded-xl px-3.5 py-2.5 transition hover:bg-white/10"
              >
                {kind === "pbix" ? (
                  <FiDownload aria-hidden className="text-cyan-300" />
                ) : (
                  <FiFileText aria-hidden className="text-cyan-300" />
                )}
                <span className="flex-1">
                  <span className="block text-sm font-medium text-white">{label}</span>
                  <span className="block text-xs text-slate-400">{detail}</span>
                </span>
              </a>
            ))}
          </div>
        </Panel>

        <Panel title="What the data shows" className="pb-5">
          <ul className="mt-3 space-y-3 px-5">
            {FINDINGS.map(({ value, text }) => (
              <li key={text} className="flex gap-3">
                <span className="w-16 shrink-0 font-display text-lg font-semibold text-white tabular-nums">
                  {value}
                </span>
                <span className="text-sm leading-snug text-slate-400">{text}</span>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="How it's built" className="pb-5">
          <ol className="mt-3 space-y-2 px-5">
            {PIPELINE.map((step, i) => (
              <li key={step.title} className="flex items-baseline gap-3 text-sm">
                <span className="w-5 shrink-0 font-display text-xs text-slate-500">0{i + 1}</span>
                <span className="text-slate-200">{step.title}</span>
                <span className="ml-auto text-xs text-slate-500">{step.detail}</span>
              </li>
            ))}
          </ol>
        </Panel>
      </div>
    </div>
  );
}
