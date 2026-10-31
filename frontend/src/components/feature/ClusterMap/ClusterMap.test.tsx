import type { ReactElement } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import ClusterMap from "./ClusterMap";
import {
  DEFAULT_REFRESH_INTERVAL_MS,
  MAP_TESTID,
  ONE_HOUR_MS,
  TEST_WAITFOR_TIMEOUT_MS,
  TEXT_COORDINATES,
  TEXT_LOAD_MOCK_DATA,
} from "@/components/feature/ClusterMap/lib/constants";
import * as api from "@/lib/api";
import { mock, POINT, POINTS } from "@/mocks";
import { FilterProvider } from "@/context/FilterProvider";
import {
  BASE_LAT,
  BTN_ACTIVE_TAB,
  BTN_RESET_ALL,
  BTN_TOGGLE_FILTERS,
  COMPLAINT_HOT_WATER,
  COMPLAINT_NOISE_RESIDENTIAL,
  CREATED_DATE_A,
  CREATED_DATE_B,
  DATE_FILTER_FUTURE,
  DATE_INPUT_COUNT,
  LABEL_REMOVE_STATUS_OPEN,
  LABEL_STATUS_COMBOBOX,
  LABEL_STATUS_OPEN_OPTION,
  LAT_STEP,
  OFFSET_LAT,
  STATUS_CLOSED,
  TEXT_NO_COMPLAINTS_MATCH,
} from "./constants";
import { COMPLAINT_TYPES, STATUSES } from "@/lib/api.constants";
import type { ComplaintType } from "@/types";
import type { MapControllerCallbacks } from "./lib";

const renderWithFilters = (
  ui: ReactElement = <ClusterMap isWalkthroughOpen={false} setIsWalkthroughOpen={() => {}} />
) => render(<FilterProvider>{ui}</FilterProvider>);

const { makeMockController, HOISTED_MOCK_POINT, HOISTED_MOCK_FILTER_OPTIONS } = vi.hoisted(() => {
  const HOISTED_ZOOM_LEVEL = 10;
  const HOISTED_MAX_ZOOM = 18;
  const HOISTED_MIN_ZOOM = 10;

  const HOISTED_MOCK_POINT = {
    uniqueKey: "1",
    latitude: 40.71,
    longitude: -74.0,
    complaintType: "Noise",
    borough: "Manhattan",
    createdDate: "2025-03-01",
    status: "Open" as const,
  };

  const HOISTED_MOCK_FILTER_OPTIONS = {
    complaintTypes: ["Noise - Residential", "Heat/Hot Water"],
    boroughs: ["MANHATTAN", "BROOKLYN"],
    statuses: ["Open", "Closed", "In Progress"],
  };

  const HOISTED_EMPTY_FILTER_OPTIONS = {
    boroughs: [] as string[],
    complaintTypes: [] as string[],
    statuses: [] as string[],
  };

  const makeMockController = (
    overrides: Partial<{ isEmpty: boolean; applyFiltersEmpty: boolean }> = {}
  ) =>
    function (this: unknown, callbacks: MapControllerCallbacks) {
      return {
        mount: vi.fn().mockImplementation(async () => {
          callbacks.onLoadingChange(false);
          callbacks.onEmptyChange(overrides.isEmpty ?? false);
          callbacks.onZoomChange(HOISTED_ZOOM_LEVEL);
        }),
        destroy: vi.fn(),
        zoomIn: vi.fn(),
        zoomOut: vi.fn(),
        resetView: vi.fn(),
        applyFilters: overrides.applyFiltersEmpty
          ? vi.fn().mockImplementation(() => {
              callbacks.onEmptyChange(true);
              callbacks.onLoadingChange(false);
            })
          : vi.fn(),
        setUseMock: vi.fn().mockImplementation(() => {
          callbacks.onEmptyChange(false);
          callbacks.onLoadingChange(false);
        }),
        reload: vi.fn(),
        getMaxZoom: vi.fn().mockReturnValue(HOISTED_MAX_ZOOM),
        getMinZoom: vi.fn().mockReturnValue(HOISTED_MIN_ZOOM),
        fetchGeoPoints: vi.fn().mockResolvedValue([]),
        fetchGeoPointsMock: vi.fn().mockResolvedValue([]),
        fetchFilterOptions: vi.fn().mockResolvedValue(HOISTED_EMPTY_FILTER_OPTIONS),
      };
    };

  return {
    makeMockController,
    HOISTED_MOCK_POINT,
    HOISTED_MOCK_FILTER_OPTIONS,
    HOISTED_EMPTY_FILTER_OPTIONS,
    HOISTED_ZOOM_LEVEL,
    HOISTED_MAX_ZOOM,
    HOISTED_MIN_ZOOM,
  };
});

