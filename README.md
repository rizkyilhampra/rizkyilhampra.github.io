# rizkyilhampra.github.io

## ✨ Features

*   **Minimalist Design:** A clean and simple design to focus on the content.
*   **Responsive:** The website is designed to work on all devices.
*   **Typewriter Effect:** A cool typewriter effect for the hero section.
*   **Theme Toggle:** A theme toggle to switch between light and dark mode.
*   **Floating Elements:** Some floating elements to make the website more interactive.
*   **Monkeytype Stats:** Typing stats fetched via a scheduled action.
*   **Spotify Stats:** Top tracks/artists (6 months, medium_term) synced daily.

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

## 📜 Available Scripts

In the project directory, you can run:

*   `bun run dev`: Starts the development server.
*   `bun run build`: Builds the app for production.
*   `bun run preview`: Serves the production build locally.
*   `bun run clean`: Removes the build cache.

## 🎵 Spotify Integration

This site fetches Spotify top tracks/artists to `public/spotify.json` via a scheduled GitHub Action.

Setup (GitHub repository settings):

1. Create a Spotify App at https://developer.spotify.com/dashboard and note the Client ID/Secret.
2. Generate a Refresh Token with scope: `user-top-read`.
   - You can use any OAuth helper locally to perform the Authorization Code flow.
3. Add GitHub Secrets:
   - `SPOTIFY_CLIENT_ID`
   - `SPOTIFY_CLIENT_SECRET`
   - `SPOTIFY_REFRESH_TOKEN`
4. The workflow `.github/workflows/update-spotify.yml` runs daily and commits `public/spotify.json` when changed.

Notes:
- Only medium_term (approx last 6 months) top tracks and artists are fetched.
- No now playing or recently played is used.

## 📝 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue.
