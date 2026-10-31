import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router";
import { describe, expect, it } from "vitest";
import DashboardNav from "./dashboard/components/DashboardNav";

const renderDashboardNav = (initialEntry: string) =>
  render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/dashboard" element={<DashboardNav />}>
          <Route path="map" element={<DashboardNav />} />
          <Route path="trendchart" element={<DashboardNav />} />
          <Route path="timechart" element={<DashboardNav />} />
        </Route>
      </Routes>
    </MemoryRouter>
  );

describe("dashboard nav", () => {
  it("renders controls for map and resolution times", () => {
    renderDashboardNav("/dashboard/map");

    expect(screen.getByRole("link", { name: "Dashboard" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Map" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Resolution Times" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Complaint Volumes" })).toBeInTheDocument();
  });

  it("indicates map as active on /dashboard/map", () => {
    renderDashboardNav("/dashboard/map");

    expect(screen.getByRole("link", { name: "Map" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Resolution Times" })).not.toHaveAttribute(
      "aria-current"
    );
  });

  it("indicates resolution times as active on /dashboard/trendchart", () => {
    renderDashboardNav("/dashboard/trendchart");

    expect(screen.getByRole("link", { name: "Resolution Times" })).toHaveAttribute(
      "aria-current",
      "page"
    );
    expect(screen.getByRole("link", { name: "Map" })).not.toHaveAttribute("aria-current");
  });

  it("indicates resolution times as active on /dashboard/timechart", () => {
    renderDashboardNav("/dashboard/timechart");

    expect(screen.getByRole("link", { name: "Complaint Volumes" })).toHaveAttribute(
      "aria-current",
      "page"
    );
    expect(screen.getByRole("link", { name: "Map" })).not.toHaveAttribute("aria-current");
  });

  it("navigates to the selected subroute when clicked", async () => {
    const user = userEvent.setup();
    renderDashboardNav("/dashboard/map");

    await user.click(screen.getByRole("link", { name: "Resolution Times" }));

    expect(screen.getByRole("link", { name: "Resolution Times" })).toHaveAttribute(
      "aria-current",
      "page"
    );
  });
});
