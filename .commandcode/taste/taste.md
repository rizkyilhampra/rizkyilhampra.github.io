# Taste (Continuously Learned by [CommandCode][cmd])

[cmd]: https://commandcode.ai/

# dev
- Do not run dev server commands (e.g., `bun run dev`, `npm run dev`). Confidence: 0.85

# design
See [design/taste.md](design/taste.md)
# architecture
- Store blog posts as separate markdown files with frontmatter rather than hardcoding post metadata in JS. Confidence: 0.75
- Prefers the simplest static/build-time solution over runtime JS machinery: pushed back on a proposed ResizeObserver/callback-ref hook for component sizing ("why you tho it's need like hook?") and steered to a deterministic constant tweak instead (shrink the generated grid). Expects the agent to reach for the least complex sufficient approach and to justify any added runtime complexity. Confidence: 0.75

# ux
- Preserve scroll position when navigating back to the home page from a post. Confidence: 0.70

# workflow
- Check available skills and MCP tools before diving into solutions or research. Confidence: 0.70

# communication
- Prefers explanations in Bahasa Indonesia when asking for elaboration on technical work. Confidence: 0.95
- When asking for explanations of changes/recommendations, wants them pitched at a higher level — plain-language framing and everyday analogies rather than jargon-dense class/token breakdowns (e.g., "with bahasa and more high level ones"). Confidence: 0.75
- Wants the "why" behind changes explained in depth — root causes, the reasoning, and the purpose of each change — not just a summary of what was done. Confidence: 0.75

