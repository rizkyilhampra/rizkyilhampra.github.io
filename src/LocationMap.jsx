import { useState } from "react";
import { Map, MapMarker, MarkerContent, MapControls } from "./lib/map";

const BANJARMASIN = [114.590111, -3.316694];

export default function LocationMap() {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="relative mt-6 h-40 w-full overflow-hidden rounded-lg border border-border bg-card/50 sm:h-44 md:w-1/2">
      {!loaded && (
        <div className="absolute inset-0 animate-pulse bg-secondary" aria-hidden="true" />
      )}

      <Map center={BANJARMASIN} zoom={3.0} onLoad={() => setLoaded(true)}>
        <MapMarker longitude={BANJARMASIN[0]} latitude={BANJARMASIN[1]}>
          <MarkerContent />
        </MapMarker>
        <MapControls position="bottom-right" />
      </Map>
    </div>
  );
}
