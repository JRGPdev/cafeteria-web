import * as THREE from "three";
import { mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils.js";

/**
 * Modelos procedurales: se generan por revolución (lathe) a partir de un perfil 2D
 * suavizado con splines, así no dependemos de archivos .glb y todo pesa unos KB.
 * Unidades: 1 ≈ radio exterior de la boca de la taza (≈ 4 cm reales).
 */

type Point = [number, number];

const LATHE_SEGMENTS = 128;

/** Interpola los puntos de control con Catmull-Rom para tener siluetas sin facetas. */
function smoothProfile(points: Point[], divisions = 220): THREE.Vector2[] {
  const curve = new THREE.SplineCurve(points.map(([x, y]) => new THREE.Vector2(x, y)));
  return curve.getSpacedPoints(divisions).map((p) => new THREE.Vector2(Math.max(0, p.x), p.y));
}

/** Altura del nivel del café y radio interior de la taza a esa altura. */
export const COFFEE_LEVEL = 0.98;
export const COFFEE_RADIUS = 0.915;

/** Altura del asiento del platillo sobre su base. */
export const SAUCER_SEAT = 0.118;

// Taza: base con anillo de pie → pared exterior → labio redondeado → pared interior (≈4 mm de grosor).
const CUP_PROFILE: Point[] = [
  [0, 0.03],
  [0.4, 0.03],
  [0.47, 0.012],
  [0.52, 0],
  [0.57, 0.004],
  [0.6, 0.028],
  [0.64, 0.09],
  [0.72, 0.22],
  [0.83, 0.45],
  [0.92, 0.72],
  [0.975, 0.98],
  [1.0, 1.12],
  [1.012, 1.168],
  [0.997, 1.194],
  [0.966, 1.19],
  [0.946, 1.16],
  [0.93, 1.1],
  [0.895, 0.9],
  [0.84, 0.7],
  [0.745, 0.45],
  [0.6, 0.25],
  [0.4, 0.15],
  [0.18, 0.125],
  [0, 0.12],
];

// Volumen del café: copia el interior de la taza (un pelo más estrecho para no pelearse con la pared).
const COFFEE_BODY_PROFILE: Point[] = [
  [0, 0.128],
  [0.18, 0.133],
  [0.395, 0.158],
  [0.592, 0.257],
  [0.736, 0.457],
  [0.83, 0.705],
  [0.884, 0.9],
  [0.9, COFFEE_LEVEL],
];

// Superficie de la crema: plana con un menisco que sube contra la pared.
// Se recorre del borde al centro para que las normales miren hacia arriba.
const CREMA_PROFILE: Point[] = [
  [COFFEE_RADIUS, COFFEE_LEVEL + 0.03],
  [0.885, COFFEE_LEVEL + 0.014],
  [0.8, COFFEE_LEVEL + 0.007],
  [0.5, COFFEE_LEVEL + 0.005],
  [0, COFFEE_LEVEL + 0.004],
];

// Platillo: pie → cara inferior → borde enrollado → cara superior → anillo donde apoya la taza.
const SAUCER_PROFILE: Point[] = [
  [0, 0.035],
  [0.5, 0.035],
  [0.56, 0.006],
  [0.62, 0],
  [0.68, 0.02],
  [0.9, 0.07],
  [1.25, 0.15],
  [1.5, 0.24],
  [1.63, 0.31],
  [1.665, 0.345],
  [1.648, 0.368],
  [1.612, 0.362],
  [1.5, 0.305],
  [1.2, 0.205],
  [0.85, 0.14],
  [0.72, 0.13],
  [0.66, 0.136],
  [0.6, 0.128],
  [0.3, SAUCER_SEAT],
  [0, SAUCER_SEAT],
];

export const createCupGeometry = () => new THREE.LatheGeometry(smoothProfile(CUP_PROFILE), LATHE_SEGMENTS);

export const createCoffeeGeometry = () =>
  new THREE.LatheGeometry(smoothProfile(COFFEE_BODY_PROFILE, 120), LATHE_SEGMENTS);

export const createSaucerGeometry = () =>
  new THREE.LatheGeometry(smoothProfile(SAUCER_PROFILE), LATHE_SEGMENTS);

/** Superficie de la crema con UV planas (la textura se proyecta desde arriba, no se enrolla). */
export function createCremaGeometry() {
  const geometry = new THREE.LatheGeometry(smoothProfile(CREMA_PROFILE, 60), LATHE_SEGMENTS);
  const position = geometry.attributes.position;
  const uv = geometry.attributes.uv;
  for (let i = 0; i < position.count; i++) {
    uv.setXY(i, position.getX(i) / (2 * COFFEE_RADIUS) + 0.5, position.getZ(i) / (2 * COFFEE_RADIUS) + 0.5);
  }
  return geometry;
}

/**
 * Asa: barrido de una sección elíptica a lo largo de una curva en "C".
 * Más ancha de canto que de grosor y algo más gruesa arriba, como un asa real.
 * Los extremos quedan embebidos en la pared de la taza.
 */
export function createHandleGeometry() {
  const curve = new THREE.CatmullRomCurve3(
    [
      [0.93, 0.98],
      [1.12, 1.03],
      [1.32, 0.92],
      [1.39, 0.68],
      [1.29, 0.44],
      [1.06, 0.34],
      [0.8, 0.37],
    ].map(([x, y]) => new THREE.Vector3(x, y, 0)),
  );

  const tubular = 96;
  const radial = 32;
  const positions: number[] = [];
  const indices: number[] = [];
  const binormal = new THREE.Vector3(0, 0, 1);
  const tangent = new THREE.Vector3();
  const normal = new THREE.Vector3();
  const point = new THREE.Vector3();

  for (let i = 0; i <= tubular; i++) {
    const u = i / tubular;
    curve.getPointAt(u, point);
    curve.getTangentAt(u, tangent);
    normal.crossVectors(binormal, tangent).normalize();

    const taper = 1.08 - 0.22 * u; // más robusta donde se une arriba
    const thickness = 0.066 * taper; // en el plano del asa
    const width = 0.105 * taper; // de canto (eje z)

    for (let j = 0; j < radial; j++) {
      const a = (j / radial) * Math.PI * 2;
      positions.push(
        point.x + normal.x * Math.cos(a) * thickness,
        point.y + normal.y * Math.cos(a) * thickness,
        Math.sin(a) * width,
      );
    }
  }

  for (let i = 0; i < tubular; i++) {
    for (let j = 0; j < radial; j++) {
      const a = i * radial + j;
      const b = (i + 1) * radial + j;
      const c = (i + 1) * radial + ((j + 1) % radial);
      const d = i * radial + ((j + 1) % radial);
      indices.push(a, d, b, b, d, c); // antihorario visto desde fuera → normales hacia fuera
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

/** Gota en forma de lágrima: la cola apunta hacia +Y (se orienta contra la trayectoria). */
export function createDropletGeometry() {
  const geometry = new THREE.SphereGeometry(1, 24, 18);
  const position = geometry.attributes.position;
  for (let i = 0; i < position.count; i++) {
    const y = position.getY(i);
    if (y > 0) {
      const pinch = 1 - 0.85 * y * y; // se afina hacia la cola
      position.setXYZ(i, position.getX(i) * pinch, y * (1 + 1.8 * y * y), position.getZ(i) * pinch);
    }
  }
  geometry.computeVertexNormals();
  return geometry;
}

/** Grano de café: elipsoide aplanado con la hendidura central en forma de S. */
export function createBeanGeometry() {
  const base = new THREE.SphereGeometry(0.5, 32, 24);
  base.deleteAttribute("normal");
  base.deleteAttribute("uv");
  const geometry = mergeVertices(base);

  const position = geometry.attributes.position;
  const p = new THREE.Vector3();

  for (let i = 0; i < position.count; i++) {
    p.fromBufferAttribute(position, i);
    p.set(p.x * 0.7, p.y, p.z * 0.48);

    if (p.z > 0) {
      p.z *= 0.72; // cara plana
      const center = 0.045 * Math.sin(p.y * 7);
      const along = 1 - Math.min(1, Math.abs(p.y) / 0.5);
      const groove = Math.exp(-(((p.x - center) / 0.045) ** 2));
      p.z -= 0.13 * groove * Math.sqrt(along);
    }

    position.setXYZ(i, p.x, p.y, p.z);
  }

  geometry.computeVertexNormals();
  return geometry;
}
