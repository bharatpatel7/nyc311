import type { ResolutionTimeChartContainerProps } from "./types";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { formatResolutionTooltip, getAgencyFromBar } from "./utils";
import {
  RESOLUTION_CHART_TITLE,
  RESOLUTION_CHART_HEIGHT,
  RESOLUTION_CHART_YAXIS_LABEL,
  RESOLUTION_CHART_BAR_COLOR,
} from "@/api/resolutionTime/constants";
import { useFilters } from "@/context/FilterProvider";
import { DepartmentFilter } from "./components";

const ResolutionTimeChartContainer = ({ children }: ResolutionTimeChartContainerProps) => (
  <div className="h-full p-6">
    <h2 className="mb-4 text-lg font-semibold text-white">{RESOLUTION_CHART_TITLE}</h2>
    {children}
  </div>
);

const ResolutionTimeChart = () => {
  const { data, agency, setAgency, activeAgencies, isLoading, isError } = useFilters();
  let filteredData = agency ? data.filter((d) => d.agency === agency) : data;
  return (
    <ResolutionTimeChartContainer>
      <DepartmentFilter
        value={agency}
        onChange={setAgency}
        activeAgencies={[...activeAgencies]}
        isLoading={isLoading}
        isError={isError}
      />
      <div className="outline-none mt-8" onMouseDown={(e) => e.preventDefault()}>
        <ResponsiveContainer width="100%" height={RESOLUTION_CHART_HEIGHT}>
          <BarChart data={filteredData} margin={{ top: 8, right: 24, left: 16, bottom: 48 }}>
            <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
            <XAxis
              dataKey="agency"
              angle={-35}
              textAnchor="end"
              tick={{ fontSize: 12, fill: "#94a3b8" }}
              interval={0}
            />
            <YAxis
              label={{
                value: RESOLUTION_CHART_YAXIS_LABEL,
                angle: -90,
                position: "insideLeft",
                offset: -4,
                style: { fontSize: 12, fill: "#94a3b8" },
              }}
              tick={{ fontSize: 12, fill: "#94a3b8" }}
            />
            <Tooltip
              isAnimationActive={false}
              formatter={formatResolutionTooltip}
              cursor={{ fill: "rgba(255,255,255,0.04)" }}
              contentStyle={{
                background: "rgba(10,14,25,0.9)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 12,
              }}
              labelStyle={{ color: "#f0efec", fontWeight: 600 }}
              itemStyle={{ color: "#cbd5e1" }}
            />
            <Bar
              dataKey="medianMinutes"
              fill={RESOLUTION_CHART_BAR_COLOR}
              radius={[4, 4, 0, 0]}
              maxBarSize={60}
              cursor="pointer"
              onClick={(d) => {
                const clicked = getAgencyFromBar(d);
                setAgency(clicked === agency ? undefined : clicked);
              }}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ResolutionTimeChartContainer>
  );
};

export default ResolutionTimeChart;
