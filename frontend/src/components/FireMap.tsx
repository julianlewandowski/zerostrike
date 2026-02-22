import { useRef, useEffect, useMemo } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { FIRMS_ACTUAL, FIRMS_LA } from "@/data/firmsHotspots";

interface FireMapProps {
  mode: "spain" | "la";
  timeProgress: number;
}

const SPAIN_CENTER: [number, number] = [-0.82, 39.46];
const LA_CENTER:    [number, number] = [-118.38, 34.12];

interface FireZone {
  id: number;
  lng: number;
  lat: number;
  radiusKm: number;
  label: string;
  threshold: number;
}

const fireZones: Record<"spain" | "la", FireZone[]> = {
  spain: [
    { id: 1, lng: -0.72, lat: 39.47, radiusKm: 14,   label: "Chiva",     threshold: 0    },
    { id: 2, lng: -1.20, lat: 39.57, radiusKm: 11,   label: "Utiel",     threshold: 0.15 },
    { id: 3, lng: -0.71, lat: 39.39, radiusKm: 9,    label: "Turís",     threshold: 0.3  },
    { id: 4, lng: -1.10, lat: 39.49, radiusKm: 12.5, label: "Requena",   threshold: 0.45 },
    { id: 5, lng: -0.57, lat: 39.28, radiusKm: 10,   label: "Llombai",   threshold: 0.55 },
    { id: 6, lng: -0.79, lat: 39.42, radiusKm: 7.5,  label: "Buñol",     threshold: 0.65 },
    { id: 7, lng: -0.65, lat: 39.14, radiusKm: 6,    label: "Tous",      threshold: 0.75 },
    { id: 8, lng: -0.69, lat: 39.42, radiusKm: 8,    label: "Godelleta", threshold: 0.85 },
  ],
  la: [
    { id: 1, lng: -118.52, lat: 34.05, radiusKm: 9,   label: "Palisades",    threshold: 0    },
    { id: 2, lng: -118.13, lat: 34.20, radiusKm: 7.5, label: "Altadena",     threshold: 0.04 },
    { id: 3, lng: -118.62, lat: 34.04, radiusKm: 6,   label: "Malibu",       threshold: 0.15 },
    { id: 4, lng: -118.41, lat: 34.34, radiusKm: 3.5, label: "Hurst",        threshold: 0.09 },
    { id: 5, lng: -118.46, lat: 34.09, radiusKm: 5,   label: "Brentwood",    threshold: 0.25 },
    { id: 6, lng: -118.07, lat: 34.23, radiusKm: 5,   label: "Sierra Madre", threshold: 0.35 },
    { id: 7, lng: -118.58, lat: 34.10, radiusKm: 6.5, label: "Topanga",      threshold: 0.40 },
    { id: 8, lng: -118.15, lat: 34.17, radiusKm: 3,   label: "Pasadena",     threshold: 0.55 },
  ],
};

const spainTownMarkers = [
  { name: "Valencia", lng: -0.38, lat: 39.47 },
  { name: "Chiva",    lng: -0.72, lat: 39.47 },
  { name: "Utiel",    lng: -1.20, lat: 39.57 },
  { name: "Requena",  lng: -1.10, lat: 39.49 },
  { name: "Turís",    lng: -0.71, lat: 39.39 },
  { name: "Buñol",    lng: -0.79, lat: 39.42 },
  { name: "Alzira",   lng: -0.44, lat: 39.15 },
];

const laTownMarkers = [
  { name: "Pac. Palisades", lng: -118.52, lat: 34.05 },
  { name: "Malibu",         lng: -118.78, lat: 34.04 },
  { name: "Altadena",       lng: -118.13, lat: 34.20 },
  { name: "Pasadena",       lng: -118.14, lat: 34.15 },
  { name: "Sylmar",         lng: -118.44, lat: 34.31 },
  { name: "Santa Monica",   lng: -118.49, lat: 34.01 },
];

/**
 * Angular polygon — 8-sided irregular shape with deterministic vertex variation.
 * Produces a tactical "zone" look instead of a smooth circle.
 */
function angularPolygon(lng: number, lat: number, radiusKm: number, sides = 8): number[][] {
  const coords: number[][] = [];
  const r = radiusKm / 111.32;
  for (let i = 0; i <= sides; i++) {
    const angle = (i / sides) * 2 * Math.PI;
    const v = 0.76 + 0.28 * Math.abs(Math.sin(i * 2.6180 + 0.4));
    const rVar = r * v;
    const dx = (rVar * Math.cos(angle)) / Math.cos((lat * Math.PI) / 180);
    const dy =  rVar * Math.sin(angle);
    coords.push([lng + dx, lat + dy]);
  }
  return coords;
}

