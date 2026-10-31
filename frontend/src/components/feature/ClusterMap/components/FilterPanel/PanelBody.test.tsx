import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import PanelBody from "./PanelBody";
import ToggleButton from "./ToggleButton";

let mockActiveEntries: { key: string; value: string }[] = [];

vi.mock("@/context/FilterProvider", () => ({
  useFilters: () => ({
    activeEntries: mockActiveEntries,
    reset: vi.fn(),
    removeFilter: vi.fn(),
  }),
}));

vi.mock("./ActiveFilters", () => ({
  default: () => <div data-testid="active-filters" />,
}));

const defaultBodyProps = {
  isExpanded: true,
  activeTab: "active" as const,
  onTabChange: vi.fn(),
  onHide: vi.fn(),
  filteredCount: 40,
  viewportCount: 20,
};

describe("PanelBody: Summary toggle", () => {
  // it("Summary section is hidden by default", () => {
  //   render(
  //     <PanelBody {...defaultBodyProps}>
  //       <div />
  //     </PanelBody>
  //   );
  //   expect(screen.queryByText("Total")).not.toBeInTheDocument();
  // });

  // it("clicking Summary button reveals the Summary section", () => {
  //   render(
  //     <PanelBody {...defaultBodyProps}>
  //       <div />
  //     </PanelBody>
  //   );
  //   fireEvent.click(screen.getByText("Summary"));
  //   expect(screen.getByText("Total")).toBeInTheDocument();
  // });

  it("Summary displays In View count", () => {
    render(
      <PanelBody {...defaultBodyProps}>
        <div />
      </PanelBody>
    );
    fireEvent.click(screen.getByText("Summary"));
    expect(screen.getByText("In View")).toBeInTheDocument();
  });

  it("Summary displays Filtered row when active filters exist", () => {
    mockActiveEntries = [{ key: "status", value: "Open" }];
    render(
      <PanelBody {...defaultBodyProps}>
        <div />
      </PanelBody>
    );
    fireEvent.click(screen.getByText("Summary"));
    expect(screen.getByText("Filtered")).toBeInTheDocument();
    mockActiveEntries = [];
  });
});

describe("ToggleButton: active state", () => {
  it("renders count badge when filters are active", () => {
    mockActiveEntries = [{ key: "borough", value: "MANHATTAN" }];
    render(<ToggleButton isExpanded={false} onClick={vi.fn()} />);
    expect(screen.getByText("1")).toBeInTheDocument();
    mockActiveEntries = [];
  });

  it("renders without badge when no filters are active", () => {
    mockActiveEntries = [];
    render(<ToggleButton isExpanded={false} onClick={vi.fn()} />);
    expect(screen.queryByText(/^\d+$/)).not.toBeInTheDocument();
  });
});
