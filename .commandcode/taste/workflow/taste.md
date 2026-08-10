# Workflow

- Prefers leveraging web_fetch to pull in official documentation (upgrade guides, release notes, docs) when planning migrations or researching breaking changes. Confidence: 0.80
- Explicitly asks the agent to research by fetching (web_fetch) whenever there is doubt, rather than guessing or assuming — e.g., verifying live behavior of a deployed site against reported issues. Confidence: 0.80
- Challenges unverified claims that something is "best practice" or "common practice" — expects such claims to be backed by actual research (web search + fetching authoritative sources, e.g., official vendor docs) before being asserted. Confidence: 0.80
- Prefers working directly on the main branch for personal/solo projects, skipping feature branches. Confidence: 0.70
- Follows the Conventional Commits specification for commit messages (e.g., `chore:`, `feat:`, `fix:`). Confidence: 0.85