function getHectares(mode: "spain" | "la", t: number): string {
  return Math.round((mode === "spain" ? 30_000 : 15_000) * t).toLocaleString();
}

// Project lng/lat to SVG x,y for fallback static map (no Mapbox token)
const FALLBACK_VIEW = { width: 400, height: 400 };
function projectSpain(lng: number, lat: number): [number, number] {
  const x = ((lng + 0.82) / 0.6) * FALLBACK_VIEW.width;
  const y = ((39.46 - lat) / 0.5) * FALLBACK_VIEW.height;
  return [x, y];
}
function projectLA(lng: number, lat: number): [number, number] {
  const x = ((lng + 118.38) / 0.8) * FALLBACK_VIEW.width;
  const y = ((34.12 - lat) / 0.4) * FALLBACK_VIEW.height;
  return [x, y];
}

const FireMap = ({ mode, timeProgress }: FireMapProps) => {
  const containerRef     = useRef<HTMLDivElement>(null);
  const mapRef           = useRef<mapboxgl.Map | null>(null);
  // Keep latest GeoJSON in refs so map.on("load") can seed data immediately
  const fireGeoJSONRef   = useRef<GeoJSON.FeatureCollection | null>(null);
  const hotspotsGeoJSONRef = useRef<GeoJSON.FeatureCollection | null>(null);
  const token        = import.meta.env.VITE_MAPBOX_TOKEN;
  const isPublicToken = token && String(token).startsWith("pk.");

  const isSpain  = mode === "spain";
  const zones    = fireZones[mode];
  const hotspots = isSpain ? FIRMS_ACTUAL : FIRMS_LA;
  const townMarkers = isSpain ? spainTownMarkers : laTownMarkers;

  // Accent colours — LA is the bigger threat (red), Spain is amber/orange
  const fillColor    = isSpain ? "#cc4400"          : "#cc2200";
  const lineColor    = isSpain ? "#ff6600"          : "#ff3300";
  const hotGlow      = isSpain ? "#ff7700"          : "#ff3300";
  const hotDay       = isSpain ? "#ffaa00"          : "#ff8800";
  const hotNight     = isSpain ? "#ff5500"          : "#ff0000";

  // ── Burned-area polygons ──────────────────────────────────────────────────
  const fireGeoJSON = useMemo(() => {
    const features: GeoJSON.Feature<GeoJSON.Polygon>[] = [];
    for (const zone of zones) {
      const zp =
        zone.threshold < timeProgress
          ? Math.min(1, (timeProgress - zone.threshold) / (1 - zone.threshold))
          : 0;
      if (zp <= 0) continue;
      const ring = angularPolygon(zone.lng, zone.lat, zone.radiusKm * zp);
      ring.push(ring[0]);
      features.push({
        type: "Feature",
        properties: { id: zone.id, label: zone.label },
        geometry: { type: "Polygon", coordinates: [ring] },
      });
    }
    return { type: "FeatureCollection" as const, features };
  }, [zones, timeProgress]);

  // ── FIRMS hotspots as small squares ──────────────────────────────────────
  const hotspotsGeoJSON = useMemo(() => {
    const features: GeoJSON.Feature<GeoJSON.Polygon>[] = hotspots
      .filter((h) => h.progress <= timeProgress)
      .map((h) => {
        const km  = 0.22 + (h.frp / 1800) * 0.85;
        const r   = km / 111.32;
        const cos = Math.cos((h.lat * Math.PI) / 180);
        const hw  = r / cos;
        const hh  = r;
        return {
          type: "Feature" as const,
          properties: { frp: h.frp, daynight: h.daynight },
          geometry: {
            type: "Polygon" as const,
            coordinates: [[
              [h.lng - hw, h.lat - hh],
              [h.lng + hw, h.lat - hh],
              [h.lng + hw, h.lat + hh],
              [h.lng - hw, h.lat + hh],
              [h.lng - hw, h.lat - hh],
            ]],
          },
        };
      });
    return { type: "FeatureCollection" as const, features };
  }, [hotspots, timeProgress]);

  // ── Map initialisation ────────────────────────────────────────────────────
  useEffect(() => {
    if (!isPublicToken || !containerRef.current) return;

    mapboxgl.accessToken = token as string;
    const el = containerRef.current;

    let activeMap: mapboxgl.Map | null = null;
    let sizeRo: ResizeObserver | null = null;
    let waitRo: ResizeObserver | null = null;

    const createMap = () => {
      if (!containerRef.current || activeMap) return;

      const map = new mapboxgl.Map({
        container: containerRef.current,
        style:   "mapbox://styles/mapbox/satellite-streets-v12",
        center:  isSpain ? SPAIN_CENTER : LA_CENTER,
        zoom:    isSpain ? 8.8 : 9.0,
        pitch:   60,
        bearing: isSpain ? 15 : -10,
        antialias: true,
      });

      map.on("load", () => {
        // Desaturate all raster layers to B&W — vector/GeoJSON layers stay colored
        const style = map.getStyle();
        if (style?.layers) {
          style.layers.forEach((layer) => {
            if (layer.type === "raster") {
              map.setPaintProperty(layer.id, "raster-saturation",    -1);
              map.setPaintProperty(layer.id, "raster-brightness-max", 0.78);
              map.setPaintProperty(layer.id, "raster-contrast",       0.2);
            }
          });
        }

        // 3D elevation
        map.addSource("mapbox-dem", {
          type: "raster-dem",
          url:  "mapbox://mapbox.mapbox-terrain-dem-v1",
          tileSize: 512,
          maxzoom: 14,
        });
        map.setTerrain({ source: "mapbox-dem", exaggeration: 2.0 });

        // Hillshading on top of B&W satellite
        map.addLayer(
          {
            id:   "hillshading",
            type: "hillshade",
            source: "mapbox-dem",
            paint: {
              "hillshade-exaggeration":           0.55,
              "hillshade-shadow-color":           "#000000",
              "hillshade-highlight-color":        "#ffffff",
              "hillshade-accent-color":           "#000000",
              "hillshade-illumination-direction": 315,
              "hillshade-illumination-anchor":    "viewport",
            },
          },
          "waterway-label"
        );

        // FIRMS hotspot squares
        map.addSource("firms-hotspots", {
          type: "geojson",
          data: { type: "FeatureCollection", features: [] },
        });

        map.addLayer({
          id: "hotspots-glow",
          type: "fill",
          source: "firms-hotspots",
          paint: { "fill-color": hotGlow, "fill-opacity": 0.15 },
        });

        map.addLayer({
          id: "hotspots-fill",
          type: "fill",
          source: "firms-hotspots",
          paint: {
            "fill-color": [
              "case",
              ["==", ["get", "daynight"], "N"], hotNight, hotDay,
            ],
            "fill-opacity": 0.88,
          },
        });

        map.addLayer({
          id: "hotspots-outline",
          type: "line",
          source: "firms-hotspots",
          paint: { "line-color": "#ffffff", "line-width": 0.6, "line-opacity": 0.5 },
        });

        // Burned area zone
        map.addSource("fire-zones", {
          type: "geojson",
          data: { type: "FeatureCollection", features: [] },
        });

        map.addLayer({
          id: "fire-zones-fill",
          type: "fill",
          source: "fire-zones",
          paint: { "fill-color": fillColor, "fill-opacity": 0.40 },
        });

        map.addLayer({
          id: "fire-zones-outline",
          type: "line",
          source: "fire-zones",
          paint: {
            "line-color":   lineColor,
            "line-width":   1.8,
            "line-opacity": 0.9,
            "line-blur":    2,
          },
        });

        // Town markers
        townMarkers.forEach((t) => {
          const markerEl = document.createElement("div");
          markerEl.className = "fire-map-marker";
          markerEl.innerHTML = `<span class="fire-map-marker-dot"></span><span class="fire-map-marker-label">${t.name}</span>`;
          new mapboxgl.Marker({ element: markerEl, anchor: "center" })
            .setLngLat([t.lng, t.lat])
            .addTo(map);
        });

        // Seed sources immediately with whatever progress is current (may be 1 on first load)
        if (fireGeoJSONRef.current)
          (map.getSource("fire-zones") as mapboxgl.GeoJSONSource).setData(fireGeoJSONRef.current);
        if (hotspotsGeoJSONRef.current)
          (map.getSource("firms-hotspots") as mapboxgl.GeoJSONSource).setData(hotspotsGeoJSONRef.current);
      });

      activeMap = map;
      mapRef.current = map;

      // Resize map whenever container dimensions change
      sizeRo = new ResizeObserver(() => { map.resize(); });
      sizeRo.observe(containerRef.current!);
    };

    if (el.clientWidth > 0 || el.clientHeight > 0) {
      // Container is already visible — initialise immediately
      createMap();
    } else {
      // Container is inside a hidden tab (display:none ancestor) — wait until visible
      waitRo = new ResizeObserver(() => {
        if (
          containerRef.current &&
          (containerRef.current.clientWidth > 0 || containerRef.current.clientHeight > 0)
        ) {
          waitRo?.disconnect();
          waitRo = null;
          createMap();
        }
      });
      waitRo.observe(el);
    }

    return () => {
      waitRo?.disconnect();
      sizeRo?.disconnect();
      activeMap?.remove();
      mapRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, isPublicToken]);

  // Keep refs current so map.on("load") can seed data immediately at any progress
  useEffect(() => { fireGeoJSONRef.current   = fireGeoJSON;   }, [fireGeoJSON]);
  useEffect(() => { hotspotsGeoJSONRef.current = hotspotsGeoJSON; }, [hotspotsGeoJSON]);

  // Push data updates every tick
  useEffect(() => {
    const map = mapRef.current;
    (map?.getSource("fire-zones")     as mapboxgl.GeoJSONSource | undefined)?.setData(fireGeoJSON);
    (map?.getSource("firms-hotspots") as mapboxgl.GeoJSONSource | undefined)?.setData(hotspotsGeoJSON);
  }, [fireGeoJSON, hotspotsGeoJSON]);

  // ── Fallback: static map image (no token or invalid token) ───────────────────
  const project = isSpain ? projectSpain : projectLA;
  const renderFallbackMap = () => (
    <div className="relative w-full h-full overflow-hidden">
      {/* Dark gradient background */}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(180deg, #0a0a0a 0%, #1a0f08 40%, #0d0d0d 100%)",
        }}
      />
      <svg
        className="absolute inset-0 w-full h-full object-cover opacity-90"
        viewBox={`0 0 ${FALLBACK_VIEW.width} ${FALLBACK_VIEW.height}`}
        preserveAspectRatio="xMidYMid slice"
      >
        {/* Fire zones */}
        {fireGeoJSON.features.map((f, i) => {
          const coords = f.geometry.coordinates[0];
          const points = coords.map(([lng, lat]) => project(lng, lat).join(",")).join(" ");
          return (
            <g key={i}>
              <polygon
                points={points}
                fill={fillColor}
                fillOpacity={0.35}
                stroke={lineColor}
                strokeWidth={1.2}
                strokeOpacity={0.9}
              />
            </g>
          );
        })}
        {/* FIRMS hotspots */}
        {hotspotsGeoJSON.features.map((f, i) => {
          const coords = f.geometry.coordinates[0];
          const [lng0, lat0] = coords[0];
          const [lng1, lat1] = coords[1];
          const [x0, y0] = project(lng0, lat0);
          const [x1, y1] = project(lng1, lat1);
          const daynight = (f.properties as { daynight?: string })?.daynight;
          const fill = daynight === "N" ? hotNight : hotDay;
          return (
            <rect
              key={i}
              x={Math.min(x0, x1)}
              y={Math.min(y0, y1)}
              width={Math.abs(x1 - x0)}
              height={Math.abs(y1 - y0)}
              fill={fill}
              fillOpacity={0.85}
              stroke="rgba(255,255,255,0.4)"
              strokeWidth={0.4}
            />
          );
        })}
      </svg>
      {/* Vignette */}
      <div
        className="absolute inset-0 pointer-events-none z-10"
        style={{ background: "radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,0.6) 100%)" }}
      />
      {/* Token hint — subtle */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 px-2 py-1 rounded bg-black/60 border border-white/10">
        <p className="text-[9px] font-mono text-white/40 text-center">
          Add <code className="text-white/60">VITE_MAPBOX_TOKEN</code> in <code>.env</code> for live map
        </p>
      </div>
    </div>
  );

  const accent    = isSpain ? "border-orange-500/50" : "border-red-600/50";
  const accentTxt = isSpain ? "text-orange-400"       : "text-red-400";
  const accentBg  = isSpain ? "bg-orange-900/15"      : "bg-red-900/20";
  const dotColor  = isSpain ? "bg-orange-500 animate-pulse" : "bg-red-500 animate-pulse";

  // When no valid token, show static map image (zones + hotspots) instead of text only
  if (!token || !isPublicToken) {
    return (
      <div className="relative w-full h-full overflow-hidden">
        {renderFallbackMap()}
        <div className={`absolute top-4 left-8 z-30 flex items-center gap-1.5 px-2 py-1 ${accentBg} border ${accent}`}>
          <span className={`w-1.5 h-1.5 ${dotColor}`} />
          <span className={`text-[9px] font-mono uppercase tracking-[0.18em] ${accentTxt}`}>
            {isSpain ? "SPAIN — OCT 2024" : "LOS ANGELES — JAN 2025"}
          </span>
        </div>
        <div className={`absolute bottom-4 left-8 z-30 px-2 py-1.5 ${accentBg} border ${accent} space-y-1`}>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 flex-shrink-0 bg-orange-400" />
            <span className="text-[8px] font-mono text-white/60">FIRMS VIIRS · day</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 flex-shrink-0 bg-red-500" />
            <span className="text-[8px] font-mono text-white/60">FIRMS VIIRS · night</span>
          </div>
        </div>
        <div className={`absolute bottom-4 right-8 z-30 text-right px-2 py-1.5 ${accentBg} border ${accent}`}>
          <p className="text-[8px] font-mono text-white/40 uppercase tracking-widest">
            {hotspotsGeoJSON.features.length} DETECTIONS
          </p>
          <p className={`text-base font-bold font-mono tabular-nums ${accentTxt}`}>
            {getHectares(mode, timeProgress)}
            <span className="text-[9px] text-white/40 ml-1">ha</span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full overflow-hidden">
      <div ref={containerRef} className="absolute inset-0 w-full h-full" />

      {/* Vignette */}
      <div
        className="absolute inset-0 pointer-events-none z-10"
        style={{ background: "radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,0.65) 100%)" }}
      />

      {/* Scanlines */}
      <div
        className="absolute inset-0 pointer-events-none z-10"
        style={{ background: "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.06) 3px, rgba(0,0,0,0.06) 4px)" }}
      />

      {/* Corner brackets */}
      {(["tl","tr","bl","br"] as const).map((pos) => (
        <div
          key={pos}
          className={`absolute z-20 w-5 h-5 pointer-events-none ${accent} ${
            pos === "tl" ? "top-2.5 left-2.5 border-t border-l" :
            pos === "tr" ? "top-2.5 right-2.5 border-t border-r" :
            pos === "bl" ? "bottom-2.5 left-2.5 border-b border-l" :
                           "bottom-2.5 right-2.5 border-b border-r"
          }`}
        />
      ))}

      {/* Mode badge */}
      <div className={`absolute top-4 left-8 z-30 flex items-center gap-1.5 px-2 py-1 ${accentBg} border ${accent}`}>
        <span className={`w-1.5 h-1.5 ${dotColor}`} />
        <span className={`text-[9px] font-mono uppercase tracking-[0.18em] ${accentTxt}`}>
          {isSpain ? "SPAIN — OCT 2024" : "LOS ANGELES — JAN 2025"}
        </span>
      </div>

      {/* FIRMS legend */}
      <div className={`absolute bottom-4 left-8 z-30 px-2 py-1.5 ${accentBg} border ${accent} space-y-1`}>
        <div className="flex items-center gap-1.5">
          <span className={`w-2 h-2 flex-shrink-0 ${isSpain ? "bg-orange-400" : "bg-orange-400"}`} />
          <span className="text-[8px] font-mono text-white/60">FIRMS VIIRS · day hotspot</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={`w-2 h-2 flex-shrink-0 ${isSpain ? "bg-red-600" : "bg-red-500"}`} />
          <span className="text-[8px] font-mono text-white/60">FIRMS VIIRS · night hotspot</span>
        </div>
      </div>

      {/* Area counter */}
      <div className={`absolute bottom-4 right-8 z-30 text-right px-2 py-1.5 ${accentBg} border ${accent}`}>
        <p className="text-[8px] font-mono text-white/40 uppercase tracking-widest">
          {hotspotsGeoJSON.features.length} DETECTIONS
        </p>
        <p className={`text-base font-bold font-mono tabular-nums ${accentTxt}`}>
          {getHectares(mode, timeProgress)}
          <span className="text-[9px] text-white/40 ml-1">ha</span>
        </p>
      </div>
    </div>
  );
};

export default FireMap;
