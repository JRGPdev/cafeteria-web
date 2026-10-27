import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { createPose, samplePose, type Pose } from "@/lib/keyframes";
import { prefersReducedMotion } from "@/lib/motion";
import { sceneState } from "@/lib/scene-progress";
import { COFFEE, CUP, RIG, SAUCER } from "./choreography";
import { Coffee } from "./parts/Coffee";
import { Cup } from "./parts/Cup";
import { GroundShadow } from "./parts/GroundShadow";
import { Saucer } from "./parts/Saucer";
import { Steam } from "./parts/Steam";

function applyPose(object: THREE.Object3D | null, pose: Pose) {
  if (!object) return;
  object.position.set(...pose.position);
  object.rotation.set(...pose.rotation);
  object.scale.setScalar(pose.scale);
}

/**
 * Taza + café + platillo. Cada frame lee el progreso del scroll y coloca
 * cada pieza según la coreografía. Añade una leve inclinación con el puntero
 * y una respiración idle para que nunca se vea estático.
 */
export function CoffeeAssembly() {
  const rig = useRef<THREE.Group>(null);
  const cup = useRef<THREE.Group>(null);
  const coffee = useRef<THREE.Group>(null);
  const saucer = useRef<THREE.Group>(null);

  // Objetos de trabajo reutilizados cada frame (evita crear basura a 60 fps).
  const scratch = useRef({
    rig: createPose(),
    cup: createPose(),
    coffee: createPose(),
    saucer: createPose(),
    tilt: new THREE.Vector2(),
    cupCastsShadow: true,
  });
  const reduced = useMemo(() => prefersReducedMotion(), []);
  const size = useThree((state) => state.size);

  useFrame(({ clock, pointer }, delta) => {
    const p = sceneState.progress;
    const { tilt, ...poses } = scratch.current;

    samplePose(RIG, p, poses.rig);
    samplePose(CUP, p, poses.cup);
    samplePose(COFFEE, p, poses.coffee);
    samplePose(SAUCER, p, poses.saucer);

    // Composición responsive: en pantallas estrechas la taza va centrada arriba.
    const r = poses.rig;
    if (size.width < 768) {
      r.position[0] *= 0.08;
      r.position[1] = r.position[1] * 0.4 + 0.95;
      r.scale *= 0.58;
    } else if (size.width < 1100) {
      r.position[0] *= 0.75;
      r.scale *= 0.82;
    }

    if (!reduced) {
      const t = clock.elapsedTime;
      tilt.x = THREE.MathUtils.damp(tilt.x, pointer.y * 0.12, 3, delta);
      tilt.y = THREE.MathUtils.damp(tilt.y, pointer.x * 0.2, 3, delta);
      r.position[1] += Math.sin(t * 0.8) * 0.05;
      r.rotation[0] -= tilt.x;
      r.rotation[1] += tilt.y + Math.sin(t * 0.35) * 0.08;
    }

    applyPose(rig.current, r);
    applyPose(cup.current, poses.cup);
    applyPose(coffee.current, poses.coffee);
    applyPose(saucer.current, poses.saucer);

    // En "Espresso" la taza flota muy por encima: su sombra taparía la crema sin explicar nada.
    const cupCastsShadow = p < 1.4 || p > 2.6;
    if (cup.current && scratch.current.cupCastsShadow !== cupCastsShadow) {
      scratch.current.cupCastsShadow = cupCastsShadow;
      cup.current.traverse((object) => {
        object.castShadow = cupCastsShadow;
      });
    }
  });

  return (
    <>
      <group ref={rig}>
        <group ref={cup}>
          <Cup />
        </group>
        <group ref={coffee}>
          <Coffee />
        </group>
        <group ref={saucer}>
          <Saucer />
          <GroundShadow />
        </group>
      </group>
      <Steam anchor={cup} />
    </>
  );
}
