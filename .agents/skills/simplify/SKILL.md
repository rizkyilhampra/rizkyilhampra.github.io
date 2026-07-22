---
name: simplify
description: >-
  Simplify and clean up recently changed code — cut complexity, remove duplication,
  flatten convoluted logic, drop dead code, and improve readability while strictly
  preserving behavior. Quality only: it does not hunt for correctness bugs. Use
  whenever the user asks to "simplify", "clean up", "tidy", "de-slop", or "refactor
  for clarity", and proactively right after generating or accepting a batch of code
  or finishing a refactor — even if they never say the word "simplify". Reach for it
  when code looks overengineered: redundant logic, needless abstractions, unused
  imports or variables, or deeply nested conditionals.
argument-hint: "[path or concern, e.g. src/auth/ or \"the error handling\"]"
# Optional — recognized by some harnesses, ignored by others:
# allowed-tools: Read, Grep, Glob, Edit, Bash
---

# Simplify

Find the simplest *correct* version of code that was just written or changed. The goal
is not shorter code for its own sake — it is removing complexity that isn't earning its
keep, so the next person (often future-you) can read it at a glance. **Behavior must not
change.** If a cleanup would alter what the code does or how callers use it, that's a
proposal to flag, not an edit to make. You are improving quality, not hunting for bugs —
if you notice a correctness bug, flag it in the report, but bug-finding is a separate
review's job.

This approximates the `/simplify` workflow: scope to the changed code, review it from
four independent angles in parallel, dedup the findings, apply targeted fixes, and
report clearly.

## 1. Determine scope

Default to **recently changed code**, not the whole repository. Blindly rewriting an
entire codebase is how you introduce bugs and drown the user in diff.

- If the user passed an argument (a path like `src/auth/`, a branch or PR, or a
  concern like "the retry logic"), scope to that.
- Otherwise, gather the diff. In a git repo:
  ```bash
  git diff @{upstream}...HEAD      # committed work on this branch
  # no upstream? fall back to: git diff main...HEAD, then git diff HEAD~1
  git diff HEAD                    # uncommitted changes (staged + unstaged)
  git status --short               # untracked files
  ```
  Combine the branch diff with any uncommitted changes — cleanup often runs before
  the commit, but the work under review is just as often already committed. Review
  the actual diff so you review *what changed*, not every line of every touched file.
- No git and no argument? Ask the user which files or directory to focus on rather than
  guessing at the whole tree.

State the scope in one line before you start so the user can redirect you.

## 2. Review through four independent lenses

The strength of this workflow is looking at the same changes from separate angles so
different classes of problem surface. **If your harness supports parallel subagents,
spawn one per lens in a single batch** so they run concurrently, giving each only its
lens plus the diff. **If it doesn't, do four sequential passes yourself** — the lenses
matter more than the parallelism.

Each finding must carry: the file and line, a one-line summary, the concrete cost
(what is duplicated, wasted, or harder to maintain), and the specific fix — the
existing helper to call, the simpler form, or the cheaper alternative. A finding that
can't name its fix isn't ready to apply.

**Lens A — Reuse.** New code that re-implements something the codebase already has.
Search the shared/utility modules and the files adjacent to the change, and name the
existing helper to call instead. Also: near-identical branches that could collapse, and
genuinely repeated blocks worth a small shared helper. Don't invent premature
abstractions — only consolidate what's actually repeated.

**Lens B — Simplification & clarity.** Unnecessary complexity the change adds: redundant
or derivable state, copy-paste with slight variation, deeply nested conditionals that
flatten with early returns, convoluted boolean expressions, dead code left behind, unused
imports and variables, misleading names, and indirection that isn't paying for itself.
Prefer the version a competent reader understands without a map.

**Lens C — Efficiency (behavior-preserving only).** Wasted work the change introduces:
redundant recomputation or repeated I/O, repeated passes over the same data, independent
operations run sequentially that could run concurrently, blocking work added to startup
or hot paths, unnecessary allocations, long-lived objects that capture large scopes
(e.g. closures holding an entire environment alive) when a small struct copying only the
needed fields would do. Only changes that keep results identical — anything that trades
correctness or precision for speed is out of scope; flag it instead.

