// App.jsx — orchestration only; no business logic, no inline CSS
import { useState, useMemo, useEffect } from "react";

import { getMoonData, getSunData, getMoonTimes, getSeason, getDayOfYear } from "./astronomy";
import { useClock, useLocation }    from "./hooks";
import { makeFormatter }            from "./utils/i18n";
import { TABS }                     from "./constants";

import ImpossiblePanel from "./components/ImpossiblePanel";
import MoonSVG from "./components/MoonSVG";
import { Stars } from "./components/widgets";
import {
  TonightPanel,
  LunarPanel,
  SolarPanel,
  CalendarPanelStateful,
  YearPanel,
} from "./components/panels";

import "./styles/global.css";
import "./styles/components.css";

export default function App() {
  // ── State ──────────────────────────────────────────────────────────────────
  const [date,     setDate]     = useState(() => new Date());
  const [light,    setLight]    = useState(false);
  const [arabic,   setArabic]   = useState(false);
  const [tab,      setTab]      = useState("tonight");
  const [calMonth, setCalMonth] = useState(() => new Date().getMonth());
  const [calYear,  setCalYear]  = useState(() => new Date().getFullYear());
  const [yrYear,   setYrYear]   = useState(() => new Date().getFullYear());

  const now    = useClock();
  const { loc, loading: geoLoading, geoLocate } = useLocation();

  // Apply theme class to <html> so body background transitions correctly
  useEffect(() => {
    document.documentElement.classList.toggle("light", light);
  }, [light]);

  // ── Derived astronomy data ─────────────────────────────────────────────────
  const moon   = useMemo(() => getMoonData(date),                 [date]);
  const sun    = useMemo(() => getSunData(date, loc.lat, loc.lon), [date, loc]);
  const mTimes = useMemo(() => getMoonTimes(date, loc.lat, loc.lon), [date, loc]);
  const season = getSeason(date, loc.lat);
  const today  = useMemo(() => new Date(), []);

  // ── Hijri dates ────────────────────────────────────────────────────────────
  const hijriEN = useMemo(
    () => new Intl.DateTimeFormat("en-u-ca-islamic",    { day: "numeric", month: "long",  year: "numeric" }).format(date),
    [date]
  );
  const hijriAR = useMemo(
    () => new Intl.DateTimeFormat("ar-SA-u-ca-islamic", { day: "numeric", month: "long",  year: "numeric" }).format(date),
    [date]
  );

  // ── Helpers ────────────────────────────────────────────────────────────────
  const fmt       = makeFormatter(arabic);
  const addDays   = (n) => setDate((d) => { const nd = new Date(d); nd.setDate(nd.getDate() + n); return nd; });
  const jumpTo    = (days) => addDays(Math.round(days));
  const phaseDate = (days) => {
    const d = new Date(date);
    d.setDate(d.getDate() + Math.round(days));
    return d.toLocaleDateString("en", { month: "short", day: "numeric" });
  };

  const isToday  = date.toDateString() === today.toDateString();
  const nowMin   = now.getHours() * 60 + now.getMinutes();
  const solProg  = isToday
    ? Math.max(0, Math.min(1, (nowMin - (sun.srMin || 360)) / ((sun.ssMin || 1080) - (sun.srMin || 360))))
    : 0;

  const clockStr = now.toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const dateStr  = now.toLocaleDateString("en",  { weekday: "long", month: "long", day: "numeric" });

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      <Stars phase={moon.phase} light={light} />
      <div className="app">
        {/* Header */}
        <header className="hdr">
          <div className="hdr-left">
            <div className="hdr-title">Moonary</div>
            <div className="hdr-clock">{clockStr} · {dateStr}</div>
          </div>
          <div className="hdr-btns">
            <button
              className={`ibtn${arabic ? " on" : ""}`}
              onClick={() => setArabic((v) => !v)}
              title="Arabic numerals"
            >ع</button>
            <button
              className="ibtn"
              onClick={() => setLight((v) => !v)}
              title="Toggle theme"
            >{light ? "☾" : "☀"}</button>
          </div>
        </header>

        {/* Location */}
        <div className="loc">
          <div className="loc-dot" />
          <span className="loc-name">{geoLoading ? "Detecting…" : loc.name}</span>
          <button className="loc-btn" onClick={geoLocate} disabled={geoLoading}>⊕ Locate</button>
        </div>

        {/* Date selector */}
        <div className="drow">
          <button className="dbtn" onClick={() => addDays(-1)}>‹</button>
          <input
            className="dinput"
            type="date"
            value={date.toISOString().split("T")[0]}
            onChange={(e) => {
              const d = new Date(e.target.value + "T12:00:00");
              if (!isNaN(d)) setDate(d);
            }}
          />
          <button className="dbtn" onClick={() => addDays(1)}>›</button>
          <button className="dbtn today-btn" onClick={() => setDate(new Date())}>Today</button>
        </div>

        {/* Moon illustration */}
        <section className="moon-sec">
          <div className="moon-fig">
            <MoonSVG
              phase={moon.phase}
              size={230}
              light={light}
              interactive
              setDate={setDate}
            />
            <div className="phase-pill">{moon.phaseName}</div>
          </div>
          <div className="moon-meta">
            <div className="phase-desc">{moon.phaseDesc}</div>
            <div className="stats3">
              <div className="stat">
                <div className="stat-lbl">Illuminated</div>
                <div className="stat-val">{fmt(moon.illumPct)}<span style={{ fontSize: 17 }}>%</span></div>
              </div>
              <div className="stat">
                <div className="stat-lbl">Age</div>
                <div className="stat-val">{fmt(moon.ageDays)}</div>
                <div className="stat-unit">days</div>
              </div>
              <div className="stat">
                <div className="stat-lbl">Distance</div>
                <div className="stat-val stat-dist">{moon.distKm.toLocaleString("en")}</div>
                <div className="stat-unit">km from Earth</div>
              </div>
            </div>
          </div>
        </section>

        {/* Tabs */}
        <nav className="tabs">
          {TABS.map(([id, lbl]) => (
            <button
              key={id}
              className={`tab${tab === id ? " on" : ""}`}
              onClick={() => setTab(id)}
            >{lbl}</button>
          ))}
        </nav>

        {/* Tab panels */}
        {tab === "tonight" && (
          <TonightPanel
            moon={moon} sun={sun} mTimes={mTimes} loc={loc}
            fmt={fmt} phaseDate={phaseDate} jumpTo={jumpTo} light={light}
          />
        )}
        {tab === "moon" && (
          <LunarPanel
            moon={moon} mTimes={mTimes} date={date}
            fmt={fmt} phaseDate={phaseDate} jumpTo={jumpTo} light={light}
            hijriEN={hijriEN} hijriAR={hijriAR}
          />
        )}
        {tab === "solar" && (
          <SolarPanel
            sun={sun} loc={loc} date={date} season={season}
            solProg={solProg} isToday={isToday} getDayOfYear={getDayOfYear}
          />
        )}
        {tab === "calendar" && (
          <CalendarPanelStateful
            date={date} setDate={setDate} today={today} light={light}
            calMonth={calMonth} calYear={calYear}
            setCalMonth={setCalMonth} setCalYear={setCalYear}
          />
        )}
        {tab === "year" && (
          <YearPanel
            yrYear={yrYear} setYrYear={setYrYear}
            today={today} setDate={setDate} setTab={setTab} light={light}
          />
        )}
        {tab === "sensors" && (
          <ImpossiblePanel light={light} moon={moon} />
        )}
      </div>
    </>
  );
}
