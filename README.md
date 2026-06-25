# [rizkyilhampra.dev](https://rizkyilhampra.dev)

## ✨ Features

### Landing page
- **Minimalist, responsive design** — content-first, works on any screen size.
- **Animated hero** — a typewriter effect cycling through taglines, plus a
  subtle entrance reveal.
- **Light / dark theme** — toggle persisted to `localStorage`.

### Today I Learned — a digital garden 🌱
An Obsidian-Publish / wiki-style space for short, interlinked notes:
- **Browse & search** all notes at `/til` with tag filtering, sorting, and
  date grouping.
- **Tags** — explore by tag (`/til/tags`) or view every note under a tag
  (`/til/tags/<tag>`).
- **Interlinking** — `[[wikilinks]]` resolve to internal links at build time,
  with **backlinks** ("Linked from") and **related notes** (shared tags) on
  each note.
- **Knowledge graph** — an interactive, force-directed graph (local per-note
  and a full-vault modal) for visually navigating connections.

Notes are authored in a separate Obsidian vault and synced into the site by a
scheduled workflow — see [Today I Learned sync](#-today-i-learned-sync).

### Live stats (auto-updated)
- **🎵 Spotify** — top tracks & artists (last 6 months), synced monthly.
- **⌨️ Monkeytype** — typing stats.
- **📊 GitHub** — multi-year contribution calendar.
- **💻 WakaTime** — coding activity over the last 7 days.

Each widget reads a JSON file in `public/` that a dedicated GitHub Action keeps
up to date, with sample fallbacks so the UI degrades gracefully.

## 🛠️ Tech Stack

- **[React 19](https://react.dev/)** — UI, with a lightweight custom
  client-side router (no router dependency).
- **[Farm](https://farm-fe.github.io/)** — fast Rust-based build tool.
- **[Tailwind CSS](https://tailwindcss.com/)** — utility-first styling.
- **[Lucide](https://lucide.dev/)** — icon set.
- **[marked](https://marked.js.org/)** + **[react-syntax-highlighter](https://github.com/react-syntax-highlighter/react-syntax-highlighter)**
  — Markdown rendering with syntax-highlighted code blocks.
- **[d3-force](https://d3js.org/d3-force)** — force simulation behind the
  knowledge graph.
- **[react-activity-calendar](https://github.com/grubersjoe/react-activity-calendar)**
  — GitHub contribution heatmap.
- **Fonts** — Plus Jakarta Sans (body), Iosevka (headers, self-subset for a
  smaller payload), JetBrains Mono (code).

## 📦 Getting Started

> [Bun](https://bun.sh/) is the package manager for this project — please don't
> use npm or yarn.

```bash
# Clone
git clone https://github.com/rizkyilhampra/rizkyilhampra.github.io.git
cd rizkyilhampra.github.io

# Install
bun install

# Run the dev server
bun run dev
```

## 📜 Available Scripts

| Command           | Description                          |
| ----------------- | ------------------------------------ |
| `bun run dev`     | Start the development server.        |
| `bun run build`   | Build the app for production.        |
| `bun run preview` | Serve the production build locally.  |
| `bun run clean`   | Remove the build cache.              |

## 🤖 Automation

Content stays current through scheduled GitHub Actions that fetch data, regenerate
the relevant JSON in `public/`, and commit only when something changed.

| Workflow                 | What it does                              | Schedule |
| ------------------------ | ----------------------------------------- | -------- |
| `update-spotify.yml`     | Top tracks & artists → `spotify.json`     | Monthly  |
| `update-monkeytype.yml`  | Typing stats → `monkeytype.json`          | ~12h     |
| `update-github.yml`      | Contributions → `github-*.json`           | ~Daily   |
| `update-wakatime.yml`    | Coding activity → `wakatime.json`         | ~12h     |
| `update-til.yml`         | Sync the digital garden (see below)       | ~12h     |
| `pages-deploy.yml`       | Build & deploy to GitHub Pages on `main`  | On push  |

The fetch logic lives in `scripts/fetch-*.mjs`. Each updater workflow checks out
and pushes its commit using a **`GH_TOKEN_PAT`** repository secret (a personal
access token with write access), so all five `update-*.yml` jobs require it in
addition to their data-source secrets below.

### 🎵 Spotify sync

`update-spotify.yml` fetches top tracks/artists (medium term, ~6 months) into
`public/spotify.json`. No "now playing" or "recently played" data is used.

Required repository secrets:

| Secret                    | How to get it                                            |
| ------------------------- | ------------------------------------------------------- |
| `SPOTIFY_CLIENT_ID`       | From a [Spotify app](https://developer.spotify.com/dashboard). |
| `SPOTIFY_CLIENT_SECRET`   | From the same Spotify app.                              |
| `SPOTIFY_REFRESH_TOKEN`   | Authorization Code flow with the `user-top-read` scope. |

### 📊 GitHub / ⌨️ Monkeytype / 💻 WakaTime sync

These read from public-proxy or authenticated APIs:

- **GitHub** — uses a public contributions proxy
  ([github-contributions-api.jogruber.de](https://github-contributions-api.jogruber.de));
  no API key needed, just `GITHUB_USERNAME`.
- **Monkeytype** — requires a `MONKEYTYPE_API_KEY` secret (and a
  `MONKEYTYPE_USERNAME` variable).
- **WakaTime** — requires a `WAKATIME_API_KEY` secret.

### 🌱 Today I Learned sync

`update-til.yml` sparse-clones the `til/` folder of a separate Obsidian vault,
runs `scripts/fetch-garden.mjs` to transform the Markdown (resolving
`[[wikilinks]]`, extracting tags, building backlinks, and writing
`public/til/*.md` + `public/til-manifest.json`), and commits the result.

## 🚀 Deployment

Pushing to `main` triggers `pages-deploy.yml`, which builds the site with Farm
and publishes the `dist/` output to **GitHub Pages**.

## 📁 Project Structure

```
public/            Static assets + generated JSON (stats, TIL notes & manifest)
scripts/           Data-fetch & content-transform scripts (fetch-*.mjs)
src/
  App.jsx          Layout, sections, and the custom client-side router
  *Stats.jsx       Spotify / Monkeytype / GitHub / WakaTime widgets
  Til*.jsx         Digital garden: index, note, tags, and previews
  Graph*.jsx/.js   Knowledge-graph view & force simulation
  ...              Shared UI, hooks, and Markdown rendering
.github/workflows/ Scheduled update jobs + Pages deploy
```

## 📝 License

Licensed under the MIT License — see [LICENSE](LICENSE) for details.

## 🤝 Contributing

This is a personal site, but suggestions are welcome — feel free to open an
issue or a pull request.
