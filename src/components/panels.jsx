// components/panels.jsx — one component per tab panel
import MiniMoon       from "./MiniMoon";
import { CycleRing, TideMeter } from "./widgets";
import { NEXT_PHASES, MONTHS, MONTHS_SHORT, WEEKDAYS_SHORT } from "../constants";
import { getMoonData } from "../astronomy";
import { useMemo }     from "react";

// ─── Shared: next-phases grid ─────────────────────────────────────────────────

function NextPhases({ moon, fmt, phaseDate, jumpTo, light }) {
  return (
    <div className="nxt">
      {NEXT_PHASES.map(({ phase, label, key }) => {
        const days = moon[key];
        return (
          <div className="ni" key={label} onClick={() => jumpTo(days)}>
            <div className="ni-ico"><MiniMoon phase={phase} size={22} light={light} /></div>
            <div className="ni-lbl">{label}</div>
            <div className="ni-days">in {fmt(days)}d</div>
            <div className="ni-date">{phaseDate(days)}</div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Tonight panel ────────────────────────────────────────────────────────────

export function TonightPanel({ moon, sun, mTimes, loc, fmt, phaseDate, jumpTo, light }) {
  const tonightText = useMemo(() => {
    const p      = moon.phase;
    const rising = mTimes.rise ? `rises at ${mTimes.rise}` : "stays below the horizon";
    if (p < 0.033 || p > 0.967) return "No moon tonight — a perfect canvas for stars. The darkest skies of the month.";
    if (p < 0.15)  return `A delicate crescent ${rising}, tracing the western sky after dusk before slipping away early.`;
    if (p < 0.45)  return `A growing half-moon ${rising}, casting soft silver light while stars still shine clearly above.`;
    if (p < 0.55)  return `The full moon ${rising} at dusk and reigns over the entire night — vivid, shadowcasting, luminous.`;
    if (p < 0.85)  return `A waning gibbous moon ${rising} in the late evening, bright enough to read by as the night deepens.`;
    return `A late crescent appears in the pre-dawn hours — only early risers will catch it low in the east.`;
  }, [moon.phase, mTimes.rise]);

  const tidalText = moon.tidalForce > 85
    ? "Strong spring tides — Sun and Moon pulling together."
    : moon.tidalForce > 60
    ? "Moderate tides as Moon and Sun pull at an angle."
    : "Neap tides — Moon and Sun at right angles, weaker pull.";

  return (
    <div className="panel">
      <div className="tonight">
        <div className="tonight-hed">Tonight's Sky · {loc.name}</div>
        <div className="tonight-main">{tonightText}</div>
        <div className="tgrid">
          <div className="tg"><div className="tg-lbl">Moonrise</div><div className="tg-val">{mTimes.rise || "—"}</div></div>
          <div className="tg"><div className="tg-lbl">Moonset</div><div className="tg-val">{mTimes.set  || "—"}</div></div>
          <div className="tg"><div className="tg-lbl">Sunrise</div><div className="tg-val">{sun.sunrise  || "—"}</div></div>
          <div className="tg"><div className="tg-lbl">Sunset</div><div className="tg-val">{sun.sunset   || "—"}</div></div>
        </div>
      </div>

      <div className="cyc">
        <CycleRing phase={moon.phase} light={light} />
        <div className="cyc-text">
          <TideMeter force={moon.tidalForce} light={light} />
          <span>{tidalText}</span>
        </div>
      </div>

      <div className="div" />
      <div className="sec-lbl">Coming Up — tap to jump</div>
      <NextPhases moon={moon} fmt={fmt} phaseDate={phaseDate} jumpTo={jumpTo} light={light} />
    </div>
  );
}

// ─── Lunar panel ──────────────────────────────────────────────────────────────

export function LunarPanel({ moon, mTimes, date, fmt, phaseDate, jumpTo, light, hijriEN, hijriAR }) {
  return (
    <div className="panel">
      <div className="cards">
        <div className="card">
          <div className="card-lbl">Date</div>
          <div className="card-val">{date.toLocaleDateString("en", { weekday: "long" })}</div>
          <div className="card-sub">{date.toLocaleDateString("en", { day: "numeric", month: "long", year: "numeric" })}</div>
        </div>
        <div className="card">
          <div className="card-lbl">Cycle</div>
          <div className="card-val">{fmt(Math.round(moon.phase * 100))}<span style={{ fontSize: 15 }}>%</span></div>
          <div className="card-sub">Day {moon.ageDays} of 29.5</div>
        </div>
        <div className="card full">
          <div className="card-lbl">Islamic / Hijri Calendar</div>
          <div className="card-val">{hijriEN}</div>
          <div className="hijri-ar">{hijriAR}</div>
        </div>
        <div className="card">
          <div className="card-lbl">Moonrise</div>
          <div className="card-val">{mTimes.rise || "—"}</div>
        </div>
        <div className="card">
          <div className="card-lbl">Moonset</div>
          <div className="card-val">{mTimes.set || "—"}</div>
        </div>
      </div>
      <div className="div" />
      <div className="sec-lbl">Next Phases — tap to jump</div>
      <NextPhases moon={moon} fmt={fmt} phaseDate={phaseDate} jumpTo={jumpTo} light={light} />
    </div>
  );
}

// ─── Solar panel ──────────────────────────────────────────────────────────────

export function SolarPanel({ sun, loc, date, season, solProg, isToday, getDayOfYear }) {
  const dlH = Math.floor((sun.dayLength || 0) / 60);
  const dlM = (sun.dayLength || 0) % 60;
  const doy = getDayOfYear(date);
  const daysInYear = date.getFullYear() % 4 === 0 ? 366 : 365;

  return (
    <div className="panel">
      <div className="sun-card">
        <div className="sun-lbl">Solar Day · {loc.name}</div>
        <div className="sun-times">
          <div className="stime"><div className="stime-lbl">Sunrise</div><div className="stime-val">{sun.sunrise    || "—"}</div></div>
          <div className="stime"><div className="stime-lbl">Solar Noon</div><div className="stime-val">{sun.solarNoon || "—"}</div></div>
          <div className="stime"><div className="stime-lbl">Sunset</div><div className="stime-val">{sun.sunset     || "—"}</div></div>
        </div>
        <div className="track">
          <div className="fill" style={{ width: `${solProg * 100}%` }}>
            {isToday && <div className="orb" />}
          </div>
        </div>
        <div className="daylen">Daylight: {dlH}h {dlM}m</div>
      </div>
      <div className="cards">
        <div className="card">
          <div className="card-lbl">Season</div>
          <div className="card-val">{season}</div>
          <div className="card-sub">{loc.lat >= 0 ? "Northern" : "Southern"} hemisphere</div>
        </div>
        <div className="card">
          <div className="card-lbl">Day of Year</div>
          <div className="card-val">{doy}</div>
          <div className="card-sub">of {daysInYear}</div>
        </div>
        <div className="card full">
          <div className="card-lbl">Location</div>
          <div className="card-val" style={{ fontSize: 17 }}>{loc.name}</div>
          <div className="card-sub">
            {loc.lat.toFixed(3)}° {loc.lat >= 0 ? "N" : "S"},{" "}
            {Math.abs(loc.lon).toFixed(3)}° {loc.lon >= 0 ? "E" : "W"}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Calendar panel ───────────────────────────────────────────────────────────

export function CalendarPanel({ date, setDate, today, light }) {
  const [calMonth, setCalMonth] = useMemo(() => {
    // This state lives inside the panel; we expose setters via callbacks below.
    // (Lifted state is passed from parent — see App.jsx)
    return [];
  }, []);
  // State is actually lifted — props provided by parent
  return null; // placeholder — see CalendarPanelStateful below
}

// The real calendar panel receives lifted state from App
export function CalendarPanelStateful({
  date, setDate, today, light,
  calMonth, calYear, setCalMonth, setCalYear,
}) {
  const firstDow = new Date(calYear, calMonth, 1).getDay();
  const calDays  = useMemo(() => {
    const n = new Date(calYear, calMonth + 1, 0).getDate();
    return Array.from({ length: n }, (_, i) => {
      const d = new Date(calYear, calMonth, i + 1, 12);
      return { day: i + 1, date: d, phase: getMoonData(d).phase };
    });
  }, [calYear, calMonth]);

  const prevMonth = () => calMonth === 0
    ? (setCalMonth(11), setCalYear((y) => y - 1))
    : setCalMonth((m) => m - 1);
  const nextMonth = () => calMonth === 11
    ? (setCalMonth(0), setCalYear((y) => y + 1))
    : setCalMonth((m) => m + 1);

  return (
    <div className="panel">
      <div className="cal-hdr">
        <button className="cal-nav" onClick={prevMonth}>‹</button>
        <div className="cal-title">{MONTHS[calMonth]} {calYear}</div>
        <button className="cal-nav" onClick={nextMonth}>›</button>
      </div>
      <div className="cal-dow">
        {WEEKDAYS_SHORT.map((d) => <div key={d} className="dow">{d}</div>)}
      </div>
      <div className="cal-grid">
        {Array(firstDow).fill(null).map((_, i) => <div key={`e${i}`} className="cell empty" />)}
        {calDays.map(({ day, date: d, phase: p }) => {
          const isTd  = d.toDateString() === today.toDateString();
          const isSel = d.toDateString() === date.toDateString();
          return (
            <div
              key={day}
              className={`cell${isTd ? " td" : ""}${isSel ? " sel" : ""}`}
              onClick={() => setDate(new Date(d))}
            >
              <span>{day}</span>
              <MiniMoon phase={p} size={12} light={light} />
            </div>
          );
        })}
      </div>
      <div className="div" />
      <div className="legend">
        {[[0, "New"], [0.25, "First Qtr"], [0.5, "Full"], [0.75, "Last Qtr"]].map(([ph, l]) => (
          <span key={l} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <MiniMoon phase={ph} size={12} light={light} /> {l}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Year panel ───────────────────────────────────────────────────────────────

import { getYearPhases } from "../astronomy";

function YearView({ year, today, onSelect, light }) {
  const months = useMemo(() => getYearPhases(year), [year]);

  return (
    <div style={{ display: "grid", gap: 10 }}>
      {months.map(({ month, days }) => (
        <div key={month} style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ fontSize: 12, color: "var(--t3)", width: 28, flexShrink: 0, letterSpacing: "0.06em" }}>
            {MONTHS_SHORT[month]}
          </div>
          <div style={{ display: "flex", gap: 3, flexWrap: "nowrap", alignItems: "center" }}>
            {days.map((phase, d) => {
              const date     = new Date(year, month, d + 1);
              const isToday  = date.toDateString() === today.toDateString();
              const illum    = 0.5 * (1 - Math.cos(2 * Math.PI * phase));
              const bg       = light
                ? `rgba(10,10,20,${0.06 + illum * 0.92})`
                : `rgba(255,255,255,${0.05 + illum * 0.90})`;
              return (
                <div
                  key={d}
                  onClick={() => onSelect(date)}
                  title={`${MONTHS_SHORT[month]} ${d + 1}`}
                  style={{
                    width: 10, height: 10, borderRadius: "50%",
                    background:   isToday ? "var(--acc)" : bg,
                    cursor:       "pointer",
                    flexShrink:   0,
                    outline:      isToday ? "2px solid var(--acc)" : "none",
                    outlineOffset: 1,
                    transition:   "background 0.15s",
                  }}
                />
              );
            })}
          </div>
        </div>
      ))}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8, fontSize: 12, color: "var(--t2)" }}>
        <span>New</span>
        <div style={{
          flex: 1, height: 3, borderRadius: 2,
          background: light
            ? "linear-gradient(90deg,rgba(10,10,20,0.06),rgba(10,10,20,0.98))"
            : "linear-gradient(90deg,rgba(255,255,255,0.05),rgba(255,255,255,0.95))",
        }} />
        <span>Full</span>
      </div>
    </div>
  );
}

export function YearPanel({ yrYear, setYrYear, today, setDate, setTab, light }) {
  return (
    <div className="panel">
      <div className="yr-hdr">
        <button className="cal-nav" onClick={() => setYrYear((y) => y - 1)}>‹</button>
        <div className="yr-title">{yrYear} — Lunar Year</div>
        <button className="cal-nav" onClick={() => setYrYear((y) => y + 1)}>›</button>
      </div>
      <div style={{ fontSize: 14, color: "var(--t2)", marginBottom: 16, lineHeight: 1.6 }}>
        Each dot is one day. Bright = full moon, dark = new moon. Tap any dot to explore.
      </div>
      <YearView
        year={yrYear}
        today={today}
        onSelect={(d) => { setDate(d); setTab("tonight"); }}
        light={light}
      />
    </div>
  );
}
