/**
 * Simulated NASA FIRMS VIIRS hotspot detections for the Valencia western
 * mountains wildfire case study (Oct 29 – Nov 5, 2024).
 *
 * Fields match real FIRMS CSV format:
 *   lng/lat   — WGS84 coordinates
 *   frp       — Fire Radiative Power (MW) — proxy for fire intensity
 *   daynight  — "D" = daytime pass, "N" = nighttime pass (fires hotter at night)
 *   progress  — 0–1 simulation progress value when this hotspot is revealed
 */
export interface Hotspot {
  id: number;
  lng: number;
  lat: number;
  frp: number;
  daynight: "D" | "N";
  progress: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// ACTUAL scenario: Full 7-day fire spread across Valencia western mountains
// Origin: Chiva sierra → spreads SW through Turís, W through Buñol,
//         NW through Siete Aguas → Requena → Utiel plateau
// ─────────────────────────────────────────────────────────────────────────────
export const FIRMS_ACTUAL: Hotspot[] = [
  // ── Day 1 afternoon — Origin: Chiva mountains ──────────────────────────────
  { id:  1, lng: -0.738, lat: 39.441, frp:  324, daynight: "D", progress: 0.00 },
  { id:  2, lng: -0.724, lat: 39.458, frp:  512, daynight: "D", progress: 0.01 },
  { id:  3, lng: -0.751, lat: 39.433, frp:  445, daynight: "D", progress: 0.02 },
  { id:  4, lng: -0.718, lat: 39.471, frp:  289, daynight: "D", progress: 0.03 },
  { id:  5, lng: -0.762, lat: 39.448, frp:  678, daynight: "D", progress: 0.03 },
  { id:  6, lng: -0.734, lat: 39.462, frp:  234, daynight: "D", progress: 0.04 },

  // ── Day 1 night — Chiva mountains expand (fires intensify overnight) ────────
  { id:  7, lng: -0.748, lat: 39.477, frp: 1240, daynight: "N", progress: 0.07 },
  { id:  8, lng: -0.776, lat: 39.441, frp:  987, daynight: "N", progress: 0.08 },
  { id:  9, lng: -0.722, lat: 39.434, frp:  756, daynight: "N", progress: 0.09 },
  { id: 10, lng: -0.758, lat: 39.492, frp:  543, daynight: "N", progress: 0.10 },
  { id: 11, lng: -0.742, lat: 39.426, frp: 1105, daynight: "N", progress: 0.10 },
  { id: 12, lng: -0.786, lat: 39.455, frp:  892, daynight: "N", progress: 0.11 },
  { id: 13, lng: -0.769, lat: 39.467, frp:  634, daynight: "N", progress: 0.12 },
  { id: 14, lng: -0.797, lat: 39.439, frp:  445, daynight: "N", progress: 0.12 },
  { id: 15, lng: -0.728, lat: 39.481, frp:  321, daynight: "D", progress: 0.13 },

  // ── Day 2 — Southwest toward Turís, Buñol corridor opens ──────────────────
  { id: 16, lng: -0.740, lat: 39.418, frp:  867, daynight: "D", progress: 0.14 },
  { id: 17, lng: -0.724, lat: 39.407, frp:  634, daynight: "D", progress: 0.15 },
  { id: 18, lng: -0.713, lat: 39.394, frp:  543, daynight: "D", progress: 0.16 },
  { id: 19, lng: -0.756, lat: 39.402, frp:  789, daynight: "D", progress: 0.16 },
  { id: 20, lng: -0.773, lat: 39.415, frp: 1234, daynight: "N", progress: 0.18 },
  { id: 21, lng: -0.698, lat: 39.389, frp:  987, daynight: "N", progress: 0.19 },
  { id: 22, lng: -0.728, lat: 39.378, frp:  765, daynight: "N", progress: 0.20 },
  { id: 23, lng: -0.812, lat: 39.428, frp: 1456, daynight: "N", progress: 0.20 },
  { id: 24, lng: -0.788, lat: 39.433, frp:  543, daynight: "N", progress: 0.21 },
  { id: 25, lng: -0.742, lat: 39.367, frp:  678, daynight: "N", progress: 0.22 },
  { id: 26, lng: -0.819, lat: 39.417, frp: 1123, daynight: "D", progress: 0.23 },
  { id: 27, lng: -0.836, lat: 39.438, frp:  876, daynight: "D", progress: 0.24 },
  { id: 28, lng: -0.762, lat: 39.381, frp:  567, daynight: "D", progress: 0.25 },
  { id: 29, lng: -0.697, lat: 39.372, frp:  445, daynight: "D", progress: 0.25 },
  { id: 30, lng: -0.821, lat: 39.452, frp:  789, daynight: "N", progress: 0.26 },
  { id: 31, lng: -0.842, lat: 39.421, frp: 1345, daynight: "N", progress: 0.27 },
  { id: 32, lng: -0.678, lat: 39.361, frp:  654, daynight: "N", progress: 0.27 },

  // ── Day 3 — Buñol, Alborache, Macastre ────────────────────────────────────
  { id: 33, lng: -0.853, lat: 39.434, frp:  987, daynight: "N", progress: 0.28 },
  { id: 34, lng: -0.831, lat: 39.405, frp: 1123, daynight: "D", progress: 0.29 },
  { id: 35, lng: -0.858, lat: 39.415, frp:  876, daynight: "D", progress: 0.30 },
  { id: 36, lng: -0.864, lat: 39.428, frp:  654, daynight: "D", progress: 0.31 },
  { id: 37, lng: -0.879, lat: 39.441, frp:  543, daynight: "D", progress: 0.31 },
  { id: 38, lng: -0.812, lat: 39.391, frp:  789, daynight: "D", progress: 0.32 },
  { id: 39, lng: -0.898, lat: 39.451, frp: 1567, daynight: "N", progress: 0.33 },
  { id: 40, lng: -0.921, lat: 39.461, frp: 1234, daynight: "N", progress: 0.34 },
  { id: 41, lng: -0.876, lat: 39.472, frp: 1123, daynight: "N", progress: 0.35 },
  { id: 42, lng: -0.912, lat: 39.484, frp:  987, daynight: "N", progress: 0.36 },
  { id: 43, lng: -0.848, lat: 39.388, frp:  765, daynight: "N", progress: 0.37 },
  { id: 44, lng: -0.937, lat: 39.471, frp: 1456, daynight: "D", progress: 0.38 },
  { id: 45, lng: -0.956, lat: 39.483, frp: 1234, daynight: "D", progress: 0.39 },
  { id: 46, lng: -0.824, lat: 39.375, frp:  654, daynight: "D", progress: 0.41 },

  // ── Day 4 — Siete Aguas, NW corridor + southern front opens ───────────────
  { id: 47, lng: -0.921, lat: 39.492, frp:  876, daynight: "D", progress: 0.42 },
  { id: 48, lng: -0.968, lat: 39.501, frp: 1123, daynight: "D", progress: 0.42 },
  { id: 49, lng: -0.978, lat: 39.488, frp: 1345, daynight: "N", progress: 0.43 },
  { id: 50, lng: -0.998, lat: 39.503, frp: 1567, daynight: "N", progress: 0.44 },
  { id: 51, lng: -1.012, lat: 39.515, frp: 1234, daynight: "N", progress: 0.45 },
  { id: 52, lng: -0.987, lat: 39.521, frp: 1123, daynight: "N", progress: 0.46 },
  { id: 53, lng: -0.962, lat: 39.507, frp:  876, daynight: "D", progress: 0.47 },
  { id: 54, lng: -1.024, lat: 39.528, frp: 1456, daynight: "D", progress: 0.48 },
  { id: 55, lng: -1.038, lat: 39.518, frp: 1678, daynight: "D", progress: 0.49 },
  { id: 56, lng: -1.052, lat: 39.532, frp: 1345, daynight: "D", progress: 0.50 },
  { id: 57, lng: -0.947, lat: 39.498, frp:  765, daynight: "N", progress: 0.51 },
  { id: 58, lng: -1.063, lat: 39.544, frp: 1234, daynight: "N", progress: 0.51 },
  { id: 59, lng: -0.621, lat: 39.312, frp:  543, daynight: "D", progress: 0.52 }, // Southern front
  { id: 60, lng: -1.076, lat: 39.533, frp: 1567, daynight: "N", progress: 0.52 },
  { id: 61, lng: -1.088, lat: 39.547, frp: 1789, daynight: "N", progress: 0.53 },
  { id: 62, lng: -0.598, lat: 39.298, frp:  456, daynight: "D", progress: 0.54 },
  { id: 63, lng: -1.042, lat: 39.556, frp: 1234, daynight: "D", progress: 0.54 },

  // ── Day 5 — Requena, Utiel approach + eastern coastal plain ───────────────
  { id: 64, lng: -1.098, lat: 39.478, frp: 1456, daynight: "D", progress: 0.56 },
  { id: 65, lng: -1.112, lat: 39.491, frp: 1678, daynight: "D", progress: 0.57 },
  { id: 66, lng: -1.134, lat: 39.503, frp: 1234, daynight: "N", progress: 0.58 },
  { id: 67, lng: -1.087, lat: 39.512, frp: 1567, daynight: "N", progress: 0.59 },
  { id: 68, lng: -1.145, lat: 39.518, frp: 1789, daynight: "N", progress: 0.60 },
  { id: 69, lng: -0.574, lat: 39.281, frp:  432, daynight: "D", progress: 0.61 },
  { id: 70, lng: -1.158, lat: 39.527, frp: 1567, daynight: "N", progress: 0.61 },
  { id: 71, lng: -1.172, lat: 39.539, frp: 1345, daynight: "D", progress: 0.62 },
  { id: 72, lng: -1.187, lat: 39.551, frp: 1678, daynight: "D", progress: 0.63 },
  { id: 73, lng: -1.198, lat: 39.562, frp: 1456, daynight: "D", progress: 0.64 },
  { id: 74, lng: -0.658, lat: 39.341, frp:  567, daynight: "N", progress: 0.64 },
  { id: 75, lng: -1.212, lat: 39.574, frp: 1789, daynight: "N", progress: 0.65 },
  { id: 76, lng: -1.223, lat: 39.561, frp: 1567, daynight: "N", progress: 0.66 },
  { id: 77, lng: -1.178, lat: 39.548, frp: 1123, daynight: "N", progress: 0.67 },
  { id: 78, lng: -1.234, lat: 39.572, frp: 1456, daynight: "D", progress: 0.68 },

  // ── Day 6 — Wide coverage, Utiel plateau, high intensity ──────────────────
  { id: 79, lng: -1.246, lat: 39.583, frp: 1234, daynight: "D", progress: 0.70 },
  { id: 80, lng: -1.258, lat: 39.568, frp: 1567, daynight: "D", progress: 0.71 },
  { id: 81, lng: -1.271, lat: 39.579, frp: 1345, daynight: "N", progress: 0.72 },
  { id: 82, lng: -1.262, lat: 39.591, frp: 1678, daynight: "N", progress: 0.73 },
  { id: 83, lng: -0.687, lat: 39.422, frp:  345, daynight: "D", progress: 0.73 }, // NE flare-up
  { id: 84, lng: -1.245, lat: 39.602, frp: 1456, daynight: "N", progress: 0.74 },
  { id: 85, lng: -0.672, lat: 39.418, frp:  456, daynight: "D", progress: 0.75 },
  { id: 86, lng: -1.283, lat: 39.588, frp: 1234, daynight: "D", progress: 0.76 },
  { id: 87, lng: -1.274, lat: 39.601, frp: 1567, daynight: "D", progress: 0.77 },
  { id: 88, lng: -1.287, lat: 39.612, frp: 1345, daynight: "N", progress: 0.78 },
  { id: 89, lng: -1.298, lat: 39.597, frp: 1123, daynight: "N", progress: 0.79 },
  { id: 90, lng: -0.663, lat: 39.429, frp:  567, daynight: "N", progress: 0.80 },

  // ── Day 7 — Residual, declining hotspots ──────────────────────────────────
  { id:  91, lng: -1.289, lat: 39.588, frp:  876, daynight: "D", progress: 0.84 },
  { id:  92, lng: -1.276, lat: 39.576, frp:  654, daynight: "D", progress: 0.86 },
  { id:  93, lng: -1.263, lat: 39.565, frp:  543, daynight: "N", progress: 0.88 },
  { id:  94, lng: -1.248, lat: 39.582, frp:  432, daynight: "N", progress: 0.90 },
  { id:  95, lng: -0.748, lat: 39.434, frp:  234, daynight: "D", progress: 0.90 },
  { id:  96, lng: -1.234, lat: 39.571, frp:  345, daynight: "D", progress: 0.92 },
  { id:  97, lng: -1.218, lat: 39.558, frp:  289, daynight: "N", progress: 0.94 },
  { id:  98, lng: -1.197, lat: 39.543, frp:  234, daynight: "N", progress: 0.96 },
  { id:  99, lng: -0.764, lat: 39.448, frp:  123, daynight: "D", progress: 0.97 },
  { id: 100, lng: -1.178, lat: 39.531, frp:  189, daynight: "D", progress: 1.00 },
];

// ─────────────────────────────────────────────────────────────────────────────
// OPTIMIZED scenario: Fire detected at ignition, contained at ~4,200 ha.
// Only Chiva origin area — hotspots stop spreading after T+24h.
// ─────────────────────────────────────────────────────────────────────────────
export const FIRMS_OPTIMIZED: Hotspot[] = [
  // Initial ignition — same as actual (drones dispatched immediately)
  { id: 101, lng: -0.738, lat: 39.441, frp:  324, daynight: "D", progress: 0.00 },
  { id: 102, lng: -0.724, lat: 39.458, frp:  512, daynight: "D", progress: 0.01 },
  { id: 103, lng: -0.751, lat: 39.433, frp:  445, daynight: "D", progress: 0.02 },
  { id: 104, lng: -0.718, lat: 39.471, frp:  289, daynight: "D", progress: 0.03 },
  { id: 105, lng: -0.762, lat: 39.448, frp:  678, daynight: "D", progress: 0.04 },

  // Aerial suppression reduces intensity — night hotspots weaker than actual
  { id: 106, lng: -0.748, lat: 39.477, frp:  567, daynight: "N", progress: 0.08 },
  { id: 107, lng: -0.776, lat: 39.441, frp:  432, daynight: "N", progress: 0.10 },
  { id: 108, lng: -0.722, lat: 39.434, frp:  345, daynight: "N", progress: 0.12 },

  // Spreading slows — containment lines holding
  { id: 109, lng: -0.740, lat: 39.418, frp:  289, daynight: "D", progress: 0.15 },
  { id: 110, lng: -0.756, lat: 39.402, frp:  213, daynight: "D", progress: 0.18 },
  { id: 111, lng: -0.773, lat: 39.415, frp:  178, daynight: "N", progress: 0.20 },
  { id: 112, lng: -0.788, lat: 39.433, frp:  145, daynight: "N", progress: 0.22 },

  // Mop-up phase — scattered residual hotspots, declining intensity
  { id: 113, lng: -0.731, lat: 39.462, frp:   98, daynight: "D", progress: 0.26 },
  { id: 114, lng: -0.763, lat: 39.449, frp:   76, daynight: "D", progress: 0.30 },
  { id: 115, lng: -0.748, lat: 39.438, frp:   54, daynight: "N", progress: 0.35 },
  { id: 116, lng: -0.724, lat: 39.451, frp:   42, daynight: "D", progress: 0.40 },

  // Full containment — final residual detection
  { id: 117, lng: -0.739, lat: 39.445, frp:   23, daynight: "D", progress: 0.45 },
];

// ─────────────────────────────────────────────────────────────────────────────
// LOS ANGELES scenario: Palisades, Eaton & Hurst fires — Jan 7–28, 2025
// Palisades origin: Piedra Morada Dr, Pacific Palisades (~-118.522, 34.047)
// Eaton origin: Altadena/Eaton Canyon (~-118.131, 34.201)
// Hurst origin: Sylmar (~-118.407, 34.328)
// ─────────────────────────────────────────────────────────────────────────────
export const FIRMS_LA: Hotspot[] = [
  // ── Palisades Fire — Origin: Pacific Palisades, Jan 7 morning ──────────────
  { id: 201, lng: -118.522, lat: 34.047, frp:  456, daynight: "D", progress: 0.00 },
  { id: 202, lng: -118.534, lat: 34.052, frp:  678, daynight: "D", progress: 0.01 },
  { id: 203, lng: -118.510, lat: 34.041, frp:  543, daynight: "D", progress: 0.02 },
  { id: 204, lng: -118.546, lat: 34.058, frp:  789, daynight: "D", progress: 0.03 },
  { id: 205, lng: -118.498, lat: 34.035, frp:  345, daynight: "D", progress: 0.03 },

  // ── Palisades — Day 1 evening, rapid expansion (Santa Ana winds 80+ mph) ───
  { id: 206, lng: -118.558, lat: 34.063, frp: 1123, daynight: "N", progress: 0.07 },
  { id: 207, lng: -118.572, lat: 34.047, frp:  987, daynight: "N", progress: 0.08 },
  { id: 208, lng: -118.545, lat: 34.035, frp:  876, daynight: "N", progress: 0.09 },
  { id: 209, lng: -118.484, lat: 34.028, frp:  654, daynight: "N", progress: 0.10 },
  { id: 210, lng: -118.561, lat: 34.072, frp: 1345, daynight: "N", progress: 0.11 },

  // ── Palisades — Day 2, spreading into Topanga Canyon and Malibu ───────────
  { id: 211, lng: -118.587, lat: 34.054, frp: 1234, daynight: "D", progress: 0.14 },
  { id: 212, lng: -118.598, lat: 34.068, frp: 1456, daynight: "D", progress: 0.15 },
  { id: 213, lng: -118.614, lat: 34.041, frp: 1678, daynight: "D", progress: 0.16 },
  { id: 214, lng: -118.472, lat: 34.020, frp:  789, daynight: "D", progress: 0.17 },
  { id: 215, lng: -118.627, lat: 34.058, frp: 1789, daynight: "N", progress: 0.19 },
  { id: 216, lng: -118.641, lat: 34.045, frp: 1567, daynight: "N", progress: 0.20 },
  { id: 217, lng: -118.455, lat: 34.013, frp:  654, daynight: "N", progress: 0.21 },

  // ── Palisades — Day 3, Topanga Canyon + full Malibu front ─────────────────
  { id: 218, lng: -118.653, lat: 34.072, frp: 1345, daynight: "D", progress: 0.24 },
  { id: 219, lng: -118.668, lat: 34.059, frp: 1678, daynight: "D", progress: 0.25 },
  { id: 220, lng: -118.572, lat: 34.083, frp: 1123, daynight: "D", progress: 0.26 },
  { id: 221, lng: -118.681, lat: 34.046, frp: 1456, daynight: "N", progress: 0.28 },
  { id: 222, lng: -118.695, lat: 34.061, frp: 1789, daynight: "N", progress: 0.29 },
  { id: 223, lng: -118.441, lat: 34.007, frp:  543, daynight: "N", progress: 0.30 },

  // ── Palisades — Days 4–5, peak spread into Brentwood ─────────────────────
  { id: 224, lng: -118.708, lat: 34.053, frp: 1567, daynight: "D", progress: 0.35 },
  { id: 225, lng: -118.721, lat: 34.068, frp: 1234, daynight: "D", progress: 0.36 },
  { id: 226, lng: -118.558, lat: 34.091, frp: 1123, daynight: "D", progress: 0.37 },
  { id: 227, lng: -118.734, lat: 34.048, frp: 1789, daynight: "N", progress: 0.40 },
  { id: 228, lng: -118.427, lat: 34.002, frp:  432, daynight: "D", progress: 0.42 },
  { id: 229, lng: -118.746, lat: 34.063, frp: 1456, daynight: "N", progress: 0.44 },

  // ── Palisades — Days 6–9, residual/declining ──────────────────────────────
  { id: 230, lng: -118.758, lat: 34.052, frp: 1234, daynight: "D", progress: 0.50 },
  { id: 231, lng: -118.544, lat: 34.098, frp:  987, daynight: "N", progress: 0.55 },
  { id: 232, lng: -118.769, lat: 34.067, frp:  876, daynight: "D", progress: 0.62 },
  { id: 233, lng: -118.537, lat: 34.104, frp:  765, daynight: "N", progress: 0.68 },
  { id: 234, lng: -118.781, lat: 34.047, frp:  654, daynight: "D", progress: 0.74 },
  { id: 235, lng: -118.529, lat: 34.112, frp:  432, daynight: "N", progress: 0.82 },

  // ── Eaton Fire — Origin: Altadena/Eaton Canyon, Jan 7 afternoon ───────────
  { id: 236, lng: -118.131, lat: 34.201, frp:  567, daynight: "D", progress: 0.03 },
  { id: 237, lng: -118.119, lat: 34.212, frp:  789, daynight: "D", progress: 0.04 },
  { id: 238, lng: -118.143, lat: 34.194, frp:  654, daynight: "D", progress: 0.05 },
  { id: 239, lng: -118.107, lat: 34.221, frp:  432, daynight: "D", progress: 0.06 },

  // ── Eaton — Day 1 night ────────────────────────────────────────────────────
  { id: 240, lng: -118.098, lat: 34.232, frp: 1234, daynight: "N", progress: 0.09 },
  { id: 241, lng: -118.154, lat: 34.208, frp: 1123, daynight: "N", progress: 0.10 },
  { id: 242, lng: -118.087, lat: 34.243, frp:  987, daynight: "N", progress: 0.11 },
  { id: 243, lng: -118.121, lat: 34.186, frp:  876, daynight: "N", progress: 0.12 },

  // ── Eaton — Day 2–3, spreading into Sierra Madre + Pasadena foothills ─────
  { id: 244, lng: -118.076, lat: 34.254, frp: 1456, daynight: "D", progress: 0.16 },
  { id: 245, lng: -118.165, lat: 34.221, frp: 1234, daynight: "D", progress: 0.17 },
  { id: 246, lng: -118.063, lat: 34.265, frp: 1678, daynight: "D", progress: 0.18 },
  { id: 247, lng: -118.048, lat: 34.242, frp: 1345, daynight: "N", progress: 0.21 },
  { id: 248, lng: -118.178, lat: 34.214, frp: 1123, daynight: "N", progress: 0.22 },
  { id: 249, lng: -118.037, lat: 34.257, frp: 1567, daynight: "N", progress: 0.23 },

  // ── Eaton — Day 4–5, peak ─────────────────────────────────────────────────
  { id: 250, lng: -118.025, lat: 34.268, frp: 1789, daynight: "D", progress: 0.28 },
  { id: 251, lng: -118.189, lat: 34.228, frp: 1456, daynight: "D", progress: 0.30 },
  { id: 252, lng: -118.012, lat: 34.252, frp: 1678, daynight: "N", progress: 0.33 },
  { id: 253, lng: -118.198, lat: 34.202, frp: 1234, daynight: "D", progress: 0.36 },
  { id: 254, lng: -118.001, lat: 34.263, frp: 1567, daynight: "N", progress: 0.40 },

  // ── Eaton — Days 6–10, declining ─────────────────────────────────────────
  { id: 255, lng: -118.145, lat: 34.235, frp:  876, daynight: "D", progress: 0.48 },
  { id: 256, lng: -117.992, lat: 34.271, frp:  765, daynight: "N", progress: 0.55 },
  { id: 257, lng: -118.134, lat: 34.218, frp:  654, daynight: "D", progress: 0.62 },
  { id: 258, lng: -117.981, lat: 34.259, frp:  543, daynight: "N", progress: 0.70 },

  // ── Hurst Fire — Origin: Sylmar/San Fernando, Jan 7 evening ──────────────
  { id: 259, lng: -118.407, lat: 34.328, frp:  678, daynight: "N", progress: 0.08 },
  { id: 260, lng: -118.418, lat: 34.341, frp:  876, daynight: "N", progress: 0.10 },
  { id: 261, lng: -118.394, lat: 34.317, frp:  567, daynight: "N", progress: 0.11 },
  { id: 262, lng: -118.431, lat: 34.352, frp: 1123, daynight: "N", progress: 0.13 },
  { id: 263, lng: -118.384, lat: 34.334, frp:  789, daynight: "D", progress: 0.16 },
  { id: 264, lng: -118.443, lat: 34.345, frp:  654, daynight: "D", progress: 0.19 },
  { id: 265, lng: -118.421, lat: 34.361, frp:  543, daynight: "D", progress: 0.22 },
  { id: 266, lng: -118.408, lat: 34.348, frp:  432, daynight: "D", progress: 0.26 },
  { id: 267, lng: -118.396, lat: 34.339, frp:  321, daynight: "N", progress: 0.31 },
  { id: 268, lng: -118.412, lat: 34.332, frp:  213, daynight: "D", progress: 0.38 },

  // ── Sunset/Kenneth/other smaller fires ────────────────────────────────────
  { id: 269, lng: -118.342, lat: 34.108, frp:  456, daynight: "D", progress: 0.15 },
  { id: 270, lng: -118.327, lat: 34.098, frp:  567, daynight: "N", progress: 0.22 },
  { id: 271, lng: -118.354, lat: 34.117, frp:  345, daynight: "D", progress: 0.30 },
];
