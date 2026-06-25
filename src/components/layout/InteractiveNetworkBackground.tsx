import React, { useEffect, useRef } from "react";
import * as THREE from "three";

interface InteractiveNetworkBackgroundProps {
  theme: string; // "light" or "dark"
}

// Generate smooth, high-fidelity glowing radial dot texture dynamically with memory safety
function createRadialGlowTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, "rgba(255, 255, 255, 1.0)");
    gradient.addColorStop(0.15, "rgba(255, 255, 255, 0.95)");
    gradient.addColorStop(0.35, "rgba(255, 255, 255, 0.45)");
    gradient.addColorStop(0.7, "rgba(255, 255, 255, 0.12)");
    gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);
  }
  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

export function InteractiveNetworkBackground({ theme }: InteractiveNetworkBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const themeRef = useRef(theme);

  // Keep track of theme state directly in a ref for immediate access inside the animation loop
  useEffect(() => {
    themeRef.current = theme;
  }, [theme]);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Create scene, camera, renderer
    const scene = new THREE.Scene();
    
    // Choose perspective camera
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.z = 80;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Track mouse coordinates normalized between -1 and 1
    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };

    const handleMouseMove = (event: MouseEvent) => {
      mouse.targetX = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.targetY = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    // Keep mobile touch friendly
    const handleTouchMove = (event: TouchEvent) => {
      if (event.touches.length > 0) {
        mouse.targetX = (event.touches[0].clientX / window.innerWidth) * 2 - 1;
        mouse.targetY = -(event.touches[0].clientY / window.innerHeight) * 2 + 1;
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchmove", handleTouchMove);

    // Initial random generation of particles
    const particleCount = 75; // Balanced for aesthetics & performance
    const particles: Array<{
      mesh: THREE.Mesh;
      basePosition: THREE.Vector3;
      speed: THREE.Vector3;
      seed: number;
      isSquare: boolean;
    }> = [];

    // Shared materials
    const squareMaterial = new THREE.MeshBasicMaterial({
      transparent: true,
      depthWrite: false,
    });
    const pointMaterial = new THREE.MeshBasicMaterial({
      transparent: true,
      depthWrite: false,
    });

    const squareGeo = new THREE.PlaneGeometry(1.4, 1.4);
    const pointGeo = new THREE.PlaneGeometry(0.35, 0.35);

    // Set colors according to theme
    const applyColors = (isDark: boolean) => {
      if (isDark) {
        squareMaterial.color.setHex(0x06b6d4); // Cyan
        squareMaterial.opacity = 0.75;
        pointMaterial.color.setHex(0x22d3ee); // Light cyan
        pointMaterial.opacity = 0.6;
      } else {
        squareMaterial.color.setHex(0x2563eb); // Rich blue
        squareMaterial.opacity = 0.45;
        pointMaterial.color.setHex(0x3b82f6); // Muted blue
        pointMaterial.opacity = 0.35;
      }
    };

    applyColors(themeRef.current === "dark" || themeRef.current.includes("dark"));

    // Create bounds based on camera FOV
    const xRange = 85;
    const yRange = 55;
    const zRange = 60; // range from -40 to 20

    for (let i = 0; i < particleCount; i++) {
      const isSquare = Math.random() > 0.48; // balanced split
      const geo = isSquare ? squareGeo : pointGeo;
      const mat = isSquare ? squareMaterial : pointMaterial;

      const mesh = new THREE.Mesh(geo, mat);

      // Random distribution
      const x = (Math.random() - 0.5) * xRange;
      const y = (Math.random() - 0.5) * yRange;
      const z = (Math.random() - 0.5) * zRange; // spreads them in 3D depth

      mesh.position.set(x, y, z);
      scene.add(mesh);

      particles.push({
        mesh,
        basePosition: new THREE.Vector3(x, y, z),
        speed: new THREE.Vector3(
          (Math.random() - 0.5) * 0.15,
          (Math.random() - 0.5) * 0.15,
          (Math.random() - 0.5) * 0.05
        ),
        seed: Math.random() * 100,
        isSquare,
      });
    }

    // Build sparse, elegant connections based on proximity + limited degree (max 2 per node)
    const connections: Array<[number, number]> = [];
    const maxConnectDistance = 16.5;
    const connectionCounts = new Array(particleCount).fill(0);

    for (let i = 0; i < particleCount; i++) {
      const candidates: Array<{ index: number; dist: number }> = [];
      for (let j = i + 1; j < particleCount; j++) {
        const d = particles[i].basePosition.distanceTo(particles[j].basePosition);
        if (d < maxConnectDistance) {
          candidates.push({ index: j, dist: d });
        }
      }
      
      // Nearest candidates first
      candidates.sort((a, b) => a.dist - b.dist);
      
      let localCreated = 0;
      for (const cand of candidates) {
        if (connectionCounts[i] >= 2) break;
        if (connectionCounts[cand.index] < 2) {
          connections.push([i, cand.index]);
          connectionCounts[i]++;
          connectionCounts[cand.index]++;
          localCreated++;
          if (localCreated >= 2) break;
        }
      }
    }

    // Line segments setup
    const lineIndicesCount = connections.length * 2;
    const linePositions = new Float32Array(lineIndicesCount * 3);
    const lineGeometry = new THREE.BufferGeometry();
    lineGeometry.setAttribute("position", new THREE.BufferAttribute(linePositions, 3));

    const lineMaterial = new THREE.LineBasicMaterial({
      transparent: true,
      depthWrite: false,
    });

    const applyLineColors = (isDark: boolean) => {
      if (isDark) {
        lineMaterial.color.setHex(0x06b6d4);
        lineMaterial.opacity = 0.12;
      } else {
        lineMaterial.color.setHex(0x2563eb);
        lineMaterial.opacity = 0.06;
      }
    };
    applyLineColors(themeRef.current === "dark" || themeRef.current.includes("dark"));

    const lineSegments = new THREE.LineSegments(lineGeometry, lineMaterial);
    scene.add(lineSegments);

    // Electrical currents flowing periodically along subset of connection lines
    // Represents around ~18% of connections
    const pulses: Array<{
      mesh: THREE.Mesh;
      connectionIndex: number;
      progress: number;
      speed: number;
      reverse: boolean;
    }> = [];

    const glowTexture = createRadialGlowTexture();
    const pulseGeo = new THREE.PlaneGeometry(2.4, 2.4);
    const pulseMaterial = new THREE.MeshBasicMaterial({
      map: glowTexture,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending, // realistic glowing composite
    });

    const applyPulseColors = (isDark: boolean) => {
      if (isDark) {
        pulseMaterial.color.setHex(0x22d3ee); // electric cyan
        pulseMaterial.opacity = 0.95;
      } else {
        pulseMaterial.color.setHex(0x1d4ed8); // electric blue in light mode
        pulseMaterial.opacity = 0.85;
      }
    };
    applyPulseColors(themeRef.current === "dark" || themeRef.current.includes("dark"));

    if (connections.length > 0) {
      const pulseTotal = Math.max(4, Math.floor(connections.length * 0.18));
      for (let p = 0; p < pulseTotal; p++) {
        const mesh = new THREE.Mesh(pulseGeo, pulseMaterial);
        scene.add(mesh);
        pulses.push({
          mesh,
          connectionIndex: Math.floor(Math.random() * connections.length),
          progress: Math.random(),
          speed: 0.005 + Math.random() * 0.012,
          reverse: Math.random() > 0.5,
        });
      }
    }

    // Smooth resize handler
    const handleResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    resizeObserver.observe(container);

    let animationFrameId: number;
    let lastTheme = themeRef.current;

    // Animation Loop
    const animate = (time: number) => {
      animationFrameId = requestAnimationFrame(animate);

      // Gentle mouse lerping for lag-free smoothing
      mouse.x += (mouse.targetX - mouse.x) * 0.06;
      mouse.y += (mouse.targetY - mouse.y) * 0.06;

      const elapsed = time * 0.0006;
      const currentTheme = themeRef.current;

      // React immediately to external theme changes inside the 60fps loop
      if (currentTheme !== lastTheme) {
        const isDark = currentTheme === "dark" || currentTheme.includes("dark");
        applyColors(isDark);
        applyLineColors(isDark);
        applyPulseColors(isDark);
        lastTheme = currentTheme;
      }

      // Update positions of particles with organic hover floating + mouse parallax
      particles.forEach((p) => {
        // Subtle organic float wave offset over time
        const driftX = Math.sin(elapsed + p.seed) * 1.8;
        const driftY = Math.cos(elapsed * 0.8 + p.seed * 1.2) * 1.8;

        // Parallax depth multiplier: closer items (higher Z, nearer to camera) move more
        // Farther items (lower Z) move less.
        const normalizedDepth = (p.basePosition.z + 30) / 60; // 0 to 1
        // Base parallax factor
        const parallaxFactor = 1.8 + normalizedDepth * 5.5;

        p.mesh.position.x = p.basePosition.x + driftX + mouse.x * parallaxFactor;
        p.mesh.position.y = p.basePosition.y + driftY + mouse.y * parallaxFactor;
        
        // Face the camera directly
        p.mesh.quaternion.copy(camera.quaternion);
      });

      // Update electrical pulse currents running through connections
      pulses.forEach((pulse) => {
        pulse.progress += pulse.speed;
        if (pulse.progress >= 1.0) {
          pulse.progress = 0;
          pulse.connectionIndex = Math.floor(Math.random() * connections.length);
          pulse.speed = 0.005 + Math.random() * 0.012;
          pulse.reverse = Math.random() > 0.5;
        }

        if (connections[pulse.connectionIndex]) {
          const [n1, n2] = connections[pulse.connectionIndex];
          const startPt = particles[pulse.reverse ? n2 : n1].mesh.position;
          const endPt = particles[pulse.reverse ? n1 : n2].mesh.position;

          pulse.mesh.position.lerpVectors(startPt, endPt, pulse.progress);
          pulse.mesh.quaternion.copy(camera.quaternion);

          // Breathe scale slightly
          const fade = Math.sin(pulse.progress * Math.PI);
          pulse.mesh.scale.setScalar(0.75 + fade * 0.5);
        }
      });

      // Update connected line geometries coordinate buffer array
      const positionsAttr = lineGeometry.getAttribute("position") as THREE.BufferAttribute;
      const array = positionsAttr.array as Float32Array;

      let idx = 0;
      for (let i = 0; i < connections.length; i++) {
        const [n1, n2] = connections[i];
        const p1 = particles[n1].mesh.position;
        const p2 = particles[n2].mesh.position;

        array[idx++] = p1.x;
        array[idx++] = p1.y;
        array[idx++] = p1.z;

        array[idx++] = p2.x;
        array[idx++] = p2.y;
        array[idx++] = p2.z;
      }

      positionsAttr.needsUpdate = true;

      // Render scene
      renderer.render(scene, camera);
    };

    animationFrameId = requestAnimationFrame(animate);

    // Proper Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
      resizeObserver.disconnect();
      
      // Memory cleanup
      scene.clear();
      squareGeo.dispose();
      pointGeo.dispose();
      pulseGeo.dispose();
      glowTexture.dispose();
      squareMaterial.dispose();
      pointMaterial.dispose();
      pulseMaterial.dispose();
      lineGeometry.dispose();
      lineMaterial.dispose();
      renderer.dispose();

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 w-full h-full pointer-events-none -z-10 bg-zinc-50 dark:bg-[#020205] transition-colors duration-500 overflow-hidden"
      style={{ mixBlendMode: "normal" }}
    />
  );
}
