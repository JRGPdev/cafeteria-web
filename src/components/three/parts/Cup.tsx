import { useEffect, useMemo } from "react";
import { bakeLatheOcclusion, bakeOcclusion, OcclusionBaker } from "../ambientOcclusion";
import { createCupGeometry, createHandleGeometry } from "../geometry";
import { CeramicMaterial } from "../materials";

const AO = { distance: 0.45, strength: 0.75 };

function createCup() {
  const body = createCupGeometry();
  const handle = createHandleGeometry();

  // El cuerpo es simétrico salvo junto al asa: allí se recalcula con el asa como obstáculo.
  const bodyOnly = new OcclusionBaker([body], { ...AO, samples: 48 });
  const withHandle = new OcclusionBaker([body, handle], { ...AO, samples: 16 });
  bakeLatheOcclusion(body, bodyOnly, {
    baker: withHandle,
    // Solo la pared exterior del lado del asa, a la altura del asa.
    where: (p, n) => n.x > 0.3 && Math.abs(p.z) < 0.6 && p.y > 0.2 && p.y < 1.15,
  });
  bakeOcclusion(handle, withHandle);

  return { body, handle };
}

export function Cup() {
  const { body, handle } = useMemo(() => createCup(), []);

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
