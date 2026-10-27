import { ContactShadows } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { sampleNumber } from "@/lib/keyframes";
import { sceneState } from "@/lib/scene-progress";
import { CONTACT_SHADOW } from "../choreography";

/**
 * Sombra suave bajo el platillo. Va dentro del grupo del platillo, así que
 * siempre "toca" la pieza aunque ésta se mueva o gire con el scroll.
 */
export function GroundShadow() {
  const group = useRef<THREE.Group>(null);

  useFrame(() => {
    const shadow = group.current;
    if (!shadow) return;
    const opacity = sampleNumber(CONTACT_SHADOW, sceneState.progress);
    shadow.visible = opacity > 0.01;
    shadow.traverse((object) => {
      if (object instanceof THREE.Mesh) (object.material as THREE.Material).opacity = opacity;
    });
  });

  return (
    <ContactShadows
      ref={group}
      position={[0, -0.004, 0]}
      scale={4.8}
      resolution={512}
      blur={2.6}
      far={1.4}
      color="#24160d"
    />
  );
}
