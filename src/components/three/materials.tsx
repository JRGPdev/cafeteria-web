import { useEffect, useMemo } from "react";
import { createGlazeRoughnessTexture } from "./textures";

/** Colores físicos de la escena (más saturados que la UI para compensar la iluminación). */
export const SCENE_COLORS = {
  ceramic: "#f8f6f2",
  coffee: "#1b0d05",
} as const;

/**
 * Esmalte cerámico: base blanca cálida con capa de barniz brillante (clearcoat).
 * Usa la oclusión ambiental horneada en el color de vértice (ver ambientOcclusion.ts),
 * por eso las geometrías que lo usan deben traer el atributo `color`.
 */
export function CeramicMaterial() {
  const roughnessMap = useMemo(() => createGlazeRoughnessTexture(), []);
  useEffect(() => () => roughnessMap.dispose(), [roughnessMap]);

  return (
    <meshPhysicalMaterial
      color={SCENE_COLORS.ceramic}
      vertexColors
      // El mapa (≈0.16–0.3) define la rugosidad final; `roughness` actúa como multiplicador.
      roughness={1}
      roughnessMap={roughnessMap}
      clearcoat={1}
      clearcoatRoughness={0.03}
      ior={1.52}
      specularIntensity={0.5}
    />
  );
}

/** Café líquido: casi negro, muy brillante, con reflejo rojizo en los bordes. */
export function CoffeeMaterial() {
  return (
    <meshPhysicalMaterial
      color={SCENE_COLORS.coffee}
      roughness={0.06}
      clearcoat={1}
      clearcoatRoughness={0.02}
      sheen={0.6}
      sheenColor="#7a3412"
      sheenRoughness={0.35}
      envMapIntensity={1.4}
    />
  );
}
