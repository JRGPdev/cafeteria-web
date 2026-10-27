import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { sampleNumber } from "@/lib/keyframes";
import { prefersReducedMotion } from "@/lib/motion";
import { seededRandom } from "@/lib/random";
import { sceneState } from "@/lib/scene-progress";
import { SPLASH_SIZE, SPLASH_SPREAD } from "../choreography";
import { COFFEE_LEVEL, createDropletGeometry } from "../geometry";
import { CoffeeMaterial } from "../materials";

const COUNT = 26;
const JET = 3;
const UP = new THREE.Vector3(0, 1, 0);

interface Droplet {
  angle: number;
  radius: number;
  height: number;
  size: number;
  flight: number;
  phase: number;
}

function createDroplets(): Droplet[] {
  const random = seededRandom(42);
  return Array.from({ length: COUNT }, (_, i) => {
    const jet = i < JET; // gotas centrales que saltan hacia arriba, cada vez más pequeñas
    const t = random();
    return {
      angle: (i / COUNT) * Math.PI * 2 + random() * 0.3,
      radius: jet ? random() * 0.08 : 0.78 + t * 0.2,
      height: jet ? 0.55 + i * 0.32 : 0.04 + t * t * 0.55,
      size: jet ? 0.045 - i * 0.01 : 0.012 + random() * 0.024,
      flight: 0.8 + random() * 1.6,
      phase: random() * Math.PI * 2,
    };
  });
}

/** Corona de gotas sobre el café: en el hero salpica, con el scroll se dispersa. */
export function Splash() {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const droplets = useMemo(() => createDroplets(), []);
  const geometry = useMemo(() => createDropletGeometry(), []);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const reduced = useMemo(() => prefersReducedMotion(), []);
  const scratch = useRef({ direction: new THREE.Vector3() });

  useEffect(() => () => geometry.dispose(), [geometry]);

  useFrame(({ clock }) => {
    const instanced = mesh.current;
    if (!instanced) return;

    const p = sceneState.progress;
    const spread = sampleNumber(SPLASH_SPREAD, p);
    const size = sampleNumber(SPLASH_SIZE, p);
    instanced.visible = size > 0.01;
    if (!instanced.visible) return;

    const time = reduced ? 0 : clock.elapsedTime;
    const { direction } = scratch.current;

    droplets.forEach((d, i) => {
      const r = d.radius + spread * d.flight;
      const bob = Math.sin(time * 1.6 + d.phase) * 0.035;
      dummy.position.set(
        Math.cos(d.angle) * r,
        COFFEE_LEVEL + d.height * (1 + spread * 0.35) + bob,
        Math.sin(d.angle) * r,
      );
      // La cola de la gota apunta en contra de su trayectoria (hacia fuera y arriba).
      const outward = d.radius < 0.2 ? 0 : 0.9 + spread * 0.6;
      direction.set(-Math.cos(d.angle) * outward, -1.2, -Math.sin(d.angle) * outward).normalize();
      dummy.quaternion.setFromUnitVectors(UP, direction);
      dummy.scale.setScalar(d.size * size);
      dummy.updateMatrix();
      instanced.setMatrixAt(i, dummy.matrix);
    });

    instanced.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[geometry, undefined, COUNT]} frustumCulled={false} castShadow>
      <CoffeeMaterial />
    </instancedMesh>
  );
}
