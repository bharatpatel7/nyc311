# hooks/

This folder contains **custom React hooks** used throughout the app

Hooks here are responsible for **stateful logic, API calls, or data transformations** that can be reused by multiple components.

> Note: Endpoint-specific hooks that directly fetch and parse API data live in `api/<endpoint>/use<Endpoint>.ts`.
> Hooks in this folder may **compose multiple API hooks** or add additional logic for components.

---

## **Conventions**

1. **Naming**
   - Hooks must start with `use` (e.g., `useDashboardData`, `useFilteredComplaints`).
   - Use descriptive names that explain what the hook returns.

2. **Location**
   - Composed or app-wide hooks: `hooks/`.
   - Different from hooks here, which are simple endpoint hooks: `api/<endpoint>/use<Endpoint>.ts`.

3. **Return Pattern**
   - Prefer returning an object `{ data, loading, error }` when fetching data.
   - Avoid returning tuples unless it’s small and well-documented.

4. **Parsing / Validation**
   - Never parse or validate raw API data directly in the hook.
   - Always use the parser functions in `lib/` to ensure safe data types.

5. **Logging**
   - Use `utils/helpers.ts` (`logError`, `logWarning`) for errors or warnings.
   - Avoid `console.log` directly in hooks.

---

## **Example: Composed Hook**

```ts
// hooks/useDashboardData.ts
import { useResolutionTime } from "@/api/resolutionTime/useResolutionTime";
import { useAnotherApiHook } from "@/api/anotherApi/useAnotherApiHook";

export const useDashboardData = () => {
  const { data: resolution, loading: loadingResolution } = useResolutionTime("NYPD");
  const { data: otherData, loading: loadingOther } = useAnotherApiHook();

  const loading = loadingResolution || loadingOther;

  return {
    resolution,
    otherData,
    loading,
  };
};
```
