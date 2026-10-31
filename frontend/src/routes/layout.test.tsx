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
          <Route path="city" element={<DashboardNav />} />
          <Route path="explorer" element={<DashboardNav />} />
          <Route path="scorecard" element={<DashboardNav />} />
          <Route path="pulse" element={<DashboardNav />} />
          <Route path="insights" element={<DashboardNav />} />
        </Route>
      </Routes>
    </MemoryRouter>
  );

describe("dashboard nav", () => {
  it("renders controls for every dashboard view", () => {
    renderDashboardNav("/dashboard/explorer");

    expect(screen.getByRole("link", { name: "3D City" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Insights" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Overview" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Explorer" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Scorecard" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "City Pulse" })).toBeInTheDocument();
  });

  it("indicates the explorer as active on /dashboard/map", () => {
    renderDashboardNav("/dashboard/explorer");

    expect(screen.getByRole("link", { name: "Explorer" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Scorecard" })).not.toHaveAttribute("aria-current");
  });

  it("indicates the scorecard as active on /dashboard/scorecard", () => {
    renderDashboardNav("/dashboard/scorecard");

    expect(screen.getByRole("link", { name: "Scorecard" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Explorer" })).not.toHaveAttribute("aria-current");
  });

  it("indicates city pulse as active on /dashboard/pulse", () => {
    renderDashboardNav("/dashboard/pulse");

    expect(screen.getByRole("link", { name: "City Pulse" })).toHaveAttribute(
      "aria-current",
      "page"
    );
    expect(screen.getByRole("link", { name: "Explorer" })).not.toHaveAttribute("aria-current");
  });

  it("indicates 3D city as active on /dashboard/city", () => {
    renderDashboardNav("/dashboard/city");

    expect(screen.getByRole("link", { name: "3D City" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Overview" })).not.toHaveAttribute("aria-current");
  });

  it("navigates to the selected subroute when clicked", async () => {
    const user = userEvent.setup();
    renderDashboardNav("/dashboard/explorer");

    await user.click(screen.getByRole("link", { name: "Scorecard" }));

    expect(screen.getByRole("link", { name: "Scorecard" })).toHaveAttribute("aria-current", "page");
  });
});
