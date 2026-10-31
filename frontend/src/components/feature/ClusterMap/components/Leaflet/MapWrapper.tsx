import type { ReactNode } from "react";
import { cn } from "@/lib/util";
import { WRAPPER_TESTID } from "@/components/feature/ClusterMap/lib/constants";

interface MapWrapperProps {
  className?: string;
  children: ReactNode;
}

const MapWrapper = ({ className, children }: MapWrapperProps) => (
  <div className={cn("relative h-[600px] w-full rounded", className)} data-testid={WRAPPER_TESTID}>
    {children}
  </div>
);

export default MapWrapper;
