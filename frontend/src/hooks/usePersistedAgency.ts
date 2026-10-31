import { useState, useEffect } from "react";
import { AGENCY_STORAGE_KEY } from "./constants";
import type { Agency } from "@/types";

/**
 * Persists the selected agency to localStorage under AGENCY_STORAGE_KEY
 * Initialises from localStorage on mount so the selection survives page refreshes.
 * Setting agency to undefined removes the key from storage.
 */
export const usePersistedAgency = () => {
  const [agency, setAgencyState] = useState<Agency | undefined>(() => {
    return (localStorage.getItem(AGENCY_STORAGE_KEY) as Agency) ?? undefined;
  });

  useEffect(() => {
    if (agency !== undefined) {
      localStorage.setItem(AGENCY_STORAGE_KEY, agency);
    } else {
      localStorage.removeItem(AGENCY_STORAGE_KEY);
    }
  }, [agency]);

  const setAgency = (value: Agency | undefined) => setAgencyState(value);

  return { agency, setAgency };
};
