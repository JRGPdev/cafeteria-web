import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import type { Mesh } from "three";
import { createCoffeeGeometry, createCremaGeometry } from "../geometry";
import { CoffeeMaterial } from "../materials";
import { createCremaBumpTexture, createCremaTexture } from "../textures";
import { Splash } from "./Splash";

/** El café con su crema. Conserva la forma interior de la taza al separarse. */
export function Coffee() {
  const body = useMemo(() => createCoffeeGeometry(), []);
  const surfaceGeometry = useMemo(() => createCremaGeometry(), []);
  const crema = useMemo(() => createCremaTexture(), []);
  const cremaBump = useMemo(() => createCremaBumpTexture(), []);
  const surface = useRef<Mesh>(null);

  useEffect(
    () => () => {
      body.dispose();
      surfaceGeometry.dispose();
      crema.dispose();
      cremaBump.dispose();
    },
    [body, surfaceGeometry, crema, cremaBump],
  );

  // La crema gira muy despacio, como recién servida.
  useFrame((_, delta) => {
    if (surface.current) surface.current.rotation.y += delta * 0.05;
  });

  return (
    <group>
      <mesh geometry={body} castShadow>
        <CoffeeMaterial />
      </mesh>
      <mesh ref={surface} geometry={surfaceGeometry} receiveShadow>
        {/* La crema es espuma: mate, sin barniz; el sheen le da el brillo aterciopelado. */}
        <meshPhysicalMaterial
          map={crema}
          bumpMap={cremaBump}
          bumpScale={0.6}
          roughness={0.72}
          specularIntensity={0.35}
          sheen={0.5}
          sheenColor="#e8c08a"
          sheenRoughness={0.55}
        />
      </mesh>
      <Splash />
    </group>
  );
}
