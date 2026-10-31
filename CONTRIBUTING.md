# Contributing Guide

Team Forest, CIS3750 W26.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Branching Strategy](#branching-strategy)
- [Commit Messages](#commit-messages)
- [Merge Requests](#merge-requests)
- [Code Style](#code-style)
- [Testing](#testing)
- [Makefile](#makefile)
- [Complete Workflow Example](#complete-workflow-example)

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) (v24+)
- [Docker Compose](https://docs.docker.com/compose/install/) (v2.0+)
- [Git](https://git-scm.com/)
- [API Token](https://data.cityofnewyork.us)

## Getting Started

1. Clone the repository

```bash
   git clone https://github.com/bharatpatel7/nyc311.git
   cd 311-complaint-patterns-and-response-times
```

2. Setup API token and .env

```
1. Register for a API token at https://data.cityofnewyork.us
2. Copy the root `.env.example` to `.env` and fill in your token and database info (for local dev)
```

3. Build and start all services

```bash
   docker compose up --build -d
```

4. View logs (if running detached)

```bash
   docker compose logs -f
```

5. Stop all services

```bash
   docker compose down
```

> To also remove volumes (wipes database data):

```bash
   docker compose down -v
```

6. Create your branch before making any changes (see Branching below)

## Branching Strategy

All branch names must follow this pattern:

```
<type>/<short-description>
```

### Allowed Types

| Type      | Purpose                                | Targets |
| :-------- | :------------------------------------- | :------ |
| hotfix/   | urgent fixes for deployment issues     | main    |
| release/  | release preparation                    | main    |
| feature/  | new features or enhancements           | main    |
| bug/      | bug fixes found during development     | main    |
| chore/    | maintenance, config, dependencies      | main    |
| docs/     | documentation only changes             | main    |
| refactor/ | code restructuring, no behavior change | main    |
| test/     | adding or fixing tests                 | main    |
| ci/       | CI/CD pipeline changes                 | main    |

### Rules

- Use **lowercase and hyphens** only; no underscores or spaces
- Keep descriptions **short, meaningful** (3–5 words)
- Minimum 3 characters after the slash:
  - `<type>/min`

### Valid Examples

```
feature/user-authentication
bug/fix-null-pointer-login
hotfix/payment-crash
release/v2.1.0
chore/update-dependencies
docs/api-endpoint-guide
```

### Invalid Examples

```
Feature/Login          # uppercase
my-branch              # missing type prefix
feature/               # no description
fix/a                  # too short
feature/Add_Login      # underscore and uppercase
```

## Commit Messages

All commits must follow the format:

```
<type>(<scope>): <short description>

[optional body]

[optional footer]
```

### Allowed Types

| Type     | Purpose                                   |
| :------- | :---------------------------------------- |
| feat     | a new feature                             |
| fix      | a bug fix                                 |
| docs     | documentation changes only                |
| style    | formatting, whitespace (no logic changes) |
| refactor | code change that is not a fix or feature  |
| perf     | performance improvement                   |
| test     | adding or fixing tests                    |
| chore    | build process, dependency updates         |
| ci       | CI/CD configuration changes               |
| build    | build system changes                      |
| revert   | reverts a previous commit                 |

### Rules

- Minimum 10 characters in the description
- Use lowercase for type and description

### Valid Examples

```
feat(auth): add Auth login with Google
fix(api): resolve null pointer on empty user response
docs(readme): update local setup instructions
chore(deps): bump react from 18.0.0 to 19.0.0
fix(ui): correct responsives on mobile dashboard
```

### Invalid Examples

```
WIP                          # too vague and too short
fix                          # no description
Update stuff                 # not correct format
FIXED THE LOGIN BUG          # all caps
temp                         # blocked by push rules
```

## Merge Requests

### Before Opening an MR

- [ ] branch name follows the naming convention
- [ ] all commits follow the commit message format
- [ ] code is tested locally and passes all checks
- [ ] no `.env`, secrets, or large binary files committed (max 25 MB)
- [ ] pipeline passes (lint, tests, build)

### MR Title

Follow the same format as commit messages:

```
feat(auth): add Auth login support
fix(api): resolve timeout on large payloads
```

### MR Description

Use the provided MR template which includes:

- what changed and why
- how to test it
- screenshots (for UI changes)
- related issue or reference

### Review Process

- at least **1 approval** required before merging
- the MR author should **not merge their own MR**
- address all review comments before merging
- resolve all pipeline failures before requesting review

## Code Style

All code must pass linting and formatting checks before a merge request can be approved. These checks run automatically in CI, so fix any failures before requesting a review.

### JavaScript / TypeScript — ESLint + Prettier

Applies to all `.ts`, `.tsx`, `.js`, `.jsx` files.

```bash
# check for lint errors
npm run lint

# auto fix lint errors
npm run lint:fix

# format with Prettier
npm run format

# check formatting without changing files (used in CI)
npm run format:check
```

Config files: `eslint.config.js`, `.prettierrc`

**TypeScript**

- No unused variables or imports
  - prefix with `_` to intentionally ignore: `_unusedParam`
- Avoid `any` type
  - use proper types or `unknown` instead (warning)
- All TypeScript recommended rules apply

**React**

- No need to import React in scope
  - `react/react-in-jsx-scope` is off
- No PropTypes required
  - TypeScript types are used instead
- React Hooks must follow the [Rules of Hooks](https://react.dev/reference/rules/rules-of-hooks)
- Hook dependency arrays must be complete
  - missing deps are a warning

---

### Python — Black

```bash
# format all Python files
black .

# check without making changes (used in CI)
black --check .
```

Config file: `pyproject.toml`

Key rules:

- Max line length: 88 characters
- One import per line

---

### Java — Checkstyle

```bash
# run Checkstyle on main source
./gradlew checkstyleMain

# run Checkstyle on tests too
./gradlew checkstyleTest

# run all checks together
./gradlew check
```

Config file: `config/checkstyle/checkstyle.xml`

---

### General Rules (All Languages)

- **No commented-out code** in final commits
  - delete it
- **No debug statements** left in code:
  - JavaScript: no `console.log()`, `console.debug()`
  - Python: no `print()` used for debugging
  - Java: no `System.out.println()` used for debugging
- **No hardcoded credentials, URLs, or environment-specific values**
  - use `.env` or config files
- **One responsibility per function**
  - keep functions small and focused
- **Meaningful names**
  - variables, functions, and classes should describe what they do

---

### CI Enforcement

All of the following must pass in the pipeline before an MR can be merged:

| Check      | Language                | Command                    |
| :--------- | :---------------------- | :------------------------- |
| ESLint     | JavaScript / TypeScript | `npm run lint`             |
| Prettier   | JavaScript / TypeScript | `npm run format:check`     |
| Black      | Python                  | `black --check .`          |
| Checkstyle | Java                    | `./gradlew checkstyleMain` |

> If CI fails on a style check, fix it locally and push again.

## Testing

All new features must include tests. Tests must pass in CI before an MR can be merged.

---

### Running Tests Inside Docker

Make sure your containers are running before executing any tests:

```bash
# via make
make up

# via docker compose
docker compose up -d
```

---

### Java — JUnit (backend)

```bash
# run all Java tests via make
make test-backend

# run with coverage report
docker compose exec backend ./gradlew test jacocoTestReport
```

Coverage report output: `build/reports/jacoco/test/html/index.html`

---

### Python — Pytest (python)

```bash
# run all Python tests via make
make test-ingestor

# run all Python tests via docker compose
docker compose exec ingestor pytest

# run with coverage report
docker compose exec ingestor pytest --cov=. --cov-report=term-missing

# run a specific test file
docker compose exec ingestor pytest tests/test_complaints.py
```

---

### Frontend — Vitest + MSW (frontend)

```bash
# run all frontend tests via make
make test-frontend

# run all frontend tests via docker compose
docker compose exec frontend npm test

# run in watch mode during development
docker compose exec frontend npm run test:watch

# run with coverage report
docker compose exec frontend npm run test:coverage
```

MSW: is used to intercept and mock API calls during tests
Note: do not make real API calls in tests

```tsx
// example — mock an API call with MSW
server.use(
  http.get("/api/complaints", () => {
    return HttpResponse.json({ data: mockComplaints });
  }),
);
```

---

### Run All Tests

```bash
# run all tests via make
make test

# run all tests via docker compose
docker compose exec backend ./gradlew test & \
docker compose exec ingestor pytest & \
docker compose exec frontend npm test
```

---

### Coverage Requirements

| Layer        | Framework         | Minimum Coverage |
| :----------- | :---------------- | :--------------- |
| Java backend | JUnit + JaCoCo    | 80%              |
| Python       | Pytest + Coverage | 80%              |
| Frontend     | Vitest            | 80%              |

> CI will fail if coverage drops below 80% in any layer.

---

### General Rules

- All new features must include tests
- Mock only at the boundary (API layer, DB layer)
- Test files must live next to the code they test

## Makefile

Type make to get a full list of options

## Complete Workflow Example

Start to finish.

---

### Scenario: Adding a new complaints filter feature

**1. Start from an up-to-date main branch**

```bash
git checkout main
git pull origin main
```

**2. Create your branch**

```bash
git checkout -b feature/complaints-filter-by-date
```

**3. Start your containers**

```bash
# via make
make up

# via docker compose
docker compose up -d
```

**4. Make your changes, then run linting**

```bash
# via make
make lint

# via docker compose

## JS / TS
docker compose exec frontend npm run lint:fix
docker compose exec frontend npm run format

## python
docker compose exec ingestor black .

## java
docker compose exec backend ./gradlew checkstyleMain
```

**5. Run all tests**

```bash
# via make
make test

# via docker compose
docker compose exec backend ./gradlew test & \
docker compose exec ingestor pytest & \
docker compose exec frontend npm test
```

**6. Commit your changes**

```bash
git add .
git commit -m "feat(complaints): add date range filter to complaints view"
```

**7. Push your branch**

```bash
git push origin feature/complaints-filter-by-date
```

**8. Open a Pull Request on GitHub**

- Title: `feat(complaints): add date range filter to complaints view`
- Target branch: `main` (auto-set by branch rule)
- Fill in the MR description template
- Assign a reviewer

**9. Address review comments, push fixes**

```bash
git commit -m "fix(complaints): correct date range boundary logic"
git push origin feature/complaints-filter-by-date
```

**10. MR is approved and merged by reviewer**

