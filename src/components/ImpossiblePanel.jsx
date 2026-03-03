// components/ImpossiblePanel.jsx — device sensors & "impossible" web features
import { useWakeLock, useBattery, useDeviceOrientation, useAmbientLight, vibrate } from "../hooks/useDeviceFeatures";
import { useEffect, useRef } from "react";

// ─── Compass SVG ─────────────────────────────────────────────────────────────
function Compass({ alpha, light }) {
  const heading = alpha ?? 0;
  const directions = ["N","NE","E","SE","S","SW","W","NW"];
  const dir = directions[Math.round(heading / 45) % 8];
  const acc = light ? "#3320c8" : "#c8bfff";
  const bg  = light ? "#f5f4f0" : "#0d0d1c";
  const dim = light ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.07)";

  return (
    <svg width={80} height={80} viewBox="0 0 80 80">
      <circle cx={40} cy={40} r={37} fill={bg} stroke={dim} strokeWidth={1.5}/>
      {/* tick marks */}
      {Array.from({length:12},(_,i)=>{
        const a = i*30*Math.PI/180;
        const r1 = i%3===0?28:32, r2=36;
        return <line key={i}
          x1={40+r1*Math.sin(a)} y1={40-r1*Math.cos(a)}
          x2={40+r2*Math.sin(a)} y2={40-r2*Math.cos(a)}
          stroke={dim} strokeWidth={i%3===0?1.5:0.8}
        />;
      })}
      {/* rotating needle */}
      <g transform={`rotate(${heading} 40 40)`}>
        <polygon points="40,10 43,40 40,46 37,40" fill={acc} opacity={0.9}/>
        <polygon points="40,70 43,40 40,46 37,40" fill={dim}/>
      </g>
      <circle cx={40} cy={40} r={3} fill={acc}/>
      <text x={40} y={7} textAnchor="middle" fontSize={7} fill={acc}
        fontFamily="'Outfit',sans-serif" fontWeight="500" letterSpacing="0.1em">N</text>
      {/* heading label */}
      {alpha !== null && (
        <text x={40} y={58} textAnchor="middle" fontSize={8} fill={acc}
          fontFamily="'Outfit',sans-serif" fontWeight="300">
          {heading}° {dir}
        </text>
      )}
    </svg>
  );
}

// ─── Tilt horizon ─────────────────────────────────────────────────────────────
function TiltHorizon({ beta, gamma, light }) {
  const b = beta  ?? 0;
  const g = gamma ?? 0;
  const acc = light ? "#3320c8" : "#c8bfff";
  const bg  = light ? "#f5f4f0" : "#0d0d1c";
  const dim = light ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.06)";

  // Map beta/gamma to ball position inside circle
  const bClamp = Math.max(-45, Math.min(45, b));
  const gClamp = Math.max(-45, Math.min(45, g));
  const ballX  = 40 + (gClamp / 45) * 28;
  const ballY  = 40 + (bClamp / 45) * 28;

  return (
    <svg width={80} height={80} viewBox="0 0 80 80">
      <circle cx={40} cy={40} r={37} fill={bg} stroke={dim} strokeWidth={1.5}/>
      <circle cx={40} cy={40} r={28} fill="none" stroke={dim} strokeWidth={0.8}/>
      {/* crosshair */}
      <line x1={12} y1={40} x2={68} y2={40} stroke={dim} strokeWidth={0.8}/>
      <line x1={40} y1={12} x2={40} y2={68} stroke={dim} strokeWidth={0.8}/>
      {/* centre dot */}
      <circle cx={40} cy={40} r={2} fill={dim}/>
      {/* ball */}
      <circle cx={ballX} cy={ballY} r={7}
        fill="none" stroke={acc} strokeWidth={1.5}
        style={{transition:"cx 0.15s,cy 0.15s"}}/>
      <circle cx={ballX} cy={ballY} r={2} fill={acc}
        style={{transition:"cx 0.15s,cy 0.15s"}}/>
      {/* labels */}
      <text x={40} y={9} textAnchor="middle" fontSize={7} fill={acc}
        fontFamily="'Outfit',sans-serif" fontWeight="300">{b > 0 ? "↑" : "↓"}</text>
    </svg>
  );
}

