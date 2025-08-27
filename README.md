# rizkyilhampra.github.io

## ✨ Features

*   **Minimalist Design:** A clean and simple design to focus on the content.
*   **Responsive:** The website is designed to work on all devices.
*   **Typewriter Effect:** A cool typewriter effect for the hero section.
*   **Theme Toggle:** A theme toggle to switch between light and dark mode.
*   **Floating Elements:** Some floating elements to make the website more interactive.

## 🚀 Technologies Used

*   **[React](https://react.dev/)**: A JavaScript library for building user interfaces.
*   **[Farm](https://farm-fe.github.io/)**: A super fast web build tool written in Rust.
*   **[Tailwind CSS](https://tailwindcss.com/)**: A utility-first CSS framework for rapid UI development.
*   **[Catppuccin](https://github.com/catppuccin/catppuccin)**: A soothing pastel theme for the UI.
*   **[Lucide](https://lucide.dev/)**: A simply beautiful and consistent icon set.

## 📦 Setup

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/rizkyilhampra/rizkyilhampra.github.io.git
    ```

2.  **Navigate to the project directory:**

    ```bash
    cd rizkyilhampra.github.io
    ```

3.  **Install the dependencies:**

    ```bash
    bun install
    ```

## ⌨️ Monkeytype Integration

- Overview: The site can display your Monkeytype stats without exposing your API key by fetching data during CI and committing a `monkeytype.json` file that the frontend reads at runtime.

- Security: Never commit your API key. Store it as a GitHub Repository Secret named `MONKEYTYPE_API_KEY`.

### 1) Enable the workflow

The repo includes `.github/workflows/update-monkeytype.yml` which runs every 12 hours or on demand. It executes `scripts/fetch-monkeytype.mjs` to write `monkeytype.json` at the repo root and commits it.

Steps:

1. Go to GitHub repo → Settings → Secrets and variables → Actions → New repository secret.
2. Name: `MONKEYTYPE_API_KEY`. Value: your Monkeytype API key.
3. (Optional) Update username: The workflow uses `MONKEYTYPE_USERNAME` and currently defaults to `rizkyilhampra`.
4. Manually run the workflow from Actions tab (or wait for the schedule).

The script uses the official MonkeyType API endpoints per the docs at https://api.monkeytype.com/docs

API endpoint mapping:
- Profile: `GET /users/{uidOrName}/profile` (ApeKey auth)
- Personal bests: `GET /users/personalBests` (ApeKey auth)
- Recent results: `GET /results` (ApeKey auth, returns up to 1000 recent results)

Normalize responses into this shape (example in `monkeytype.sample.json`):

```
{
  "profile": { "name": "...", "id": "..." },
  "summary": { "tests": 0, "timeTyping": 0 },
  "pbs": {
    "time15": { "wpm": 0, "acc": 0.0, "timestamp": "" },
    "time60": { "wpm": 0, "acc": 0.0, "timestamp": "" }
  },
  "recent": [ { "wpm": 0, "acc": 0.0, "mode": "time", "time": 60, "language": "english", "timestamp": "" } ]
}
```

The frontend component (`src/MonkeytypeStats.jsx`) fetches `/monkeytype.json` and renders:
- Best 60s and 15s WPM (+ accuracy)
- Average WPM/accuracy across recent results
- Total tests + time typing
- A tiny sparkline from recent WPMs

If `monkeytype.json` is missing, the UI shows a small “Connect Monkeytype” card.


## 📜 Available Scripts

In the project directory, you can run:

*   `bun run dev`: Starts the development server.
*   `bun run build`: Builds the app for production.
*   `bun run preview`: Serves the production build locally.
*   `bun run clean`: Removes the build cache.

## 📝 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue.
