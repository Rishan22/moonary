// components/MiniMoon.jsx — tiny moon icon used in calendar and phase lists

function buildMiniPath(phase, cx, cy, r) {
  const tRx = Math.abs(Math.cos(2 * Math.PI * phase)) * r;
  const top  = { x: cx, y: cy - r };
  const bot  = { x: cx, y: cy + r };

  if (phase < 0.01 || phase > 0.99) return "";
  if (phase <= 0.25)  return `M${top.x} ${top.y}A${r} ${r} 0 0 1 ${bot.x} ${bot.y}A${tRx} ${r} 0 0 0 ${top.x} ${top.y}Z`;
  if (phase <  0.5)   return `M${top.x} ${top.y}A${r} ${r} 0 0 1 ${bot.x} ${bot.y}A${tRx} ${r} 0 0 1 ${top.x} ${top.y}Z`;
  if (phase <  0.51)  return `M${cx} ${cy}m${-r} 0a${r} ${r} 0 1 0 ${r * 2} 0a${r} ${r} 0 1 0 ${-r * 2} 0`;
  if (phase <= 0.75)  return `M${top.x} ${top.y}A${r} ${r} 0 0 0 ${bot.x} ${bot.y}A${tRx} ${r} 0 0 0 ${top.x} ${top.y}Z`;
  return                     `M${top.x} ${top.y}A${r} ${r} 0 0 0 ${bot.x} ${bot.y}A${tRx} ${r} 0 0 1 ${top.x} ${top.y}Z`;
}

export default function MiniMoon({ phase, size = 14, light }) {
  const cx   = size / 2;
  const cy   = size / 2;
  const r    = cx - 0.8;
  const path = buildMiniPath(phase, cx, cy, r);
  // Stable clip-path id scoped to the phase value
  const uid  = `mm${Math.round(phase * 2000)}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{ display: "inline-block", verticalAlign: "middle" }}
    >
      <defs>
        <clipPath id={uid}><circle cx={cx} cy={cy} r={r} /></clipPath>
      </defs>
      <circle cx={cx} cy={cy} r={r} fill="#0a0a14" />
      {path && (
        <path d={path} fill={light ? "#b8b4a8" : "#d4d0c4"} clipPath={`url(#${uid})`} />
      )}
    </svg>
  );
}
