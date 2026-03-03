// hooks/useDeviceFeatures.js — "impossible" browser APIs
// DeviceOrientation, Wake Lock, Battery, Vibration, Ambient Light

import { useState, useEffect, useCallback, useRef } from "react";

// ─── Wake Lock ────────────────────────────────────────────────────────────────
export function useWakeLock() {
  const [active,  setActive]  = useState(false);
  const [support, setSupport] = useState(false);
  const lockRef = useRef(null);

  useEffect(() => {
    setSupport("wakeLock" in navigator);
    return () => { lockRef.current?.release().catch(() => {}); };
  }, []);

  const toggle = useCallback(async () => {
    if (lockRef.current) {
      await lockRef.current.release().catch(() => {});
      lockRef.current = null;
      setActive(false);
    } else {
      try {
        lockRef.current = await navigator.wakeLock.request("screen");
        lockRef.current.addEventListener("release", () => {
          lockRef.current = null;
          setActive(false);
        });
        setActive(true);
      } catch { /* permission denied */ }
    }
  }, []);

  return { active, support, toggle };
}

// ─── Battery ──────────────────────────────────────────────────────────────────
export function useBattery() {
  const [battery, setBattery] = useState(null);

  useEffect(() => {
    if (!("getBattery" in navigator)) return;
    let batt;
    const update = () => setBattery({
      level:     Math.round(batt.level * 100),
      charging:  batt.charging,
      chargingTime: batt.chargingTime,
      dischargingTime: batt.dischargingTime,
    });
    navigator.getBattery().then((b) => {
      batt = b;
      update();
      b.addEventListener("levelchange",     update);
      b.addEventListener("chargingchange",  update);
    }).catch(() => {});
    return () => {
      if (batt) {
        batt.removeEventListener("levelchange",    update);
        batt.removeEventListener("chargingchange", update);
      }
    };
  }, []);

  return battery;
}

// ─── Device Orientation ───────────────────────────────────────────────────────
export function useDeviceOrientation() {
  const [orient, setOrient] = useState({ alpha: null, beta: null, gamma: null, support: false });

  useEffect(() => {
    if (!("DeviceOrientationEvent" in window)) return;

    const handler = (e) => {
      if (e.alpha === null && e.beta === null) return; // not supported
      setOrient({
        alpha:   e.alpha  != null ? Math.round(e.alpha)  : null, // compass heading 0–360
        beta:    e.beta   != null ? Math.round(e.beta)   : null, // front-back tilt -180–180
        gamma:   e.gamma  != null ? Math.round(e.gamma)  : null, // left-right tilt -90–90
        support: true,
      });
    };

    // iOS 13+ requires permission
    if (typeof DeviceOrientationEvent.requestPermission === "function") {
      // Attempt silently; caller can call requestOrientationPermission if needed
    } else {
      window.addEventListener("deviceorientation", handler, true);
    }
    window.addEventListener("deviceorientation", handler, true);
    return () => window.removeEventListener("deviceorientation", handler, true);
  }, []);

  const requestPermission = useCallback(async () => {
    if (typeof DeviceOrientationEvent?.requestPermission === "function") {
      const perm = await DeviceOrientationEvent.requestPermission();
      return perm === "granted";
    }
    return true;
  }, []);

  return { ...orient, requestPermission };
}

// ─── Ambient Light ────────────────────────────────────────────────────────────
export function useAmbientLight() {
  const [lux, setLux] = useState(null);

  useEffect(() => {
    // Try AmbientLightSensor (Chrome with Generic Sensor API)
    if ("AmbientLightSensor" in window) {
      try {
        // eslint-disable-next-line no-undef
        const sensor = new AmbientLightSensor({ frequency: 1 });
        sensor.addEventListener("reading", () => setLux(Math.round(sensor.illuminance)));
        sensor.addEventListener("error", () => {});
        sensor.start();
        return () => sensor.stop();
      } catch {}
    }
    // Fallback: deprecated devicelight event (Firefox legacy)
    const handler = (e) => setLux(Math.round(e.value));
    window.addEventListener("devicelight", handler);
    return () => window.removeEventListener("devicelight", handler);
  }, []);

  return lux;
}

// ─── Vibration ────────────────────────────────────────────────────────────────
export function vibrate(pattern) {
  if ("vibrate" in navigator) {
    navigator.vibrate(pattern);
  }
}
