import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";
import { createPose, sampleNumber, samplePose, type Pose, type Vec3 } from "@/lib/keyframes";
import { prefersReducedMotion } from "@/lib/motion";
import { sceneState } from "@/lib/scene-progress";
import { COFFEE, CUP, LABEL_OPACITY, RIG, SAUCER } from "./choreography";
import { Coffee } from "./parts/Coffee";
import { Cup } from "./parts/Cup";
import { GroundShadow } from "./parts/GroundShadow";
import { Saucer } from "./parts/Saucer";
import { Steam } from "./parts/Steam";

/** Punto (local a cada pieza) donde arranca la línea de su etiqueta: taza, café, platillo. */
const LABEL_ANCHORS: Vec3[] = [
  [1.45, 0.85, 0],
  [0.9, 0.6, 0],
  [1.6, 0.25, 0],
];

function applyPose(object: THREE.Object3D | null, pose: Pose) {
  if (!object) return;
  object.position.set(...pose.position);
  object.rotation.set(...pose.rotation);
  object.scale.setScalar(pose.scale);
}

interface CoffeeAssemblyProps {
  /** Etiquetas DOM (en el mismo orden que LABEL_ANCHORS) que se proyectan sobre las piezas. */
  labels: RefObject<Array<HTMLDivElement | null>>;
}

/**
 * Taza + café + platillo. Cada frame lee el progreso del scroll y coloca
 * cada pieza según la coreografía. Añade una leve inclinación con el puntero
 * y una respiración idle para que nunca se vea estático.
 */
export function CoffeeAssembly({ labels }: CoffeeAssemblyProps) {
  const rig = useRef<THREE.Group>(null);
  const cup = useRef<THREE.Group>(null);
  const coffee = useRef<THREE.Group>(null);
  const saucer = useRef<THREE.Group>(null);
  const anchors = useRef<Array<THREE.Object3D | null>>([]);

  // Objetos de trabajo reutilizados cada frame (evita crear basura a 60 fps).
  const scratch = useRef({
    rig: createPose(),
    cup: createPose(),
    coffee: createPose(),
    saucer: createPose(),
    tilt: new THREE.Vector2(),
    projected: new THREE.Vector3(),
    cupCastsShadow: true,
  });
  const reduced = useMemo(() => prefersReducedMotion(), []);
  const size = useThree((state) => state.size);

  useFrame(({ clock, pointer, camera }, delta) => {
    const p = sceneState.progress;
    const { tilt, projected, ...poses } = scratch.current;

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
    rig.current?.updateMatrixWorld();

    // En "Espresso" la taza flota muy por encima: su sombra taparía la crema sin explicar nada.
    const cupCastsShadow = p < 1.4 || p > 2.6;
    if (cup.current && scratch.current.cupCastsShadow !== cupCastsShadow) {
      scratch.current.cupCastsShadow = cupCastsShadow;
      cup.current.traverse((object) => {
        object.castShadow = cupCastsShadow;
      });
    }

    // Etiquetas: proyectamos cada ancla 3D a píxeles de pantalla.
    const opacity = sampleNumber(LABEL_OPACITY, p);
    anchors.current.forEach((anchor, i) => {
      const label = labels.current[i];
      if (!anchor || !label) return;

      label.style.visibility = opacity > 0.01 ? "visible" : "hidden";
      if (opacity <= 0.01) return;

      anchor.getWorldPosition(projected).project(camera);
      const x = (projected.x * 0.5 + 0.5) * size.width;
      const y = (-projected.y * 0.5 + 0.5) * size.height;
      label.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
      label.style.opacity = opacity.toFixed(3);
      label.style.setProperty("--reveal", opacity.toFixed(3));
    });
  });

  return (
    <>
      <group ref={rig}>
        <group ref={cup}>
          <Cup />
          <object3D ref={(o) => void (anchors.current[0] = o)} position={LABEL_ANCHORS[0]} />
        </group>
        <group ref={coffee}>
          <Coffee />
          <object3D ref={(o) => void (anchors.current[1] = o)} position={LABEL_ANCHORS[1]} />
        </group>
        <group ref={saucer}>
          <Saucer />
          <GroundShadow />
          <object3D ref={(o) => void (anchors.current[2] = o)} position={LABEL_ANCHORS[2]} />
        </group>
      </group>
      <Steam anchor={cup} />
    </>
  );
}
