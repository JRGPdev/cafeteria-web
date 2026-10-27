import { use, useEffect, useMemo } from "react";
import { writeOcclusion } from "../ambientOcclusion";
import { createSaucerGeometry } from "../geometry";
import { CeramicMaterial } from "../materials";
import { loadOcclusion } from "../occlusion";

export function Saucer() {
  const occlusion = use(loadOcclusion());

  const geometry = useMemo(() => {
    const saucer = createSaucerGeometry();
    writeOcclusion(saucer, occlusion.saucer);
    return saucer;
  }, [occlusion]);

  useEffect(() => () => geometry.dispose(), [geometry]);

  return (
    <mesh geometry={geometry} castShadow receiveShadow>
      <CeramicMaterial />
    </mesh>
  );
}
