import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Section from "./Section";
import {
  SECTION_CONTENT,
  SECTION_TITLE,
  SECTION_SUBTITLE,
  HEADING_STYLE,
  BASE_CLASS,
  CUSTOM_CLASS,
  HEADING_LEVEL,
} from "./constants";

describe("Section", () => {
  it("should render children content", () => {
    render(
      <Section>
        <p>{SECTION_CONTENT}</p>
      </Section>
    );
    expect(screen.getByText(SECTION_CONTENT)).toBeInTheDocument();
  });

  it("should render a title heading when provided", () => {
    render(
      <Section title={SECTION_TITLE}>
        <p></p>
      </Section>
    );
    expect(
      screen.getByRole("heading", { level: HEADING_LEVEL, name: SECTION_TITLE })
    ).toBeInTheDocument();
  });

  it("should render a subtitle when provided", () => {
    render(
      <Section subtitle={SECTION_SUBTITLE}>
        <p></p>
      </Section>
    );
    expect(screen.getByText(SECTION_SUBTITLE)).toBeInTheDocument();
  });

  it("should render both title and subtitle together", () => {
    render(
      <Section title={SECTION_TITLE} subtitle={SECTION_SUBTITLE}>
        <p></p>
      </Section>
    );
    expect(screen.getByRole("heading", { name: SECTION_TITLE })).toBeInTheDocument();
    expect(screen.getByText(SECTION_SUBTITLE)).toBeInTheDocument();
  });

  it("should omit the heading block when neither title nor subtitle is provided", () => {
    const { container } = render(
      <Section>
        <p></p>
      </Section>
    );
    expect(container.querySelector(HEADING_STYLE)).not.toBeInTheDocument();
  });

  it("should merge a custom className onto the section element", () => {
    const { container } = render(
      <Section className={CUSTOM_CLASS}>
        <p></p>
      </Section>
    );
    const section = container.querySelector("section");
    expect(section).toHaveClass(CUSTOM_CLASS);
    // Base styles should still be present
    expect(section).toHaveClass(BASE_CLASS);
  });
});
