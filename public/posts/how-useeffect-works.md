---
slug: how-useeffect-works
title: How useEffect works
date: 2026-05-16
---

## The job of useEffect

React renders UI from props and state. `useEffect` is for work that needs to happen after React has updated the screen because the component must stay synchronized with something outside React.

That outside system might be a browser API, a timer, a subscription, analytics, or a network connection. If the value can be calculated while rendering, it usually does not need an effect.

## A basic effect with cleanup

The setup function runs after render. If it returns another function, React uses that returned function as cleanup before the effect runs again and when the component unmounts.

```jsx
import { useEffect, useState } from "react";

export function WindowWidth() {
  const [width, setWidth] = useState(window.innerWidth);

  useEffect(() => {
    function handleResize() {
      setWidth(window.innerWidth);
    }

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return <p>Window width: {width}px</p>;
}
```

The empty dependency array means this effect does not depend on any reactive value from the component body. It subscribes once, then cleanup removes the listener.

## Dependencies are not optional guesses

Every prop, state value, or function declared inside the component and read by the effect is reactive. If the effect reads it, it belongs in the dependency array.

```jsx
import { useEffect } from "react";
import { createConnection } from "./chat";

export function ChatRoom({ roomId }) {
  useEffect(() => {
    const connection = createConnection(roomId);
    connection.connect();

    return () => {
      connection.disconnect();
    };
  }, [roomId]);

  return <h1>Room: {roomId}</h1>;
}
```

When `roomId` changes, React runs the old cleanup first, then runs the setup again with the new value. That keeps the component synchronized with the current room instead of leaving stale connections behind.

## Common mistakes

The biggest mistake is using effects to derive data that could be computed during render. Another common issue is hiding dependencies to stop reruns, which usually creates stale data instead of fixing the design.

A useful rule of thumb: `useEffect` is an escape hatch for synchronization. If there is no outside system involved, try rendering from props and state first.
