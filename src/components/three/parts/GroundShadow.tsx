import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { sampleNumber } from "@/lib/keyframes";
import { sceneState } from "@/lib/scene-progress";
import { CONTACT_SHADOW } from "../choreography";

/** Mancha de sombra difusa pintada una vez en un canvas (más densa en el centro). */
function createShadowTexture(size = 256) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const c = size / 2;
  const gradient = ctx.createRadialGradient(c, c, 0, c, c, c);
  gradient.addColorStop(0, "rgba(36, 22, 13, 0.85)");
  gradient.addColorStop(0.42, "rgba(36, 22, 13, 0.55)");
  gradient.addColorStop(0.62, "rgba(36, 22, 13, 0.2)");
  gradient.addColorStop(1, "rgba(36, 22, 13, 0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Sombra suave bajo el platillo. Va dentro del grupo del platillo, así que
 * siempre "toca" la pieza aunque ésta se mueva o gire con el scroll.
 * Es una textura estática: a diferencia de una sombra de contacto en tiempo real,
 * no vuelve a dibujar la escena en cada frame.
 */
export function GroundShadow() {
  const material = useRef<THREE.MeshBasicMaterial>(null);
  const texture = useMemo(() => createShadowTexture(), []);

  useEffect(() => () => texture.dispose(), [texture]);

  useFrame(() => {
    if (!material.current) return;
    const opacity = sampleNumber(CONTACT_SHADOW, sceneState.progress);
    material.current.opacity = opacity;
    material.current.visible = opacity > 0.01;
  });

  return (
    <mesh position={[0, -0.006, 0]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={-1}>
      <planeGeometry args={[4.4, 4.4]} />
      <meshBasicMaterial ref={material} map={texture} transparent depthWrite={false} toneMapped={false} />
    </mesh>
  );
}