// ─── Battery arc ─────────────────────────────────────────────────────────────
function BatteryArc({ level, charging, light }) {
  const r    = 28, cx = 40, cy = 40;
  const circ = 2 * Math.PI * r;
  const pct  = (level ?? 0) / 100;
  const col  = level < 20 ? "#ff4444" : level < 50 ? "#ffaa00" : (light ? "#3320c8" : "#c8bfff");
  const acc  = light ? "#3320c8" : "#c8bfff";
  const bg   = light ? "#f5f4f0" : "#0d0d1c";
  const dim  = light ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.06)";

  return (
    <svg width={80} height={80} viewBox="0 0 80 80">
      <circle cx={cx} cy={cy} r={37} fill={bg} stroke={dim} strokeWidth={1.5}/>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={dim} strokeWidth={4}/>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={col} strokeWidth={4}
        strokeDasharray={`${pct * circ} ${circ}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${cx} ${cy})`}
        style={{transition:"stroke-dasharray 1s ease"}}
      />
      <text x={cx} y={cy+2} textAnchor="middle" fontSize={13} fill={acc}
        fontFamily="'Cormorant Garamond',serif" fontWeight="400">
        {level != null ? `${level}%` : "—"}
      </text>
      <text x={cx} y={cy+14} textAnchor="middle" fontSize={7} fill={col}
        fontFamily="'Outfit',sans-serif" fontWeight="300" letterSpacing="0.1em">
        {charging ? "CHARGING" : level != null ? "BATTERY" : "NO API"}
      </text>
    </svg>
  );
}

// ─── Lux meter ────────────────────────────────────────────────────────────────
function LuxBar({ lux, light }) {
  const acc = light ? "#3320c8" : "#c8bfff";
  const dim = light ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.06)";
  const label = lux === null ? "No sensor"
    : lux < 50   ? "Dark"
    : lux < 200  ? "Dim"
    : lux < 1000 ? "Indoor"
    : lux < 10000? "Bright"
    : "Sunlight";
  const pct = lux == null ? 0 : Math.min(100, Math.log10(Math.max(1, lux)) / 5 * 100);

  return (
    <div style={{display:"flex",flexDirection:"column",gap:6}}>
      <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:acc,fontFamily:"'Outfit',sans-serif",fontWeight:300}}>
        <span>Ambient Light</span>
        <span>{lux != null ? `${lux.toLocaleString()} lux` : "—"}</span>
      </div>
      <div style={{height:3,background:dim,borderRadius:2,overflow:"hidden"}}>
        <div style={{height:"100%",width:`${pct}%`,background:`linear-gradient(90deg,${dim},${acc})`,borderRadius:2,transition:"width 0.5s"}}/>
      </div>
      <div style={{fontSize:10,color:light?"rgba(0,0,0,0.35)":"rgba(255,255,255,0.25)",fontFamily:"'Outfit',sans-serif",letterSpacing:"0.08em"}}>{label}</div>
    </div>
  );
}

