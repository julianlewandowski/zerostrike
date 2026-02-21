// Extended drone data with telemetry history for the Fleet screen.
// History arrays: 13 points, t=0 (2h ago) → t=120 (now), 10-min intervals.

function genBatterySeries(current, status) {
  const start = status === 'deployed'
    ? Math.min(100, current + 22)
    : status === 'warning'
      ? Math.min(100, current + 35)
      : Math.min(100, current + 1);

  const drain = (start - current) / 12;

  return Array.from({ length: 13 }, (_, i) => ({
    t: i * 10,
    v: Math.round(Math.min(100, Math.max(0,
      start - drain * i + (Math.random() - 0.5) * 1.8
    ))),
  }));
}

function genAltSeries(base, active) {
  return Array.from({ length: 13 }, (_, i) => ({
    t: i * 10,
    v: active ? Math.round(Math.max(30, base + (Math.random() - 0.5) * 80)) : 0,
  }));
}

function genSpeedSeries(base, active) {
  return Array.from({ length: 13 }, (_, i) => ({
    t: i * 10,
    v: active ? Math.round(Math.max(0, base + (Math.random() - 0.5) * 10)) : 0,
  }));
}

export const DRONES_DETAIL = [
  {
    id: 'ZS-01',
    lat: 36.20, lng: -118.40,
    status: 'deployed',
    battery: 78,
    mission: 'SEED-ZONE-A',
    altitude: 285,
    speed: 18,
    heading: 'NNE',
    payloadPct: 62,
    flightTime: '04:23:12',
    batteryHistory: genBatterySeries(78, 'deployed'),
    altHistory:     genAltSeries(285, true),
    speedHistory:   genSpeedSeries(18, true),
  },
  {
    id: 'ZS-02',
    lat: 35.80, lng: -119.10,
    status: 'deployed',
    battery: 65,
    mission: 'SEED-ZONE-B',
    altitude: 312,
    speed: 22,
    heading: 'NW',
    payloadPct: 45,
    flightTime: '05:11:38',
    batteryHistory: genBatterySeries(65, 'deployed'),
    altHistory:     genAltSeries(312, true),
    speedHistory:   genSpeedSeries(22, true),
  },
  {
    id: 'ZS-03',
    lat: 36.80, lng: -118.80,
    status: 'standby',
    battery: 100,
    mission: 'STANDBY',
    altitude: 0,
    speed: 0,
    heading: '---',
    payloadPct: 100,
    flightTime: '00:00:00',
    batteryHistory: genBatterySeries(100, 'standby'),
    altHistory:     genAltSeries(0, false),
    speedHistory:   genSpeedSeries(0, false),
  },
  {
    id: 'ZS-04',
    lat: 36.50, lng: -117.90,
    status: 'warning',
    battery: 22,
    mission: 'RTB — LOW BATT',
    altitude: 148,
    speed: 30,
    heading: 'SSW',
    payloadPct: 8,
    flightTime: '06:44:02',
    batteryHistory: genBatterySeries(22, 'warning'),
    altHistory:     genAltSeries(148, true),
    speedHistory:   genSpeedSeries(30, true),
  },
  {
    id: 'ZS-05',
    lat: 35.50, lng: -119.50,
    status: 'standby',
    battery: 95,
    mission: 'STANDBY',
    altitude: 0,
    speed: 0,
    heading: '---',
    payloadPct: 100,
    flightTime: '00:00:00',
    batteryHistory: genBatterySeries(95, 'standby'),
    altHistory:     genAltSeries(0, false),
    speedHistory:   genSpeedSeries(0, false),
  },
  {
    id: 'ZS-06',
    lat: 37.10, lng: -119.20,
    status: 'deployed',
    battery: 84,
    mission: 'PATROL-NORTH',
    altitude: 240,
    speed: 20,
    heading: 'N',
    payloadPct: 80,
    flightTime: '03:05:49',
    batteryHistory: genBatterySeries(84, 'deployed'),
    altHistory:     genAltSeries(240, true),
    speedHistory:   genSpeedSeries(20, true),
  },
  {
    id: 'ZS-07',
    lat: 35.20, lng: -118.00,
    status: 'standby',
    battery: 91,
    mission: 'STANDBY',
    altitude: 0,
    speed: 0,
    heading: '---',
    payloadPct: 100,
    flightTime: '00:00:00',
    batteryHistory: genBatterySeries(91, 'standby'),
    altHistory:     genAltSeries(0, false),
    speedHistory:   genSpeedSeries(0, false),
  },
];
