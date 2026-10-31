import { usePersistedState } from "@/hooks/usePersistedState";
import { AGENCY_STORAGE_KEY, isAgency } from "@/lib/agency";
import type { Agency } from "@/types/agency";

/**
 * Persists the selected agency to localStorage via usePersistedState.
 * Validates the stored string against the known Agency type before returning it —
 * invalid or stale values are silently discarded and treated as undefined.
 */
export const usePersistedAgency = () => {
  const { value, setValue } = usePersistedState(AGENCY_STORAGE_KEY);

  // guard against stale or unexpected values written by older versions of the app
  const agency: Agency | undefined = value !== undefined && isAgency(value) ? value : undefined;

  const setAgency = (next: Agency | undefined) => setValue(next);

  return { agency, setAgency };
};
