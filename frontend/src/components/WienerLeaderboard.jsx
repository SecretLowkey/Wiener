import React, { useEffect, useRef, useState } from 'react';

const CA = 'GvQH1VGGbrjeRSbsCreptYN4GUcZ9w7vMFJ5ic8ypump';
const TOTAL_SUPPLY = 1_000_000_000;
const BURNED_AMT = 166_000_000;
const BURNED_PCT = 16.6;
const STAKED_STATIC = 242_153_388.063511;
const MIN_STAKE = 50_000;
const TIME_CONSTANT = '30d';
const POOL_REWARDS_SOL = 6.682831;

const WIENER_IMG_URL =
  'https://customer-assets.emergentagent.com/job_6583b0ee-cbd3-4955-a597-92c9cfcc3e14/artifacts/8gh9cgds_image.png';

/* Site palette colors */
const COLOR_BURNED = '#c44d4d';
const COLOR_STAKED = '#d4a017';
const COLOR_CIRC = '#54B347';

/* ── helpers ─────────────────────────────────────────────── */
const fmt = (n, d = 0) => {
  if (n == null) return '—';
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(2) + 'B';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return Number(n).toLocaleString(undefined, { maximumFractionDigits: d });
};
const fmtFull = (n) =>
  Number(n).toLocaleString(undefined, { maximumFractionDigits: 6 });

/* ── AnimBar ─────────────────────────────────────────────── */
function AnimBar({ pct, maxPct = 100, color, delay = 0, h = 8 }) {
  const [w, setW] = useState(0);
  useEffect(() => {
    const t = setTimeout(
      () => setW(Math.min((pct / maxPct) * 100, 100)),
      delay
    );
    return () => clearTimeout(t);
  }, [pct, maxPct, delay]);
  return (
    <div
      className="lb-bar"
      style={{ height: h, borderRadius: h }}
    >
      <div
        className="lb-bar-fill"
        style={{
          width: `${w}%`,
          background: color,
          borderRadius: h,
        }}
      />
    </div>
  );
}

/* ── CountUp ─────────────────────────────────────────────── */
function CountUp({ to, dec = 2, suffix = '', ms = 1400 }) {
  const [v, setV] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    if (to == null) return;
    ref.current = null;
    const go = (ts) => {
      if (!ref.current) ref.current = ts;
      const p = Math.min((ts - ref.current) / ms, 1);
      const e = 1 - Math.pow(1 - p, 3);
      setV(to * e);
      if (p < 1) requestAnimationFrame(go);
    };
    requestAnimationFrame(go);
  }, [to, ms]);
  return (
    <span>
      {v.toFixed(dec)}
      {suffix}
    </span>
  );
}

/* ── Donut SVG ───────────────────────────────────────────── */
function Donut({ slices }) {
  const r = 68,
    cx = 90,
    cy = 90,
    sw = 22;
  const circ = 2 * Math.PI * r;
  let cum = 0;
  return (
    <svg viewBox="0 0 180 180" style={{ width: '100%', maxWidth: 200 }}>
      {slices.map((s, i) => {
        const len = circ * (s.pct / 100);
        const gap = circ - len;
        const rotate = (cum / 100) * 360 - 90;
        cum += s.pct;
        return (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={s.color}
            strokeWidth={sw}
            strokeDasharray={`${len} ${gap}`}
            transform={`rotate(${rotate} ${cx} ${cy})`}
          />
        );
      })}
      <circle cx={cx} cy={cy} r={r - sw / 2 - 3} fill="#fefefe" />
      <text
        x={cx}
        y={cy - 6}
        textAnchor="middle"
        fill="#2d2a26"
        fontSize="20"
        fontFamily="Caveat, cursive"
        fontWeight="700"
      >
        $wiener
      </text>
      <text
        x={cx}
        y={cy + 14}
        textAnchor="middle"
        fill="#7a7570"
        fontSize="9"
        fontFamily="'Patrick Hand', sans-serif"
      >
        1,000,000,000 supply
      </text>
    </svg>
  );
}

