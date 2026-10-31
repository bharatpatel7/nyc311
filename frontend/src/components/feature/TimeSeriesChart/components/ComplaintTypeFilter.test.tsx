import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import ComplaintTypeFilter from "./ComplaintTypeFilter";
import { COMPLAINT_TYPES, DEFAULT_LABEL } from "./constants";

describe("ComplaintTypeFilter", () => {
  let onChange: Mock<(value: string | undefined) => void>;

  beforeEach(() => {
    onChange = vi.fn();
    Element.prototype.scrollIntoView = vi.fn();
  });

  it("renders with 'All Types' default label when no value is selected", () => {
    render(
      <ComplaintTypeFilter value={undefined} onChange={onChange} complaintTypes={COMPLAINT_TYPES} />
    );

    expect(screen.getByText(DEFAULT_LABEL)).toBeInTheDocument();
  });

  it("displays the selected complaint type when a value is provided", () => {
    render(
      <ComplaintTypeFilter
        value={COMPLAINT_TYPES[1]}
        onChange={onChange}
        complaintTypes={COMPLAINT_TYPES}
      />
    );

    expect(screen.getByText(COMPLAINT_TYPES[1])).toBeInTheDocument();
  });

  it("lists all complaint types as options when opened", async () => {
    const user = userEvent.setup();
    render(
      <ComplaintTypeFilter value={undefined} onChange={onChange} complaintTypes={COMPLAINT_TYPES} />
    );

    await user.click(screen.getByRole("combobox"));

    const listbox = screen.getByRole("listbox");
    for (const type of COMPLAINT_TYPES) {
      expect(within(listbox).getByText(type)).toBeInTheDocument();
    }
    expect(screen.getAllByRole("option")).toHaveLength(COMPLAINT_TYPES.length + 1);
  });

  it("calls onChange with selected complaint type when an option is clicked", async () => {
    const user = userEvent.setup();
    render(
      <ComplaintTypeFilter value={undefined} onChange={onChange} complaintTypes={COMPLAINT_TYPES} />
    );

    await user.click(screen.getByRole("combobox"));
    await user.click(screen.getByText(COMPLAINT_TYPES[1]));

    expect(onChange).toHaveBeenCalledOnce();
    expect(onChange).toHaveBeenCalledWith(COMPLAINT_TYPES[1]);
  });

  it("calls onChange with undefined when the default 'All Types' option is selected", async () => {
    const user = userEvent.setup();
    render(
      <ComplaintTypeFilter
        value={COMPLAINT_TYPES[1]}
        onChange={onChange}
        complaintTypes={COMPLAINT_TYPES}
      />
    );

    await user.click(screen.getByRole("combobox"));
    await user.click(screen.getByText(DEFAULT_LABEL));

    expect(onChange).toHaveBeenCalledOnce();
    expect(onChange).toHaveBeenCalledWith(undefined);
  });

  it("does not call onChange when no selection is made", () => {
    render(
      <ComplaintTypeFilter value={undefined} onChange={onChange} complaintTypes={COMPLAINT_TYPES} />
    );

    expect(onChange).not.toHaveBeenCalled();
  });

  it("disables the trigger and shows loading text when loading is true", () => {
    render(
      <ComplaintTypeFilter
        value={undefined}
        onChange={onChange}
        complaintTypes={COMPLAINT_TYPES}
        isLoading={true}
      />
    );

    const trigger = screen.getByRole("combobox");
    expect(trigger).toBeDisabled();
    expect(screen.getByText("Loading…")).toBeInTheDocument();
  });

  it("renders an empty list when complaintTypes is empty", async () => {
    const user = userEvent.setup();
    render(<ComplaintTypeFilter value={undefined} onChange={onChange} complaintTypes={[]} />);

    await user.click(screen.getByRole("combobox"));

    const options = screen.getAllByRole("option");
    expect(options).toHaveLength(1);
    expect(within(screen.getByRole("listbox")).getByText(DEFAULT_LABEL)).toBeInTheDocument();
  });
});
