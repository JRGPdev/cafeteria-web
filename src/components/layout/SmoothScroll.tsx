"use client";

import Lenis from "lenis";
import { useEffect } from "react";
import { loadingStore } from "@/lib/loading";
import { prefersReducedMotion } from "@/lib/motion";
import { measureSections } from "@/lib/scene-progress";

export function SmoothScroll() {
  useEffect(() => {
    measureSections();

    const lenis = prefersReducedMotion()
      ? null
      : new Lenis({ autoRaf: true, lerp: 0.085, anchors: true });

    // Fuentes, imágenes o resize cambian alturas: re-medimos las paradas.
    const observer = new ResizeObserver(() => measureSections());
    observer.observe(document.body);

    // Sin scroll mientras está la pantalla de carga.
    if (!loadingStore.getState().done) lenis?.stop();
    const unsubscribe = loadingStore.subscribe(() => {
      if (loadingStore.getState().done) lenis?.start();
    });

    return () => {
      unsubscribe();
      observer.disconnect();
      lenis?.destroy();
    };
  }, []);

  return null;
}
