import { describe, it, expect, beforeEach } from "vitest";
import L from "leaflet";
import { IconFactory } from "./IconFactory";
import {
  COUNTS_INITIAL,
  COUNT_POST_RESET,
  COUNT_TOP_OF_TWO,
  CLUSTER_ICON_CLASS,
  COUNT_MIDDLE_OF_THREE,
  COUNT_FOURTH_OF_FIVE,
  COUNT_SMALL,
  COUNT_K_FORMAT,
  EXPECTED_K_LABEL,
  STATUS_UNKNOWN,
  COUNTS_EXACTLY_THREE,
  COUNTS_FEWER_THAN_THREE,
  COUNTS_FIVE,
} from "./constants";
import { STATUS_OPEN, STATUS_CLOSED } from "../../constants";

const mockCluster = (count: number): L.MarkerCluster =>
  ({ getChildCount: () => count }) as unknown as L.MarkerCluster;

let factory: IconFactory;

beforeEach(() => {
  factory = new IconFactory();
});

describe("IconFactory.computeRankCutoffs", () => {
  it("resets cutoffs on empty array", () => {
    factory.computeRankCutoffs(COUNTS_INITIAL);
    factory.computeRankCutoffs([]);
    const icon = factory.createClusterIcon(mockCluster(COUNT_POST_RESET));
    expect(icon).toBeDefined();
  });

  it("sets redMin to last element when fewer than 3 counts", () => {
    factory.computeRankCutoffs(COUNTS_FEWER_THAN_THREE);
    const icon = factory.createClusterIcon(mockCluster(COUNT_TOP_OF_TWO));
    expect(icon.options.className).toBe(CLUSTER_ICON_CLASS);
  });

  it("sets yellowMin to Infinity when yellowEnd <= 3", () => {
    factory.computeRankCutoffs(COUNTS_EXACTLY_THREE);
    const icon = factory.createClusterIcon(mockCluster(COUNT_MIDDLE_OF_THREE));
    expect(icon).toBeDefined();
  });

  it("sets yellowMin from sorted array when yellowEnd > 3", () => {
    factory.computeRankCutoffs(COUNTS_FIVE);
    const icon = factory.createClusterIcon(mockCluster(COUNT_FOURTH_OF_FIVE));
    expect(icon).toBeDefined();
  });
});

describe("IconFactory.createClusterIcon", () => {
  it("returns cached icon on repeated calls", () => {
    factory.computeRankCutoffs([]);
    const a = factory.createClusterIcon(mockCluster(COUNT_SMALL));
    const b = factory.createClusterIcon(mockCluster(COUNT_SMALL));
    expect(a).toBe(b);
  });

  it("returns new icon after clearClusterCache", () => {
    factory.computeRankCutoffs([]);
    const a = factory.createClusterIcon(mockCluster(COUNT_SMALL));
    factory.clearClusterCache();
    const b = factory.createClusterIcon(mockCluster(COUNT_SMALL));
    expect(a).not.toBe(b);
  });

  it("formats counts >= 1000 as Nk", () => {
    factory.computeRankCutoffs([]);
    const icon = factory.createClusterIcon(mockCluster(COUNT_K_FORMAT));
    expect(icon.options.html).toContain(EXPECTED_K_LABEL);
  });
});

describe("IconFactory.getMarkerIcons", () => {
  it("returns different icons for normal and hovered states", () => {
    const { normal, hovered } = factory.getMarkerIcons(STATUS_OPEN, true);
    expect(normal).not.toBe(hovered);
  });

  it("returns same icon for all statuses when colourByStatus is false", () => {
    const a = factory.getMarkerIcons(STATUS_OPEN, false);
    const b = factory.getMarkerIcons(STATUS_CLOSED, false);
    expect(a.normal).toBe(b.normal);
  });

  it("returns different icons per status when colourByStatus is true", () => {
    const a = factory.getMarkerIcons(STATUS_OPEN, true);
    const b = factory.getMarkerIcons(STATUS_CLOSED, true);
    expect(a.normal).not.toBe(b.normal);
  });

  it("falls back to default fill for unknown status", () => {
    const { normal } = factory.getMarkerIcons(STATUS_UNKNOWN, true);
    expect(normal).toBeDefined();
  });

  it("clearAll invalidates marker cache", () => {
    const a = factory.getMarkerIcons(STATUS_OPEN, true);
    factory.clearAll();
    const b = factory.getMarkerIcons(STATUS_OPEN, true);
    expect(a.normal).not.toBe(b.normal);
  });
});
