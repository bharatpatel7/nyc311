import { MapCard } from "./components";
import { useFilters } from "@/context/FilterProvider";

const DashboardMap = () => {
  const { isWalkthroughOpen, setIsWalkthroughOpen } = useFilters();
  return (
    <MapCard isWalkthroughOpen={isWalkthroughOpen} setIsWalkthroughOpen={setIsWalkthroughOpen} />
  );
};

export default DashboardMap;
