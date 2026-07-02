import { Map, MapMarker, MarkerContent, MapControls } from "./lib/map";

const KALSEL_CENTER = [115.2837585, -3.0926415];
const BANJARMASIN = [114.590111, -3.316694];

export default function LocationMap() {
  return (
    <div className="relative mt-6 h-40 w-full overflow-hidden rounded-lg border border-border bg-card/50 sm:h-44 md:w-1/2">
      <Map center={KALSEL_CENTER} zoom={6.5}>
        <MapMarker longitude={BANJARMASIN[0]} latitude={BANJARMASIN[1]}>
          <MarkerContent />
        </MapMarker>
        <MapControls position="bottom-right" />
      </Map>
    </div>
  );
}
