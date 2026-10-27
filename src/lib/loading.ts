/**
 * Estado de carga de la página, compartido entre la escena 3D (que informa)
 * y la pantalla de carga / scroll (que escuchan). Se consume con
 * `useSyncExternalStore`, sin contextos ni librerías.
 */

export interface LoadingState {
  /** Progreso real reportado (0–1). Nunca retrocede. */
  progress: number;
  /** La escena 3D ya pintó sus primeros frames. */
  sceneReady: boolean;
  /** La pantalla de carga terminó de salir: la página es interactiva. */
  done: boolean;
}

const INITIAL: LoadingState = { progress: 0, sceneReady: false, done: false };

let state: LoadingState = INITIAL;
const listeners = new Set<() => void>();

function update(patch: Partial<LoadingState>) {
  state = { ...state, ...patch };
  listeners.forEach((listener) => listener());
}

export const loadingStore = {
  getState: () => state,
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  report(progress: number) {
    if (progress > state.progress) update({ progress: Math.min(1, progress) });
  },
  markSceneReady() {
    if (!state.sceneReady) update({ sceneReady: true, progress: 1 });
  },
  markDone() {
    if (!state.done) update({ done: true });
  },
};
