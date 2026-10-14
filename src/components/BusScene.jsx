import './BusScene.css';

/**
 * Animated bus scene: city skyline, drifting clouds, a driving bus
 * with spinning wheels, headlight beam, exhaust puffs and a moving road.
 */
function BusScene() {
  return (
    <div className="bus-scene" aria-hidden="true">
      {/* Clouds */}
      <div className="bs-cloud c1">☁️</div>
      <div className="bs-cloud c2">☁️</div>
      <div className="bs-cloud c3">☁️</div>

      {/* City skyline (parallax) */}
      <div className="bs-skyline">
        {[...Array(18)].map((_, i) => (
          <div
            key={i}
            className="bs-building"
            style={{
              '--h': `${26 + ((i * 37) % 54)}px`,
              '--w': `${26 + ((i * 17) % 26)}px`,
            }}
          >
            <span className="bs-window w1" />
            <span className="bs-window w2" />
            <span className="bs-window w3" />
          </div>
        ))}
      </div>

      {/* Street lights */}
      <div className="bs-lights">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bs-lamp" style={{ '--d': `${i * 1.6}s` }}>
            <span className="bs-lamp-glow" />
          </div>
        ))}
      </div>

      {/* The Bus */}
      <div className="bs-bus-wrap">
        <div className="bs-bus">
          {/* Exhaust puffs */}
          <span className="bs-smoke s1" />
          <span className="bs-smoke s2" />
          <span className="bs-smoke s3" />

          {/* Headlight beam */}
          <span className="bs-beam" />

          <svg viewBox="0 0 300 130" className="bs-bus-svg">
            <defs>
              <linearGradient id="busBody" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00ffae" />
                <stop offset="100%" stopColor="#00c6ff" />
              </linearGradient>
              <linearGradient id="busGlass" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#dff9ff" />
                <stop offset="100%" stopColor="#8fd8ff" />
              </linearGradient>
            </defs>

            {/* Body */}
            <rect x="8" y="18" width="284" height="82" rx="16" fill="url(#busBody)" />
            {/* Roof strip */}
            <rect x="8" y="18" width="284" height="10" rx="5" fill="rgba(255,255,255,0.35)" />
            {/* Bottom skirt */}
            <rect x="8" y="88" width="284" height="12" rx="6" fill="rgba(0,0,0,0.25)" />

            {/* Windshield */}
            <path d="M292 34 h-30 a8 8 0 0 0 -8 8 v24 a8 8 0 0 0 8 8 h30 z" fill="url(#busGlass)" />

            {/* Windows */}
            {[0, 1, 2, 3, 4].map(i => (
              <rect key={i} x={24 + i * 44} y="34" width="34" height="30" rx="6" fill="url(#busGlass)" />
            ))}

            {/* Passengers */}
            <circle cx="41" cy="56" r="7" fill="#1a1245" />
            <circle cx="129" cy="56" r="7" fill="#1a1245" />
            <circle cx="217" cy="56" r="7" fill="#1a1245" />

            {/* Door */}
            <rect x="238" y="46" width="22" height="52" rx="4" fill="rgba(0,0,0,0.3)" />
            <line x1="249" y1="46" x2="249" y2="98" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />

            {/* Brand text */}
            <text x="105" y="84" fontSize="14" fontWeight="900" fill="#083344" fontFamily="Inter, sans-serif" textAnchor="middle">GoJourney</text>

            {/* Headlight / taillight */}
            <circle cx="288" cy="80" r="5" fill="#fff8ae" className="bs-headlight" />
            <rect x="8" y="74" width="6" height="12" rx="3" fill="#ff4757" />
          </svg>

          {/* Wheels */}
          <div className="bs-wheel wheel-front">
            <div className="bs-hub" />
          </div>
          <div className="bs-wheel wheel-back">
            <div className="bs-hub" />
          </div>
        </div>

        {/* Speed lines */}
        <div className="bs-speedlines">
          <span /><span /><span />
        </div>
      </div>

      {/* Road */}
      <div className="bs-road">
        <div className="bs-road-dashes" />
      </div>
    </div>
  );
}

export default BusScene;
