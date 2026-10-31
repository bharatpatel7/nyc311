import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, beforeEach } from "vitest";
import DateRangeFilter from "./DateRangeFilter";
import {
  LABEL_FROM,
  LABEL_TO,
  TEST_DATE_FROM,
  TEST_DATE_TO,
  TEST_DATE_FROM_CHANGED,
} from "./constants";
import { FilterProvider } from "@/context/FilterProvider";

const renderFilter = () => {
  render(
    <FilterProvider>
      <DateRangeFilter />
    </FilterProvider>
  );
};

describe("DateRangeFilter", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("should render both date inputs with labels", () => {
    renderFilter();
    expect(screen.getByLabelText(LABEL_FROM)).toBeInTheDocument();
    expect(screen.getByLabelText(LABEL_TO)).toBeInTheDocument();
  });

  it("should display empty inputs when dates are undefined", () => {
    renderFilter();
    expect(screen.getByLabelText(LABEL_FROM)).toHaveValue("");
    expect(screen.getByLabelText(LABEL_TO)).toHaveValue("");
  });

  it("should display provided date values", async () => {
    renderFilter();
    const fromInput = screen.getByLabelText(LABEL_FROM);
    const toInput = screen.getByLabelText(LABEL_TO);
    await userEvent.type(fromInput, TEST_DATE_FROM);
    await userEvent.type(toInput, TEST_DATE_TO);
    expect(fromInput).toHaveValue(TEST_DATE_FROM);
    expect(toInput).toHaveValue(TEST_DATE_TO);
  });

  it("should call onChange with updated dateFrom when From input changes", async () => {
    renderFilter();
    const fromInput = screen.getByLabelText(LABEL_FROM);
    await userEvent.type(fromInput, TEST_DATE_FROM);
    expect(fromInput).toHaveValue(TEST_DATE_FROM);
  });

  it("should call onChange with updated dateTo when To input changes", async () => {
    renderFilter();
    const toInput = screen.getByLabelText(LABEL_TO);
    await userEvent.type(toInput, TEST_DATE_TO);
    expect(toInput).toHaveValue(TEST_DATE_TO);
  });

  it("should reset dateFrom to dateTo if dateFrom > dateTo", async () => {
    renderFilter();
    const toInput = screen.getByLabelText(LABEL_TO);
    await userEvent.type(toInput, TEST_DATE_TO);

    const fromInput = screen.getByLabelText(LABEL_FROM);
    await userEvent.type(fromInput, TEST_DATE_FROM_CHANGED);

    expect(screen.getByLabelText(LABEL_FROM)).toHaveValue(TEST_DATE_TO);
    expect(screen.getByLabelText(LABEL_TO)).toHaveValue(TEST_DATE_TO);
  });

  it("should reset dateTo to dateFrom if dateTo < dateFrom", async () => {
    renderFilter();
    const fromInput = screen.getByLabelText(LABEL_FROM);
    await userEvent.type(fromInput, TEST_DATE_FROM_CHANGED);

    const toInput = screen.getByLabelText(LABEL_TO);
    await userEvent.type(toInput, TEST_DATE_TO);

    expect(screen.getByLabelText(LABEL_FROM)).toHaveValue(TEST_DATE_FROM_CHANGED);
    expect(screen.getByLabelText(LABEL_TO)).toHaveValue(TEST_DATE_FROM_CHANGED);
  });

  it("should clear dateFrom when input is cleared", async () => {
    renderFilter();
    const fromInput = screen.getByLabelText(LABEL_FROM);
    await userEvent.type(fromInput, TEST_DATE_FROM);
    await userEvent.clear(fromInput);
    expect(fromInput).toHaveValue("");
  });

  it("should clear dateTo when input is cleared", async () => {
    renderFilter();
    const toInput = screen.getByLabelText(LABEL_TO);
    await userEvent.type(toInput, TEST_DATE_TO);
    await userEvent.clear(toInput);
    expect(toInput).toHaveValue("");
  });
});
