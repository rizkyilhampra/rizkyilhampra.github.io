import MapLibreGL from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { createPortal } from "react-dom";
import { Minus, Plus } from "lucide-react";
import clsx from "clsx";

const defaultStyles = {
  dark: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
  light: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
};

// Pre-allocate the WebGL context + web worker once so the map initializes
// near-instantly on (re)mount — e.g. when returning to the home route.
MapLibreGL.prewarm();

/**
 * Mount-time external system setup. The only sanctioned wrapper around
 * `useEffect` for one-time side effects; reusable custom hook so components
 * never call `useEffect` directly.
 */
function useMountEffect(effect) {
  /* eslint-disable react-hooks/exhaustive-deps, no-restricted-syntax */
  useEffect(effect, []);
}

// --- Theme (external store, not an effect) ---------------------------------

function subscribeDocumentTheme(callback) {
  if (typeof document === "undefined") return () => {};
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
  return () => observer.disconnect();
}

function getDocumentThemeSnapshot() {
  if (typeof document === "undefined") return "light";
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

// Follows the `dark` class on <html> (same mechanism as ThemeToggle.jsx).
// Implemented with useSyncExternalStore — subscribing to an external store,
// not a useEffect subscription.
function useResolvedTheme() {
  return useSyncExternalStore(
    subscribeDocumentTheme,
    getDocumentThemeSnapshot,
    () => "light"
  );
}

// --- Map instance -----------------------------------------------------------

function useMapLibre(containerRef, { initialStyle, onLoad, options }) {
  const [map, setMap] = useState(null);
  const onLoadRef = useRef(onLoad);
  onLoadRef.current = onLoad;

  useMountEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const instance = new MapLibreGL.Map({
      container,
      style: initialStyle,
      renderWorldCopies: false,
      attributionControl: { compact: true },
      ...options,
    });

    const loadHandler = () => onLoadRef.current?.();
    instance.on("load", loadHandler);
    setMap(instance);

    return () => {
      instance.off("load", loadHandler);
      instance.remove();
      setMap(null);
    };
  });

  return map;
}

// Swap the basemap style when the resolved theme changes. Isolated in a
// reusable hook (syncing an external system to a changing value).
function useBasemapStyle(map, theme, initialStyle) {
  const currentStyleRef = useRef(initialStyle);

  useEffect(() => {
    if (!map || !theme) return;

    const next = theme === "dark" ? defaultStyles.dark : defaultStyles.light;
    if (currentStyleRef.current === next) return;

    currentStyleRef.current = next;
    map.setStyle(next, { diff: false });
  }, [map, theme]);
}

const MapContext = createContext(null);

function useMap() {
  const context = useContext(MapContext);
  if (!context) {
    throw new Error("useMap must be used within a Map component");
  }
  return context;
}

/**
 * MapLibre-powered map container. Trimmed port of mapcn's registry `Map`
 * (https://www.mapcn.dev) adapted to plain JSX for this project (no
 * TypeScript, no `@/` alias, no shadcn CLI). Theme (light/dark basemap)
 * follows the `dark` class on <html>, same mechanism as ThemeToggle.jsx.
 *
 * Components here never call `useEffect` directly — all side effects live in
 * the `useMapLibre` / `useBasemapStyle` / `useMapMarker` hooks above.
 */
const Map = forwardRef(function Map(
  { children, className, onLoad, ...props },
  ref
) {
  const containerRef = useRef(null);
  const resolvedTheme = useResolvedTheme();
  const initialStyle =
    resolvedTheme === "dark" ? defaultStyles.dark : defaultStyles.light;

  const map = useMapLibre(containerRef, {
    initialStyle,
    onLoad,
    options: props,
  });
  useBasemapStyle(map, resolvedTheme, initialStyle);

  useImperativeHandle(ref, () => map, [map]);

  const contextValue = useMemo(() => ({ map }), [map]);

  return (
    <MapContext.Provider value={contextValue}>
      <div
        ref={containerRef}
        className={clsx("relative h-full w-full", className)}
      >
        {map && children}
      </div>
    </MapContext.Provider>
  );
});

