// utils/i18n.js — localisation helpers

/** Converts ASCII digits to Eastern Arabic numerals */
export function toArabicNumerals(str) {
  return String(str).replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[d]);
}

/** Returns a formatter function that optionally converts to Arabic numerals */
export function makeFormatter(arabic) {
  return (n) => arabic ? toArabicNumerals(n) : n;
}
