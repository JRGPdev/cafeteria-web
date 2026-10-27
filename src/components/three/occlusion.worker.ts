import { bakeSceneOcclusion } from "./ambientOcclusion";

// Hilo aparte: el horneado (~cientos de miles de rayos) no congela la página ni la pantalla de carga.
self.onmessage = () => {
  const result = bakeSceneOcclusion();
  (self as unknown as Worker).postMessage(result, [
    result.cupBody.buffer,
    result.handle.buffer,
    result.saucer.buffer,
  ]);
};
