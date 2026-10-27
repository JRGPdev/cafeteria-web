import { bakeSceneOcclusion, type SceneOcclusion } from "./ambientOcclusion";

let pending: Promise<SceneOcclusion> | null = null;

/**
 * Oclusión ambiental de la cerámica, calculada en un Web Worker.
 * La promesa se cachea: todos los componentes (y React `use`) comparten la misma.
 * Si el navegador no admite workers de módulo, se calcula en el hilo principal.
 */
export function loadOcclusion(): Promise<SceneOcclusion> {
  pending ??= new Promise((resolve) => {
    const fallback = () => resolve(bakeSceneOcclusion());
    try {
      const worker = new Worker(new URL("./occlusion.worker.ts", import.meta.url), { type: "module" });
      worker.onmessage = (event: MessageEvent<SceneOcclusion>) => {
        resolve(event.data);
        worker.terminate();
      };
      worker.onerror = () => {
        worker.terminate();
        fallback();
      };
      worker.postMessage(null);
    } catch {
      fallback();
    }
  });
  return pending;
}
