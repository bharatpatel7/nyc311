import React from "react";
import { render } from "@testing-library/react";
import { FilterProvider } from "../context/FilterProvider";

export const renderWithFilters = (ui: React.ReactElement) =>
  render(<FilterProvider>{ui}</FilterProvider>);
