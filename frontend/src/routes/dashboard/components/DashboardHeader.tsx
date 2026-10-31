import DashboardTitle from "./DashboardTitle";
import BackButton from "./BackButton";
import { useFilters } from "@/context/FilterProvider";

const DashboardHeader = () => {
  const { isWalkthroughOpen } = useFilters();
  return (
    <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <BackButton disabled={isWalkthroughOpen} />
        <DashboardTitle />
      </div>
    </header>
  );
};

export default DashboardHeader;
