import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Loader from "./Loader";
import {
  SPINNER_CLASS,
  FONT_SIZE_CLASS,
  SIZE_CASES,
  DEFAULT_LABEL,
  DEFAULT_LABEL_ONLY,
} from "./constants";

describe("Loader", () => {
  it("should have an accessible status role", () => {
    render(<Loader />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("should render the spinner", () => {
    const { container } = render(<Loader />);
    expect(container.querySelector(`.${SPINNER_CLASS}`)).toBeInTheDocument();
  });

  it("should render a label when provided", () => {
    render(<Loader label={DEFAULT_LABEL} />);
    expect(screen.getByText(DEFAULT_LABEL)).toBeInTheDocument();
  });

  it("should not render a label when omitted", () => {
    render(<Loader />);
    expect(screen.queryByText(DEFAULT_LABEL)).not.toBeInTheDocument();
  });

  it.each(SIZE_CASES)("should apply correct class for $size", ({ size, expected }) => {
    const { container } = render(<Loader size={size} />);
    expect(container.querySelector(`.${SPINNER_CLASS}`)).toHaveClass(expected);
  });

  it("should default to medium", () => {
    const { container } = render(<Loader />);
    expect(container.querySelector(`.${SPINNER_CLASS}`)).toHaveClass(FONT_SIZE_CLASS.md);
  });

  it("should show default label when spinner is hidden and no label is provided", () => {
    render(<Loader isShowSpinner={false} />);
    expect(screen.getByText(DEFAULT_LABEL)).toBeInTheDocument();
  });

  it("should use custom label over default when spinner is hidden", () => {
    render(<Loader isShowSpinner={false} label={DEFAULT_LABEL_ONLY} />);
    expect(screen.getByText(DEFAULT_LABEL_ONLY)).toBeInTheDocument();
    expect(screen.queryByText(DEFAULT_LABEL)).not.toBeInTheDocument();
  });

  it("should not render the spinner when isShowSpinner is false", () => {
    const { container } = render(<Loader isShowSpinner={false} />);
    expect(container.querySelector(`.${SPINNER_CLASS}`)).not.toBeInTheDocument();
  });

  it("should apply a custom className to the wrapper", () => {
    const { container } = render(<Loader className="my-custom-class" />);
    expect(container.firstChild).toHaveClass("my-custom-class");
  });

  it("should still have base wrapper classes with a custom className", () => {
    const { container } = render(<Loader className="extra" />);
    expect(container.firstChild).toHaveClass("flex");
  });

  it("should render at sm size without error", () => {
    expect(() => render(<Loader size="sm" />)).not.toThrow();
  });

  it("should render at lg size without error", () => {
    expect(() => render(<Loader size="lg" />)).not.toThrow();
  });

  it("should render label alongside the spinner", () => {
    render(<Loader label="Fetching data" />);
    expect(screen.getByText("Fetching data")).toBeInTheDocument();
  });
});
