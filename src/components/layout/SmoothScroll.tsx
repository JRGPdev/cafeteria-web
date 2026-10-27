"use client";

import Lenis from "lenis";
import { useEffect } from "react";
import { prefersReducedMotion } from "@/lib/motion";
import { measureSections } from "@/lib/scene-progress";

/** Scroll suave (Lenis) + medición de secciones para la escena 3D. */
export function SmoothScroll() {
  useEffect(() => {
    measureSections();

    const lenis = prefersReducedMotion()
      ? null
      : new Lenis({ autoRaf: true, lerp: 0.085, anchors: true });

    // Fuentes, imágenes o resize cambian alturas: re-medimos las paradas.
    const observer = new ResizeObserver(() => measureSections());
    observer.observe(document.body);

    return () => {
      observer.disconnect();
      lenis?.destroy();
    };
  }, []);

  return null;
}
