import { forwardRef } from "react";
import { MAP_TESTID } from "@/components/feature/ClusterMap/lib/constants";

const MapContainer = forwardRef<HTMLDivElement>((_, ref) => {
  return (
    <div className="relative z-0 h-full w-full overflow-hidden rounded">
      <div ref={ref} className="h-full w-full rounded" data-testid={MAP_TESTID} />
    </div>
  );
});

MapContainer.displayName = "MapContainer";

export default MapContainer;
