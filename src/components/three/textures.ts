import * as THREE from "three";
import { seededRandom } from "@/lib/random";

type Ctx = CanvasRenderingContext2D;

function createCanvas(size: number): [HTMLCanvasElement, Ctx] {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  return [canvas, canvas.getContext("2d")!];
}

/**
 * Ruido suave tipo "value noise": una rejilla pequeña de valores aleatorios
 * escalada con interpolación. Varias octavas dan textura orgánica.
 */
function paintNoise(ctx: Ctx, size: number, random: () => number, octaves: Array<[number, number]>) {
  for (const [cells, alpha] of octaves) {
    const [small, sctx] = createCanvas(cells);
    const image = sctx.createImageData(cells, cells);
    for (let i = 0; i < image.data.length; i += 4) {
      const v = random() * 255;
      image.data[i] = image.data[i + 1] = image.data[i + 2] = v;
      image.data[i + 3] = 255;
    }
    sctx.putImageData(image, 0, 0);
    ctx.globalAlpha = alpha;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(small, 0, 0, size, size);
  }
  ctx.globalAlpha = 1;
}

/** Burbujas de la crema: más grandes y abundantes cerca del borde, como en un espresso real. */
function paintBubbles(ctx: Ctx, size: number, random: () => number, mode: "color" | "bump") {
  const c = size / 2;
  for (let i = 0; i < 2600; i++) {
    const edge = Math.pow(random(), 0.45); // sesgo hacia el borde
    const radius = edge * c * 0.97;
    const angle = random() * Math.PI * 2;
    const x = c + Math.cos(angle) * radius;
    const y = c + Math.sin(angle) * radius;
    const r = (0.4 + random() * (edge > 0.85 ? 3.2 : 1.4)) * (size / 1024);

    if (mode === "bump") {
      ctx.fillStyle = `rgba(255,255,255,${0.35 + random() * 0.4})`;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.strokeStyle = `rgba(70, 38, 18, ${0.25 + random() * 0.3})`;
      ctx.lineWidth = Math.max(0.6, r * 0.35);
      ctx.fillStyle = `rgba(232, 196, 150, ${0.18 + random() * 0.25})`;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
  }
}

function toTexture(canvas: HTMLCanvasElement, srgb: boolean) {
  const texture = new THREE.CanvasTexture(canvas);
  if (srgb) texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}

/** Color de la crema: avellana claro al centro, moteado "tigre" y anillo oscuro contra la taza. */
export function createCremaTexture(size = 1024): THREE.CanvasTexture {
  const [canvas, ctx] = createCanvas(size);
  const c = size / 2;
  const random = seededRandom(7);

  const base = ctx.createRadialGradient(c * 0.94, c * 0.92, 0, c, c, c);
  base.addColorStop(0, "#c99a66");
  base.addColorStop(0.35, "#b9844f");
  base.addColorStop(0.7, "#a06a38");
  base.addColorStop(0.88, "#83502a");
  base.addColorStop(0.955, "#5a321a");
  base.addColorStop(1, "#2d170b");
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, size, size);

  // Moteado: el ruido oscurece y aclara zonas de forma irregular.
  const [noise, nctx] = createCanvas(size);
  paintNoise(nctx, size, random, [
    [10, 1],
    [28, 0.55],
    [80, 0.25],
    [256, 0.08],
  ]);
  ctx.globalCompositeOperation = "overlay";
  ctx.globalAlpha = 0.42;
  ctx.drawImage(noise, 0, 0);

  // Manchas "tigre": puntos oscuros difuminados repartidos por toda la crema.
  ctx.globalCompositeOperation = "multiply";
  ctx.globalAlpha = 1;
  ctx.filter = `blur(${size / 260}px)`;
  for (let i = 0; i < 900; i++) {
    const radius = Math.sqrt(random()) * c * 0.92;
    const angle = random() * Math.PI * 2;
    ctx.fillStyle = `rgba(120, 72, 38, ${0.12 + random() * 0.18})`;
    ctx.beginPath();
    ctx.arc(c + Math.cos(angle) * radius, c + Math.sin(angle) * radius, (2 + random() * 6) * (size / 1024), 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.filter = "none";
  ctx.globalCompositeOperation = "source-over";

  paintBubbles(ctx, size, random, "color");

  return toTexture(canvas, true);
}

/** Relieve de la crema (burbujas y espuma) para que la luz rasante la "pique". */
export function createCremaBumpTexture(size = 1024): THREE.CanvasTexture {
  const [canvas, ctx] = createCanvas(size);
  const random = seededRandom(19);
  ctx.fillStyle = "#808080";
  ctx.fillRect(0, 0, size, size);
  ctx.globalCompositeOperation = "overlay";
  paintNoise(ctx, size, random, [
    [48, 0.45],
    [160, 0.25],
    [512, 0.1],
  ]);
  ctx.globalCompositeOperation = "source-over";
  paintBubbles(ctx, size, random, "bump");
  return toTexture(canvas, false);
}

/** Micro-variación de rugosidad del esmalte: rompe el brillo "perfecto" de ordenador. */
export function createGlazeRoughnessTexture(size = 512): THREE.CanvasTexture {
  const [canvas, ctx] = createCanvas(size);
  const random = seededRandom(31);
  ctx.fillStyle = "#2a2a2a";
  ctx.fillRect(0, 0, size, size);
  ctx.globalCompositeOperation = "lighter";
  paintNoise(ctx, size, random, [
    [8, 0.08],
    [48, 0.06],
    [256, 0.05],
  ]);
  const texture = toTexture(canvas, false);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  return texture;
}
