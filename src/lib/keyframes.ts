export type Vec3 = [number, number, number];

export interface Pose {
  position: Vec3;
  rotation: Vec3;
  scale: number;
}

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

/** Curva suave entre paradas: arranca y llega despacio. */
const ease = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Devuelve el índice base y la fracción suavizada para un progreso dado. */
function locate(length: number, progress: number): [number, number] {
  const p = clamp(progress, 0, length - 1);
  const i = Math.min(Math.floor(p), length - 2);
  return [i, ease(p - i)];
}

export function sampleNumber(track: readonly number[], progress: number): number {
  if (track.length === 1) return track[0];
  const [i, t] = locate(track.length, progress);
  return lerp(track[i], track[i + 1], t);
}

/** Interpola una pista de poses y escribe el resultado en `out` (sin crear objetos por frame). */
export function samplePose(track: readonly Pose[], progress: number, out: Pose): Pose {
  if (track.length === 1) {
    const only = track[0];
    out.position = [...only.position];
    out.rotation = [...only.rotation];
    out.scale = only.scale;
    return out;
  }

  const [i, t] = locate(track.length, progress);
  const a = track[i];
  const b = track[i + 1];

  for (let k = 0; k < 3; k++) {
    out.position[k] = lerp(a.position[k], b.position[k], t);
    out.rotation[k] = lerp(a.rotation[k], b.rotation[k], t);
  }
  out.scale = lerp(a.scale, b.scale, t);
  return out;
}

export const createPose = (): Pose => ({
  position: [0, 0, 0],
  rotation: [0, 0, 0],
  scale: 1,
});