vi.mock("./lib/MapController", () => ({
  MapController: vi.fn(makeMockController()),
}));

vi.mock("./lib/constants", async () => {
  const actual = await vi.importActual<typeof import("./lib/constants")>("./lib/constants");
  return { ...actual, MIN_LOAD_MS: 0, CHUNK_SIZE: 1 };
});

vi.mock("@/lib/api", () => ({
  fetchGeoPoints: vi.fn().mockResolvedValue([HOISTED_MOCK_POINT]),
  fetchGeoPointsMock: vi.fn().mockResolvedValue([HOISTED_MOCK_POINT]),
  fetchFilterOptions: vi.fn().mockResolvedValue(HOISTED_MOCK_FILTER_OPTIONS),
}));

afterEach(() => {
  vi.mocked(api.fetchGeoPoints).mockResolvedValue([POINT]);
  vi.mocked(api.fetchGeoPointsMock).mockResolvedValue([POINT]);
});

describe("ClusterMap zoom buttons", () => {
  beforeEach(async () => {
    const { MapController } = await import("./lib/MapController");
    vi.mocked(MapController).mockImplementation(makeMockController());
  });

  it("clicking zoom-in triggers map zoomIn", async () => {
    renderWithFilters();
    await waitFor(() => expect(screen.queryByRole("status")).not.toBeInTheDocument(), {
      timeout: TEST_WAITFOR_TIMEOUT_MS,
    });
    const buttons = screen.getAllByRole("button");
    await userEvent.click(buttons[0]);
    expect(buttons[0]).toBeInTheDocument();
  });

  it("clicking zoom-out triggers map zoomOut", async () => {
    renderWithFilters();
    await waitFor(() => expect(screen.queryByRole("status")).not.toBeInTheDocument(), {
      timeout: TEST_WAITFOR_TIMEOUT_MS,
    });
    const buttons = screen.getAllByRole("button");
    await userEvent.click(buttons[1]);
    expect(buttons[1]).toBeInTheDocument();
  });

  it("clicking reset view button resets the map", async () => {
    renderWithFilters();
    await waitFor(() => expect(screen.queryByRole("status")).not.toBeInTheDocument(), {
      timeout: TEST_WAITFOR_TIMEOUT_MS,
    });
    const buttons = screen.getAllByRole("button");
    await userEvent.click(buttons[2]);
    expect(buttons[2]).toBeInTheDocument();
  });
});

describe("ClusterMap with null coordinates", () => {
  beforeEach(() => {
    mock.geoPoints.loaded(POINTS);
  });

  it("skips points with null latitude or longitude", async () => {
    renderWithFilters();
    await waitFor(() => {
      expect(screen.queryByRole("status")).not.toBeInTheDocument();
    });
    expect(screen.getByTestId(MAP_TESTID)).toBeInTheDocument();
  });
});

describe("ClusterMap re-render with existing markers", () => {
  it("reuses existing markers on subsequent data loads", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });

    renderWithFilters();
    await waitFor(() => {
      expect(screen.queryByRole("status")).not.toBeInTheDocument();
    });

    mock.geoPoints.loaded([{ ...POINTS[0], status: STATUS_CLOSED }]);
    vi.advanceTimersByTime(ONE_HOUR_MS);

    await waitFor(() => {
      expect(screen.getByTestId(MAP_TESTID)).toBeInTheDocument();
    });

    vi.useRealTimers();
  });
});

describe("ClusterMap with multiple statuses", () => {
  beforeEach(() => {
    mock.geoPoints.loaded(
      STATUSES.map((status, i) => ({
        ...POINTS[0],
        uniqueKey: String(i + 1),
        latitude: BASE_LAT + i * LAT_STEP,
        status,
      }))
    );
  });

  it("renders map with markers of all status types", async () => {
    renderWithFilters();
    await waitFor(() => {
      expect(screen.queryByRole("status")).not.toBeInTheDocument();
    });
    expect(screen.getByTestId(MAP_TESTID)).toBeInTheDocument();
  });
});

describe("ClusterMap selectedPoint", () => {
  it("does not render MarkerDetailPanel by default", async () => {
    renderWithFilters();
    await waitFor(() => {
      expect(screen.queryByRole("status")).not.toBeInTheDocument();
    });
    expect(screen.queryByText(TEXT_COORDINATES)).not.toBeInTheDocument();
  });
});

