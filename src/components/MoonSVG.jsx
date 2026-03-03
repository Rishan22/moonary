// components/MoonSVG.jsx — interactive moon illustration
import { useMoonDrag } from "../hooks";

/**
 * Builds the SVG path for the lit face of the moon at a given phase.
 * Returns an empty string for new moon (no lit face).
 */
function buildLitPath(phase, cx, cy, r) {
  const termRx = Math.abs(Math.cos(2 * Math.PI * phase)) * r;
  const top    = { x: cx, y: cy - r };
  const bot    = { x: cx, y: cy + r };

  if (phase < 0.005 || phase > 0.995) return "";
  if (phase <= 0.25)  return `M${top.x} ${top.y}A${r} ${r} 0 0 1 ${bot.x} ${bot.y}A${termRx} ${r} 0 0 0 ${top.x} ${top.y}Z`;
  if (phase <  0.5)   return `M${top.x} ${top.y}A${r} ${r} 0 0 1 ${bot.x} ${bot.y}A${termRx} ${r} 0 0 1 ${top.x} ${top.y}Z`;
  if (phase <  0.505) return `M${cx} ${cy}m${-r} 0a${r} ${r} 0 1 0 ${r * 2} 0a${r} ${r} 0 1 0 ${-r * 2} 0`;
  if (phase <= 0.75)  return `M${top.x} ${top.y}A${r} ${r} 0 0 0 ${bot.x} ${bot.y}A${termRx} ${r} 0 0 0 ${top.x} ${top.y}Z`;
  return                     `M${top.x} ${top.y}A${r} ${r} 0 0 0 ${bot.x} ${bot.y}A${termRx} ${r} 0 0 1 ${top.x} ${top.y}Z`;
}

export default function MoonSVG({ phase, size = 240, light, interactive, setDate }) {
  const cx      = size / 2;
  const cy      = size / 2;
  const r       = size * 0.42;
  const litPath = buildLitPath(phase, cx, cy, r);

  const { onMouseDown, onTouchStart } = useMoonDrag({
    phase, sy: 29.53058867, size, setDate, interactive,
  });

  const glowColor = light
    ? "rgba(160,150,120,0.22)"
    : "rgba(210,200,165,0.38)";

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{
        filter:       `drop-shadow(0 0 ${light ? 20 : 50}px ${glowColor})`,
        overflow:     "visible",
        cursor:       interactive ? "ew-resize" : "default",
      }}
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
    >
      <defs>
        <radialGradient id="gLit" cx="36%" cy="30%" r="70%">
          <stop offset="0%"   stopColor={light ? "#f5f2ea" : "#f2eeE4"} />
          <stop offset="55%"  stopColor={light ? "#dedad0" : "#e4e0d4"} />
          <stop offset="100%" stopColor={light ? "#b8b4a8" : "#c4c0b0"} />
        </radialGradient>
        <radialGradient id="gDark" cx="50%" cy="45%" r="62%">
          <stop offset="0%"   stopColor="#18182a" />
          <stop offset="100%" stopColor="#08080e" />
        </radialGradient>
        <radialGradient id="gLimb" cx="50%" cy="50%" r="50%">
          <stop offset="68%"  stopColor="rgba(0,0,0,0)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.28)" />
        </radialGradient>
        <clipPath id="cpMoon"><circle cx={cx} cy={cy} r={r} /></clipPath>
        <clipPath id="cpLit">
          {litPath
            ? <path d={litPath} />
            : <circle cx={-9999} cy={-9999} r={1} />}
        </clipPath>
      </defs>

      {/* 1. Full dark disc */}
      <circle cx={cx} cy={cy} r={r} fill="url(#gDark)" />

      {/* 2. Lit face + limb darkening */}
      {litPath && (
        <g clipPath="url(#cpMoon)">
          <path d={litPath} fill="url(#gLit)" />
          <circle cx={cx} cy={cy} r={r} fill="url(#gLimb)" clipPath="url(#cpLit)" />
        </g>
      )}

      {/* 3. Outer rim */}
      <circle
        cx={cx} cy={cy} r={r} fill="none"
        stroke={light ? "rgba(0,0,0,0.14)" : "rgba(255,255,255,0.09)"}
        strokeWidth="1"
      />

      {/* 4. Drag hint */}
      {interactive && (
        <text
          x={cx} y={cy + r + 20}
          textAnchor="middle" fontSize={10}
          fill={light ? "rgba(0,0,0,0.2)" : "rgba(255,255,255,0.18)"}
          fontFamily="'DM Sans',sans-serif"
          letterSpacing="0.12em"
        >
          drag to explore
        </text>
      )}
    </svg>
  );
}
