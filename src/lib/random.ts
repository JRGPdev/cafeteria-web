/**
 * Generador pseudoaleatorio determinista (Park–Miller).
 * Mantiene la escena idéntica en cada carga y es seguro de usar durante el render.
 */
export function seededRandom(seed: number): () => number {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}
