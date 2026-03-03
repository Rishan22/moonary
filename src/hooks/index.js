// ─────────────────────────────────────────────────────────────────────────────
// hooks/index.js — custom hooks, extracted from the monolith component
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback, useRef } from "react";
import { DEFAULT_LOCATION } from "../constants";

// ─── Live clock ──────────────────────────────────────────────────────────────

/** Returns a Date that updates every second. */
export function useClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

// ─── Geolocation ─────────────────────────────────────────────────────────────

/** Returns `{ loc, loading, geoLocate }` where `geoLocate` triggers the browser API. */
export function useLocation() {
  const [loc, setLoc]         = useState(DEFAULT_LOCATION);
  const [loading, setLoading] = useState(false);

  const geoLocate = useCallback(async () => {
    if (!navigator.geolocation) return;
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async ({ coords: { latitude: la, longitude: lo } }) => {
        try {
          const res  = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${la}&lon=${lo}&format=json`
          );
          const data = await res.json();
          const city =
            data.address?.city ||
            data.address?.town  ||
            data.address?.village ||
            "Here";
          setLoc({
            lat:  la,
            lon:  lo,
            name: `${city}, ${(data.address?.country_code ?? "").toUpperCase()}`,
          });
        } catch {
          setLoc({ lat: la, lon: lo, name: `${la.toFixed(2)}°, ${lo.toFixed(2)}°` });
        }
        setLoading(false);
      },
      () => setLoading(false)
    );
  }, []);

  return { loc, loading, geoLocate };
}

// ─── Moon drag ───────────────────────────────────────────────────────────────

/**
 * Returns mouse/touch handlers that let the user drag the moon illustration
 * to scrub through the lunar cycle.
 *
 * @param {number}   phase   Current phase (0–1)
 * @param {number}   sy      Synodic month length (days)
 * @param {number}   size    SVG diameter used to scale drag distance
 * @param {function} setDate React state setter for the selected date
 * @param {boolean}  interactive  Whether dragging is enabled
 */
export function useMoonDrag({ phase, sy, size, setDate, interactive }) {
  const dragRef = useRef(null);

  const applyDelta = useCallback((clientX) => {
    const dp = (clientX - dragRef.current.startX) / (size * 2.5);
    let delta = ((dragRef.current.startPhase + dp) % 1 + 1) % 1 - phase;
    if (delta > 0.5)  delta -= 1;
    if (delta < -0.5) delta += 1;
    const dd = Math.round(delta * sy);
    if (dd !== 0) {
      setDate((d) => {
        const nd = new Date(d);
        nd.setDate(nd.getDate() + dd);
        return nd;
      });
    }
  }, [phase, sy, size, setDate]);

  const onMouseDown = useCallback((e) => {
    if (!interactive) return;
    e.preventDefault();
    dragRef.current = { startX: e.clientX, startPhase: phase };
    const onMove = (ev) => applyDelta(ev.clientX);
    const onUp   = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup",   onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup",   onUp);
  }, [interactive, phase, applyDelta]);

  const onTouchStart = useCallback((e) => {
    if (!interactive) return;
    dragRef.current = { startX: e.touches[0].clientX, startPhase: phase };
    const onMove = (ev) => applyDelta(ev.touches[0].clientX);
    const onUp   = () => {
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend",  onUp);
    };
    window.addEventListener("touchmove", onMove, { passive: true });
    window.addEventListener("touchend",  onUp);
  }, [interactive, phase, applyDelta]);

  return { onMouseDown, onTouchStart };
}
