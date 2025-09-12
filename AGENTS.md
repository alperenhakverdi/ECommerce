# Repository Guidelines

## Project Structure & Module Organization
- Root: Docker/deploy (`docker-compose*.yml`, `scripts/`).
- Backend (.NET 8): `Backend/` — Solution `Backend/ECommerce.sln`; layers `src/ECommerce.{Domain,Application,Infrastructure,API}`; tests `Backend/tests/ECommerce.API.Tests`.
- Frontend (React + TS): `Frontend/ecommerce-frontend/` — App `src/` (components, pages, services, tests); public assets `public/`.

## Build, Test, and Development Commands
- Backend restore/build: `dotnet restore Backend/ECommerce.sln`; `dotnet build Backend/ECommerce.sln -c Release --no-restore`.
- Backend test (xUnit + coverage): `dotnet test Backend/tests/ECommerce.API.Tests/ECommerce.API.Tests.csproj --collect:"XPlat Code Coverage"`.
- Run API locally: `dotnet run --project Backend/src/ECommerce.API`.
- Frontend install/dev: `cd Frontend/ecommerce-frontend && npm ci && npm start`.
- Frontend build/tests: `npm run build`; `npm test -- --coverage --watchAll=false`.
- Type check/lint: `npx tsc --noEmit`; `npx eslint "src/**/*.{ts,tsx}"`.

## Coding Style & Naming Conventions
- C#: 4-space indent; file-scoped namespaces; PascalCase for types/methods; camelCase for locals/params; async methods end with `Async`; prefer DI; use `var` for local inference; enable nullable reference types.
- TypeScript/React: 2-space indent; components in `src/components` use `PascalCase` (e.g., `ProductCard.tsx`); hooks start with `use*`; keep API calls in `src/services`; lint with `eslint-config-react-app`; run `npx tsc --noEmit`.

## Testing Guidelines
- Backend: xUnit tests in `Backend/tests/**` using `Fact`/`Theory`; keep deterministic, business-logic focused; collect coverage via the command above.
- Frontend: Jest + React Testing Library; tests under `Frontend/ecommerce-frontend/src/tests` as `*.test.ts`/`*.test.tsx`; run with coverage using the command above.

## Commit & Pull Request Guidelines
- Commits: Conventional Commits (e.g., `feat(cart): persist items in session`).
- PRs: clear description, linked issues (e.g., `Closes #123`), and screenshots/GIFs for UI changes. Ensure builds pass, tests are added/updated, and no secrets are committed. Prefer small, focused PRs.

## Security & Configuration Tips
- Do not commit real secrets. Use `.env.example` (root and frontend); copy to `.env` locally.
- Validate `REACT_APP_API_URL` and backend connection strings before running.
- Run `npm audit` in `Frontend/ecommerce-frontend` and keep dependencies updated.

## Agent-Specific Notes
- This file applies repo-wide. If nested `AGENTS.md` files exist, deeper ones take precedence. Follow the styles and commands above when generating or modifying code.

