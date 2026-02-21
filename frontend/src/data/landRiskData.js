// ── EU-THETA Land Risk Zones — Mediterranean basin ────────────────────
// Static placeholder GeoJSON FeatureCollection.
// Replaced by /api/map/land-risk when the backend is ready.
//
// Risk classes:
//   critical          — high fuel dryness + steep terrain + population proximity
//   moderate          — buffer zones around critical areas
//   natural_fire_zone — ecologically beneficial fire zones (NOT to be suppressed)

export const LAND_RISK = {
  type: 'FeatureCollection',
  features: [

    // ── CRITICAL ZONES ─────────────────────────────────────────────────

    // Attica / Athens — high fuel, dense urban interface, matches STRK-009
    {
      type: 'Feature',
      properties: { id: 'LR-ATT', level: 'critical', name: 'Attica / Athens' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [23.0, 37.6], [24.4, 37.6], [24.4, 38.5],
          [23.8, 38.6], [23.0, 38.5], [23.0, 37.6],
        ]],
      },
    },

    // Valencia coast — matches STRK-007, dry Levante wind corridor
    {
      type: 'Feature',
      properties: { id: 'LR-VAL', level: 'critical', name: 'Valencia Coast' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-1.2, 38.8], [0.4, 38.8], [0.4, 40.1],
          [-0.6, 40.2], [-1.2, 40.0], [-1.2, 38.8],
        ]],
      },
    },

    // Provence hills — matches WTHR-027, mistral-driven fire weather
    {
      type: 'Feature',
      properties: { id: 'LR-PRV', level: 'critical', name: 'Provence Hills' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [4.5, 43.0], [6.6, 43.0], [6.6, 44.1],
          [5.8, 44.3], [4.5, 44.1], [4.5, 43.0],
        ]],
      },
    },

    // Western Sardinia — dry macchia, steep terrain, low population
    {
      type: 'Feature',
      properties: { id: 'LR-SAR', level: 'critical', name: 'Western Sardinia' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [8.0, 39.5], [9.1, 39.5], [9.1, 40.9],
          [8.5, 41.2], [8.0, 40.8], [8.0, 39.5],
        ]],
      },
    },

    // ── MODERATE ZONES ─────────────────────────────────────────────────

    // Broader Attica buffer
    {
      type: 'Feature',
      properties: { id: 'LR-ATT-M', level: 'moderate', name: 'Central Greece buffer' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [22.0, 37.0], [25.5, 37.0], [25.5, 39.2],
          [23.8, 39.5], [22.0, 39.2], [22.0, 37.0],
        ]],
      },
    },

    // Iberian east coast buffer (Catalonia + Valencia hinterland)
    {
      type: 'Feature',
      properties: { id: 'LR-IB-M', level: 'moderate', name: 'Eastern Iberia buffer' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-2.0, 38.0], [1.5, 38.0], [1.5, 41.5],
          [-0.2, 42.0], [-2.0, 41.5], [-2.0, 38.0],
        ]],
      },
    },

    // Southern France / Rhône corridor
    {
      type: 'Feature',
      properties: { id: 'LR-FR-M', level: 'moderate', name: 'Rhône–Var corridor' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [3.5, 42.5], [7.5, 42.5], [7.5, 44.5],
          [5.5, 45.0], [3.5, 44.5], [3.5, 42.5],
        ]],
      },
    },

    // Sardinia + Corsica buffer
    {
      type: 'Feature',
      properties: { id: 'LR-SAR-M', level: 'moderate', name: 'Tyrrhenian islands buffer' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [7.5, 38.8], [10.0, 38.8], [10.0, 42.0],
          [8.5, 42.5], [7.5, 42.0], [7.5, 38.8],
        ]],
      },
    },

    // Southern Italy (Calabria / Sicily)
    {
      type: 'Feature',
      properties: { id: 'LR-SIT-M', level: 'moderate', name: 'Calabria & Sicily' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [12.0, 36.5], [15.5, 36.5], [15.5, 39.5],
          [14.0, 40.0], [12.0, 39.5], [12.0, 36.5],
        ]],
      },
    },

    // ── NATURAL FIRE ZONES ─────────────────────────────────────────────
    // Ecologically beneficial fire — NOT to be suppressed

    // Iberian interior (Portugal / western Spain)
    {
      type: 'Feature',
      properties: { id: 'LR-PT-N', level: 'natural_fire_zone', name: 'Iberian interior shrubland' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-9.0, 37.5], [-6.5, 37.5], [-6.5, 40.5],
          [-8.0, 41.0], [-9.0, 40.5], [-9.0, 37.5],
        ]],
      },
    },

    // Peloponnese / southern Greece scrubland
    {
      type: 'Feature',
      properties: { id: 'LR-PEL-N', level: 'natural_fire_zone', name: 'Peloponnese scrubland' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [21.5, 36.5], [23.0, 36.5], [23.0, 37.5],
          [22.2, 37.8], [21.5, 37.5], [21.5, 36.5],
        ]],
      },
    },

    // Anatolian coastal scrub (Turkey border zone)
    {
      type: 'Feature',
      properties: { id: 'LR-TUR-N', level: 'natural_fire_zone', name: 'Aegean coastal scrub' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [26.0, 37.0], [28.5, 37.0], [28.5, 38.5],
          [27.0, 39.0], [26.0, 38.5], [26.0, 37.0],
        ]],
      },
    },
  ],
};
