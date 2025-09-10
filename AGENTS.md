# Repository Guidelines

## Project Structure & Module Organization
- Root: Docker and deployment scripts (`docker-compose*.yml`, `scripts/`).
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
- C#
  - 4-space indent, file-scoped namespaces; PascalCase for types/methods; camelCase for locals/params; async methods end with `Async`.
  - Prefer DI, `var` for local inference, nullable reference types enabled where applicable.
- TypeScript/React
  - 2-space indent; components in `src/components` use `PascalCase` filenames (e.g., `ProductCard.tsx`).
  - Hooks start with `use*`; keep API logic in `src/services`.
- Linting/formatting
  - Frontend uses ESLint via `eslint-config-react-app`. Type check with `npx tsc --noEmit`.

## Testing Guidelines
- Backend: xUnit tests live in `Backend/tests/**`. Add new tests alongside features. Use `Fact`/`Theory` and keep tests deterministic.
- Frontend: Place tests under `src/tests` as `*.test.ts`/`*.test.tsx`. Use React Testing Library for UI behavior.
- Aim for meaningful coverage on business logic and critical flows (CI collects coverage for both).

## Commit & Pull Request Guidelines
- Use Conventional Commits: `feat:`, `fix:`, `chore:`, `docs:`, `test:`, `refactor:`.
  - Example: `feat(cart): persist items in session`
- Pull Requests
  - Include clear description, linked issues (`Closes #123`), and screenshots/GIFs for UI changes.
  - Ensure: builds pass, tests added/updated, no secrets committed. Small, focused PRs are preferred.

## Security & Configuration Tips
- Never commit real secrets. Use `.env.example` (root and frontend) to document required variables; copy to `.env` locally.
- Validate API base URLs (`REACT_APP_API_URL`) and backend connection strings before running.
- Run `npm audit` in `Frontend/ecommerce-frontend` and keep dependencies updated.

