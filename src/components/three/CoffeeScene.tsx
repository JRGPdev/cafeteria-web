"use client";

import { Environment, Lightformer, SoftShadows } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useRef, useState } from "react";
import * as THREE from "three";
import { ANATOMY } from "@/content/landing";
import { cx } from "@/lib/cx";
import { getSceneProgress, sceneState } from "@/lib/scene-progress";
import { CoffeeAssembly } from "./CoffeeAssembly";
import { PartLabel } from "./PartLabel";
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

/**
 * Iluminación de fotografía de producto:
 * - HDRI real de un estudio (Poly Haven, CC0) servido desde /public: da reflejos
 *   y degradados auténticos en el esmalte, imposibles de imitar con luces sintéticas.
 * - Softbox frontal alto añadido encima del HDRI: la franja de brillo vertical
 *   típica de una foto de producto.
 * - Luz de ventana que proyecta sombras suaves.
 */
const STUDIO_HDRI = "/hdri/studio_small_09_1k.hdr";

function Lighting() {
  return (
    <>
      <SoftShadows size={22} samples={16} focus={0.55} />
      <ambientLight intensity={0.06} color="#fff1e0" />

      {/* Luz principal: ventana arriba a la izquierda */}
      <directionalLight
        castShadow
        position={[-3.5, 6, 4]}
        intensity={2.1}
        color="#fff3e4"
        shadow-mapSize={[2048, 2048]}
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
  const labels = useRef<Array<HTMLDivElement | null>>([]);

  return (
    <div className={cx(styles.stage, ready && styles.ready)} aria-hidden>
      <Canvas
        shadows
        dpr={[1, 2]}
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
        <ScrollDriver />
        <Lighting />
        <CoffeeAssembly labels={labels} />
        <Beans />
      </Canvas>

      {ANATOMY.parts.map((part, i) => (
        <PartLabel
          key={part.index}
          ref={(element) => {
            labels.current[i] = element;
          }}
          {...part}
        />
      ))}
    </div>
  );
}
