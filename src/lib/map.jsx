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
} from "react";
import { createPortal } from "react-dom";
import { Minus, Plus } from "lucide-react";

import { cn } from "./cn";

const defaultStyles = {
  dark: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
  light: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
};

// Check document class for theme — matches ThemeToggle.jsx, which toggles a
// `dark` class on <html> and persists the choice to localStorage.
function getDocumentTheme() {
  if (typeof document === "undefined") return null;
  if (document.documentElement.classList.contains("dark")) return "dark";
  return "light";
}

function useResolvedTheme(themeProp) {
  const [detectedTheme, setDetectedTheme] = useState(
    () => themeProp ?? getDocumentTheme()
  );

  useEffect(() => {
    if (themeProp) return;

    const observer = new MutationObserver(() => {
      setDetectedTheme(getDocumentTheme());
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, [themeProp]);

  return themeProp ?? detectedTheme;
}

const MapContext = createContext(null);

function useMap() {
  const context = useContext(MapContext);
  if (!context) {
    throw new Error("useMap must be used within a Map component");
  }
  return context;
}

function DefaultLoader() {
  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/50 backdrop-blur-xs">
      <div className="flex gap-1">
        <span className="size-1.5 animate-pulse rounded-full bg-muted-foreground/60" />
        <span className="size-1.5 animate-pulse rounded-full bg-muted-foreground/60 [animation-delay:150ms]" />
        <span className="size-1.5 animate-pulse rounded-full bg-muted-foreground/60 [animation-delay:300ms]" />
      </div>
    </div>
  );
}

/**
 * MapLibre-powered map container. Trimmed port of mapcn's registry `Map`
 * (https://www.mapcn.dev) adapted to plain JSX for this project (no
 * TypeScript, no `@/` alias, no shadcn CLI). Theme (light/dark basemap)
 * follows the `dark` class on <html>, same mechanism as ThemeToggle.jsx.
 */
const Map = forwardRef(function Map(
  { children, className, theme: themeProp, styles, loading = false, ...props },
  ref
) {
  const containerRef = useRef(null);
  const [mapInstance, setMapInstance] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isStyleLoaded, setIsStyleLoaded] = useState(false);
  const currentStyleRef = useRef(null);
  const styleTimeoutRef = useRef(null);
  const resolvedTheme = useResolvedTheme(themeProp);

  const mapStyles = useMemo(
    () => ({
      dark: styles?.dark ?? defaultStyles.dark,
      light: styles?.light ?? defaultStyles.light,
    }),
    [styles]
  );

  useImperativeHandle(ref, () => mapInstance, [mapInstance]);

  const clearStyleTimeout = useCallback(() => {
    if (styleTimeoutRef.current) {
      clearTimeout(styleTimeoutRef.current);
      styleTimeoutRef.current = null;
    }
  }, []);

  // Initialize the map once on mount.
  useEffect(() => {
    if (!containerRef.current) return;

    const initialStyle =
      resolvedTheme === "dark" ? mapStyles.dark : mapStyles.light;
    currentStyleRef.current = initialStyle;

    const map = new MapLibreGL.Map({
      container: containerRef.current,
      style: initialStyle,
      renderWorldCopies: false,
      attributionControl: { compact: true },
      ...props,
    });

    const styleDataHandler = () => {
      clearStyleTimeout();
      styleTimeoutRef.current = setTimeout(() => setIsStyleLoaded(true), 100);
    };
    const loadHandler = () => setIsLoaded(true);

    map.on("load", loadHandler);
    map.on("styledata", styleDataHandler);
    setMapInstance(map);

    return () => {
      clearStyleTimeout();
      map.off("load", loadHandler);
      map.off("styledata", styleDataHandler);
      map.remove();
      setIsLoaded(false);
      setIsStyleLoaded(false);
      setMapInstance(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Swap the basemap style when the resolved theme changes.
  useEffect(() => {
    if (!mapInstance || !resolvedTheme) return;

    const newStyle =
      resolvedTheme === "dark" ? mapStyles.dark : mapStyles.light;

    if (currentStyleRef.current === newStyle) return;

    clearStyleTimeout();
    currentStyleRef.current = newStyle;
    setIsStyleLoaded(false);
    mapInstance.setStyle(newStyle, { diff: true });
  }, [mapInstance, resolvedTheme, mapStyles, clearStyleTimeout]);

  const contextValue = useMemo(
    () => ({
      map: mapInstance,
      isLoaded: isLoaded && isStyleLoaded,
      resolvedTheme,
    }),
    [mapInstance, isLoaded, isStyleLoaded, resolvedTheme]
  );

  return (
    <MapContext.Provider value={contextValue}>
      <div
        ref={containerRef}
        className={cn("relative h-full w-full", className)}
      >
        {(!isLoaded || loading) && <DefaultLoader />}
        {mapInstance && children}
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

function MapMarker({
  longitude,
  latitude,
  children,
  onClick,
  draggable = false,
  ...markerOptions
}) {
  const { map } = useMap();

  const callbacksRef = useRef({ onClick });
  callbacksRef.current = { onClick };

  const marker = useMemo(() => {
    const markerInstance = new MapLibreGL.Marker({
      ...markerOptions,
      element: document.createElement("div"),
      draggable,
    }).setLngLat([longitude, latitude]);

    const handleClick = (e) => callbacksRef.current.onClick?.(e);
    markerInstance.getElement()?.addEventListener("click", handleClick);

    return markerInstance;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!map) return;
    marker.addTo(map);
    return () => marker.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]);

  useEffect(() => {
    const current = marker.getLngLat();
    if (current.lng !== longitude || current.lat !== latitude) {
      marker.setLngLat([longitude, latitude]);
    }
  }, [marker, longitude, latitude]);

  return (
    <MarkerContext.Provider value={{ marker, map }}>
      {children}
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
    <div className={cn("relative cursor-pointer", className)}>
      {children || <DefaultMarkerIcon />}
    </div>,
    marker.getElement()
  );
}

function MarkerTooltip({ children, className, ...popupOptions }) {
  const { marker, map } = useMarkerContext();
  const container = useMemo(() => document.createElement("div"), []);
  const { offset } = popupOptions;

  const tooltip = useMemo(() => {
    return new MapLibreGL.Popup({
      offset: 16,
      ...popupOptions,
      closeOnClick: true,
      closeButton: false,
    }).setMaxWidth("none");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!map) return;

    tooltip.setDOMContent(container);

    const handleMouseEnter = () => {
      tooltip.setLngLat(marker.getLngLat()).addTo(map);
    };
    const handleMouseLeave = () => tooltip.remove();

    marker.getElement()?.addEventListener("mouseenter", handleMouseEnter);
    marker.getElement()?.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      marker.getElement()?.removeEventListener("mouseenter", handleMouseEnter);
      marker.getElement()?.removeEventListener("mouseleave", handleMouseLeave);
      tooltip.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]);

  useEffect(() => {
    tooltip.setOffset(offset ?? 16);
  }, [tooltip, offset]);

  return createPortal(
    <div
      className={cn(
        "pointer-events-none rounded-md bg-foreground px-2 py-1 text-xs text-balance text-background shadow-md",
        "animate-in fade-in-0 zoom-in-95 duration-200 ease-out",
        className
      )}
    >
      {children}
    </div>,
    container
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

function MapControls({ position = "bottom-right", showZoom = true, className }) {
  const { map } = useMap();

  const handleZoomIn = useCallback(() => {
    map?.zoomTo(map.getZoom() + 1, { duration: 300 });
  }, [map]);

  const handleZoomOut = useCallback(() => {
    map?.zoomTo(map.getZoom() - 1, { duration: 300 });
  }, [map]);

  if (!showZoom) return null;

  return (
    <div
      className={cn(
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

export { Map, MapMarker, MarkerContent, MarkerTooltip, MapControls };
