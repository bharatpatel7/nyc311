import { FiArrowRight, FiBarChart } from "react-icons/fi";
import { Panel } from "./components";

const EMBED_URL = import.meta.env.VITE_POWERBI_EMBED_URL as string | undefined;

const PIPELINE = [
  { title: "NYC Open Data", detail: "311 API" },
  { title: "Python ingestor", detail: "MariaDB" },
  { title: "Sync job", detail: "Docker → Azure" },
  { title: "Azure SQL", detail: "Star schema" },
  { title: "Microsoft Fabric", detail: "Semantic model + DAX" },
  { title: "Power BI", detail: "Embedded here" },
];

/** Power BI report embedded from "Publish to web", or a placeholder until one is published. */
export default function DashboardInsights() {
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

  return (
    <Panel className="flex min-h-[560px] flex-col items-center justify-center px-6 py-16 text-center">
      <span className="grid size-14 place-items-center rounded-2xl bg-amber-400/10 text-2xl text-amber-300 ring-1 ring-amber-400/30">
        <FiBarChart aria-hidden />
      </span>
      <h1 className="mt-6 text-3xl font-semibold text-white">Power BI insights</h1>
      <p className="mt-3 max-w-xl text-slate-400">
        A Power BI report on response times, hotspots and trends, built on an Azure SQL star schema.
        It appears here once it&apos;s published.
      </p>
      <ol className="mt-10 flex flex-wrap items-center justify-center gap-2">
        {PIPELINE.map((step, i) => (
          <li key={step.title} className="flex items-center gap-2">
            <div className="glass rounded-xl px-4 py-2.5 text-left">
              <div className="text-sm font-medium text-white">{step.title}</div>
              <div className="text-xs text-slate-400">{step.detail}</div>
            </div>
            {i < PIPELINE.length - 1 && <FiArrowRight aria-hidden className="text-cyan-300/70" />}
          </li>
        ))}
      </ol>
    </Panel>
  );
}
