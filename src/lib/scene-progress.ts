/**
 * Progreso de scroll expresado en "secciones".
 *
 * Cada <section data-scene-section> es una parada de la coreografía 3D.
 * Si el scroll está justo al inicio de la sección 2, el progreso es 2.0;
 * a mitad de camino hacia la 3, es 2.5. Así la animación queda alineada
 * con el contenido sin depender de alturas fijas.
 */

const SECTION_SELECTOR = "[data-scene-section]";

let sectionTops: number[] = [];

export function measureSections(): void {
  if (typeof document === "undefined") return;
  const sections = document.querySelectorAll<HTMLElement>(SECTION_SELECTOR);
  sectionTops = Array.from(
    sections,
    (el) => el.getBoundingClientRect().top + window.scrollY,
  );
}

export function getSceneProgress(): number {
  if (typeof window === "undefined") return 0;
  if (sectionTops.length === 0) measureSections();
  if (sectionTops.length < 2) return 0;

  const y = window.scrollY;
  const last = sectionTops.length - 1;

  if (y <= sectionTops[0]) return 0;

  for (let i = 0; i < last; i++) {
    const start = sectionTops[i];
    const end = sectionTops[i + 1];
    if (y < end) return i + (y - start) / (end - start);
  }

  return last;
}

/** Estado compartido con la escena: el progreso ya suavizado por frame. */
export const sceneState = {
  progress: 0,
};
