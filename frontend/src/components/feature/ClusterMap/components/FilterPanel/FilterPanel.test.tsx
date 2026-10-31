import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

const mockReset = vi.fn();
const mockRemoveFilter = vi.fn();
let mockActiveEntries: { key: string; value: string }[] = [];

vi.mock("@/context/FilterProvider", () => ({
  useFilters: () => ({
    activeEntries: mockActiveEntries,
    reset: mockReset,
    removeFilter: mockRemoveFilter,
  }),
}));

vi.mock("./ActiveFilters", () => ({
  default: () => (
    <div data-testid="active-filters">
      {mockActiveEntries.map(({ key, value }) => (
        <span key={key}>{`${key}: ${value}`}</span>
      ))}
    </div>
  ),
}));

vi.mock("./ToggleButton", () => ({
  default: ({ onClick }: { onClick: () => void }) => (
    <button aria-label="Toggle filter panel" onClick={onClick}>
      ›
    </button>
  ),
}));

vi.mock("./PanelBody", () => ({
  default: ({ isExpanded }: { isExpanded: boolean }) =>
    isExpanded ? (
      <div className="backdrop-blur-md bg-white/25 border-white/40 shadow-xl backdrop-blur-xl" />
    ) : null,
}));

import FilterPanel from "./FilterPanel";
import ActiveFilterBadge from "./ActiveFilterBadge";

const defaultProps = {
  isExpanded: false,
  onExpand: vi.fn(),
  onCollapse: vi.fn(),
  activeTab: "filters" as const,
  onTabChange: vi.fn(),
  filteredCount: 0,
  viewportCount: 0,
};

beforeEach(() => {
  mockActiveEntries = [];
  vi.clearAllMocks();
});

// ===========================================================================
// FilterPanel — positioning (no overlap with ZoomPanel)
// ===========================================================================

describe("FilterPanel — no overlap with ZoomPanel", () => {
  it("mounts at the top-left corner of the map", () => {
    const { container } = render(
      <FilterPanel {...defaultProps}>
        <div />
      </FilterPanel>
    );
    const root = container.firstChild as HTMLElement;
    expect(root.className).toContain("absolute");
    expect(root.className).toContain("left-1");
    expect(root.className).toContain("top-1");
  });

  it("does not use bottom or right positioning that would collide with ZoomPanel", () => {
    const { container } = render(
      <FilterPanel {...defaultProps}>
        <div />
      </FilterPanel>
    );
    const root = container.firstChild as HTMLElement;
    expect(root.className).not.toMatch(/\bbottom-/);
    expect(root.className).not.toMatch(/\bright-/);
  });
});

// ===========================================================================
// FilterPanel — expand / collapse
// ===========================================================================

describe("FilterPanel — expand / collapse", () => {
  it("calls onExpand when toggle button is clicked", () => {
    const onExpand = vi.fn();
    render(
      <FilterPanel {...defaultProps} onExpand={onExpand}>
        <div />
      </FilterPanel>
    );
    fireEvent.click(screen.getByRole("button", { name: /toggle filter panel/i }));
    expect(onExpand).toHaveBeenCalledOnce();
  });

  it("does not render PanelBody when collapsed", () => {
    const { container } = render(
      <FilterPanel {...defaultProps} isExpanded={false}>
        <div />
      </FilterPanel>
    );
    expect(container.querySelector(".bg-white\\/25")).toBeNull();
  });

  it("renders PanelBody when expanded", () => {
    const { container } = render(
      <FilterPanel {...defaultProps} isExpanded>
        <div />
      </FilterPanel>
    );
    expect(container.querySelector(".bg-white\\/25")).not.toBeNull();
  });

  it("calls onCollapse when clicking outside", () => {
    const onCollapse = vi.fn();
    render(
      <FilterPanel {...defaultProps} isExpanded onCollapse={onCollapse}>
        <div />
      </FilterPanel>
    );
    fireEvent.mouseDown(document.body);
    expect(onCollapse).toHaveBeenCalledOnce();
  });

  it("does not call onCollapse when clicking inside", () => {
    const onCollapse = vi.fn();
    const { container } = render(
      <FilterPanel {...defaultProps} isExpanded onCollapse={onCollapse}>
        <div />
      </FilterPanel>
    );
    fireEvent.mouseDown(container.firstChild as HTMLElement);
    expect(onCollapse).not.toHaveBeenCalled();
  });
});

