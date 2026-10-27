import { useEffect, useMemo } from "react";
import { bakeLatheOcclusion, OcclusionBaker } from "../ambientOcclusion";
import { createSaucerGeometry } from "../geometry";
import { CeramicMaterial } from "../materials";

function createSaucer() {
  const geometry = createSaucerGeometry();
  bakeLatheOcclusion(geometry, new OcclusionBaker([geometry], { samples: 48, distance: 0.35, strength: 0.7 }));
  return geometry;
}

export function Saucer() {
  const geometry = useMemo(() => createSaucer(), []);

  useEffect(() => () => geometry.dispose(), [geometry]);

  return (
    <mesh geometry={geometry} castShadow receiveShadow>
      <CeramicMaterial />
    </mesh>
  );
}
