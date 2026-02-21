// ── EU-THETA operational zone: Mediterranean basin ──────────────────────
export const DRONES = [
  { id: 'ZS-01', lat: 38.20, lng:  23.70, status: 'deployed', battery: 78, mission: 'SEED-ZONE-ALPHA' },
  { id: 'ZS-02', lat: 39.47, lng:  -0.38, status: 'deployed', battery: 65, mission: 'SEED-ZONE-BETA'  },
  { id: 'ZS-03', lat: 42.10, lng:   2.60, status: 'standby',  battery: 100,mission: 'STANDBY'        },
  { id: 'ZS-04', lat: 43.40, lng:   5.20, status: 'warning',  battery: 22, mission: 'RTB'             },
  { id: 'ZS-05', lat: 37.70, lng:  -7.10, status: 'standby',  battery: 95, mission: 'STANDBY'        },
  { id: 'ZS-06', lat: 38.60, lng:  23.80, status: 'deployed', battery: 84, mission: 'PATROL-AEGEAN'   },
  { id: 'ZS-07', lat: 37.90, lng:  22.40, status: 'standby',  battery: 91, mission: 'STANDBY'        },
];

export const THREATS = [
  { id: 'STRK-009', lat: 38.05, lng: 23.85, probability: 91, radiusKm: 42, level: 'critical', heading: 220, speedKmh: 18, etaMin: 18 }, // Attica / Athens
  { id: 'STRK-007', lat: 39.47, lng: -0.50, probability: 67, radiusKm: 34, level: 'warning',  heading: 155, speedKmh: 12, etaMin: 41 }, // Valencia coast
  { id: 'WTHR-027', lat: 43.53, lng:  5.45, probability: 48, radiusKm: 28, level: 'watch',    heading: 190, speedKmh:  8, etaMin: 73 }, // Provence
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
