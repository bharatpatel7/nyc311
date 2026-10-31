import { Chart } from "@/components/feature/TimeSeriesChart";
import { Panel } from "./components";

export default function DashboardTimeChart() {
  return (
    <Panel>
      <div className="flex h-[calc(100vh-190px)] min-h-[500px] flex-col">
        <div className="min-h-0 flex-1 overflow-hidden">
          <Chart />
        </div>
      </div>
    </Panel>
  );
}
