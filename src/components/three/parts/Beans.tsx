import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { sampleNumber } from "@/lib/keyframes";
import { prefersReducedMotion } from "@/lib/motion";
import { seededRandom } from "@/lib/random";
import { sceneState } from "@/lib/scene-progress";
import { BEANS_DRIFT } from "../choreography";
import { createBeanGeometry } from "../geometry";

const COUNT = 22;
const CAMERA_Z = 8;
const HALF_FOV_TAN = Math.tan(THREE.MathUtils.degToRad(35 / 2));

interface Bean {
  x: number;
  y: number;
  z: number;
  scale: number;
  spin: THREE.Vector3;
  rotation: THREE.Euler;
  parallax: number;
}

function createBeans(): Bean[] {
  const random = seededRandom(11);
  return Array.from({ length: COUNT }, () => {
    // Siempre por detrás de la taza (z < 0) para no tapar la lectura del texto.
    const z = -8 + random() * 6.5;
    const depth = (z + 8) / 6.5; // 0 = fondo, 1 = cerca
    return {
      x: (random() * 2 - 1) * 7.5,
      y: (random() * 2 - 1) * 4,
      z,
      scale: 0.3 + random() * 0.28,
      spin: new THREE.Vector3(random() - 0.5, random() - 0.5, random() - 0.5).multiplyScalar(0.8),
      rotation: new THREE.Euler(random() * 6, random() * 6, random() * 6),
      parallax: 0.6 + depth * 1.6,
    };
  });
}

const wrap = (value: number, min: number, max: number) => {
  const range = max - min;
  return ((((value - min) % range) + range) % range) + min;
};

/** Granos flotando a distintas profundidades: el scroll los empuja con parallax. */
export function Beans() {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const geometry = useMemo(() => createBeanGeometry(), []);
  const beans = useMemo(() => createBeans(), []);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const reduced = useMemo(() => prefersReducedMotion(), []);

  useEffect(() => () => geometry.dispose(), [geometry]);

  // Cada grano con un punto de tueste distinto: ningún lote real es uniforme.
  useEffect(() => {
    const instanced = mesh.current;
    if (!instanced) return;
    const random = seededRandom(5);
    const light = new THREE.Color("#6b3a1c");
    const dark = new THREE.Color("#2a1408");
    const color = new THREE.Color();
    for (let i = 0; i < COUNT; i++) {
      instanced.setColorAt(i, color.lerpColors(dark, light, random()));
    }
    if (instanced.instanceColor) instanced.instanceColor.needsUpdate = true;
  }, []);

  useFrame(({ clock }, delta) => {
    const instanced = mesh.current;
    if (!instanced) return;

    const drift = sampleNumber(BEANS_DRIFT, sceneState.progress);
    const time = reduced ? 0 : clock.elapsedTime;

    beans.forEach((bean, i) => {
      const halfHeight = (CAMERA_Z - bean.z) * HALF_FOV_TAN + 0.6;
      const y = wrap(bean.y + drift * bean.parallax * 2 + time * 0.08, -halfHeight, halfHeight);

      if (!reduced) {
        bean.rotation.x += bean.spin.x * delta;
        bean.rotation.y += bean.spin.y * delta;
        bean.rotation.z += bean.spin.z * delta;
      }

      dummy.position.set(bean.x, y, bean.z);
      dummy.rotation.copy(bean.rotation);
      dummy.scale.setScalar(bean.scale);
      dummy.updateMatrix();
      instanced.setMatrixAt(i, dummy.matrix);
    });

    instanced.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[geometry, undefined, COUNT]} frustumCulled={false}>
      {/* Blanco: el color real lo pone cada instancia. Brillo aceitoso de tueste medio-oscuro. */}
      <meshPhysicalMaterial
        color="#ffffff"
        roughness={0.48}
        clearcoat={0.3}
        clearcoatRoughness={0.38}
        envMapIntensity={0.6}
      />

    </instancedMesh>
  );
}
