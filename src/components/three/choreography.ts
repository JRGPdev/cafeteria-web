import type { Pose } from "@/lib/keyframes";
import { SAUCER_SEAT } from "./geometry";

/**
 * Coreografía de la escena: una parada por sección de la landing.
 *   0 Hero · 1 Anatomía · 2 Espresso · 3 Origen · 4 Visítanos
 *
 * `RIG` mueve el conjunto completo; el resto son desplazamientos locales
 * de cada pieza dentro del conjunto (así "explotan" sin perder la composición).
 */

const pose = (
  position: Pose["position"],
  rotation: Pose["rotation"] = [0, 0, 0],
  scale = 1,
): Pose => ({ position, rotation, scale });

const ASSEMBLED = pose([0, 0, 0]);
const SAUCER_ASSEMBLED = pose([0, -SAUCER_SEAT, 0]);

export const RIG: Pose[] = [
  pose([1.55, -0.85, 0], [0.38, -0.55, 0.06], 1.05),
  pose([1.7, -0.7, 0], [0.18, 0.5, -0.05], 0.74),
  pose([-1.55, -0.2, 0], [0.7, -0.3, 0.05], 0.95),
  pose([1.75, -0.05, 0], [1.42, 0.8, 0], 1.08),
  pose([0, -2, 0], [0.38, -0.7, 0], 0.78),
];

export const CUP: Pose[] = [
  ASSEMBLED,
  pose([0, 1.65, 0], [0, 0.5, 0.12]),
  pose([0.3, 2.95, -0.4], [-0.25, 1.2, 0.22]),
  ASSEMBLED,
  ASSEMBLED,
];

export const COFFEE: Pose[] = [
  ASSEMBLED,
  pose([0, 0.6, 0]),
  pose([0, 0.35, 0.2], [0.12, 0, 0], 1.18),
  ASSEMBLED,
  ASSEMBLED,
];

export const SAUCER: Pose[] = [
  SAUCER_ASSEMBLED,
  pose([0, -0.85, 0], [0.1, 0, -0.06]),
  pose([0.4, -3.6, 1.2], [0.6, 0, 0.3]),
  SAUCER_ASSEMBLED,
  SAUCER_ASSEMBLED,
];

/** Cuánto se alejan las gotas de la corona del centro. */
export const SPLASH_SPREAD = [0, 1, 1.8, 2.4, 0];
/** Tamaño de las gotas (0 = ocultas). */
export const SPLASH_SIZE = [1, 0.85, 0, 0, 0];
/** Sombra de contacto bajo el platillo (como si apoyara en una mesa). */
export const CONTACT_SHADOW = [0.6, 0.35, 0, 0.8, 0.65];
/** Opacidad del vapor. */
export const STEAM_OPACITY = [0.2, 0, 0, 0, 1];
/** Opacidad de las etiquetas de piezas (solo en Anatomía). */
export const LABEL_OPACITY = [0, 1, 0, 0, 0];
/** Velocidad extra de deriva de los granos. */
export const BEANS_DRIFT = [0, 0.6, 1.2, 2.4, 3];
