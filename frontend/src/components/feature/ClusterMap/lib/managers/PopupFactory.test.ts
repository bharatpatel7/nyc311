import { describe, it, expect, beforeEach } from "vitest";
import { PopupFactory } from "./PopupFactory";
import { POINT } from "@/mocks";
import { STATUS_FILLS } from "./constants";
import { STATUS_COLOUR_CASES } from "./utils";

describe("PopupFactory", () => {
  let factory: PopupFactory;

  beforeEach(() => {
    factory = new PopupFactory();
  });

  it("includes all point fields in the HTML output", () => {
    const html = factory.createHTML(POINT);
    expect(html).toContain(POINT.complaintType);
    expect(html).toContain(POINT.borough);
    expect(html).toContain(POINT.createdDate);
    expect(html).toContain(POINT.status);
  });

  it.each(STATUS_COLOUR_CASES)("uses correct colour for status %s", (status, colour) => {
    expect(factory.createHTML({ ...POINT, status })).toContain(colour);
  });

  it("uses default colour for unknown status", () => {
    expect(factory.createHTML({ ...POINT, status: "default" })).toContain(
      STATUS_FILLS.default.colour
    );
  });

  it("applies border-radius to popup wrapper and handles missing element gracefully", () => {
    const wrapper = document.createElement("div");
    wrapper.className = "leaflet-popup-content-wrapper";
    const popup = document.createElement("div");
    popup.appendChild(wrapper);

    factory.styleElement(popup);
    expect(wrapper.style.borderRadius).toBe("2px");
    expect(() => factory.styleElement(undefined)).not.toThrow();
  });
});
