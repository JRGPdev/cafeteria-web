"use client";

import dynamic from "next/dynamic";

// WebGL solo existe en el navegador: la escena no se prerenderiza.
const CoffeeScene = dynamic(() => import("./CoffeeScene"), { ssr: false });

export function SceneLoader() {
  return <CoffeeScene />;
}
