# design
- Use Catppuccin Mocha for syntax highlighting in code blocks. Confidence: 0.80
- No fade-in or entrance animations on page navigation transitions. Confidence: 0.75
- Prefers embedded/generated art components (e.g., the ASCII portrait) to render on a transparent background following the site theme — no fixed background color (like the beige) baked into generated data or component styles. Chose the dual-variant approach specifically because it makes the portrait fully `bg-transparent` in BOTH themes, dropping the `bg-foreground` panel entirely; confirmed satisfied with the shipped dual-variant result ("that was good"). Confidence: 0.85
- When cross-theme rendering needs a background after all, prefers theme-adaptive design-system token classes (e.g., `bg-foreground dark:bg-transparent`) over hardcoded hex values — presentation stays in CSS, generated data stays clean. Confidence: 0.65
- When placing generated art components (e.g., the ASCII portrait) alongside other content, wants their sizes visually consistent — the art should derive/scale its size from the sibling content (e.g., match the text block's height) instead of staying at a fixed intrinsic size. Confidence: 0.6
- On mobile layouts, wants the ASCII portrait/art element to appear first (above the text content), prioritizing the visual element as the entry point on small screens. Confidence: 0.7
