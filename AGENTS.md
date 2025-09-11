# Repository Guidelines

## Project Structure & Module Organization
- Root: Docker/deploy (`docker-compose*.yml`, `scripts/`).
- Backend (.NET 8): `Backend/`
  - Solution: `Backend/ECommerce.sln`
  - Layers: `src/ECommerce.Domain`, `src/ECommerce.Application`, `src/ECommerce.Infrastructure`, `src/ECommerce.API`
  - Tests: `Backend/tests/ECommerce.API.Tests`
- Frontend (React + TypeScript): `Frontend/ecommerce-frontend/`
  - App code: `src/` (components, pages, services, tests)
  - Public assets: `public/`

## Build, Test, and Development Commands
- Backend
  - Restore: `dotnet restore Backend/ECommerce.sln`
  - Build: `dotnet build Backend/ECommerce.sln -c Release --no-restore`
  - Test (xUnit + coverage): `dotnet test Backend/tests/ECommerce.API.Tests/ECommerce.API.Tests.csproj --collect:"XPlat Code Coverage"`
  - Run API: `dotnet run --project Backend/src/ECommerce.API`
- Frontend
  - Install deps: `cd Frontend/ecommerce-frontend && npm ci`
  - Dev server: `npm start`
  - Build: `npm run build`
  - Tests (Jest/RTL): `npm test -- --coverage --watchAll=false`

## Coding Style & Naming Conventions
- C#: 4-space indent; file-scoped namespaces; PascalCase for types/methods; camelCase for locals/params; async methods end with `Async`. Prefer DI, use `var` for local inference, enable nullable reference types where applicable.
- TypeScript/React: 2-space indent; components in `src/components` use `PascalCase` (e.g., `ProductCard.tsx`); hooks start with `use*`; keep API logic in `src/services`. Lint with ESLint (`eslint-config-react-app`); type-check with `npx tsc --noEmit`.

## Testing Guidelines
- Backend: xUnit tests live in `Backend/tests/**`. Use `Fact`/`Theory`; keep tests deterministic and focused on business logic. Run coverage via the dotnet test command above.
- Frontend: place tests under `Frontend/ecommerce-frontend/src/tests` as `*.test.ts`/`*.test.tsx`; use React Testing Library. Collect coverage with `npm test -- --coverage`.

## Commit & Pull Request Guidelines
- Commits: Conventional Commits (e.g., `feat(cart): persist items in session`).
- Pull Requests: include clear description, linked issues (e.g., `Closes #123`), and screenshots/GIFs for UI changes. Ensure builds pass, tests are added/updated, and no secrets are committed. Prefer small, focused PRs.

## Security & Configuration Tips
- Do not commit real secrets. Use `.env.example` (root and frontend) to document required variables; copy to `.env` locally.
- Validate `REACT_APP_API_URL` and backend connection strings before running.
- Run `npm audit` in `Frontend/ecommerce-frontend` and keep dependencies updated.

## Agent-Specific Notes
- This file applies repo-wide. If nested `AGENTS.md` files exist, deeper ones take precedence. Follow the styles and commands above when generating or modifying code.

