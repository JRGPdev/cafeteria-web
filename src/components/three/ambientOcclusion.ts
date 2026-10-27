import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { MeshBVH } from "three-mesh-bvh";

/**
 * Oclusión ambiental "horneada" en los vértices (atributo `color`).
 *
 * Desde cada vértice se lanzan rayos en el hemisferio de su normal: cuanta más
 * geometría cercana encuentran, más oscuro queda ese punto. Es lo que oscurece
 * el fondo de la taza, la zona bajo el labio y la unión del asa, como en una foto.
 * Se calcula una sola vez al cargar (no cuesta nada por frame).
 */

interface BakeOptions {
  samples: number;
  /** Distancia máxima a la que un obstáculo todavía oscurece. */
  distance: number;
  /** 0 = sin efecto, 1 = negro total en oclusión completa. */
  strength: number;
}

/** Direcciones repartidas uniformemente (espiral de Fibonacci) con peso coseno. */
function hemisphereDirections(count: number): THREE.Vector3[] {
  const golden = Math.PI * (3 - Math.sqrt(5));
  return Array.from({ length: count }, (_, i) => {
    const r = Math.sqrt((i + 0.5) / count);
    const theta = i * golden;
    return new THREE.Vector3(r * Math.cos(theta), r * Math.sin(theta), Math.sqrt(1 - r * r));
  });
}

function positionsOnly(geometry: THREE.BufferGeometry) {
  const copy = new THREE.BufferGeometry();
  copy.setAttribute("position", geometry.attributes.position);
  if (geometry.index) copy.setIndex(geometry.index);
  return copy;
}

export class OcclusionBaker {
  private bvh: MeshBVH;
  private directions: THREE.Vector3[];
  private ray = new THREE.Ray();
  private tangent = new THREE.Vector3();
  private bitangent = new THREE.Vector3();
  private dir = new THREE.Vector3();

  constructor(
    occluders: THREE.BufferGeometry[],
    private options: BakeOptions,
  ) {
    const merged = mergeGeometries(occluders.map(positionsOnly));
    this.bvh = new MeshBVH(merged);
    this.directions = hemisphereDirections(options.samples);
  }

  /** Factor de luz (0–1) para un punto con su normal. */
  sample(point: THREE.Vector3, normal: THREE.Vector3): number {
    const { distance, strength } = this.options;
    const helper = Math.abs(normal.y) < 0.9 ? THREE.Object3D.DEFAULT_UP : new THREE.Vector3(1, 0, 0);
    this.tangent.crossVectors(helper, normal).normalize();
    this.bitangent.crossVectors(normal, this.tangent);

    let occlusion = 0;
    for (const d of this.directions) {
      this.dir
        .copy(this.tangent)
        .multiplyScalar(d.x)
        .addScaledVector(this.bitangent, d.y)
        .addScaledVector(normal, d.z);
      this.ray.origin.copy(point).addScaledVector(normal, 0.004);
      this.ray.direction.copy(this.dir);
      const hit = this.bvh.raycastFirst(this.ray, THREE.DoubleSide, 0, distance);
      if (hit) occlusion += 1 - hit.distance / distance;
    }
    return 1 - strength * (occlusion / this.directions.length);
  }
}

/** Escribe el factor de luz como color de vértice (gris) para que lo use `vertexColors`. */
export function writeOcclusion(geometry: THREE.BufferGeometry, values: Float32Array) {
  const colors = new Float32Array(values.length * 3);
  values.forEach((v, i) => colors.set([v, v, v], i * 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
}

/**
 * Para piezas de revolución la oclusión es igual en todo el giro: basta con
 * calcular una columna del perfil y copiarla. `refine` permite recalcular
 * vértice a vértice donde se rompe la simetría (p. ej. junto al asa).
 */
export function bakeLatheOcclusion(
  geometry: THREE.LatheGeometry,
  baker: OcclusionBaker,
  refine?: { baker: OcclusionBaker; where: (point: THREE.Vector3, normal: THREE.Vector3) => boolean },
) {
  const { points, segments } = geometry.parameters;
  const position = geometry.attributes.position;
  const normal = geometry.attributes.normal;
  const count = position.count;
  const values = new Float32Array(count);
  const p = new THREE.Vector3();
  const n = new THREE.Vector3();

  const column = points.map((_, j) => {
    p.fromBufferAttribute(position, j);
    n.fromBufferAttribute(normal, j);
    return baker.sample(p, n);
  });

  for (let i = 0; i <= segments; i++) {
    for (let j = 0; j < points.length; j++) {
      const index = i * points.length + j;
      values[index] = column[j];
      if (refine) {
        p.fromBufferAttribute(position, index);
        n.fromBufferAttribute(normal, index);
        if (refine.where(p, n)) values[index] = refine.baker.sample(p, n);
      }
    }
  }

  writeOcclusion(geometry, values);
}

/** Oclusión vértice a vértice para geometrías sin simetría (el asa). */
export function bakeOcclusion(geometry: THREE.BufferGeometry, baker: OcclusionBaker) {
  const position = geometry.attributes.position;
  const normal = geometry.attributes.normal;
  const values = new Float32Array(position.count);
  const p = new THREE.Vector3();
  const n = new THREE.Vector3();
  for (let i = 0; i < position.count; i++) {
    p.fromBufferAttribute(position, i);
    n.fromBufferAttribute(normal, i);
    values[i] = baker.sample(p, n);
  }
  writeOcclusion(geometry, values);
}