// ===========================================================================
// FilterPanel — glass card styling
// ===========================================================================

describe("FilterPanel — glass card styling", () => {
  it("applies backdrop-blur when expanded", () => {
    const { container } = render(
      <FilterPanel {...defaultProps} isExpanded>
        <div />
      </FilterPanel>
    );
    expect(container.querySelector(".backdrop-blur-md, .backdrop-blur-xl")).not.toBeNull();
  });

  it("applies bg-white/25 when expanded", () => {
    const { container } = render(
      <FilterPanel {...defaultProps} isExpanded>
        <div />
      </FilterPanel>
    );
    expect(container.querySelector(".bg-white\\/25")).not.toBeNull();
  });

  it("applies border-white/40 when expanded", () => {
    const { container } = render(
      <FilterPanel {...defaultProps} isExpanded>
        <div />
      </FilterPanel>
    );
    expect(container.querySelector(".border-white\\/40")).not.toBeNull();
  });

  it("applies shadow-xl when expanded", () => {
    const { container } = render(
      <FilterPanel {...defaultProps} isExpanded>
        <div />
      </FilterPanel>
    );
    expect(container.querySelector(".shadow-xl")).not.toBeNull();
  });
});

// ===========================================================================
// ActiveFilterBadge — rendering
// ===========================================================================

describe("ActiveFilterBadge — rendering", () => {
  it("renders the filter label text", () => {
    render(
      <ActiveFilterBadge
        filterKey="borough"
        label="Borough: MANHATTAN"
        onRemove={mockRemoveFilter}
      />
    );
    expect(screen.getByText("Borough: MANHATTAN")).toBeInTheDocument();
  });

  it("renders a remove button with an accessible aria-label", () => {
    render(
      <ActiveFilterBadge filterKey="status" label="Status: Open" onRemove={mockRemoveFilter} />
    );
    expect(screen.getByRole("button", { name: /remove status: open filter/i })).toBeInTheDocument();
  });

  it("renders exactly one remove button per badge", () => {
    render(
      <ActiveFilterBadge filterKey="borough" label="Borough: BRONX" onRemove={mockRemoveFilter} />
    );
    expect(screen.getAllByRole("button")).toHaveLength(1);
  });
});

// ===========================================================================
// ActiveFilterBadge — remove interaction
// ===========================================================================

describe("ActiveFilterBadge — remove interaction", () => {
  it("calls onRemove with 'borough' when × is clicked", () => {
    render(
      <ActiveFilterBadge
        filterKey="borough"
        label="Borough: BROOKLYN"
        onRemove={mockRemoveFilter}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: /remove/i }));
    expect(mockRemoveFilter).toHaveBeenCalledOnce();
    expect(mockRemoveFilter).toHaveBeenCalledWith("borough");
  });

  it("calls onRemove with 'complaintType' when × is clicked", () => {
    render(
      <ActiveFilterBadge
        filterKey="complaintType"
        label="Complaint Type: Noise"
        onRemove={mockRemoveFilter}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: /remove/i }));
    expect(mockRemoveFilter).toHaveBeenCalledWith("complaintType");
  });

  it("calls onRemove with 'status' when × is clicked", () => {
    render(
      <ActiveFilterBadge filterKey="status" label="Status: Closed" onRemove={mockRemoveFilter} />
    );
    fireEvent.click(screen.getByRole("button", { name: /remove/i }));
    expect(mockRemoveFilter).toHaveBeenCalledWith("status");
  });

  it("does not call onRemove before the button is clicked", () => {
    render(
      <ActiveFilterBadge filterKey="borough" label="Borough: QUEENS" onRemove={mockRemoveFilter} />
    );
    expect(mockRemoveFilter).not.toHaveBeenCalled();
  });
});
