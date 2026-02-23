import { useState, useRef, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial, Stars } from '@react-three/drei';
import * as THREE from 'three';
import EntranceOverlay from '../components/landing/EntranceOverlay';
import '../styles/landing.css';

// ── Globe Component ──────────────────────────────────────────────────────────

// Simplified continent approximation using spherical distance
const isLand = (phi, theta) => {
  // Convert to lat/lon for easier definition
  // phi (0..PI) -> lat (90..-90)
  // theta (0..2PI) -> lon (-180..180)
  
  const lat = 90 - (phi * 180 / Math.PI);
  let lon = (theta * 180 / Math.PI) - 180;
  
  // Normalize lon to -180..180
  if (lon < -180) lon += 360;
  if (lon > 180) lon -= 360;

  // Define major landmasses as (lat, lon, radius_degrees)
  const landmasses = [
    // North America
    { lat: 65, lon: -150, r: 12 }, // Alaska
    { lat: 60, lon: -110, r: 18 }, // Canada West
    { lat: 55, lon: -80, r: 18 },  // Canada East
    { lat: 40, lon: -115, r: 12 }, // US West
    { lat: 38, lon: -90, r: 12 },  // US East
    { lat: 20, lon: -100, r: 10 }, // Mexico
    
    // South America
    { lat: 5, lon: -65, r: 14 },   // North
    { lat: -15, lon: -55, r: 14 }, // Brazil
    { lat: -40, lon: -65, r: 10 }, // South Tip
    
    // Europe
    { lat: 50, lon: 10, r: 10 },   // Central
    { lat: 60, lon: 20, r: 10 },   // Scandinavia/Baltic
    { lat: 42, lon: -5, r: 5 },    // Iberia
    
    // Africa
    { lat: 20, lon: 0, r: 12 },    // Sahara West
    { lat: 20, lon: 30, r: 12 },   // Sahara East
    { lat: 0, lon: 20, r: 15 },    // Central
    { lat: -20, lon: 20, r: 12 },  // South
    
    // Asia
    { lat: 60, lon: 80, r: 20 },   // Russia West
    { lat: 60, lon: 120, r: 20 },  // Russia East
    { lat: 35, lon: 100, r: 18 },  // China
    { lat: 25, lon: 80, r: 10 },   // India
    { lat: 30, lon: 50, r: 12 },   // Middle East
    { lat: 15, lon: 100, r: 8 },   // SE Asia
    
    // Oceania
    { lat: -25, lon: 135, r: 15 }, // Australia
    { lat: -40, lon: 175, r: 5 },  // NZ
    { lat: -5, lon: 115, r: 5 },   // Indonesia
    { lat: -5, lon: 145, r: 5 },   // Papua
    
    // Polar
    { lat: 75, lon: -40, r: 10 },  // Greenland
    { lat: -80, lon: 0, r: 25 },   // Antarctica
    { lat: -80, lon: 120, r: 25 }, // Antarctica
    { lat: -80, lon: -120, r: 25 }, // Antarctica
  ];

  // Check distance to any landmass center
  for (const land of landmasses) {
    // Great circle distance approximation (spherical law of cosines)
    // d = acos( sin(lat1)*sin(lat2) + cos(lat1)*cos(lat2)*cos(lon2-lon1) ) * R
    // We work in degrees, so convert to radians for math
    
    const rad = Math.PI / 180;
    const dLat = Math.abs(lat - land.lat);
    const dLon = Math.abs(lon - land.lon);
    
    // Simple Euclidean approximation for speed (good enough for this visual style)
    // Adjust longitude distance based on latitude (meridians converge)
    const dist = Math.sqrt(dLat * dLat + (dLon * Math.cos(lat * rad)) ** 2);
    
    // Add some noise/irregularity to the radius to make it look like a coastline
    // We can use a pseudo-random based on position to be deterministic
    const noise = (Math.sin(lat * 0.5) + Math.cos(lon * 0.5)) * 2;
    
    if (dist < land.r + noise) return true;
  }
  
  return false;
};

// ── Drone Swarm Component ──────────────────────────────────────────────────

const Drone = ({ curve, speed, offset, color }) => {
  const ref = useRef();
  const t = useRef(offset);

  useFrame((state, delta) => {
    // Advance position (slower)
    t.current = (t.current + delta * speed * 0.02) % 1;
    
    if (ref.current && curve) {
      const pos = curve.getPointAt(t.current);
      const tangent = curve.getTangentAt(t.current);
      
      ref.current.position.copy(pos);
      ref.current.lookAt(pos.clone().add(tangent));
    }
  });

  return (
    <group ref={ref}>
      {/* Drone Body */}
      <mesh rotation={[0, Math.PI / 2, 0]}>
        <coneGeometry args={[0.02, 0.08, 4]} />
        <meshBasicMaterial color={color} />
      </mesh>
      {/* Engine Glows */}
      <mesh position={[0.02, 0, 0.02]}>
        <sphereGeometry args={[0.005]} />
        <meshBasicMaterial color={color} transparent opacity={0.4} />
      </mesh>
      <mesh position={[-0.02, 0, 0.02]}>
        <sphereGeometry args={[0.005]} />
        <meshBasicMaterial color={color} transparent opacity={0.4} />
      </mesh>
    </group>
  );
};

