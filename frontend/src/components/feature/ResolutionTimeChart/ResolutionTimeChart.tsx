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
  <div className="bg-white p-6  h-[calc(100vh-220px)] min-h-[500px] bg-slate-100 dark:bg-slate-800">
    <h2 className="mb-4 text-lg font-semibold text-gray-900">{RESOLUTION_CHART_TITLE}</h2>
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
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="agency"
              angle={-35}
              textAnchor="end"
              tick={{ fontSize: 12 }}
              interval={0}
            />
            <YAxis
              label={{
                value: RESOLUTION_CHART_YAXIS_LABEL,
                angle: -90,
                position: "insideLeft",
                offset: -4,
                style: { fontSize: 12 },
              }}
              tick={{ fontSize: 12 }}
            />
            <Tooltip isAnimationActive={false} formatter={formatResolutionTooltip} />
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
