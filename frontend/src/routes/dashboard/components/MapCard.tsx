import { lazy, Suspense, type Dispatch, type SetStateAction } from "react";

const ClusterMap = lazy(() => import("@/components/feature/ClusterMap"));

interface MapCardProps {
  isWalkthroughOpen: boolean;
  setIsWalkthroughOpen: Dispatch<SetStateAction<boolean>>;
}

const MapCard = ({ isWalkthroughOpen, setIsWalkthroughOpen }: MapCardProps) => (
  <div className="overflow-hidden rounded border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/5 dark:shadow-black/30 dark:backdrop-blur-sm">
    <Suspense
      fallback={
        <div className="h-[calc(100vh-220px)] min-h-[500px] bg-slate-100 dark:bg-slate-800" />
      }
    >
      <ClusterMap
        className="h-[calc(100vh-220px)] min-h-[500px]"
        isWalkthroughOpen={isWalkthroughOpen}
        setIsWalkthroughOpen={setIsWalkthroughOpen}
      />
    </Suspense>
  </div>
);

export default MapCard;