const DroneSwarm = () => {
  const count = 50;
  
  const drones = useMemo(() => {
    return new Array(count).fill(0).map(() => {
      // Generate random spline curve across the screen, favoring the left
      const points = [];
      const numPoints = 12;
      
      // Define a bounding box for the flight paths
      // X: -8 (far left) to 4 (mid-right)
      // Y: -4 to 4
      // Z: -2 to 4
      
      for (let i = 0; i < numPoints; i++) {
        // Bias towards left side (-4 center)
        const x = (Math.random() - 0.5) * 12 - 2; 
        const y = (Math.random() - 0.5) * 7;
        const z = (Math.random() - 0.5) * 5;
        
        points.push(new THREE.Vector3(x, y, z));
      }
      // Close the loop
      points.push(points[0].clone());
      
      const curve = new THREE.CatmullRomCurve3(points);
      curve.closed = true;
      curve.tension = 0.5; // Smoother curves
      
      return {
        curve,
        speed: 0.2 + Math.random() * 0.4, // Slower speed
        offset: Math.random(),
        // Subtler colors: Slate, Dark Grey, Occasional Dim Cyan
        color: Math.random() > 0.8 ? "#38bdf8" : (Math.random() > 0.5 ? "#475569" : "#334155") 
      };
    });
  }, []);

  return (
    <group>
      {drones.map((d, i) => (
        <Drone key={i} {...d} />
      ))}
    </group>
  );
};

// ── Left Side Tactical Grid ──────────────────────────────────────────────────

const TacticalGrid = () => {
  const gridRef = useRef();
  
  // Generate random particles for "dust" or "data"
  const particles = useMemo(() => {
    const p = [];
    for(let i=0; i<150; i++) {
      p.push((Math.random() - 0.5) * 10); // x
      p.push((Math.random() - 0.5) * 5);  // y
      p.push((Math.random() - 0.5) * 5);  // z
    }
    return new Float32Array(p);
  }, []);
  
  useFrame((state) => {
    if (gridRef.current) {
      // Slow rotation for dynamic feel
      gridRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.1) * 0.05;
    }
  });

  return (
    <group position={[-3, -2, -2]} rotation={[Math.PI / 2.5, 0, 0]} ref={gridRef}>
      <gridHelper args={[20, 40, 0x1e293b, 0x1e293b]} position={[0, 0, 0]} />
      {/* Floating Particles/Dust on the left */}
      <Points positions={particles} stride={3}>
         <PointMaterial transparent color="#38bdf8" size={0.03} opacity={0.4} sizeAttenuation={true} />
      </Points>
    </group>
  );
};

