import { useEffect, useRef } from "react";
import logoIcon from "../assets/qualitytrack-icon.png";

export const QualityCoreAnimation = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    let renderer;
    let frameId;
    let resizeObserver;
    let scene;
    let timer;
    let disposed = false;

    const initialize = async () => {
      try {
        const THREE = await import("../utils/qualityCoreThree.js");
        if (disposed) return;

      scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
      camera.position.z = 7.4;

      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
        preserveDrawingBuffer: true,
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setClearColor(0x000000, 0);
      renderer.domElement.className = "absolute inset-0 h-full w-full";
      renderer.domElement.setAttribute("aria-hidden", "true");
      container.appendChild(renderer.domElement);

      const core = new THREE.Group();
      scene.add(core);

      const cage = new THREE.Mesh(
        new THREE.IcosahedronGeometry(2.05, 1),
        new THREE.MeshBasicMaterial({
          color: 0x0a6375,
          wireframe: true,
          transparent: true,
          opacity: 0.72,
        }),
      );
      core.add(cage);

      const innerCore = new THREE.Mesh(
        new THREE.OctahedronGeometry(1.2),
        new THREE.MeshBasicMaterial({
          color: 0x65c4c2,
          wireframe: true,
          transparent: true,
          opacity: 0.9,
        }),
      );
      core.add(innerCore);

      const orbitalRing = new THREE.Mesh(
        new THREE.RingGeometry(2.48, 2.51, 96),
        new THREE.MeshBasicMaterial({
          color: 0x65c4c2,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.5,
        }),
      );
      orbitalRing.rotation.set(Math.PI / 3, 0, 0);
      core.add(orbitalRing);

      const secondRing = new THREE.Mesh(
        new THREE.RingGeometry(2.78, 2.8, 96),
        new THREE.MeshBasicMaterial({
          color: 0x0a6375,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.75,
        }),
      );
      secondRing.rotation.set(-Math.PI / 6, Math.PI / 4, 0);
      core.add(secondRing);

      const particleCount = 420;
      const positions = new Float32Array(particleCount * 3);
      const colors = new Float32Array(particleCount * 3);
      const teal = new THREE.Color(0x0a6375);
      const cyan = new THREE.Color(0x65c4c2);

      for (let index = 0; index < particleCount; index += 1) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const radius = 2.15 + Math.random() * 1.35;
        const position = index * 3;
        positions[position] = radius * Math.sin(phi) * Math.cos(theta);
        positions[position + 1] = radius * Math.sin(phi) * Math.sin(theta);
        positions[position + 2] = radius * Math.cos(phi);

        const color = Math.random() > 0.4 ? cyan : teal;
        colors[position] = color.r;
        colors[position + 1] = color.g;
        colors[position + 2] = color.b;
      }

      const particleGeometry = new THREE.BufferGeometry();
      particleGeometry.setAttribute(
        "position",
        new THREE.BufferAttribute(positions, 3),
      );
      particleGeometry.setAttribute(
        "color",
        new THREE.BufferAttribute(colors, 3),
      );
      const particles = new THREE.Points(
        particleGeometry,
        new THREE.PointsMaterial({
          size: 0.04,
          vertexColors: true,
          transparent: true,
          opacity: 0.88,
          sizeAttenuation: true,
        }),
      );
      core.add(particles);

      const resize = () => {
        const { width, height } = container.getBoundingClientRect();
        if (!width || !height) return;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height, false);
      };

      resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(container);
      resize();

      timer = new THREE.Timer();
      timer.connect(document);
      const render = (timestamp) => {
        frameId = window.requestAnimationFrame(render);
        timer.update(timestamp);
        const time = timer.getElapsed();
        core.rotation.y = time * 0.22;
        core.rotation.x = Math.sin(time * 0.3) * 0.12;
        orbitalRing.rotation.z = time * 0.35;
        secondRing.rotation.z = -time * 0.3;
        innerCore.rotation.y = -time * 0.45;
        const pulse = 1 + Math.sin(time * 1.8) * 0.05;
        innerCore.scale.setScalar(pulse);
        renderer.render(scene, camera);
      };

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        renderer.render(scene, camera);
      } else {
        render();
      }
      } catch (error) {
        console.warn("QualityTrack core animation unavailable", error);
      }
    };

    void initialize();

    return () => {
      disposed = true;
      window.cancelAnimationFrame(frameId);
      resizeObserver?.disconnect();
      scene?.traverse((object) => {
        object.geometry?.dispose();
        if (Array.isArray(object.material)) {
          object.material.forEach((material) => material.dispose());
        } else {
          object.material?.dispose();
        }
      });
      timer?.dispose();
      renderer?.dispose();
      container.replaceChildren();
    };
  }, []);

  return (
    <section
      aria-label="Animación del núcleo QualityTrack"
      className="relative isolate flex min-h-[300px] w-full flex-1 items-center justify-center overflow-hidden bg-[#081619] lg:min-h-[440px]"
      style={{
        backgroundImage:
          "radial-gradient(circle at 50% 50%, rgba(10, 99, 117, 0.32) 0%, transparent 68%), linear-gradient(rgba(101, 196, 194, 0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(101, 196, 194, 0.06) 1px, transparent 1px)",
        backgroundSize: "100% 100%, 40px 40px, 40px 40px",
      }}
    >
      <div ref={containerRef} className="absolute inset-0" />

      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#65c4c2]/70 to-transparent" />

      <div className="absolute left-4 top-4 z-10 flex items-center gap-2.5 rounded-lg border border-white/15 bg-[#081619]/85 px-3 py-2 backdrop-blur-md sm:left-6 sm:top-6">
        <span className="relative flex h-2 w-2" aria-hidden="true">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
        </span>
        <span className="font-sans text-[9px] font-semibold uppercase tracking-wider text-white sm:text-[10px]">
          Núcleo activo
        </span>
      </div>

      <div className="absolute right-4 top-4 z-10 rounded-lg border border-white/15 bg-[#081619]/85 px-3 py-2 font-sans text-[9px] font-semibold tracking-wider text-[#65c4c2] backdrop-blur-md sm:right-6 sm:top-6 sm:text-[10px]">
        QT // PRODUCCIÓN
      </div>

      <div className="pointer-events-none absolute left-1/2 top-1/2 z-10 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center">
        <svg
          aria-hidden="true"
          viewBox="0 0 200 200"
          className="absolute h-52 w-52 motion-safe:animate-[spin_36s_linear_infinite] text-[#65c4c2]/35 sm:h-64 sm:w-64"
          fill="none"
        >
          <circle cx="100" cy="100" r="92" stroke="currentColor" strokeDasharray="3 6" />
          <circle cx="100" cy="100" r="82" stroke="currentColor" strokeDasharray="24 12 6 12" />
          <path d="M100 0v12m0 176v12M0 100h12m176 0h12" stroke="currentColor" />
        </svg>
        <svg
          aria-hidden="true"
          viewBox="0 0 200 200"
          className="absolute h-40 w-40 motion-safe:animate-[spin_28s_linear_infinite_reverse] text-[#0a6375]/70 sm:h-48 sm:w-48"
          fill="none"
        >
          <circle cx="100" cy="100" r="72" stroke="currentColor" strokeDasharray="8 8" />
          <circle cx="100" cy="100" r="62" stroke="currentColor" strokeDasharray="4 16" />
        </svg>
        <div className="relative flex h-24 w-24 motion-safe:animate-pulse items-center justify-center rounded-full border border-[#65c4c2]/60 bg-[#081619]/90 shadow-[0_0_40px_rgba(10,99,117,0.65)] backdrop-blur-md sm:h-28 sm:w-28">
          <img
            src={logoIcon}
            alt="QualityTrack"
            className="h-12 w-12 object-contain drop-shadow-[0_0_14px_rgba(101,196,194,0.75)] sm:h-14 sm:w-14"
          />
        </div>
        <span className="mt-3 rounded-full border border-[#65c4c2]/40 bg-[#081619]/90 px-2.5 py-1 font-sans text-[9px] font-semibold uppercase tracking-widest text-[#65c4c2]">
          QualityTrack
        </span>
      </div>

      <div className="absolute bottom-4 left-4 right-4 z-10 flex items-center justify-between gap-2 rounded-xl border border-white/15 bg-[#081619]/85 px-3 py-3 backdrop-blur-md sm:bottom-6 sm:left-6 sm:right-6 sm:px-5">
        <span className="font-sans text-[8px] font-semibold uppercase tracking-wider text-white/80 sm:text-[10px]">
          Solicitudes
        </span>
        <span className="h-px flex-1 bg-[#65c4c2]/40" aria-hidden="true" />
        <span className="font-sans text-[8px] font-semibold uppercase tracking-wider text-[#65c4c2] sm:text-[10px]">
          Producción
        </span>
        <span className="h-px flex-1 bg-[#65c4c2]/40" aria-hidden="true" />
        <span className="font-sans text-[8px] font-semibold uppercase tracking-wider text-white/80 sm:text-[10px]">
          Calidad
        </span>
      </div>
    </section>
  );
};