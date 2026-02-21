export const PREDICTIONS = [
  {
    id: 'STRK-009', zone: 'Zone C7',  coords: '36.20°N 118.40°W',
    prob: 91, risk: 'critical', etaMin: 18,
    humidity: 8,  wind: '24 kn NE', temp: 41,
    conf: 94, recommendation: 'DISPATCH', status: 'active',      updatedMin: 1,
  },
  {
    id: 'STRK-010', zone: 'Zone C9',  coords: '36.40°N 118.20°W',
    prob: 78, risk: 'high',     etaMin: 32,
    humidity: 9,  wind: '26 kn N',  temp: 40,
    conf: 91, recommendation: 'DISPATCH', status: 'active',      updatedMin: 2,
  },
  {
    id: 'STRK-007', zone: 'Zone D3',  coords: '35.80°N 119.10°W',
    prob: 67, risk: 'high',     etaMin: 41,
    humidity: 11, wind: '19 kn N',  temp: 38,
    conf: 88, recommendation: 'DISPATCH', status: 'dispatching', updatedMin: 3,
  },
  {
    id: 'STRK-004', zone: 'Zone F3',  coords: '37.30°N 118.90°W',
    prob: 54, risk: 'high',     etaMin: 59,
    humidity: 12, wind: '28 kn NE', temp: 39,
    conf: 82, recommendation: 'DISPATCH', status: 'active',      updatedMin: 4,
  },
  {
    id: 'WTHR-027', zone: 'Zone A',   coords: '36.50°N 117.90°W',
    prob: 48, risk: 'medium',   etaMin: 73,
    humidity: 14, wind: '12 kn NW', temp: 36,
    conf: 76, recommendation: 'MONITOR',  status: 'active',      updatedMin: 6,
  },
  {
    id: 'PRED-031', zone: 'Sector N', coords: '37.10°N 119.50°W',
    prob: 44, risk: 'medium',   etaMin: 105,
    humidity: 18, wind: '22 kn E',  temp: 34,
    conf: 71, recommendation: 'MONITOR',  status: 'active',      updatedMin: 8,
  },
  {
    id: 'PRED-029', zone: 'Zone K4',  coords: '37.50°N 119.80°W',
    prob: 44, risk: 'medium',   etaMin: 88,
    humidity: 16, wind: '20 kn NE', temp: 35,
    conf: 74, recommendation: 'MONITOR',  status: 'active',      updatedMin: 11,
  },
  {
    id: 'WTHR-026', zone: 'Zone G2',  coords: '36.80°N 120.10°W',
    prob: 31, risk: 'medium',   etaMin: 140,
    humidity: 20, wind: '16 kn N',  temp: 32,
    conf: 68, recommendation: 'MONITOR',  status: 'active',      updatedMin: 22,
  },
  {
    id: 'STRK-006', zone: 'Zone B2',  coords: '36.00°N 118.80°W',
    prob: 22, risk: 'low',      etaMin: 180,
    humidity: 24, wind: '15 kn SE', temp: 31,
    conf: 65, recommendation: 'STANDBY',  status: 'active',      updatedMin: 12,
  },
  {
    id: 'STRK-005', zone: 'Zone E1',  coords: '35.40°N 118.10°W',
    prob: 19, risk: 'low',      etaMin: 220,
    humidity: 28, wind: '10 kn S',  temp: 29,
    conf: 62, recommendation: 'STANDBY',  status: 'active',      updatedMin: 15,
  },
  {
    id: 'STRK-008', zone: 'Zone A',   coords: '36.50°N 117.90°W',
    prob: 0,  risk: 'low',      etaMin: 0,
    humidity: 21, wind: '11 kn NE', temp: 33,
    conf: 99, recommendation: 'NONE',     status: 'neutralized', updatedMin: 18,
  },
  {
    id: 'STRK-003', zone: 'Zone H1',  coords: '35.10°N 117.50°W',
    prob: 0,  risk: 'low',      etaMin: 0,
    humidity: 32, wind: '8 kn W',   temp: 28,
    conf: 99, recommendation: 'NONE',     status: 'neutralized', updatedMin: 45,
  },
];

// 24-hour probability forecasts for top active threats (h=0 is now)
function genForecast(current, peakH, peakVal, halflifeH) {
  return Array.from({ length: 25 }, (_, h) => {
    let v;
    if (h === 0) {
      v = current;
    } else if (h <= peakH) {
      v = current + (peakVal - current) * (h / peakH);
    } else {
      const decay = Math.exp(-(h - peakH) / halflifeH);
      v = peakVal * decay + 5;
    }
    return Math.round(Math.max(0, Math.min(100, v + (Math.random() - 0.5) * 4)));
  });
}

export const FORECAST_24H = Array.from({ length: 25 }, (_, h) => ({ h })).map((pt, h) => ({
  h,
  label: h === 0 ? 'NOW' : `+${h}h`,
  'STRK-009': genForecast(91, 1,  96, 2)[h],
  'STRK-010': genForecast(78, 2,  88, 3)[h],
  'STRK-007': genForecast(67, 3,  79, 4)[h],
  'STRK-004': genForecast(54, 4,  70, 5)[h],
}));

export const MODEL_STATS = {
  accuracy24h:    89.2,
  falsePositive:  4.1,
  totalPredictions: 847,
  lastTrained:    '06:00 UTC',
  dataPoints:     '2.4M',
  version:        'v3.7.1',
};