// ─── Main panel ──────────────────────────────────────────────────────────────
export default function ImpossiblePanel({ light, moon, onPhaseVibrate }) {
  const { active: wakeActive, support: wakeSupport, toggle: toggleWake } = useWakeLock();
  const battery = useBattery();
  const orient  = useDeviceOrientation();
  const lux     = useAmbientLight();

  // Vibrate on full/new moon when this panel is active
  const prevPhaseRef = useRef(null);
  useEffect(() => {
    const prev = prevPhaseRef.current;
    prevPhaseRef.current = moon.phase;
    if (prev === null) return;
    // Crossed into full moon
    if (prev < 0.5 && moon.phase >= 0.5) vibrate([100, 50, 100, 50, 300]);
    if (prev > 0.0 && moon.phase <= 0.03) vibrate([50, 50, 200]);
  }, [moon.phase]);

  const hasSomething = orient.support || battery || lux !== null || wakeSupport;

  return (
    <div className="panel">
      {/* Compass + tilt */}
      <div className="impossible">
        <div className="impossible-hed">Device Sensors — live from your hardware</div>

        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}}>
          {/* Compass */}
          <div className="imp-item">
            <div className="imp-lbl">Compass Heading</div>
            <div className="tilt-ring">
              <Compass alpha={orient.alpha} light={light}/>
            </div>
            <div className="imp-sub">
              {orient.support
                ? `${orient.alpha ?? "—"}° ${orient.alpha != null ? ["N","NE","E","SE","S","SW","W","NW"][Math.round(orient.alpha/45)%8] : ""}`
                : <span style={{opacity:0.5}}>Not available</span>}
            </div>
          </div>

          {/* Level / tilt */}
          <div className="imp-item">
            <div className="imp-lbl">Tilt Level</div>
            <div className="tilt-ring">
              <TiltHorizon beta={orient.beta} gamma={orient.gamma} light={light}/>
            </div>
            <div className="imp-sub">
              {orient.support
                ? `β${orient.beta ?? 0}° γ${orient.gamma ?? 0}°`
                : <span style={{opacity:0.5}}>Not available</span>}
            </div>
          </div>

          {/* Battery */}
          <div className="imp-item">
            <div className="imp-lbl">Device Battery</div>
            <div className="tilt-ring">
              <BatteryArc level={battery?.level} charging={battery?.charging} light={light}/>
            </div>
            <div className="imp-sub">
              {battery
                ? (battery.charging ? "⚡ Charging" : `~${battery.level}% remaining`)
                : <span style={{opacity:0.5}}>Battery API unavailable</span>}
            </div>
          </div>

          {/* Ambient light */}
          <div className="imp-item">
            <div className="imp-lbl">Ambient Light</div>
            <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:80}}>
              <div style={{width:"100%"}}>
                <LuxBar lux={lux} light={light}/>
                {lux !== null && (
                  <div style={{
                    marginTop:10, fontSize:28, textAlign:"center",
                    fontFamily:"'Cormorant Garamond',serif",
                    color: light ? "#111" : "#e2dfd8",
                  }}>
                    {lux.toLocaleString()}
                    <span style={{fontSize:13,marginLeft:4,opacity:0.5,fontFamily:"'Outfit',sans-serif",fontWeight:300}}>lux</span>
                  </div>
                )}
                {lux === null && (
                  <div style={{marginTop:10,fontSize:11,opacity:0.4,fontFamily:"'Outfit',sans-serif",textAlign:"center"}}>
                    Requires Generic Sensor API
                  </div>
                )}
              </div>
            </div>
            <div className="imp-sub" style={{opacity:0.5}}>devicelight / AmbientLightSensor</div>
          </div>
        </div>

        {/* Wake lock */}
        <div style={{borderTop:`1px solid var(--border)`,paddingTop:14,display:"flex",alignItems:"center",justifyContent:"space-between",gap:12}}>
          <div>
            <div className="imp-lbl">Screen Wake Lock</div>
            <div className="imp-sub" style={{marginTop:2}}>
              {wakeActive ? "Screen will stay on while viewing the moon" : "Let the OS manage screen sleep"}
            </div>
          </div>
          {wakeSupport ? (
            <button className={`wake-btn${wakeActive ? " active" : ""}`} onClick={toggleWake}>
              {wakeActive ? "🌕 Awake" : "💤 Sleep ok"}
            </button>
          ) : (
            <span style={{fontSize:11,opacity:0.4,fontFamily:"'Outfit',sans-serif"}}>Unsupported</span>
          )}
        </div>

        {/* Vibration note */}
        <div style={{marginTop:14,fontSize:11,color:"var(--t3)",fontFamily:"'Outfit',sans-serif",lineHeight:1.5}}>
          📳 Your device will vibrate when the moon crosses a Full or New Moon phase while this panel is open.
        </div>

        {!hasSomething && (
          <div style={{marginTop:12,fontSize:12,color:"var(--t2)",fontFamily:"'Outfit',sans-serif",lineHeight:1.6,opacity:0.7}}>
            These APIs require a mobile/physical device and HTTPS. On desktop, most sensors return null — but Wake Lock and Vibration should still work.
          </div>
        )}
      </div>
    </div>
  );
}