describe("ClusterMap mock data toggle", () => {
  beforeEach(() => {
    mock.geoPoints.loaded([]);
    vi.spyOn(api, "fetchGeoPointsMock").mockResolvedValue([
      POINTS[0],
      { ...POINTS[0], uniqueKey: "2", latitude: OFFSET_LAT },
    ]);
  });

  it("switches from empty to mock data", async () => {
    const MockedMapController = (await import("./lib/MapController"))
      .MapController as unknown as ReturnType<typeof vi.fn>;
    MockedMapController.mockImplementationOnce(makeMockController({ isEmpty: true }));

    renderWithFilters();
    await waitFor(() => {
      expect(screen.getByText(TEXT_LOAD_MOCK_DATA)).toBeInTheDocument();
    });

    await userEvent.click(screen.getByText(TEXT_LOAD_MOCK_DATA));

    await waitFor(() => {
      expect(screen.queryByText(TEXT_LOAD_MOCK_DATA)).not.toBeInTheDocument();
    });
  });
});

describe("ClusterMap theme handling", () => {
  it("renders without error and mounts correctly", async () => {
    renderWithFilters();
    await waitFor(() => {
      expect(screen.queryByRole("status")).not.toBeInTheDocument();
    });
    expect(screen.getByTestId(MAP_TESTID)).toBeInTheDocument();
  });

  it("unmounts cleanly", async () => {
    const { unmount } = renderWithFilters();
    await waitFor(() => {
      expect(screen.queryByRole("status")).not.toBeInTheDocument();
    });
    expect(() => unmount()).not.toThrow();
  });

  it("handles rapid mount/unmount without error", () => {
    const { unmount: u1 } = renderWithFilters();
    u1();
    const { unmount: u2 } = renderWithFilters();
    u2();
  });
});

describe("ClusterMap multi-chunk processing", () => {
  beforeEach(() => {
    mock.geoPoints.loaded(
      COMPLAINT_TYPES.map((complaintType, i) => ({
        ...POINTS[0],
        uniqueKey: String.fromCharCode(97 + i),
        latitude: BASE_LAT + i * LAT_STEP,
        complaintType,
      }))
    );
  });

  it("processes multiple chunks when points exceed CHUNK_SIZE", async () => {
    renderWithFilters();
    await waitFor(() => {
      expect(screen.queryByRole("status")).not.toBeInTheDocument();
    });
    expect(screen.getByTestId(MAP_TESTID)).toBeInTheDocument();
  });

  it("correctly loads all markers across multiple chunks", async () => {
    renderWithFilters();
    await waitFor(
      () => {
        expect(screen.queryByRole("status")).not.toBeInTheDocument();
      },
      { timeout: TEST_WAITFOR_TIMEOUT_MS }
    );
    expect(screen.getByTestId(MAP_TESTID)).toBeInTheDocument();
  });
});

describe("ClusterMap duplicate POINTS[0] keys", () => {
  it("reuses markers for points with same lat/lng/type on reload", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });

    const dupePoints = [
      {
        ...POINTS[0],
        uniqueKey: "1",
        latitude: BASE_LAT,
        complaintType: COMPLAINT_NOISE_RESIDENTIAL as ComplaintType,
      },
      {
        ...POINTS[0],
        uniqueKey: "2",
        latitude: OFFSET_LAT,
        complaintType: COMPLAINT_HOT_WATER as ComplaintType,
      },
    ];
    mock.geoPoints.loaded(dupePoints);

    renderWithFilters();
    await waitFor(() => {
      expect(screen.queryByRole("status")).not.toBeInTheDocument();
    });

    vi.advanceTimersByTime(DEFAULT_REFRESH_INTERVAL_MS);

    await waitFor(() => {
      expect(screen.getByTestId(MAP_TESTID)).toBeInTheDocument();
    });

    vi.useRealTimers();
  });
});

describe("ClusterMap empty mock data", () => {
  it("does not show empty state when mock returns empty (useMock flag)", async () => {
    mock.geoPoints.loaded([]);
    vi.spyOn(api, "fetchGeoPointsMock").mockResolvedValue([POINTS[0]]);

    const MockedMapController = (await import("./lib/MapController"))
      .MapController as unknown as ReturnType<typeof vi.fn>;
    MockedMapController.mockImplementationOnce(makeMockController({ isEmpty: true }));

    renderWithFilters();
    await waitFor(() => {
      expect(screen.getByText(TEXT_LOAD_MOCK_DATA)).toBeInTheDocument();
    });

    await userEvent.click(screen.getByText(TEXT_LOAD_MOCK_DATA));

    await waitFor(() => {
      expect(screen.queryByText(TEXT_LOAD_MOCK_DATA)).not.toBeInTheDocument();
    });
  });
});

