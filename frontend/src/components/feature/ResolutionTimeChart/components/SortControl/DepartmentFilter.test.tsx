import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import DepartmentFilter from "./DepartmentFilter";
import type { Agency } from "@/types/agency";

const AGENCIES: Agency[] = ["HPD", "NYPD", "DOT", "DSNY"];

describe("DepartmentFilter", () => {
  let onChange: Mock<(value: Agency | undefined) => void>;

  beforeEach(() => {
    onChange = vi.fn();
    Element.prototype.scrollIntoView = vi.fn();
  });

  it("renders with 'All Agencies' default label when no value is selected", () => {
    render(<DepartmentFilter value={undefined} onChange={onChange} activeAgencies={AGENCIES} />);

    expect(screen.getByText("All Agencies")).toBeInTheDocument();
  });

  it("displays the selected agency when a value is provided", () => {
    render(<DepartmentFilter value="HPD" onChange={onChange} activeAgencies={AGENCIES} />);

    expect(screen.getByText("HPD")).toBeInTheDocument();
  });

  it("lists all activeAgencies as options when opened", async () => {
    const user = userEvent.setup();
    render(<DepartmentFilter value={undefined} onChange={onChange} activeAgencies={AGENCIES} />);

    await user.click(screen.getByRole("combobox"));

    const listbox = screen.getByRole("listbox");
    for (const agency of AGENCIES) {
      expect(within(listbox).getByText(agency)).toBeInTheDocument();
    }
    expect(screen.getAllByRole("option")).toHaveLength(AGENCIES.length + 1);
  });

  it("calls onChange with selected agency when an option is clicked", async () => {
    const user = userEvent.setup();
    render(<DepartmentFilter value={undefined} onChange={onChange} activeAgencies={AGENCIES} />);

    await user.click(screen.getByRole("combobox"));
    await user.click(screen.getByText("NYPD"));

    expect(onChange).toHaveBeenCalledOnce();
    expect(onChange).toHaveBeenCalledWith("NYPD");
  });

  it("calls onChange with undefined when the default 'All Agencies' option is selected", async () => {
    const user = userEvent.setup();
    render(<DepartmentFilter value="HPD" onChange={onChange} activeAgencies={AGENCIES} />);

    await user.click(screen.getByRole("combobox"));
    await user.click(screen.getByText("All Agencies"));

    expect(onChange).toHaveBeenCalledOnce();
    expect(onChange).toHaveBeenCalledWith(undefined);
  });

  it("does not call onChange when no selection is made", () => {
    render(<DepartmentFilter value={undefined} onChange={onChange} activeAgencies={AGENCIES} />);

    expect(onChange).not.toHaveBeenCalled();
  });

  it("disables the trigger and shows loading text when loading is true", () => {
    render(
      <DepartmentFilter
        value={undefined}
        onChange={onChange}
        activeAgencies={AGENCIES}
        isLoading={true}
      />
    );

    const trigger = screen.getByRole("combobox");
    expect(trigger).toBeDisabled();
    expect(screen.getByText("Loading…")).toBeInTheDocument();
  });

  it("renders an empty list when activeAgencies is empty", async () => {
    const user = userEvent.setup();
    render(<DepartmentFilter value={undefined} onChange={onChange} activeAgencies={[]} />);

    await user.click(screen.getByRole("combobox"));

    const options = screen.getAllByRole("option");
    expect(options).toHaveLength(1);
    expect(within(screen.getByRole("listbox")).getByText("All Agencies")).toBeInTheDocument();
  });
});
