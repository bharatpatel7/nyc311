import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ComplaintVolumeChart from "./ComplaintVolumeChart";
import { MOCK_COMPLAINT_VOLUME } from "./mock";
import {
  CHART_TITLE,
  EMPTY_TEXT,
  ERROR_TEXT,
  HOOK_EMPTY,
  HOOK_ERROR,
  HOOK_LOADED,
  HOOK_LOADING,
  HOOK_SINGLE,
  LEGEND_ITEM_NOISE,
  LOADING_TEXT,
  SELECTOR_LINE,
  SELECTOR_LINE_CHART,
  SELECTOR_X_AXIS,
  SELECTOR_Y_AXIS,
  STRIKETHROUGH_STYLE,
  TOGGLE_BUTTON_PATTERN,
  VISIBLE_COUNT_PATTERN,
} from "./constants";

vi.mock("recharts", async () => {
  const actual = await vi.importActual<typeof import("recharts")>("recharts");
  return {
    ...actual,
    ResponsiveContainer: ({ children }: { children: React.ReactElement }) => (
      <div data-testid="responsive-container">
        {React.cloneElement(children, { width: 500, height: 400 } as Record<string, unknown>)}
      </div>
    ),
  };
});

const mockUseComplaintVolume = vi.fn();
vi.mock("@/hooks/useComplaintVolume", () => ({
  useComplaintVolume: (...args: unknown[]) => mockUseComplaintVolume(...args),
}));

vi.mock("@/hooks/usePersistedState", () => ({
  usePersistedState: () => ({ value: undefined, setValue: vi.fn() }),
}));

describe("ComplaintVolumeChart", () => {
  beforeEach(() => {
    localStorage.clear();
    mockUseComplaintVolume.mockReturnValue(HOOK_LOADED);
  });

  it("renders the chart title", () => {
    render(<ComplaintVolumeChart />);

    expect(screen.getByText(CHART_TITLE)).toBeInTheDocument();
  });

  it("renders one line per complaint type", () => {
    const { container } = render(<ComplaintVolumeChart />);

    const lines = container.querySelectorAll(SELECTOR_LINE);
    const types = [...new Set(MOCK_COMPLAINT_VOLUME.map((d) => d.complaintType))];
    expect(lines).toHaveLength(types.length);
  });

  it("renders a single line when filtered to one type", () => {
    mockUseComplaintVolume.mockReturnValue(HOOK_SINGLE);

    const { container } = render(<ComplaintVolumeChart />);

    const lines = container.querySelectorAll(SELECTOR_LINE);
    expect(lines).toHaveLength(1);
  });

  it("renders the custom legend below the chart", () => {
    render(<ComplaintVolumeChart />);

    const types = [...new Set(MOCK_COMPLAINT_VOLUME.map((d) => d.complaintType))];
    for (const type of types) {
      expect(screen.getByText(type)).toBeInTheDocument();
    }
  });

  it("toggles line visibility when legend item is clicked", async () => {
    const user = userEvent.setup();
    render(<ComplaintVolumeChart />);

    const noiseButton = screen.getByText(LEGEND_ITEM_NOISE);
    await user.click(noiseButton);

    expect(noiseButton).toHaveStyle(STRIKETHROUGH_STYLE);
  });

  it("re-shows line when toggled legend item is clicked again", async () => {
    const user = userEvent.setup();
    render(<ComplaintVolumeChart />);

    const noiseButton = screen.getByText(LEGEND_ITEM_NOISE);
    await user.click(noiseButton);
    await user.click(noiseButton);

    expect(noiseButton).not.toHaveStyle(STRIKETHROUGH_STYLE);
  });

  it("shows loading state while fetching", () => {
    mockUseComplaintVolume.mockReturnValue(HOOK_LOADING);

    render(<ComplaintVolumeChart />);

    expect(screen.getByText(LOADING_TEXT)).toBeInTheDocument();
  });

  it("does not render a chart while loading", () => {
    mockUseComplaintVolume.mockReturnValue(HOOK_LOADING);

    const { container } = render(<ComplaintVolumeChart />);

    expect(container.querySelector(SELECTOR_LINE_CHART)).not.toBeInTheDocument();
  });

  it("shows error state when request fails", () => {
    mockUseComplaintVolume.mockReturnValue(HOOK_ERROR);

    render(<ComplaintVolumeChart />);

    expect(screen.getByText(ERROR_TEXT)).toBeInTheDocument();
  });

  it("shows empty state when data is empty", () => {
    mockUseComplaintVolume.mockReturnValue(HOOK_EMPTY);

    render(<ComplaintVolumeChart />);

    expect(screen.getByText(EMPTY_TEXT)).toBeInTheDocument();
  });

  it("does not render a chart when data is empty", () => {
    mockUseComplaintVolume.mockReturnValue(HOOK_EMPTY);

    const { container } = render(<ComplaintVolumeChart />);

    expect(container.querySelector(SELECTOR_LINE_CHART)).not.toBeInTheDocument();
  });

  it("displays the y-axis label", () => {
    const { container } = render(<ComplaintVolumeChart />);

    expect(container.querySelector(SELECTOR_Y_AXIS)).toBeInTheDocument();
  });

  it("displays months on the x-axis", () => {
    const { container } = render(<ComplaintVolumeChart />);

    expect(container.querySelector(SELECTOR_X_AXIS)).toBeInTheDocument();
  });

  it("shows visible count", () => {
    render(<ComplaintVolumeChart />);

    expect(screen.getByText(VISIBLE_COUNT_PATTERN)).toBeInTheDocument();
  });

  it("renders Show All / Hide All toggle button", () => {
    render(<ComplaintVolumeChart />);

    expect(screen.getByRole("button", { name: TOGGLE_BUTTON_PATTERN })).toBeInTheDocument();
  });
});
