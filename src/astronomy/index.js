// ─────────────────────────────────────────────────────────────────────────────
// astronomy/index.js — pure astronomy calculations, zero React dependencies
// ─────────────────────────────────────────────────────────────────────────────

const DEG = Math.PI / 180;
const RAD = 180 / Math.PI;

/** Convert a JS Date to Julian Day Number */
export function toJulianDay(date) {
  return date.getTime() / 86400000 + 2440587.5;
}

/** Zero-padded HH:MM from fractional minutes since midnight */
function minutesToTime(totalMinutes) {
  const t = ((totalMinutes % 1440) + 1440) % 1440;
  const h = String(Math.floor(t / 60)).padStart(2, "0");
  const m = String(Math.floor(t % 60)).padStart(2, "0");
  return `${h}:${m}`;
}

// ─── Moon ────────────────────────────────────────────────────────────────────

const SYNODIC_MONTH = 29.53058867;

const PHASE_MAP = [
  [0,     0.033, "New Moon",        "Hidden in darkness between Earth and Sun."],
  [0.033, 0.25,  "Waxing Crescent", "A sliver of light grows on the right each night."],
  [0.25,  0.283, "First Quarter",   "Half lit — exactly one week past new moon."],
  [0.283, 0.5,   "Waxing Gibbous",  "Nearly full, swelling toward the apex."],
  [0.5,   0.533, "Full Moon",       "Earth between Sun and Moon — a perfect silver disc."],
  [0.533, 0.75,  "Waning Gibbous",  "The light retreats after the full moon peak."],
  [0.75,  0.783, "Last Quarter",    "Half lit, now on the left — three weeks in."],
  [0.783, 1,     "Waning Crescent", "A last sliver fades before the cycle begins again."],
];

function getPhaseName(phase) {
  if (phase < 0.033 || phase > 0.967) return PHASE_MAP[0];
  return PHASE_MAP.find(([lo, hi]) => phase >= lo && phase < hi) ?? PHASE_MAP[7];
}

/** Full moon data for a given date */
export function getMoonData(date) {
  const J = toJulianDay(date);

  const phase = ((((J - 2451549.5 - 0.7604) / SYNODIC_MONTH) % 1) + 1) % 1;
  const illum = 0.5 * (1 - Math.cos(2 * Math.PI * phase));
  const anomaly = ((J - 2451550.1) / 27.554551) % 1;
  const distKm = Math.round(384400 * (1 - 0.0549 * Math.cos(2 * Math.PI * anomaly)));
  const ageDays = +(phase * SYNODIC_MONTH).toFixed(1);

  const daysUntil = (target) =>
    +((phase < target ? target - phase : 1 + target - phase) * SYNODIC_MONTH).toFixed(1);

  const [, , phaseName, phaseDesc] = getPhaseName(phase);

  const tidalForce = Math.round(
    (Math.abs(Math.cos(2 * Math.PI * phase)) * 0.7 + 0.3) * (384400 / distKm) * 100
  );

  return {
    phase,
    illum,
    illumPct: Math.round(illum * 100),
    ageDays,
    distKm,
    phaseName,
    phaseDesc,
    J,
    sy: SYNODIC_MONTH,
    nextNew:   daysUntil(0),
    nextFirst: daysUntil(0.25),
    nextFull:  daysUntil(0.5),
    nextLast:  daysUntil(0.75),
    tidalForce,
  };
}

// ─── Sun ─────────────────────────────────────────────────────────────────────

function getSunPosition(J) {
  const n   = J - 2451545.0;
  const L   = (280.46 + 0.9856474 * n) % 360;
  const g   = ((357.528 + 0.9856003 * n) % 360) * DEG;
  const lam = (L + 1.915 * Math.sin(g) + 0.02 * Math.sin(2 * g)) * DEG;
  const eps = 23.439 * DEG;
  return {
    dec: Math.asin(Math.sin(eps) * Math.sin(lam)) * RAD,
    ra:  ((Math.atan2(Math.cos(eps) * Math.sin(lam), Math.cos(lam)) * RAD) + 360) % 360,
  };
}

/** Sunrise / sunset / solar noon for a given date and location */
export function getSunData(date, lat, lon) {
  const J   = toJulianDay(date);
  const sun = getSunPosition(J);
  const lR  = lat * DEG;
  const dR  = sun.dec * DEG;
  const cosH =
    (Math.cos(90.833 * DEG) - Math.sin(lR) * Math.sin(dR)) /
    (Math.cos(lR) * Math.cos(dR));

  if (cosH > 1) {
    return { sunrise: null, sunset: null, solarNoon: null, dayLength: 0, srMin: 0, ssMin: 0 };
  }
  if (cosH < -1) {
    return { sunrise: "00:00", sunset: "24:00", solarNoon: "12:00", dayLength: 1440, srMin: 0, ssMin: 1440 };
  }

  const H   = Math.acos(cosH) * RAD;
  const eqT = sun.ra - (280.46646 + 0.9856474 * (J - 2451545)) % 360;
  const noon = 720 - 4 * lon - eqT;
  const sr   = noon - H * 4;
  const ss   = noon + H * 4;

  return {
    sunrise:    minutesToTime(sr),
    sunset:     minutesToTime(ss),
    solarNoon:  minutesToTime(noon),
    dayLength:  Math.round(ss - sr),
    srMin:      sr,
    ssMin:      ss,
  };
}

// ─── Moon rise / set ──────────────────────────────────────────────────────────

/** Approximate moonrise / moonset for a given date and location */
export function getMoonTimes(date, lat, lon) {
  const J       = toJulianDay(date);
  const moonLon = (218.316 + 13.176396 * (J - 2451545)) % 360;
  const moonDec = Math.asin(Math.sin(5.145 * DEG) * Math.sin(moonLon * DEG)) * RAD;
  const lR      = lat * DEG;
  const dR      = moonDec * DEG;
  const cosH    =
    (Math.cos(90.567 * DEG) - Math.sin(lR) * Math.sin(dR)) /
    (Math.cos(lR) * Math.cos(dR));

  if (Math.abs(cosH) > 1) return { rise: null, set: null };

  const H    = Math.acos(cosH) * RAD;
  const base = 720 - 4 * lon + ((J - 2451545) * (-360 / 27.32158)) % 360 * 4;

  return {
    rise: minutesToTime(base - H * 4),
    set:  minutesToTime(base + H * 4),
  };
}

// ─── Calendar helpers ─────────────────────────────────────────────────────────

export function getDayOfYear(date) {
  return Math.floor((date - new Date(date.getFullYear(), 0, 0)) / 86400000);
}

export function getSeason(date, lat) {
  const d  = getDayOfYear(date);
  const nh = lat >= 0;
  if (d >= 79  && d < 172) return nh ? "Spring" : "Autumn";
  if (d >= 172 && d < 264) return nh ? "Summer" : "Winter";
  if (d >= 264 && d < 355) return nh ? "Autumn" : "Spring";
  return nh ? "Winter" : "Summer";
}

/** Pre-compute moon phase for every day of every month in a year */
export function getYearPhases(year) {
  return Array.from({ length: 12 }, (_, m) => {
    const daysInMonth = new Date(year, m + 1, 0).getDate();
    return {
      month: m,
      days: Array.from({ length: daysInMonth }, (_, i) =>
        getMoonData(new Date(year, m, i + 1, 12)).phase
      ),
    };
  });
}