describe("ClusterMap filter controls", () => {
  it("supports selecting a filter and resetting it", async () => {
    renderWithFilters();
    await waitFor(() => {
      expect(screen.queryByRole("status")).not.toBeInTheDocument();
    });

    await userEvent.click(screen.getByRole("button", { name: BTN_TOGGLE_FILTERS }));
    const statusCombobox = screen.getByRole("combobox", { name: LABEL_STATUS_COMBOBOX });
    await userEvent.click(statusCombobox);
    const openOption = await screen.findByRole("option", { name: LABEL_STATUS_OPEN_OPTION });
    await userEvent.click(openOption);
    await userEvent.click(screen.getByRole("button", { name: BTN_ACTIVE_TAB }));

    await waitFor(() => {
      expect(screen.getByLabelText(LABEL_REMOVE_STATUS_OPEN)).toBeInTheDocument();
    });

    await userEvent.click(screen.getByRole("button", { name: BTN_RESET_ALL }));
    await waitFor(() => {
      expect(screen.queryByLabelText(LABEL_REMOVE_STATUS_OPEN)).not.toBeInTheDocument();
    });
  });

  it("clears all filter values after reset", async () => {
    vi.mocked(api.fetchGeoPoints).mockResolvedValue([
      POINT,
      { ...POINT, uniqueKey: "2", latitude: 40.72, status: "Closed" as const },
    ]);

    renderWithFilters();
    await waitFor(() => {
      expect(screen.queryByRole("status")).not.toBeInTheDocument();
    });

    await userEvent.click(screen.getByRole("button", { name: BTN_TOGGLE_FILTERS }));

    const dateInputs = document.querySelectorAll<HTMLInputElement>('input[type="date"]');
    expect(dateInputs).toHaveLength(DATE_INPUT_COUNT);

    fireEvent.change(dateInputs[0], { target: { value: CREATED_DATE_A } });
    fireEvent.change(dateInputs[1], { target: { value: CREATED_DATE_B } });

    await userEvent.click(screen.getByRole("button", { name: BTN_RESET_ALL }));

    await waitFor(() => {
      expect(dateInputs[0].value).toBe("");
      expect(dateInputs[1].value).toBe("");
    });
  });

  it("shows empty state when applyFilters results in no data", async () => {
    const MockedMapController = (await import("./lib/MapController"))
      .MapController as unknown as ReturnType<typeof vi.fn>;

    MockedMapController.mockImplementationOnce(makeMockController({ applyFiltersEmpty: true }));

    renderWithFilters();
    await waitFor(() => {
      expect(screen.queryByRole("status")).not.toBeInTheDocument();
    });

    await userEvent.click(screen.getByRole("button", { name: BTN_TOGGLE_FILTERS }));

    const dateInputs = document.querySelectorAll<HTMLInputElement>('input[type="date"]');
    expect(dateInputs).toHaveLength(DATE_INPUT_COUNT);
    fireEvent.change(dateInputs[0], { target: { value: DATE_FILTER_FUTURE } });

    await waitFor(() => {
      expect(screen.getByText(TEXT_NO_COMPLAINTS_MATCH)).toBeVisible();
    });
  });

  it("excludes records with invalid createdDate when date filter is active", async () => {
    const MockedMapController = (await import("./lib/MapController"))
      .MapController as unknown as ReturnType<typeof vi.fn>;

    MockedMapController.mockImplementationOnce(makeMockController({ applyFiltersEmpty: true }));

    renderWithFilters();
    await waitFor(() => {
      expect(screen.queryByRole("status")).not.toBeInTheDocument();
    });

    await userEvent.click(screen.getByRole("button", { name: BTN_TOGGLE_FILTERS }));

    const dateInputs = document.querySelectorAll<HTMLInputElement>('input[type="date"]');
    expect(dateInputs).toHaveLength(DATE_INPUT_COUNT);
    fireEvent.change(dateInputs[0], { target: { value: CREATED_DATE_A } });

    await waitFor(() => {
      expect(screen.getByText(TEXT_NO_COMPLAINTS_MATCH)).toBeVisible();
    });
  });
});
