import type { ComplaintType } from "@/types/api";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import Dropdown from "./Dropdown";
import { TEST_DEFAULT, TEST_ID, TEST_LABEL, TEST_OPTIONS } from "./constants";

describe("Dropdown", () => {
  let onChange: Mock<(value: ComplaintType | undefined) => void>;

  beforeEach(() => {
    onChange = vi.fn();
    Element.prototype.scrollIntoView = vi.fn();
  });

  it("disables the button while loading", () => {
    render(
      <Dropdown
        id={TEST_ID}
        label={TEST_LABEL}
        value={undefined}
        onChange={onChange}
        options={[]}
        loading={true}
        error={false}
      />
    );

    const trigger = screen.getByRole("combobox");
    expect(trigger).toBeDisabled();
    expect(trigger).toHaveAttribute("aria-busy", "true");
  });

  it("shows loading text while fetching", () => {
    render(
      <Dropdown
        id={TEST_ID}
        label={TEST_LABEL}
        value={undefined}
        onChange={onChange}
        options={[]}
        loading={true}
        error={false}
      />
    );

    expect(screen.getByText("Loading…")).toBeInTheDocument();
  });

  it("renders all options plus a default clear option when opened", async () => {
    const user = userEvent.setup();
    render(
      <Dropdown
        id={TEST_ID}
        label={TEST_LABEL}
        value={undefined}
        onChange={onChange}
        options={TEST_OPTIONS}
        loading={false}
        error={false}
        defaultLabel={TEST_DEFAULT}
      />
    );

    await user.click(screen.getByRole("combobox"));

    const listbox = screen.getByRole("listbox");
    expect(within(listbox).getByText(TEST_DEFAULT)).toBeInTheDocument();
    for (const opt of TEST_OPTIONS) {
      expect(screen.getByText(opt)).toBeInTheDocument();
    }
    expect(screen.getAllByRole("option")).toHaveLength(TEST_OPTIONS.length + 1);
  });

  it("does not show options when closed", () => {
    render(
      <Dropdown
        id={TEST_ID}
        label={TEST_LABEL}
        value={undefined}
        onChange={onChange}
        options={TEST_OPTIONS}
        loading={false}
        error={false}
      />
    );

    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("calls onChange with the selected value", async () => {
    const user = userEvent.setup();
    render(
      <Dropdown
        id={TEST_ID}
        label={TEST_LABEL}
        value={undefined}
        onChange={onChange}
        options={TEST_OPTIONS}
        loading={false}
        error={false}
      />
    );

    await user.click(screen.getByRole("combobox"));
    await user.click(screen.getByText("Noise - Residential"));
    expect(onChange).toHaveBeenCalledWith("Noise - Residential");
  });

  it("calls onChange with undefined when selecting the default option", async () => {
    const user = userEvent.setup();
    render(
      <Dropdown
        id={TEST_ID}
        label={TEST_LABEL}
        value="Noise - Residential"
        onChange={onChange}
        options={TEST_OPTIONS}
        loading={false}
        error={false}
        defaultLabel={TEST_DEFAULT}
      />
    );

    await user.click(screen.getByRole("combobox"));
    await user.click(screen.getByText(TEST_DEFAULT));
    expect(onChange).toHaveBeenCalledWith(undefined);
  });

  it("closes the dropdown after selecting an option", async () => {
    const user = userEvent.setup();
    render(
      <Dropdown
        id={TEST_ID}
        label={TEST_LABEL}
        value={undefined}
        onChange={onChange}
        options={TEST_OPTIONS}
        loading={false}
        error={false}
      />
    );

    await user.click(screen.getByRole("combobox"));
    expect(screen.getByRole("listbox")).toBeInTheDocument();

    await user.click(screen.getByText("Graffiti"));
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("closes the dropdown on Escape", async () => {
    const user = userEvent.setup();
    render(
      <Dropdown
        id={TEST_ID}
        label={TEST_LABEL}
        value={undefined}
        onChange={onChange}
        options={TEST_OPTIONS}
        loading={false}
        error={false}
      />
    );

    await user.click(screen.getByRole("combobox"));
    expect(screen.getByRole("listbox")).toBeInTheDocument();

    await user.keyboard("{Escape}");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("keeps the button enabled on error with fallback options", () => {
    render(
      <Dropdown
        id={TEST_ID}
        label={TEST_LABEL}
        value={undefined}
        onChange={onChange}
        options={TEST_OPTIONS}
        loading={false}
        error={true}
      />
    );

    expect(screen.getByRole("combobox")).not.toBeDisabled();
  });

  it("renders fallback options on error", async () => {
    const user = userEvent.setup();
    render(
      <Dropdown
        id={TEST_ID}
        label={TEST_LABEL}
        value={undefined}
        onChange={onChange}
        options={TEST_OPTIONS}
        loading={false}
        error={true}
      />
    );

    await user.click(screen.getByRole("combobox"));
    for (const opt of TEST_OPTIONS) {
      expect(screen.getByText(opt)).toBeInTheDocument();
    }
  });

  // it("shows a warning message on error", () => {
  //   render(
  //     <Dropdown
  //       id={TEST_ID}
  //       label={TEST_LABEL}
  //       value={undefined}
  //       onChange={onChange}
  //       options={TEST_OPTIONS}
  //       loading={false}
  //       error={true}
  //     />
  //   );
  //
  //   expect(screen.getByRole("alert")).toHaveTextContent(ERROR_MESSAGE);
  // });

  it("has a label associated with the trigger", () => {
    render(
      <Dropdown
        id={TEST_ID}
        label={TEST_LABEL}
        value={undefined}
        onChange={onChange}
        options={TEST_OPTIONS}
        loading={false}
        error={false}
      />
    );

    const trigger = screen.getByRole("combobox");
    expect(trigger).toHaveAttribute("aria-labelledby", `${TEST_ID}-label`);
    expect(screen.getByText(TEST_LABEL)).toBeInTheDocument();
  });

  it("navigates options with arrow keys", async () => {
    const user = userEvent.setup();
    render(
      <Dropdown
        id={TEST_ID}
        label={TEST_LABEL}
        value={undefined}
        onChange={onChange}
        options={TEST_OPTIONS}
        loading={false}
        error={false}
      />
    );

    await user.click(screen.getByRole("combobox"));
    await user.keyboard("{ArrowDown}");
    await user.keyboard("{ArrowDown}");
    await user.keyboard("{Enter}");
    expect(onChange).toHaveBeenCalledWith("Noise - Residential");
  });
});