const Globe = ({ isMobile }) => {
  const groupRef = useRef();
  const meshRef = useRef();
  
  // Voxel Globe Settings
  const radius = 2;
  const resolution = 80; // Higher resolution for better shape definition
  
  // Generate voxel positions
  const { positions, colors } = useMemo(() => {
    const pos = [];
    const col = [];
    const colorLand = new THREE.Color("#10b981"); // Emerald green land
    const colorOcean = new THREE.Color("#1e3a8a"); // Deep blue ocean
    
    // Iterate through a spherical grid
    for (let i = 0; i < resolution; i++) {
      const phi = Math.acos(-1 + (2 * i) / resolution);
      const latCircumference = 2 * Math.PI * Math.sin(phi);
      const thetaCount = Math.floor(latCircumference * resolution / Math.PI);
      
      for (let j = 0; j < thetaCount; j++) {
        const theta = (2 * Math.PI * j) / thetaCount;
        
        // Check if land
        const land = isLand(phi, theta);
        
        // Position (Y-up coordinate system)
        // x = r * sin(phi) * sin(theta)
        // y = r * cos(phi)
        // z = r * sin(phi) * cos(theta)
        const x = radius * Math.sin(phi) * Math.sin(theta);
        const y = radius * Math.cos(phi);
        const z = radius * Math.sin(phi) * Math.cos(theta);
        
        pos.push(x, y, z);
        
        // Color
        if (land) {
          col.push(colorLand.r, colorLand.g, colorLand.b);
        } else {
          // Ocean: Sparse and dark
          if (Math.random() > 0.85) { 
             col.push(colorOcean.r, colorOcean.g, colorOcean.b);
          } else {
             // Skip most ocean points
             pos.pop(); pos.pop(); pos.pop();
          }
        }
      }
    }
    return { positions: new Float32Array(pos), colors: new Float32Array(col) };
  }, []);

  // Set up instanced mesh
  useEffect(() => {
    if (!meshRef.current) return;
    
    const tempObject = new THREE.Object3D();
    const count = positions.length / 3;
    
    for (let i = 0; i < count; i++) {
      const x = positions[i * 3];
      const y = positions[i * 3 + 1];
      const z = positions[i * 3 + 2];
      
      tempObject.position.set(x, y, z);
      tempObject.lookAt(0, 0, 0);
      
      // Determine if land based on color (simple check)
      const isLandPoint = colors[i * 3] > 0.1; 
      
      // Scale cubes
      const scale = isLandPoint ? 0.05 : 0.02;
      // Extrude land slightly outward
      const extrusion = isLandPoint ? 1.5 : 0.5;
      
      tempObject.scale.set(scale, scale, scale * extrusion);
      
      tempObject.updateMatrix();
      meshRef.current.setMatrixAt(i, tempObject.matrix);
      meshRef.current.setColorAt(i, new THREE.Color(colors[i * 3], colors[i * 3 + 1], colors[i * 3 + 2]));
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
    meshRef.current.instanceColor.needsUpdate = true;
  }, [positions, colors]);

  // Generate fire positions (Red/Orange Voxels)
  const firePositions = useMemo(() => {
    const points = [];
    const count = 50; 
    const r = radius + 0.1; 
    
    // Hotspots (lat, lon)
    const hotspots = [
      { lat: 0, lon: 20 },   // Africa
      { lat: -10, lon: -60 }, // S. America
      { lat: -25, lon: 135 }, // Australia
      { lat: 40, lon: -120 }, // California
      { lat: 40, lon: 20 },   // Mediterranean
    ];

    for (let i = 0; i < count; i++) {
      const center = hotspots[Math.floor(Math.random() * hotspots.length)];
      
      // Random spread
      const lat = center.lat + (Math.random() - 0.5) * 30;
      const lon = center.lon + (Math.random() - 0.5) * 30;
      
      // Convert back to spherical for positioning
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lon + 180) * (Math.PI / 180);
      
      // Only place if near land
      if (isLand(phi, theta)) {
        const x = r * Math.sin(phi) * Math.sin(theta);
        const y = r * Math.cos(phi);
        const z = r * Math.sin(phi) * Math.cos(theta);
        points.push(x, y, z);
      }
    }
    return new Float32Array(points);
  }, []);

  useFrame((state, delta) => {
    if (groupRef.current) {
      // Rotate around Y axis (Polar axis)
      groupRef.current.rotation.y += delta * 0.05;
      
      // Scroll interaction
      const scrollY = window.scrollY;
      const t = scrollY * 0.0015;
      
      // Move globe
      let targetX, targetY, targetZ;

      if (isMobile) {
        // Mobile: Center and move up
        targetX = 0;
        targetY = 1.2; 
        targetZ = -1;
      } else {
        // Desktop: Right side
        targetX = 2.5 + Math.sin(t) * 0.5;
        targetY = Math.cos(t * 0.7) * 0.2;
        targetZ = -Math.sin(t * 0.5) * 0.3; 
      }
      
      const scale = 1 + Math.sin(state.clock.elapsedTime * 0.5) * 0.02;
      
      groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, targetX, 0.05);
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetY, 0.05);
      groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, targetZ, 0.05);
      
      groupRef.current.scale.set(scale, scale, scale);
    }
  });

  return (
    <group ref={groupRef} position={[2.5, 0, 0]} rotation={[0, 0, 0.2]}> {/* Slight tilt */}
      {/* Voxel Globe */}
      <instancedMesh ref={meshRef} args={[null, null, positions.length / 3]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>
      
      {/* Inner dark sphere */}
      <mesh>
        <sphereGeometry args={[1.9, 32, 32]} />
        <meshBasicMaterial color="#020408" />
      </mesh>

      {/* Burning Fires */}
      <Points positions={firePositions} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color="#ff3300"
          size={0.12}
          sizeAttenuation={true}
          depthWrite={false}
          opacity={0.9}
          blending={THREE.AdditiveBlending}
        />
      </Points>
    </group>
  );
};

// ── Main Landing Component ───────────────────────────────────────────────────

import TheProblem from '../components/landing/TheProblem';
import TheSolution from '../components/landing/TheSolution';
import HowItWorks from '../components/landing/HowItWorks';
import HowWeBuiltIt from '../components/landing/HowWeBuiltIt';
import AboutUs from '../components/landing/AboutUs';

