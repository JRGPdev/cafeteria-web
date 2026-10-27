import { use, useEffect, useMemo } from "react";
import { writeOcclusion } from "../ambientOcclusion";
import { createCupGeometry, createHandleGeometry } from "../geometry";
import { CeramicMaterial } from "../materials";
import { loadOcclusion } from "../occlusion";

export function Cup() {
  // Suspende hasta que el Worker entrega la oclusión horneada.
  const occlusion = use(loadOcclusion());

  const { body, handle } = useMemo(() => {
    const body = createCupGeometry();
    const handle = createHandleGeometry();
    writeOcclusion(body, occlusion.cupBody);
    writeOcclusion(handle, occlusion.handle);
    return { body, handle };
  }, [occlusion]);

  useEffect(
    () => () => {
      body.dispose();
      handle.dispose();
    },
    [body, handle],
  );

  return (
    <group>
      <mesh geometry={body} castShadow receiveShadow>
        <CeramicMaterial />
      </mesh>
      <mesh geometry={handle} castShadow receiveShadow>
        <CeramicMaterial />
      </mesh>
    </group>
  );
}
