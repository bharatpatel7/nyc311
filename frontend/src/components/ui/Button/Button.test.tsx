import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import Button from "./Button";
import {
  BUTTON_TEXT,
  BUTTON_COLOUR_STYLES,
  BUTTON_SIZE_STYLES,
  DEFAULT_BUTTON_CLASS,
} from "./constants";

describe("Button", () => {
  it("should render button text", () => {
    render(<Button>{BUTTON_TEXT}</Button>);
    expect(screen.getByRole("button", { name: BUTTON_TEXT })).toBeInTheDocument();
  });

  describe("variants", () => {
    it("should apply primary style by default", () => {
      render(<Button></Button>);
      expect(screen.getByRole("button")).toHaveClass(BUTTON_COLOUR_STYLES.PRIMARY);
    });

    it("shouly apply secondary styles", () => {
      render(<Button variant="secondary"></Button>);
      const btn = screen.getByRole("button");
      expect(btn).toHaveClass(BUTTON_COLOUR_STYLES.SECONDARY);
      expect(btn).not.toHaveClass(BUTTON_COLOUR_STYLES.PRIMARY);
    });
  });

  describe("sizes", () => {
    it("should apply medium size classes by default", () => {
      render(<Button></Button>);
      expect(screen.getByRole("button")).toHaveClass(BUTTON_SIZE_STYLES.MEDIUM);
    });

    it("should apply small size classes", () => {
      render(<Button size="sm"></Button>);
      expect(screen.getByRole("button")).toHaveClass(BUTTON_SIZE_STYLES.SMALL);
    });

    it("should apply large size classes", () => {
      render(<Button size="lg"></Button>);
      expect(screen.getByRole("button")).toHaveClass(BUTTON_SIZE_STYLES.LARGE);
    });
  });

  it("onClick handler works", async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}></Button>);

    await userEvent.click(screen.getByRole("button"));
    expect(handleClick).toHaveBeenCalledOnce();
  });

  it("should merge a custom className", () => {
    const CUSTOM_CLASS = "custom";

    render(<Button className={CUSTOM_CLASS}></Button>);
    const btn = screen.getByRole("button");
    expect(btn).toHaveClass(CUSTOM_CLASS);
    // Button should still have default classNames
    expect(btn).toHaveClass(DEFAULT_BUTTON_CLASS);
  });
});
