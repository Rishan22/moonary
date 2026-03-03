// ─────────────────────────────────────────────────────────────────────────────
// constants/index.js — app-wide constants
// ─────────────────────────────────────────────────────────────────────────────

export const DEFAULT_LOCATION = { lat: 40.7128, lon: -74.006, name: "New York, US" };

export const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

export const MONTHS_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export const WEEKDAYS_SHORT = ["Su","Mo","Tu","We","Th","Fr","Sa"];

export const TABS = [
  ["tonight",  "Tonight"],
  ["moon",     "Lunar"],
  ["solar",    "Solar"],
  ["calendar", "Calendar"],
  ["year",     "Year"],
  ["sensors",  "Sensors"],
];

export const NEXT_PHASES = [
  { phase: 0,    label: "New Moon",  key: "nextNew"   },
  { phase: 0.25, label: "First Qtr", key: "nextFirst" },
  { phase: 0.5,  label: "Full Moon", key: "nextFull"  },
  { phase: 0.75, label: "Last Qtr",  key: "nextLast"  },
];