/* ════════════════════════════════════════════════════════════
   MAIN
═══════════════════════════════════════════════════════════ */
export default function WienerLeaderboard() {
  const [staked, setStaked] = useState(STAKED_STATIC);
  const [updated, setUpdated] = useState(null);

  /* try tibane API (best-effort; CORS may block) */
  async function loadStaking() {
    const URLS = [
      `https://api.tibane.net/staking/${CA}`,
      `https://www.tibane.net/api/staking/${CA}`,
      `https://tibane.net/api/pool/${CA}`,
    ];
    for (const url of URLS) {
      try {
        const r = await fetch(url, {
          headers: { Accept: 'application/json' },
        });
        if (!r.ok) continue;
        const d = await r.json();
        const amt = d.totalStaked ?? d.stakedAmount ?? d.total_staked;
        if (amt) {
          setStaked(Number(amt));
          setUpdated(new Date());
          return;
        }
      } catch {
        /* try next */
      }
    }
    setUpdated(new Date());
  }

  useEffect(() => {
    loadStaking();
    const id = setInterval(loadStaking, 30_000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* derived */
  const stakedPct = (staked / TOTAL_SUPPLY) * 100;
  const circAmt = TOTAL_SUPPLY - BURNED_AMT - staked;
  const circPct = (circAmt / TOTAL_SUPPLY) * 100;

  const donutSlices = [
    { pct: BURNED_PCT, color: COLOR_BURNED },
    { pct: stakedPct, color: COLOR_STAKED },
    { pct: circPct, color: COLOR_CIRC },
  ];

  return (
    <section id="leaderboard-section" className="lb-section">
      <div className="lb-inner">
        <div className="lb-header">
          <img
            src={WIENER_IMG_URL}
            alt="$wiener"
            className="lb-header-logo"
          />
          <h2 className="lb-title">tokenomics</h2>
          <p className="lb-subtitle">it's just a hotdog</p>

          {updated && (
            <div className="lb-live">
              <span className="lb-live-dot" />
              <span>live · {updated.toLocaleTimeString()}</span>
              <button
                onClick={loadStaking}
                className="lb-refresh"
                aria-label="refresh"
                title="refresh"
              >
                ↻
              </button>
            </div>
          )}
        </div>

        <div className="lb-tab-content">
          {/* donut + legend */}
          <div className="lb-card lb-donut-card">
            <div className="lb-donut-wrap">
              <Donut slices={donutSlices} />
            </div>
            <div className="lb-legend">
              {/* BURNED */}
              <div className="lb-legend-item">
                <div className="lb-legend-head">
                  <span style={{ color: COLOR_BURNED }}>burned forever</span>
                  <span style={{ color: COLOR_BURNED }}>{BURNED_PCT}%</span>
                </div>
                <AnimBar
                  pct={BURNED_PCT}
                  maxPct={100}
                  color={COLOR_BURNED}
                  delay={100}
                  h={7}
                />
                <div className="lb-legend-sub">
                  {fmtFull(BURNED_AMT)} tokens — gone forever, never coming back
                </div>
              </div>

              {/* STAKED */}
              <div className="lb-legend-item">
                <div className="lb-legend-head">
                  <span style={{ color: COLOR_STAKED }}>staked</span>
                  <span style={{ color: COLOR_STAKED }}>
                    <CountUp to={stakedPct} dec={2} suffix="%" />
                  </span>
                </div>
                <AnimBar
                  pct={stakedPct}
                  maxPct={100}
                  color={COLOR_STAKED}
                  delay={200}
                  h={7}
                />
                <div className="lb-legend-sub">
                  <CountUp to={staked} dec={6} /> tokens staked right now ·
                  changes freely
                </div>
              </div>

              {/* CIRCULATING */}
              <div className="lb-legend-item">
                <div className="lb-legend-head">
                  <span style={{ color: COLOR_CIRC }}>circulating</span>
                  <span style={{ color: COLOR_CIRC }}>
                    ~<CountUp to={circPct} dec={1} suffix="%" />
                  </span>
                </div>
                <AnimBar
                  pct={circPct}
                  maxPct={100}
                  color={COLOR_CIRC}
                  delay={300}
                  h={7}
                />
                <div className="lb-legend-sub">
                  ~{fmt(circAmt)} tokens in free circulation
                </div>
              </div>
            </div>
          </div>

          {/* staking pool card */}
          <div className="lb-card lb-staking-card">
            <div className="lb-staking-head">
              <span className="lb-section-label">staking pool</span>
              <a
                href={`https://www.tibane.net/staking/${CA}`}
                target="_blank"
                rel="noopener noreferrer"
                className="lb-link"
              >
                tibane.net ↗︎
              </a>
            </div>

            <div className="lb-staking-grid">
              {[
                {
                  label: 'total staked',
                  val: fmtFull(staked),
                  sub: `${stakedPct.toFixed(2)}% of supply`,
                  color: COLOR_STAKED,
                },
                {
                  label: 'pool rewards',
                  val: `${POOL_REWARDS_SOL} SOL`,
                  sub: 'distributed to stakers',
                  color: COLOR_CIRC,
                },
                {
                  label: 'time constant',
                  val: TIME_CONSTANT,
                  sub: 'staking lock period',
                  color: '#3a8d8a',
                },
                {
                  label: 'min. stake',
                  val: MIN_STAKE.toLocaleString(),
                  sub: '$wiener minimum',
                  color: COLOR_CIRC,
                },
              ].map(({ label, val, sub, color }) => (
                <div key={label} className="lb-staking-cell">
                  <div className="lb-staking-label">{label}</div>
                  <div className="lb-staking-val" style={{ color }}>
                    {val}
                  </div>
                  <div className="lb-staking-sub">{sub}</div>
                </div>
              ))}
            </div>

            <div className="lb-staking-bar">
              <AnimBar
                pct={stakedPct}
                maxPct={100}
                color={COLOR_STAKED}
                delay={400}
                h={6}
              />
              <span className="lb-staking-bar-label">
                {stakedPct.toFixed(1)}% staked
              </span>
            </div>

            <p className="lb-note">
              staking is dynamic — anyone can stake or unstake at any time.
              numbers update in real-time.{' '}
              <a
                href={`https://www.tibane.net/staking/${CA}/members`}
                target="_blank"
                rel="noopener noreferrer"
                className="lb-link-inline"
              >
                view all members ↗︎
              </a>
            </p>
          </div>

          {/* supply table */}
          <div className="lb-card lb-table-card">
            <div className="lb-table-head">supply breakdown</div>
            {[
              {
                label: 'total supply',
                val: '1,000,000,000',
                note: '$wiener — pump.fun standard',
                color: 'var(--text-dark)',
              },
              {
                label: 'burned forever',
                val: `${BURNED_PCT}% · ${fmt(BURNED_AMT)}`,
                note: 'permanent — removed from supply forever',
                color: COLOR_BURNED,
              },
              {
                label: 'staked (dynamic)',
                val: `${stakedPct.toFixed(2)}% · ${fmt(staked)}`,
                note: 'live · anyone can stake / unstake freely',
                color: COLOR_STAKED,
              },
              {
                label: 'circulating',
                val: `~${circPct.toFixed(1)}% · ${fmt(circAmt)}`,
                note: 'remaining freely tradeable supply',
                color: COLOR_CIRC,
              },
            ].map((row) => (
              <div key={row.label} className="lb-table-row">
                <div>
                  <div className="lb-table-label">{row.label}</div>
                  <div className="lb-table-note">{row.note}</div>
                </div>
                <div className="lb-table-val" style={{ color: row.color }}>
                  {row.val}
                </div>
              </div>
            ))}
          </div>

          <div className="lb-footer-links">
            {[
              [`https://www.tibane.net/staking/${CA}`, 'staking'],
              [`https://pump.fun/coin/${CA}`, 'pump.fun'],
              [`https://dexscreener.com/solana/${CA}`, 'dexscreener'],
              [`https://solscan.io/token/${CA}`, 'solscan'],
            ].map(([u, l], i) => (
              <span key={l}>
                {i > 0 && ' · '}
                <a href={u} target="_blank" rel="noopener noreferrer">
                  {l} ↗︎
                </a>
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
