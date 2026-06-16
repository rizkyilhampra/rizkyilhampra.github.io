import { useEffect, useRef } from "react";

/**
 * Maps vertical mouse-wheel movement to horizontal scrolling on an element.
 *
 * Uses a native, non-passive listener because React's onWheel prop is passive
 * (so e.preventDefault() would be ignored and the page would still scroll).
 *
 * While hovering the element it always captures vertical wheel as horizontal
 * scroll and never releases at the edges — the page only scrolls once the
 * cursor leaves the element. Primarily-horizontal gestures (trackpads) and the
 * case where the element doesn't overflow are passed through untouched.
 *
 * @returns {import("react").RefObject<HTMLElement>} ref to attach to the scroll container
 */
export function useWheelHorizontalScroll() {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const onWheel = (e) => {
      // Let primarily-horizontal gestures (trackpads) pass through
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;

      // Nothing to scroll horizontally — keep normal page scrolling
      if (el.scrollWidth <= el.clientWidth) return;

      e.preventDefault();
      el.scrollLeft += e.deltaY;
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  return ref;
}
