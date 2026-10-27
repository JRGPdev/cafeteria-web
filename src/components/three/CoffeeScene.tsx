"use client";

import { Environment, Lightformer, PerformanceMonitor, SoftShadows, useProgress } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { Suspense, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { cx } from "@/lib/cx";
import { loadingStore } from "@/lib/loading";
import { getSceneProgress, sceneState } from "@/lib/scene-progress";
import { CoffeeAssembly } from "./CoffeeAssembly";
import { Beans } from "./parts/Beans";
import styles from "./CoffeeScene.module.css";

/** Suaviza el progreso del scroll una sola vez por frame para toda la escena. */
function ScrollDriver() {
  const initialized = useRef(false);

  useFrame((_, delta) => {
    const target = getSceneProgress();
    // Si se recarga a mitad de página, la escena arranca ya colocada.
    if (!initialized.current) {
      sceneState.progress = target;
      initialized.current = true;
      return;
    }
    sceneState.progress = THREE.MathUtils.damp(sceneState.progress, target, 6, delta);
  });

  return null;
}

/** Informa a la pantalla de carga del avance de los recursos (HDRI). */
function LoadProgress() {
  const { progress } = useProgress();

  useEffect(() => {
    // 0–20 %: módulo 3D descargado · 20–90 %: recursos · 100 %: primer render (SceneReady).
    loadingStore.report(0.2 + (progress / 100) * 0.7);
  }, [progress]);

  return null;
}

/** Espera unos frames tras montar la escena (shaders compilados, sombras listas). */
function SceneReady() {
  const frames = useRef(0);

  useFrame(() => {
    frames.current += 1;
    if (frames.current === 3) loadingStore.markSceneReady();
  });

  return null;
}

/**
 * Iluminación de fotografía de producto:
 * - HDRI real de un estudio (Poly Haven, CC0) servido desde /public: da reflejos
 *   y degradados auténticos en el esmalte, imposibles de imitar con luces sintéticas.
 * - Softbox frontal alto añadido encima del HDRI: la franja de brillo vertical
 *   típica de una foto de producto.
 * - Luz de ventana que proyecta sombras suaves.
 */
const STUDIO_HDRI = "/hdri/studio_small_09_1k.hdr";

/** En pantallas retina, 1.5 se ve igual de nítido que 2 y pinta ~44 % menos píxeles. */
const MAX_DPR = typeof window === "undefined" ? 1 : Math.min(window.devicePixelRatio, 1.5);

function Lighting() {
  return (
    <>
      {/* 10 muestras: casi igual de suave que 16 con bastante menos coste por píxel */}
      <SoftShadows size={20} samples={10} focus={0.55} />
      <ambientLight intensity={0.06} color="#fff1e0" />

      {/* Luz principal: ventana arriba a la izquierda */}
      <directionalLight
        castShadow
        position={[-3.5, 6, 4]}
        intensity={2.1}
        color="#fff3e4"
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0002}
        shadow-normalBias={0.025}
      >
        <orthographicCamera attach="shadow-camera" args={[-4, 4, 4, -4, 0.5, 20]} />
      </directionalLight>

      {/* Contraluz cálido que separa la taza del fondo */}
      <directionalLight position={[5, 1.5, -4]} intensity={1.3} color="#ffb57a" />

      <Environment
        files={STUDIO_HDRI}
        resolution={512}
        frames={1}
        environmentIntensity={0.9}
        environmentRotation={[0, Math.PI * 0.35, 0]}
      >
        <Lightformer form="rect" intensity={3} color="#fffaf3" position={[-2.6, 1.5, 7]} scale={[1.4, 7, 1]} />
        <Lightformer form="rect" intensity={0.8} color="#e8a56b" position={[6, 0.5, 1]} scale={[3, 8, 1]} />
      </Environment>
    </>
  );
}

export default function CoffeeScene() {
  const [ready, setReady] = useState(false);
  // Resolución adaptativa: si el equipo no sostiene los FPS, bajamos la densidad de píxeles.
  const [dpr, setDpr] = useState(MAX_DPR);

  // Si este módulo ya se ejecuta, la descarga del código 3D terminó.
  useEffect(() => loadingStore.report(0.2), []);

  return (
    <div className={cx(styles.stage, ready && styles.ready)} aria-hidden>
      <Canvas
        shadows
        dpr={dpr}
        camera={{ position: [0, 0, 8], fov: 35 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        // El lienzo no recibe clics (pointer-events: none); el puntero se lee de toda la página.
        eventSource={document.documentElement}
        eventPrefix="client"
        onCreated={({ gl }) => {
          // Neutral conserva los blancos de la cerámica (ACES los vuelve beige y lavados).
          gl.toneMapping = THREE.NeutralToneMapping;
          gl.toneMappingExposure = 1.12;
          setReady(true);
        }}
      >
        <PerformanceMonitor onDecline={() => setDpr(1)} onIncline={() => setDpr(MAX_DPR)} />
        <ScrollDriver />
        <LoadProgress />
        {/* Todo lo que carga (HDRI) u hornea (oclusión) está dentro: SceneReady solo
            se monta cuando el conjunto completo está listo. */}
        <Suspense fallback={null}>
          <Lighting />
          <CoffeeAssembly />
          <Beans />
          <SceneReady />
        </Suspense>
      </Canvas>
    </div>
  );
}
