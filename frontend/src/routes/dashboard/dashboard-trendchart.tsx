import Chart from "@/components/feature/ResolutionTimeChart/ResolutionTimeChart";
import { Panel } from "./components";

export default function ResolutionTimeChart() {
  return (
    <Panel>
      <div className="flex h-[calc(100vh-190px)] min-h-[500px] flex-col">
        <div className="min-h-0 flex-1 overflow-hidden">
          <Chart />
        </div>
        <p className="shrink-0 px-5 pb-4 text-xs text-slate-500">
          Only agencies with at least one closed complaint are included in resolution time
          calculations.
        </p>
      </div>
    </Panel>
  );
}
