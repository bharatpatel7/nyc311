import { lazy, Suspense, type Dispatch, type SetStateAction } from "react";

const ClusterMap = lazy(() => import("@/components/feature/ClusterMap"));

interface MapCardProps {
  isWalkthroughOpen: boolean;
  setIsWalkthroughOpen: Dispatch<SetStateAction<boolean>>;
}

const MapCard = ({ isWalkthroughOpen, setIsWalkthroughOpen }: MapCardProps) => (
  <div className="glass overflow-hidden rounded-2xl">
    <Suspense
      fallback={<div className="h-[calc(100vh-190px)] min-h-[500px] animate-pulse bg-white/5" />}
    >
      <ClusterMap
        className="h-[calc(100vh-190px)] min-h-[500px]"
        isWalkthroughOpen={isWalkthroughOpen}
        setIsWalkthroughOpen={setIsWalkthroughOpen}
      />
    </Suspense>
  </div>
);

export default MapCard;
