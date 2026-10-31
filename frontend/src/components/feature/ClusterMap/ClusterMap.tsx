import type { ActiveTab, ClusterMapProps } from "@/types/ClusterMap";
import { useEffect, useRef, useState, useCallback } from "react";
import { MapController } from "./lib/MapController";
import {
  MapContainer,
  MapWrapper,
  LoadingOverlay,
  ZoomPanel,
  EmptyState,
  EdgeFade,
  LoadingBar,
} from "./components";
import { MAX_ZOOM, MIN_ZOOM, TOAST_MESSAGE, TOAST_TIMER } from "./lib/constants";
import { FilterPanel } from "./components/FilterPanel";
import { useFilters } from "@/context/FilterProvider";
import DateRangeFilter from "@/components/feature/ClusterMap/components/DateRangeFilter";
import { CategoryFilter } from "./components/CategoryFilter";
import ToastMessage from "@/components/ui/Toast";
import SpotlightTip from "./components/Spotlight";

const ClusterMap = ({ className, isWalkthroughOpen, setIsWalkthroughOpen }: ClusterMapProps) => {
  const filterPanelRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  // holds the MapController instance — kept in a ref so it survives re-renders
  const controllerRef = useRef<MapController | null>(null);

  // tracks whether a reload is in progress, used to
  // suppress the empty state flash while markers are being replaced
  const isReloadingRef = useRef(false);
  // once we've had real data, we hide the "load mock" button on the empty state
  const hasEverHadDataRef = useRef(false);

  // refs used as stable callbacks passed into MapController so it always
  // reads the latest value without needing to recreate the controller
  const isInitialLoadRef = useRef(true);
  const colourByStatusRef = useRef(true);
  const panOnClusterRef = useRef(true);
  const panOnMarkerRef = useRef(true);

  // full-screen overlay shown only on the very first load
  const [loading, setLoading] = useState(true);
  // thin loading bar shown on subsequent reloads/filter changes
  const [softLoading, setSoftLoading] = useState(false);

  const [isEmpty, setIsEmpty] = useState(false);
  // delayed version of isEmpty — adds a small buffer to avoid flashing on fast loads
  const [showEmpty, setShowEmpty] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterActiveTab, setFilterActiveTab] = useState<ActiveTab>("filters");
  const [zoom, setZoom] = useState(MIN_ZOOM);
  const [isAtDefault, setIsAtDefault] = useState(true);
  const [filteredCount, setFilteredCount] = useState(0);
  const [viewportCount, setViewportCount] = useState(0);
  const [showNoResults, setShowNoResults] = useState(false);

  const filters = useFilters();

  // show the "no results" toast whenever filters are active but nothing matched
  useEffect(() => {
    if (filteredCount === 0 && filters.activeEntries.length > 0) {
      setShowNoResults(true);
    }
  }, [filteredCount, filters.activeEntries.length]);

  // delay showing the empty state slightly so it doesn't flash during fast reloads
  useEffect(() => {
    if (!isEmpty || softLoading || loading) {
      setShowEmpty(false);
      return;
    }
    const timer = setTimeout(() => setShowEmpty(true), 150);
    return () => clearTimeout(timer);
  }, [isEmpty, softLoading, loading]);

  // suppress empty state during reloads; track whether we've had data at least once
  const handleEmptyChange = useCallback((empty: boolean) => {
    if (empty && isReloadingRef.current) return;
    if (!empty) hasEverHadDataRef.current = true;
    setIsEmpty(empty);
  }, []);

  // first load drives the full-screen overlay; subsequent loads use the soft loading bar
  const handleLoadingChange = useCallback((isLoading: boolean) => {
    if (isInitialLoadRef.current) {
      setLoading(isLoading);
      if (!isLoading) isInitialLoadRef.current = false;
    } else {
      isReloadingRef.current = isLoading;
      setSoftLoading(isLoading);
      if (isLoading) setIsEmpty(false);
    }
  }, []);

  // mount the MapController once and clean it up on unmount
  useEffect(() => {
    const el = containerRef.current;
    if (!el || controllerRef.current) return;
    const controller = new MapController({
      onLoadingChange: handleLoadingChange,
      onEmptyChange: handleEmptyChange,
      onZoomChange: setZoom,
      onPointsChange: (filtered) => {
        setFilteredCount(filtered);
      },
      onViewportCountChange: setViewportCount,
      onViewChange: (atDefault) => setIsAtDefault(atDefault),
      getColourByStatus: () => colourByStatusRef.current,
      getPanOnMarker: () => panOnMarkerRef.current,
      getPanOnCluster: () => panOnClusterRef.current,
    });
    controllerRef.current = controller;
    controller.mount(el);
    return () => {
      controller.destroy();
      controllerRef.current = null;
    };
  }, [handleEmptyChange, handleLoadingChange]);

  // push filter changes into the controller whenever the context updates
  useEffect(() => {
    controllerRef.current?.applyFilters({
      borough: filters.borough,
      complaintType: filters.complaintType,
      status: filters.status,
      dateFrom: filters.dateFrom,
      dateTo: filters.dateTo,
    });
  }, [filters.borough, filters.complaintType, filters.status, filters.dateFrom, filters.dateTo]);

  const handleZoomIn = useCallback(() => controllerRef.current?.zoomIn(), []);

  const handleZoomOut = useCallback(() => controllerRef.current?.zoomOut(), []);

  const handleReset = useCallback(() => {
    controllerRef.current?.resetView();
    setIsAtDefault(true);
  }, []);

  const handleLoadMock = useCallback(() => {
    controllerRef.current?.setUseMock(true);
  }, []);

  return (
    <MapWrapper className={className}>
      <MapContainer ref={containerRef} />
      {isWalkthroughOpen && <div className="absolute inset-0 z-[9997]" />}
      <EdgeFade />
      <LoadingOverlay isVisible={loading} />
      <LoadingBar isVisible={softLoading} />
      {showEmpty && filters.activeEntries.length === 0 && (
        <EmptyState onLoadMock={hasEverHadDataRef.current ? undefined : handleLoadMock} />
      )}
      <ToastMessage
        variant="info"
        isVisible={filteredCount === 0 && showNoResults && !loading}
        onClose={() => setShowNoResults(false)}
        message={TOAST_MESSAGE}
        duration={TOAST_TIMER}
      />
      <ZoomPanel
        zoomIn={handleZoomIn}
        zoomOut={handleZoomOut}
        resetView={handleReset}
        disableZoomIn={zoom >= MAX_ZOOM || isWalkthroughOpen}
        disableZoomOut={zoom <= MIN_ZOOM || isWalkthroughOpen}
        disableReset={isAtDefault || isWalkthroughOpen}
      />
      <FilterPanel
        ref={filterPanelRef}
        isExpanded={filterOpen}
        onExpand={() => setFilterOpen(true)}
        onCollapse={() => {
          if (!isWalkthroughOpen) setFilterOpen(false);
        }}
        spotlight={isWalkthroughOpen}
        activeTab={filterActiveTab}
        onTabChange={setFilterActiveTab}
        filteredCount={filteredCount}
        viewportCount={viewportCount}
      >
        <div data-walkthrough="category-filter">
          <CategoryFilter />
        </div>

        <div data-walkthrough="date-range-filter">
          <DateRangeFilter />
        </div>
      </FilterPanel>
      <SpotlightTip
        id="filter-panel-v1"
        targetRef={filterPanelRef}
        onOpenChange={setIsWalkthroughOpen}
        steps={[
          {
            title: "Open the filter panel",
            description: "Click the filter icon in the top-left of the map to open the panel.",
            onEnter: () => {
              setFilterOpen(false);
              setFilterActiveTab("filters");
            },
            highlightSelector: "[data-walkthrough='toggle-button']",
          },
          {
            title: "Filter by group",
            description: "Use the dropdowns to filter by complaint type, borough, and/or status.",
            onEnter: () => {
              setFilterOpen(true);
              setFilterActiveTab("filters");
            },
            highlightSelector: "[data-walkthrough='category-filter']",
          },
          {
            title: "Filter by date range",
            description:
              "Pick a start and/or end date to narrow complaints to a specific time period.",
            onEnter: () => {
              setFilterOpen(true);
              setFilterActiveTab("filters");
            },
            highlightSelector: "[data-walkthrough='date-range-filter']",
          },
          {
            title: "Review active filters",
            description:
              "Switch to the Active tab to see all applied filters and reset them individually.",
            onEnter: () => {
              setFilterOpen(true);
              setFilterActiveTab("active");
            },
            highlightSelector: "[data-walkthrough='active-filters']",
          },
        ]}
        onDismiss={() => setFilterOpen(false)}
      />
    </MapWrapper>
  );
};

export default ClusterMap;