const MarkerContext = createContext(null);

function useMarkerContext() {
  const context = useContext(MarkerContext);
  if (!context) {
    throw new Error("Marker components must be used within MapMarker");
  }
  return context;
}

// Create a MapLibre marker once and keep its instance in state so children
// (MarkerContent) can portal into it. Callbacks are read through a ref so the
// marker is not recreated when the handler identity changes (ref isolated in
// this hook, not the component).
function useMapMarker(map, { longitude, latitude, onClick }) {
  const [marker, setMarker] = useState(null);
  const callbacksRef = useRef({ onClick });
  callbacksRef.current = { onClick };

  useMountEffect(() => {
    const markerInstance = new MapLibreGL.Marker({
      element: document.createElement("div"),
    });

    const handleClick = (e) => callbacksRef.current.onClick?.(e);
    markerInstance.getElement()?.addEventListener("click", handleClick);
    setMarker(markerInstance);

    return () => {
      markerInstance.getElement()?.removeEventListener("click", handleClick);
      markerInstance.remove();
      setMarker(null);
    };
  });

  useEffect(() => {
    if (!map || !marker) return;
    marker.setLngLat([longitude, latitude]);
    marker.addTo(map);
    return () => marker.remove();
  }, [map, marker, longitude, latitude]);

  return marker;
}

function MapMarker({ longitude, latitude, children, onClick }) {
  const { map } = useMap();
  const marker = useMapMarker(map, { longitude, latitude, onClick });

  return (
    <MarkerContext.Provider value={{ marker, map }}>
      {marker ? children : null}
    </MarkerContext.Provider>
  );
}

function DefaultMarkerIcon() {
  return (
    <span className="relative flex h-4 w-4">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75 motion-reduce:hidden" />
      <span className="relative inline-flex h-4 w-4 rounded-full border-2 border-primary-foreground bg-primary shadow-glow" />
    </span>
  );
}

function MarkerContent({ children, className }) {
  const { marker } = useMarkerContext();

  return createPortal(
    <div className={clsx("relative cursor-pointer", className)}>
      {children || <DefaultMarkerIcon />}
    </div>,
    marker.getElement()
  );
}

const positionClasses = {
  "top-left": "top-2 left-2",
  "top-right": "top-2 right-2",
  "bottom-left": "bottom-2 left-2",
  "bottom-right": "bottom-2 right-2",
};

function ControlGroup({ children }) {
  return (
    <div className="flex flex-col overflow-hidden rounded-md border border-border bg-background shadow-sm [&>button:not(:last-child)]:border-b [&>button:not(:last-child)]:border-border">
      {children}
    </div>
  );
}

function ControlButton({ onClick, label, children }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      type="button"
      className="flex size-8 items-center justify-center transition-all first:rounded-t-md last:rounded-b-md hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring dark:hover:bg-accent/40"
    >
      {children}
    </button>
  );
}

function MapControls({ position = "bottom-right", className }) {
  const { map } = useMap();

  const handleZoomIn = useCallback(() => {
    map?.zoomTo(map.getZoom() + 1, { duration: 300 });
  }, [map]);

  const handleZoomOut = useCallback(() => {
    map?.zoomTo(map.getZoom() - 1, { duration: 300 });
  }, [map]);

  return (
    <div
      className={clsx(
        "absolute z-10 flex flex-col gap-1.5",
        positionClasses[position],
        className
      )}
    >
      <ControlGroup>
        <ControlButton onClick={handleZoomIn} label="Zoom in">
          <Plus className="size-4" />
        </ControlButton>
        <ControlButton onClick={handleZoomOut} label="Zoom out">
          <Minus className="size-4" />
        </ControlButton>
      </ControlGroup>
    </div>
  );
}

export { Map, MapMarker, MarkerContent, MapControls };
