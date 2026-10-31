import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { FilterProvider, useFilters } from "@/context/FilterProvider";
import { mock, POINT } from "@/mocks";
import type { GeoPoint } from "@/types/geopoints";
import type { ComplaintType, Borough, Status } from "@/types/api";

const FilterConsumer = ({ points }: { points: GeoPoint[] }) => {
  const ctx = useFilters();
  const filtered = ctx.filterPoints(points);
  return <span data-testid="count">{filtered.length}</span>;
};

const setup = (points: GeoPoint[] = [POINT]) => {
  let ctxRef: ReturnType<typeof useFilters>;

  const Capture = () => {
    ctxRef = useFilters();
    return <FilterConsumer points={points} />;
  };

  render(
    <FilterProvider>
      <Capture />
    </FilterProvider>
  );

  return {
    getCount: () => Number(screen.getByTestId("count").textContent),
    ctx: () => ctxRef,
  };
};

describe("FilterProvider", () => {
  beforeEach(() => {
    localStorage.clear();
    mock.filterOptions.loaded();
  });

  describe("filterPoints — complaintType branch", () => {
    it("keeps point when complaintType filter matches", async () => {
      const { getCount, ctx } = setup();
      await act(async () => ctx().setComplaintType("Noise - Residential" as ComplaintType));
      expect(getCount()).toBe(1);
    });

    it("removes point when complaintType filter does not match", async () => {
      const { getCount, ctx } = setup();
      await act(async () => ctx().setComplaintType("Rodent" as ComplaintType));
      expect(getCount()).toBe(0);
    });
  });

  describe("filterPoints — borough branch", () => {
    it("keeps point when borough filter matches", async () => {
      const { getCount, ctx } = setup();
      await act(async () => ctx().setBorough("MANHATTAN" as Borough));
      expect(getCount()).toBe(1);
    });

    it("removes point when borough filter does not match", async () => {
      const { getCount, ctx } = setup();
      await act(async () => ctx().setBorough("BROOKLYN" as Borough));
      expect(getCount()).toBe(0);
    });
  });

  describe("filterPoints — status branch", () => {
    it("keeps point when status filter matches", async () => {
      const { getCount, ctx } = setup();
      await act(async () => ctx().setStatus("Open" as Status));
      expect(getCount()).toBe(1);
    });

    it("removes point when status filter does not match", async () => {
      const { getCount, ctx } = setup();
      await act(async () => ctx().setStatus("Closed" as Status));
      expect(getCount()).toBe(0);
    });
  });

  describe("filterPoints — dateFrom branch", () => {
    it("keeps point when createdDate is on or after dateFrom", async () => {
      const { getCount, ctx } = setup();
      await act(async () => ctx().setDateFrom("2025-01-01"));
      expect(getCount()).toBe(1);
    });

    it("removes point when createdDate is before dateFrom", async () => {
      const { getCount, ctx } = setup();
      await act(async () => ctx().setDateFrom("2025-07-01"));
      expect(getCount()).toBe(0);
    });
  });

  describe("filterPoints — dateTo branch", () => {
    it("keeps point when createdDate is on or before dateTo", async () => {
      const { getCount, ctx } = setup();
      await act(async () => ctx().setDateTo("2025-12-31"));
      expect(getCount()).toBe(1);
    });

    it("removes point when createdDate is after dateTo", async () => {
      const { getCount, ctx } = setup();
      await act(async () => ctx().setDateTo("2025-01-01"));
      expect(getCount()).toBe(0);
    });
  });

  describe("filterPoints — no active filters", () => {
    it("returns all points when no filter is set", () => {
      const points: GeoPoint[] = [POINT, { ...POINT, uniqueKey: "2" }];
      const { getCount } = setup(points);
      expect(getCount()).toBe(2);
    });
  });

  describe("filterPoints — multiple filters combined", () => {
    it("applies all active filters together", async () => {
      const { getCount, ctx } = setup();
      await act(async () => {
        ctx().setComplaintType("Noise - Residential" as ComplaintType);
        ctx().setBorough("MANHATTAN" as Borough);
        ctx().setStatus("Open" as Status);
        ctx().setDateFrom("2025-01-01");
        ctx().setDateTo("2025-12-31");
      });
      expect(getCount()).toBe(1);
    });

    it("returns 0 when one filter in a combination does not match", async () => {
      const { getCount, ctx } = setup();
      await act(async () => {
        ctx().setComplaintType("Noise - Residential" as ComplaintType);
        ctx().setBorough("BRONX" as Borough);
      });
      expect(getCount()).toBe(0);
    });
  });

  describe("reset", () => {
    it("clears all filters so filterPoints returns all points", async () => {
      const { getCount, ctx } = setup();
      await act(async () => ctx().setBorough("BRONX" as Borough));
      expect(getCount()).toBe(0);
      await act(async () => ctx().reset());
      expect(getCount()).toBe(1);
    });
  });

  describe("removeFilter", () => {
    it("removes a single active filter", async () => {
      const { getCount, ctx } = setup();
      await act(async () => ctx().setBorough("BRONX" as Borough));
      expect(getCount()).toBe(0);
      await act(async () => ctx().removeFilter("borough"));
      expect(getCount()).toBe(1);
    });
  });

  describe("activeEntries", () => {
    it("is empty when no filters are set", () => {
      const { ctx } = setup();
      expect(ctx().activeEntries).toHaveLength(0);
    });

    it("reflects set filters", async () => {
      const { ctx } = setup();
      await act(async () => ctx().setBorough("MANHATTAN" as Borough));
      const entry = ctx().activeEntries.find((e) => e.key === "borough");
      expect(entry?.value).toBe("MANHATTAN");
    });
  });

  describe("useFilters outside provider", () => {
    it("throws when used outside FilterProvider", () => {
      const Bad = () => {
        useFilters();
        return null;
      };
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      expect(() => render(<Bad />)).toThrow("useFilters must be used within a FilterProvider");
      consoleSpy.mockRestore();
    });
  });
});
