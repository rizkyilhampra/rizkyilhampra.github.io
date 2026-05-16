---
slug: thinking-in-react
title: Thinking in React, summarized
date: 2026-05-16
readingTime: 4 min read
description: A practical summary of React's component-first workflow: split the UI, find state, and let data flow down.
sources:
  - title: Thinking in React
    url: https://react.dev/learn/thinking-in-react
---

## Start from the interface

The React docs frame UI work as a translation exercise: look at a screen, then break it into components that match the visible structure. A search box, table, row, and category heading are not just markup details. They are boundaries where behavior and responsibility can stay clear.

This is useful even when the design is small. Naming the parts first keeps the component tree honest, and it makes the rest of the work easier to reason about.

## Build the static version first

Before adding interactivity, the docs recommend building a static version that renders the data. That step forces the UI to prove its structure without event handlers, state updates, or edge-case logic getting in the way.

For a portfolio or dashboard, this means the first pass should make real content look correct. After that, state becomes a deliberate addition rather than a default habit.

## Keep state minimal

A central lesson is that not every changing-looking value needs to become state. If a value can be calculated from props or existing state, storing it separately can create duplication and bugs.

The better question is: what is the smallest set of values that can describe every possible UI state? Once that set is clear, derived values can stay derived.

## Put state where the data changes

After identifying the minimal state, place it in the component that owns the relevant behavior. If multiple components need the same state, move it to their closest shared parent and pass the data down.

That downward data flow is one of React's strongest constraints. It can feel strict at first, but it keeps changes traceable because each screen state has a single source of truth.

## The practical takeaway

Thinking in React is less about memorizing an API and more about building a repeatable process: split the UI, render static data, identify minimal state, choose the owner, then wire interactions.

That process scales from a simple profile page to a more complex product screen because it keeps each decision tied to the interface the user actually sees.
