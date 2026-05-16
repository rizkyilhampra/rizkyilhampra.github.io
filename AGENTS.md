# Repository Guidelines

## Project Structure & Module Organization

This is a React portfolio site built with Farm and Tailwind CSS. Application code lives in `src/`, with `src/index.jsx` mounting the app and `src/App.jsx` composing the page. Reusable UI components use PascalCase filenames such as `ThemeToggle.jsx` and `GitHubStats.jsx`; shared helpers live in `src/utils.js`. Global styles are in `src/style.css`.

Static and generated public assets live in `public/`, including stats JSON consumed by the UI. Data-fetching scripts are in `scripts/`, GitHub Actions workflows are in `.github/workflows/`, and production output is generated into `dist/`.

## Build, Test, and Development Commands

Use Bun for dependency and script execution.

- `bun install`: install dependencies from `package.json` and `bun.lockb`.
- `bun run dev` or `bun run start`: start the Farm development server.
- `bun run build`: create a production build in `dist/`; use this as the main verification command.
- `bun run preview`: serve the built app locally for final inspection.
- `bun run clean`: remove Farm build cache/output.

Stats can be refreshed with scripts such as `bun scripts/fetch-github.mjs` or `bun scripts/fetch-spotify.mjs` when required environment variables are available.

## Coding Style & Naming Conventions

Follow `.editorconfig`: UTF-8, LF endings, final newline, two-space indentation, and trimmed trailing whitespace. Write React components as functional components and name component files in PascalCase. Keep utility modules camelCase, for example `utils.js`. Prefer Tailwind utilities and existing Catppuccin theme tokens over custom CSS. Use `lucide-react` for icons.

ESLint configuration exists in `.eslintrc.json`; unused variables are warnings when prefixed with `_` for intentional ignores.

## Testing Guidelines

No automated test suite is currently configured. For changes, run `bun run build` and manually inspect important states with `bun run dev` or `bun run preview`. When editing stats components, test populated JSON and missing/empty data paths where practical.

## Commit & Pull Request Guidelines

Recent history uses concise conventional-style messages, especially `chore(scope): summary` and `build: summary`, for example `chore(github): update contributions (all years)`. Keep commits focused and imperative.

Pull requests should include a short description, verification commands, linked issues when applicable, and screenshots or recordings for visible UI changes. Note generated files under `public/` and any environment variables needed to reproduce data fetching.

## Security & Configuration Tips

Do not commit private tokens or local `.env` values. Use the sample files such as `spotify.sample.json` and `monkeytype.sample.json` for data shape references, and store production credentials in GitHub Secrets used by the scheduled workflows.