export default function Landing() {
  const [booting, setBooting] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    // Enable window scrolling for the landing page
    document.body.style.overflowY = 'auto';
    document.body.style.overflowX = 'hidden';
    document.documentElement.style.overflowY = 'auto';
    document.documentElement.style.overflowX = 'hidden';
    
    const root = document.getElementById('root');
    if (root) {
      root.style.overflowY = 'auto';
      root.style.overflowX = 'hidden';
      root.style.height = 'auto';
    }

    return () => {
      // Restore app-like behavior (no window scroll)
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      if (root) {
        root.style.overflow = 'hidden';
        root.style.height = '100%';
      }
    };
  }, []);

  const handleEnter = () => setBooting(true);

  return (
    <>
      {booting && <EntranceOverlay />}

      <div className="landing-page">
        {/* 3D Background */}
        <div className="globe-background" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100vh',
          zIndex: -1,
          background: 'radial-gradient(circle at center, #0a1118 0%, #000000 100%)',
          pointerEvents: 'none'
        }}>
          <Canvas camera={{ position: [0, 0, 5.5], fov: 45 }}>
            <ambientLight intensity={0.5} />
            <Globe isMobile={isMobile} />
            <DroneSwarm />
            {!isMobile && <TacticalGrid />}
            <Stars radius={100} depth={50} count={2000} factor={4} saturation={0} fade speed={0.5} />
          </Canvas>
        </div>

        {/* ── Hero ──────────────────────────────────────────────── */}
        <section className="landing-hero">
          <div className="landing-hero-content">
            <div className="landing-eyebrow">stopping lightning to prevent dangerous forest fires</div>

            <h1 className="landing-wordmark">ZEROSTRIKE</h1>

            <div className="landing-tagline">Palantir for wildfires</div>

            <p className="landing-desc">
              we prevent wildfires by stopping dry lightning strikes with a prediction model and agent orchestration layer that deploys autonomous cloud seeding drones.
            </p>

            <div className="landing-cta-row">
              <a 
                href="https://www.youtube.com/watch?v=CCgxti4Cq6c" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="landing-cta"
                style={{ textDecoration: 'none', display: 'inline-block', textAlign: 'center' }}
              >
                WATCH THE DEMO
              </a>
              <a 
                href="https://devpost.com/software/zerostrike" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="landing-cta-secondary"
                style={{ textDecoration: 'none', display: 'inline-block', textAlign: 'center' }}
              >
                VIEW DEVPOST
              </a>
            </div>
          </div>

          {/* Stats 
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
          */}
        </section>

        {/* ── Demo Video ────────────────────────────────────────── */}
        <section className="landing-video-section">
          <h2 className="landing-video-subheading">see what we've built :)</h2>
          <div className="video-container">
            <iframe 
              width="100%" 
              height="100%" 
              src="https://www.youtube.com/embed/CCgxti4Cq6c" 
              title="ZeroStrike Demo" 
              frameBorder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
              allowFullScreen
            ></iframe>
          </div>
        </section>

        {/* ── New Sections ──────────────────────────────────────── */}
        <TheProblem />
        <TheSolution />
        <HowItWorks />
        <HowWeBuiltIt />

        {/* ── Demo Explanation ──────────────────────────────────── */}
        <section style={{
          width: '100%',
          background: '#020408',
          padding: '80px 0',
          position: 'relative',
          zIndex: 1,
          borderTop: '1px solid rgba(255, 255, 255, 0.05)'
        }}>
          <div style={{
            padding: '0 40px',
            textAlign: 'center',
            maxWidth: '600px',
            margin: '0 auto',
            color: 'rgba(255, 255, 255, 0.5)',
            fontSize: '12px',
            fontFamily: 'var(--font-mono)',
            lineHeight: '1.6'
          }}>
            <div style={{ 
              textTransform: 'uppercase', 
              letterSpacing: '0.1em', 
              marginBottom: '12px',
              color: 'rgba(56, 189, 248, 0.6)'
            }}>
              where's our demo?
            </div>
            <p>
              due to an overwhelming increase in user traffic following our HackEurope 2026 win, and the requirement for specially set up drone hardware to fully experience the demo, we have temporarily taken the live demo offline. please watch the video walkthrough above to see what we built, or reach out to us if you'd like to chat :)
            </p>
          </div>
        </section>

        <AboutUs />

        {/* ── Footer ────────────────────────────────────────────── */}
        <footer className="landing-footer">
          <span>ZEROSTRIKE // WILDFIRE TACTICAL COMMAND v1.0.0</span>
          <span>OP ZONE: EU-THETA // CLASSIFICATION: RESTRICTED</span>
        </footer>
      </div>
    </>
  );
}
