# lib/

This folder contains **runtime helpers and domain logic** that are reusable across the app.

Unlike `types/`, files in `lib/` can contain **functions, runtime checks, and parsing logic**.

### Example: `lib/agency.ts`

- `isAgency(value: string): value is Agency` -> runtime type guard.
- `parseResolutionTime(data: ResolutionTimeDtoRaw[]): ResolutionTimeDto[]` -> filters invalid API data and converts it to safe types.
- Uses shared logging utilities from `utils/`.

### Guidelines

1. Helpers should be **pure or side-effect minimal**.
2. Do **not** include UI components here.
3. Can rely on constants or types from `types/`.

### Example Usage

```ts
import { isAgency, parseResolutionTime } from "@/lib/agency";

if (isAgency("NYPD")) {
  console.log("Valid agency!");
}

const safeData = parseResolutionTime(rawApiData);
```

### Example Folder Structure

```bash
├── lib/
│   ├── README.md                 # Explains purpose of lib folder
│   ├── agency.ts                 # Runtime helpers, validation, parsing functions
│   └── ...                       # Other domain logic
```
