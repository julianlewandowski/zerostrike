import { useEffect, useRef } from 'react';

export default function ParallaxBackground() {
  const planetRef = useRef(null);
  const gridRef = useRef(null);
  const starsRef = useRef(null);
  const fogRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const height = window.innerHeight;
      const progress = scrollY / height; // 0 to 1+

      // Parallax calculations
      if (planetRef.current) {
        // Planet zooms in and moves down slightly
        const scale = 1 + progress * 0.8;
        const y = scrollY * 0.2;
        planetRef.current.style.transform = `translate3d(-50%, calc(-50% + ${y}px), 0) scale(${scale})`;
      }

      if (gridRef.current) {
        // Grid moves faster and tilts
        const y = scrollY * 0.5;
        const rotate = progress * 5; // Slight rotation
        gridRef.current.style.transform = `perspective(1000px) rotateX(60deg) translateY(${y}px) rotateZ(${rotate}deg)`;
      }

      if (starsRef.current) {
        // Stars move slowly
        const y = scrollY * 0.1;
        starsRef.current.style.transform = `translateY(${y}px)`;
      }

      if (fogRef.current) {
        // Fog moves and fades
        const y = scrollY * 0.3;
        const opacity = Math.max(0, 1 - progress * 1.5);
        fogRef.current.style.transform = `translateY(${y}px)`;
        fogRef.current.style.opacity = opacity;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="parallax-container">
      {/* Layer 0: Deep Space Background (Fixed) */}
      <div className="parallax-layer space-bg" />

      {/* Layer 1: Stars */}
      <div ref={starsRef} className="parallax-layer stars" />

      {/* Layer 2: Planet/Orb */}
      <div ref={planetRef} className="parallax-layer planet-wrap">
        <div className="planet-body" />
        <div className="planet-atmosphere" />
        <div className="planet-ring" />
      </div>

      {/* Layer 3: Tactical Grid */}
      <div className="parallax-layer grid-wrap">
        <div ref={gridRef} className="tactical-grid" />
      </div>

      {/* Layer 4: Fog/Atmosphere */}
      <div ref={fogRef} className="parallax-layer fog" />
      
      {/* Vignette Overlay */}
      <div className="parallax-layer vignette" />
    </div>
  );
}
