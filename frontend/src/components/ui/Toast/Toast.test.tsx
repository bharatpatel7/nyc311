import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import ToastMessage from "./Toast";
import {
  TEST_MESSAGE,
  OPACITY_STYLE,
  INVISIBLE_DISABLE_EVENTS,
  VARIANT_STYLES,
  TIMER_DURATION,
} from "./constants";

describe("ToastMessage", () => {
  const defaultProps = {
    message: TEST_MESSAGE,
    isVisible: true,
    onClose: vi.fn(),
  };

  it("should render the message text", () => {
    render(<ToastMessage {...defaultProps} />);
    expect(screen.getByText(TEST_MESSAGE)).toBeInTheDocument();
  });

  it("should have isVisible classes when isVisible is true", () => {
    render(<ToastMessage {...defaultProps} />);
    const toast = screen.getByRole("alert");
    expect(toast).toHaveClass(OPACITY_STYLE.VISIBLE);
    expect(toast).not.toHaveClass(INVISIBLE_DISABLE_EVENTS);
  });

  it("sould have hidden classes when isVisible is false", () => {
    render(<ToastMessage {...defaultProps} isVisible={false} />);
    const toast = screen.getByRole("alert");
    expect(toast).toHaveClass(OPACITY_STYLE.NOT_VISIBLE);
    expect(toast).toHaveClass(INVISIBLE_DISABLE_EVENTS);
  });

  it("should call onClose when the close button is clicked", async () => {
    const onClose = vi.fn();
    render(<ToastMessage {...defaultProps} onClose={onClose} />);

    await userEvent.click(screen.getByRole("button"));
    expect(onClose).toHaveBeenCalledOnce();
  });

  describe("variant styles", () => {
    it("should apply info variant style by default", () => {
      render(<ToastMessage {...defaultProps} />);
      expect(screen.getByRole("alert")).toHaveClass(VARIANT_STYLES.INFO);
    });

    it("should apply other variant styles", () => {
      render(<ToastMessage {...defaultProps} variant="error" />);
      expect(screen.getByRole("alert")).toHaveClass(VARIANT_STYLES.ERROR);
    });
  });

  describe("auto dismiss timer", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("should call onClose after the specified duration", () => {
      const onClose = vi.fn();
      render(<ToastMessage {...defaultProps} onClose={onClose} duration={TIMER_DURATION} />);

      expect(onClose).not.toHaveBeenCalled();
      vi.advanceTimersByTime(TIMER_DURATION);
      expect(onClose).toHaveBeenCalledOnce();
    });

    it("should not auto-dismiss when duration is not set", () => {
      const onClose = vi.fn();
      render(<ToastMessage {...defaultProps} onClose={onClose} />);

      vi.advanceTimersByTime(TIMER_DURATION);
      expect(onClose).not.toHaveBeenCalled();
    });

    it("should not auto-dismiss when not isVisible", () => {
      const onClose = vi.fn();
      render(
        <ToastMessage
          {...defaultProps}
          isVisible={false}
          onClose={onClose}
          duration={TIMER_DURATION}
        />
      );

      vi.advanceTimersByTime(TIMER_DURATION);
      expect(onClose).not.toHaveBeenCalled();
    });
  });
});
