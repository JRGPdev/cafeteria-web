import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";
import { sampleNumber } from "@/lib/keyframes";
import { sceneState } from "@/lib/scene-progress";
import { STEAM_OPACITY } from "../choreography";

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform float uTime;
  uniform float uOpacity;
  uniform float uSeed;
  uniform vec3 uColor;
  varying vec2 vUv;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
               mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
  }

  void main() {
    float y = vUv.y;
    float x = vUv.x - 0.5;
    x += sin(y * 5.0 - uTime * 1.1 + uSeed) * 0.11 * y;
    x += (noise(vec2(y * 3.0 - uTime * 0.5, uSeed)) - 0.5) * 0.3 * y;

    float width = mix(0.05, 0.3, y);
    float alpha = smoothstep(width, 0.0, abs(x));
    alpha *= smoothstep(0.0, 0.18, y) * smoothstep(1.0, 0.4, y);
    alpha *= 0.45 + 0.55 * noise(vec2(vUv.x * 4.0 + uSeed, y * 6.0 - uTime * 0.7));

    gl_FragColor = vec4(uColor, alpha * uOpacity);
  }
`;

const WISPS = [
  { x: -0.22, seed: 1.3, scale: 1 },
  { x: 0.12, seed: 4.7, scale: 1.2 },
  { x: 0.3, seed: 8.1, scale: 0.85 },
];

interface SteamProps {
  /** Grupo de la taza: el vapor sale de su boca. */
  anchor: RefObject<THREE.Group | null>;
}

/** Vapor procedural (shader) que sigue a la taza y siempre sube en vertical. */
export function Steam({ anchor }: SteamProps) {
  const group = useRef<THREE.Group>(null);
  const geometry = useMemo(() => new THREE.PlaneGeometry(1, 2.4).translate(0, 1.2, 0), []);
  const materials = useMemo(
    () =>
      WISPS.map(
        (wisp) =>
          new THREE.ShaderMaterial({
            vertexShader,
            fragmentShader,
            transparent: true,
            depthWrite: false,
            uniforms: {
              uTime: { value: 0 },
              uOpacity: { value: 0 },
              uSeed: { value: wisp.seed },
              uColor: { value: new THREE.Color("#fff8f0") },
            },
          }),
      ),
    [],
  );

  useEffect(
    () => () => {
      geometry.dispose();
      materials.forEach((m) => m.dispose());
    },
    [geometry, materials],
  );

  useFrame(({ clock }) => {
    if (!group.current || !anchor.current) return;

    const opacity = sampleNumber(STEAM_OPACITY, sceneState.progress) * 0.55;
    group.current.visible = opacity > 0.01;
    if (!group.current.visible) return;

    anchor.current.localToWorld(group.current.position.set(0, 1.05, 0));

    for (const wisp of group.current.children) {
      const { uniforms } = (wisp as THREE.Mesh<THREE.BufferGeometry, THREE.ShaderMaterial>).material;
      uniforms.uTime.value = clock.elapsedTime;
      uniforms.uOpacity.value = opacity;
    }
  });

  return (
    <group ref={group}>
      {WISPS.map((wisp, i) => (
        <mesh
          key={wisp.seed}
          geometry={geometry}
          material={materials[i]}
          position={[wisp.x, 0, 0.1 * i]}
          scale={wisp.scale}
        />
      ))}
    </group>
  );
}
