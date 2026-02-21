import { useEffect, useRef } from 'react';

export default function ParallaxBackground() {
  const skyRef = useRef(null);
  const starsRef = useRef(null);
  const mountFarRef = useRef(null);
  const mountMidRef = useRef(null);
  const forestRef = useRef(null);
  const droneRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const h = window.innerHeight;
      const progress = Math.min(scrollY / h, 2); // Cap effect somewhat

      // 1. Sky/Stars: Rotate/Scale slightly
      if (skyRef.current) {
        skyRef.current.style.transform = `translateY(${scrollY * 0.5}px)`;
      }
      if (starsRef.current) {
        starsRef.current.style.transform = `translateY(${scrollY * 0.3}px) scale(${1 + progress * 0.1})`;
      }

      // 2. Far Mountains: Slow movement, slight zoom
      if (mountFarRef.current) {
        const y = scrollY * 0.15;
        const scale = 1 + progress * 0.1;
        mountFarRef.current.style.transform = `translate3d(0, ${y}px, 0) scale(${scale})`;
      }

      // 3. Mid Mountains: Medium movement, medium zoom
      if (mountMidRef.current) {
        const y = scrollY * 0.25;
        const scale = 1 + progress * 0.2;
        mountMidRef.current.style.transform = `translate3d(0, ${y}px, 0) scale(${scale})`;
      }

      // 4. Forest/Foreground: Fast movement, high zoom (creates the "entering" feeling)
      if (forestRef.current) {
        const y = scrollY * 0.4;
        const scale = 1 + progress * 0.4;
        forestRef.current.style.transform = `translate3d(0, ${y}px, 0) scale(${scale})`;
      }

      // 5. Drones: Independent flight path + parallax
      if (droneRef.current) {
        const y = scrollY * 0.6; // Moves fast
        const x = Math.sin(scrollY * 0.002) * 100; // Horizontal drift
        const scale = 1 + progress * 0.5; // Drones get closer
        droneRef.current.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${scale})`;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="parallax-container">
      {/* Layer 0: Sky Gradient */}
      <div ref={skyRef} className="parallax-layer sky-layer" />

      {/* Layer 1: Stars */}
      <div ref={starsRef} className="parallax-layer stars-layer" />

      {/* Layer 2: Far Mountains (Atmospheric) */}
      <div ref={mountFarRef} className="parallax-layer mount-far">
        <svg viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMax slice" className="layer-svg">
          <path fill="#0f172a" d="M0,400 C300,350 600,550 960,450 C1320,350 1620,500 1920,420 L1920,1080 L0,1080 Z" />
        </svg>
      </div>

      {/* Layer 3: Mid Mountains (Detailed) */}
      <div ref={mountMidRef} className="parallax-layer mount-mid">
        <svg viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMax slice" className="layer-svg">
          <path fill="#1e293b" d="M0,600 C200,550 500,750 800,650 C1100,550 1500,700 1920,620 L1920,1080 L0,1080 Z" />
          {/* Add some "tech" grid lines on the mountain */}
          <path fill="none" stroke="rgba(56, 189, 248, 0.1)" strokeWidth="1" d="M0,600 L1920,620 M200,550 L200,1080 M800,650 L800,1080" />
        </svg>
      </div>

      {/* Layer 4: Drones (Between Mid and Front) */}
      <div ref={droneRef} className="parallax-layer drone-layer">
        {/* Drone 1 */}
        <div className="drone-unit d1">
          <div className="drone-body" />
          <div className="drone-light" />
        </div>
        {/* Drone 2 */}
        <div className="drone-unit d2">
          <div className="drone-body" />
          <div className="drone-light" />
        </div>
      </div>

      {/* Layer 5: Forest/Foreground (Darkest, Silhouette) */}
      <div ref={forestRef} className="parallax-layer forest-front">
        <svg viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMax slice" className="layer-svg">
          {/* Jagged tree line */}
          <path fill="#020617" d="M0,850 L50,800 L100,850 L150,780 L200,850 L250,810 L300,850 L350,790 L400,850 L450,820 L500,850 L550,750 L600,850 L1920,850 L1920,1080 L0,1080 Z" />
        </svg>
      </div>

      {/* Overlay: Vignette & Scanlines (Fixed) */}
      <div className="parallax-overlay" />
    </div>
  );
}
