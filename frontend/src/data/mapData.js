export const DRONES = [
  { id: 'ZS-01', lat: 36.20, lng: -118.40, status: 'deployed', battery: 78,  mission: 'SEED-ZONE-A' },
  { id: 'ZS-02', lat: 35.80, lng: -119.10, status: 'deployed', battery: 65,  mission: 'SEED-ZONE-B' },
  { id: 'ZS-03', lat: 36.80, lng: -118.80, status: 'standby',  battery: 100, mission: 'STANDBY' },
  { id: 'ZS-04', lat: 36.50, lng: -117.90, status: 'warning',  battery: 22,  mission: 'RTB' },
  { id: 'ZS-05', lat: 35.50, lng: -119.50, status: 'standby',  battery: 95,  mission: 'STANDBY' },
  { id: 'ZS-06', lat: 37.10, lng: -119.20, status: 'deployed', battery: 84,  mission: 'PATROL-NORTH' },
  { id: 'ZS-07', lat: 35.20, lng: -118.00, status: 'standby',  battery: 91,  mission: 'STANDBY' },
];

export const THREATS = [
  { id: 'STRK-009', lat: 36.20, lng: -118.40, probability: 91, radiusKm: 42, level: 'critical' },
  { id: 'STRK-007', lat: 35.80, lng: -119.10, probability: 67, radiusKm: 34, level: 'warning' },
  { id: 'WTHR-027', lat: 36.50, lng: -117.90, probability: 48, radiusKm: 28, level: 'watch' },
];

// Seeding radius per deployed drone (km)
export const COVERAGE_RADIUS_KM = 80;

/**
 * Generate approximate circle polygon coordinates.
 * Returns a closed ring suitable for GeoJSON Polygon coordinates[0].
 */
export function circleRing(lngLat, radiusKm, steps = 64) {
  const [lng, lat] = lngLat;
  const latRad = (lat * Math.PI) / 180;
  const coords = [];

  for (let i = 0; i <= steps; i++) {
    const angle = (i / steps) * 2 * Math.PI;
    const dLng = (radiusKm / (111.32 * Math.cos(latRad))) * Math.cos(angle);
    const dLat = (radiusKm / 110.574) * Math.sin(angle);
    coords.push([lng + dLng, lat + dLat]);
  }

  return coords;
}

export function buildThreatGeoJSON(threats) {
  return {
    type: 'FeatureCollection',
    features: threats.map((t) => ({
      type: 'Feature',
      properties: {
        id: t.id,
        level: t.level,
        color: t.level === 'critical' ? '#ff2020' : '#ff6a00',
      },
      geometry: {
        type: 'Polygon',
        coordinates: [circleRing([t.lng, t.lat], t.radiusKm)],
      },
    })),
  };
}

export function buildCoverageGeoJSON(drones) {
  return {
    type: 'FeatureCollection',
    features: drones
      .filter((d) => d.status === 'deployed')
      .map((d) => ({
        type: 'Feature',
        properties: { id: d.id },
        geometry: {
          type: 'Polygon',
          coordinates: [circleRing([d.lng, d.lat], COVERAGE_RADIUS_KM)],
        },
      })),
  };
}
