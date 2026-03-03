// components/widgets.jsx — small, self-contained UI widgets
import { useMemo } from "react";

// ─── Stars background ─────────────────────────────────────────────────────────

const STAR_POINTS = Array.from({ length: 55 }, (_, i) => ({
  x: (Math.sin(i * 2.399) * 0.5 + 0.5) * 100,
  y: (Math.cos(i * 2.399 + 1) * 0.5 + 0.5) * 100,
  r: 0.25 + (i % 4) * 0.18,
  o: 0.08 + (i % 6) * 0.07,
}));

export function Stars({ phase, light }) {
  if (light) return null;
  const dim = 1 - 0.5 * (1 - Math.cos(2 * Math.PI * phase)) * 0.75;
  return (
    <svg
      style={{ position: "fixed", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 0 }}
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid slice"
    >
      {STAR_POINTS.map((s, i) => (
        <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="white" opacity={s.o * dim} />
      ))}
    </svg>
  );
}

// ─── Cycle ring ───────────────────────────────────────────────────────────────

export function CycleRing({ phase, light }) {
  const sz   = 84;
  const cx   = 42;
  const cy   = 42;
  const r    = 31;
  const sw   = 5;
  const circ = 2 * Math.PI * r;
  const acc  = light ? "#5a4820" : "#c0b080";
  const bg   = light ? "rgba(0,0,0,0.09)" : "rgba(255,255,255,0.08)";
  const mx   = cx + r * Math.cos(phase * 2 * Math.PI - Math.PI / 2);
  const my   = cy + r * Math.sin(phase * 2 * Math.PI - Math.PI / 2);

  return (
    <svg width={sz} height={sz} viewBox={`0 0 ${sz} ${sz}`} style={{ flexShrink: 0 }}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={bg}  strokeWidth={sw} />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={acc} strokeWidth={sw}
        strokeDasharray={`${phase * circ} ${circ}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${cx} ${cy})`}
        style={{ transition: "stroke-dasharray 0.6s ease" }}
      />
      <circle cx={mx} cy={my} r={4} fill={acc} style={{ transition: "cx 0.6s ease, cy 0.6s ease" }} />
      <text x={cx} y={cy + 5} textAnchor="middle" fontSize={12} fontWeight="600"
        fill={acc} fontFamily="'Playfair Display',serif">
        {Math.round(phase * 100)}%
      </text>
    </svg>
  );
}

// ─── Tidal meter ──────────────────────────────────────────────────────────────

export function TideMeter({ force, light }) {
  const isSpring  = force > 85;
  const isModerate = force > 60;
  const label = isSpring ? "Spring Tides" : isModerate ? "Moderate" : "Neap Tides";
  const color = isSpring
    ? (light ? "#1a4a7a" : "#70aaee")
    : isModerate
    ? (light ? "#5a4820" : "#c0b080")
    : (light ? "#6a6050" : "#888070");

  return (
    <div style={{ width: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6, color: "var(--t2)" }}>
        <span>Tidal Influence</span>
        <span style={{ color, fontWeight: 600 }}>{label}</span>
      </div>
      <div style={{ height: 3, background: "var(--border)", borderRadius: 2, overflow: "hidden" }}>
        <div style={{
          height: "100%",
          width: `${Math.min(100, force)}%`,
          background: `linear-gradient(90deg, var(--acc2), ${color})`,
          borderRadius: 2,
          transition: "width 0.8s ease",
        }} />
      </div>
    </div>
  );
}