**Lens D — Altitude.** Is each change implemented at the right depth, or is it a fragile
bandaid? A special case layered on top of shared infrastructure is a sign the fix isn't
deep enough — prefer generalizing the underlying mechanism over stacking special cases.
Conversely, a sweeping generalization for a one-off need is too deep. Fixes here can
reach slightly beyond the diff (into the mechanism the change patched around) when
that's where the right fix lives — but say so in the report.

Collect concrete findings from each lens, then **dedup findings that point at the same
line or mechanism** before applying anything. Discard anything speculative or
stylistic-only that doesn't clearly improve the code.

## 3. Apply targeted changes

Make the edits directly, but keep them tight and honest:

- **Preserve behavior exactly.** Same inputs → same outputs, same side effects, same
  errors. When unsure whether a change is behavior-preserving, don't make it — note it.
- **Never silently change a public/external interface** (function signatures, exported
  names, CLI flags, API shapes, serialized formats). If simplification wants one, stop and
  flag it as a proposal with the tradeoff spelled out.
- **Stay in scope.** Touch the recently-changed code (or the requested target). Don't
  wander into unrelated files.
- **Don't add dependencies or frameworks** to make something "cleaner." Simpler means
  fewer moving parts, not a new library.
- **Minimal, reviewable diffs.** Each change should have a clear reason a reviewer would
  accept. If you can't articulate why a change helps, drop it.
- **Skip, don't argue.** Skip any finding whose fix would change intended behavior,
  require changes well outside the reviewed diff, or that you judge a false positive —
  note the skip in the report rather than debating it.

## 4. Report

Tests are the real safety net — you can't run the user's judgment for them. Close with a
short, skimmable summary using this shape:

```
## Simplifications applied
- <file>: <what changed and why, one line>
- <file>: <what changed and why, one line>

## Skipped
- <finding and why it was skipped, one line>             # omit this section if empty

## Flagged (not changed) — needs your call
- <interface change / risky refactor and the tradeoff>   # omit this section if empty

Review the diff and run your test suite before merging.
```

If nothing needed fixing, say so plainly — "the code was already clean" is a valid
result. Group by file or by lens, whichever reads more clearly for the change set. Keep
it terse: the diff is the detail; this is the map.

## What not to do

- Don't shorten code at the cost of readability (no clever one-liners that need a comment
  to decode, no golfing).
- Don't refactor code that wasn't part of the recent change unless asked.
- Don't change formatting-only concerns a linter/formatter already owns — that's noise.
- Don't rewrite working code to match a personal style preference; simplify only where
  there's a real complexity or clarity win.
- Don't remove code you don't understand on the assumption it's dead — confirm first.

## Examples

**Example 1 — flatten and drop dead code**
Input:
```python
def get_role(user):
    if user is not None:
        if user.is_active:
            if user.role:
                return user.role
            else:
                return "guest"
        else:
            return "guest"
    else:
        return "guest"
```
Output:
```python
def get_role(user):
    if user and user.is_active and user.role:
        return user.role
    return "guest"
```
Reason: three "guest" branches collapse to one default; nesting flattens with an early
combined condition. Behavior identical.

**Example 2 — flag instead of edit**
The user's changed function is clearer if you rename its parameter `data` to `records`,
but it's an exported public function.
Right move: apply the internal simplifications, then flag the rename separately —
"Renaming the `data` param to `records` reads better but changes the public signature;
want me to do it and update callers?" — rather than silently breaking the interface.

**Example 3 — wrong altitude**
The diff adds `if url.startswith("s3://"): return fetch_s3(url)` at one call site of a
shared `fetch(url)` used from five places.
Right move: the special case belongs inside `fetch` (or its scheme dispatch), not
layered on one caller — otherwise the other four call sites silently miss s3 support.
Move it down into the shared mechanism, and note in the report that the fix reached
beyond the diff into `fetch`.
