import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Card from "./Card";
import { CARD_TITLE, CARD_DESC, CARD_ICON, HEADING_LEVEL } from "./constants";

describe("Card", () => {
  const defaultProps = {
    icon: <span data-testid={CARD_ICON}></span>,
    title: CARD_TITLE,
    description: CARD_DESC,
  };

  it("should render the title", () => {
    render(<Card {...defaultProps} />);
    expect(
      screen.getByRole("heading", { level: HEADING_LEVEL, name: CARD_TITLE })
    ).toBeInTheDocument();
  });

  it("should render the description", () => {
    render(<Card {...defaultProps} />);
    expect(screen.getByText(CARD_DESC)).toBeInTheDocument();
  });

  it("should render the icon", () => {
    render(<Card {...defaultProps} />);
    expect(screen.getByTestId(CARD_ICON)).toBeInTheDocument();
  });
});
