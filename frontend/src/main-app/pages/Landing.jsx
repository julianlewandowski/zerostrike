import { useState } from 'react';
import EntranceOverlay from '../components/landing/EntranceOverlay';
import ParallaxBackground from '../components/landing/ParallaxBackground';
import '../styles/landing.css';

export default function Landing() {
  const [booting, setBooting] = useState(false);

  const handleEnter = () => setBooting(true);

  return (
    <>
      {booting && <EntranceOverlay />}

      <div className="landing-page">
        <ParallaxBackground />

        {/* ── Hero ──────────────────────────────────────────────── */}
        <section className="landing-hero">
          <div className="landing-eyebrow">CLASSIFIED // OPERATIONAL SYSTEM</div>

          <h1 className="landing-wordmark">ZEROSTRIKE</h1>

          <div className="landing-tagline">The Palantir for Wildfires</div>

          <p className="landing-desc">
            We prevent wildfires by stopping dry lightning strikes with a prediction model and agent orchestration layer that deploys autonomous cloud seeding drones.
          </p>

          <button className="landing-cta" onClick={handleEnter}>
            TRY THE DEMO
          </button>

          {/* Stats */}
          <div className="landing-stats">
            <div className="landing-stat">
              <span className="landing-stat-value">847</span>
              <span className="landing-stat-label">Storms Intercepted</span>
            </div>
            <div className="landing-stat">
              <span className="landing-stat-value">94.2%</span>
              <span className="landing-stat-label">Prediction Accuracy</span>
            </div>
            <div className="landing-stat">
              <span className="landing-stat-value">3.2M</span>
              <span className="landing-stat-label">Hectares Protected</span>
            </div>
            <div className="landing-stat green">
              <span className="landing-stat-value green">0</span>
              <span className="landing-stat-label">Uncontrolled Ignitions</span>
            </div>
          </div>
        </section>

        {/* ── How It Works ──────────────────────────────────────── */}
        <section className="landing-section">
          <div className="landing-section-label">HOW IT WORKS</div>

          <div className="landing-steps">
            <div className="landing-step">
              <div className="landing-step-num">01</div>
              <span className="landing-step-icon">⚡</span>
              <div className="landing-step-title">PREDICT</div>
              <p className="landing-step-desc">
                Advanced atmospheric sensors and neural climate models detect dry lightning
                conditions 6–18 hours before strike, cross-referenced against fuel
                moisture indices and historical ignition patterns.
              </p>
            </div>

            <div className="landing-step-connector" />

            <div className="landing-step">
              <div className="landing-step-num">02</div>
              <span className="landing-step-icon">🛸</span>
              <div className="landing-step-title">DISPATCH</div>
              <p className="landing-step-desc">
                Automated command protocols deploy cloud-seeding drone swarms to
                optimal pre-computed coordinates within 90 seconds of threat
                confirmation, maximizing coverage radius.
              </p>
            </div>

            <div className="landing-step-connector" />

            <div className="landing-step">
              <div className="landing-step-num">03</div>
              <span className="landing-step-icon">🌧</span>
              <div className="landing-step-title">NEUTRALIZE</div>
              <p className="landing-step-desc">
                Drones release silver iodide nucleation agents at precision altitudes,
                triggering controlled precipitation and eliminating lightning-induced
                fire risk across the threat zone.
              </p>
            </div>
          </div>
        </section>

        {/* ── Technology Metrics ────────────────────────────────── */}
        <section className="landing-section">
          <div className="landing-section-label">SYSTEM SPECIFICATIONS</div>

          <div className="landing-tech-grid">
            <div className="landing-tech-card">
              <div className="landing-tech-label">Prediction Horizon</div>
              <div className="landing-tech-value">6–18 hrs</div>
              <div className="landing-tech-desc">
                Neural climate model trained on 40 years of Mediterranean atmospheric data
                with real-time sensor ingestion.
              </div>
            </div>
            <div className="landing-tech-card">
              <div className="landing-tech-label">Drone Dispatch Latency</div>
              <div className="landing-tech-value">&lt; 90 sec</div>
              <div className="landing-tech-desc">
                Automated mission planning computes optimal coverage formation and
                waypoints in under 12 milliseconds.
              </div>
            </div>
            <div className="landing-tech-card">
              <div className="landing-tech-label">Coverage Radius</div>
              <div className="landing-tech-value">80 km²</div>
              <div className="landing-tech-desc">
                Each drone unit seeds a 80 km radius using proprietary atomization
                nozzles rated for altitudes up to 4,200 m.
              </div>
            </div>
            <div className="landing-tech-card">
              <div className="landing-tech-label">Operational Zone</div>
              <div className="landing-tech-value">EU-THETA</div>
              <div className="landing-tech-desc">
                Mediterranean basin coverage — Spain, France, Greece, Italy.
                Expanding to North Africa in Q3 2026.
              </div>
            </div>
            <div className="landing-tech-card">
              <div className="landing-tech-label">Fleet Availability</div>
              <div className="landing-tech-value">7 / 9</div>
              <div className="landing-tech-desc">
                Active units on standby or deployed. Hot-swap battery depots
                maintain 24/7 operational readiness.
              </div>
            </div>
            <div className="landing-tech-card">
              <div className="landing-tech-label">False Positive Rate</div>
              <div className="landing-tech-value">5.8%</div>
              <div className="landing-tech-desc">
                Ensemble model with Bayesian uncertainty quantification — each
                dispatch decision is logged and reviewed for continuous learning.
              </div>
            </div>
          </div>
        </section>

        {/* ── Final CTA ─────────────────────────────────────────── */}
        <section className="landing-final-cta">
          <div className="landing-section-label">OPERATIONAL STATUS: LIVE</div>
          <h2 className="landing-final-title">Ready for tactical command?</h2>
          <button className="landing-cta" onClick={handleEnter}>
            ACCESS DASHBOARD
          </button>
        </section>

        {/* ── Footer ────────────────────────────────────────────── */}
        <footer className="landing-footer">
          <span>ZEROSTRIKE // WILDFIRE TACTICAL COMMAND v1.0.0</span>
          <span>OP ZONE: EU-THETA // CLASSIFICATION: RESTRICTED</span>
        </footer>
      </div>
    </>
  );
}
