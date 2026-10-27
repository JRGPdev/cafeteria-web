"use client";

import { useEffect, useRef, useState } from "react";
import { BRAND } from "@/content/landing";
import { cx } from "@/lib/cx";
import { loadingStore } from "@/lib/loading";
import { prefersReducedMotion } from "@/lib/motion";
import styles from "./Preloader.module.css";

/** Mensajes según el avance: la carga cuenta cómo se prepara un café. */
const MESSAGES: Array<[number, string]> = [
  [0, "Moliendo los granos"],
  [0.3, "Calentando el agua a 93 °C"],
  [0.6, "Extrayendo el espresso"],
  [0.88, "Sirviendo la crema"],
];

const MIN_VISIBLE_MS = 1800;
const FULL_HOLD_MS = 500;
/** Avance máximo por frame (~0,8 s de vacío a lleno a 60 fps). */
const MAX_STEP = 0.02;
const EXIT_MS = 1300;
/** Si WebGL falla o tarda demasiado, no dejamos al visitante bloqueado. */
const FAILSAFE_MS = 12000;

// Taza en línea (mismo lenguaje que el icono de la navbar), dibujada en un viewBox de 200×180.
const CUP = "M44 66 H146 C146 116 128 146 95 146 C62 146 44 116 44 66 Z";
const CUP_INNER = "M47 68 H143 C143 114 126 143 95 143 C64 143 47 114 47 68 Z";
const HANDLE = "M145 84 C172 80 174 124 136 124";
const SAUCER = "M16 152 C42 168 148 168 174 152";
const WAVE = "M0 0 Q25 -5 50 0 T100 0 T150 0 T200 0 T250 0 T300 0 T350 0 T400 0 V110 H0 Z";
const STEAM = [
  "M80 54 C72 44 88 38 80 26 C72 16 86 10 80 0",
  "M95 54 C103 44 87 38 95 26 C103 16 89 10 95 0",
  "M110 54 C102 44 118 38 110 26 C102 16 116 10 110 0",
];

type Phase = "loading" | "leaving" | "gone";

export function Preloader() {
  const root = useRef<HTMLDivElement>(null);
  const percent = useRef<HTMLSpanElement>(null);
  const liquid = useRef<SVGGElement>(null);
  const steam = useRef<SVGGElement>(null);
  const bar = useRef<HTMLSpanElement>(null);
  const [message, setMessage] = useState(MESSAGES[0][1]);
  const [phase, setPhase] = useState<Phase>("loading");

  // Bucle de progreso: avanza suave hacia el valor real y "gotea" mientras espera,
  // sin pasar del 94 % hasta que la escena confirma que ya pintó.
  useEffect(() => {
    const html = document.documentElement;
    html.dataset.loading = "";

    const reduced = prefersReducedMotion();
    const start = performance.now();
    let shown = 0;
    let fullAt = 0;
    let frame = 0;

    const tick = (now: number) => {
      const element = root.current;
      const { progress, sceneReady } = loadingStore.getState();
      const ceiling = sceneReady ? 1 : 0.94;
      const target = Math.min(ceiling, Math.max(progress, shown + 0.0012));
      // Paso limitado: aunque el progreso real salte, el café se ve subir.
      const step = Math.min((target - shown) * 0.08, MAX_STEP);
      shown += sceneReady ? Math.max(step, 0.004) : step;
      if (sceneReady && shown >= 0.998) shown = 1;
      if (shown === 1 && !fullAt) fullAt = now;

      // Se escribe solo en los elementos que cambian (transform/opacity = sin repintar).
      element?.setAttribute("aria-valuenow", String(Math.round(shown * 100)));
      liquid.current?.setAttribute("transform", `translate(0 ${(148 - shown * 74).toFixed(2)})`);
      if (steam.current) steam.current.style.opacity = (shown * 0.9).toFixed(3);
      if (bar.current) bar.current.style.transform = `scaleX(${shown.toFixed(4)})`;
      if (percent.current) percent.current.textContent = String(Math.round(shown * 100));
      setMessage(MESSAGES.findLast(([from]) => shown >= from)![1]);

      // Taza llena un instante antes de salir (el "listo" se tiene que ver).
      if (fullAt && now - fullAt > (reduced ? 0 : FULL_HOLD_MS) && now - start > (reduced ? 400 : MIN_VISIBLE_MS)) {
        setPhase("leaving");
        return;
      }
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    const failsafe = window.setTimeout(() => loadingStore.markSceneReady(), FAILSAFE_MS);

    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(failsafe);
    };
  }, []);

  // Salida: el telón sube y el hero arranca sus animaciones a la vez.
  useEffect(() => {
    if (phase !== "leaving") return;
    const html = document.documentElement;
    html.dataset.loaded = "";

    const timeout = window.setTimeout(() => {
      delete html.dataset.loading;
      loadingStore.markDone();
      setPhase("gone");
    }, EXIT_MS);
    return () => window.clearTimeout(timeout);
  }, [phase]);

  if (phase === "gone") return null;

  return (
    <div
      ref={root}
      data-theme="dark"
      className={cx(styles.loader, phase === "leaving" && styles.leaving)}
      role="progressbar"
      aria-label="Cargando la página"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={0}
    >
      <div className={styles.glow} aria-hidden />

      <div className={styles.content}>
        <svg className={styles.cup} viewBox="0 0 200 180" aria-hidden>
          <defs>
            <clipPath id="preloader-cup">
              <path d={CUP_INNER} />
            </clipPath>
            <linearGradient id="preloader-coffee" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#d9a35f" />
              <stop offset="0.07" stopColor="#a5652f" />
              <stop offset="0.2" stopColor="#4a250f" />
              <stop offset="1" stopColor="#1f0f06" />
            </linearGradient>
          </defs>

          <g ref={steam} className={styles.steam}>
            {STEAM.map((d, i) => (
              <path key={d} d={d} style={{ animationDelay: `${i * 0.45}s` }} />
            ))}
          </g>

          <g clipPath="url(#preloader-cup)">
            <g ref={liquid} transform="translate(0 148)">
              <path className={styles.waveBack} d={WAVE} />
              <path className={styles.waveFront} d={WAVE} fill="url(#preloader-coffee)" />
            </g>
          </g>

          <path className={styles.stroke} d={CUP} />
          <path className={styles.stroke} d={HANDLE} />
          <path className={styles.stroke} d={SAUCER} />
        </svg>

        <p className={styles.brand}>{BRAND.name}</p>
        <p className={styles.message}>
          <span key={message} className={styles.messageText}>
            {message}…
          </span>
        </p>
        <p className={styles.percent}>
          <span ref={percent}>0</span>
          <small>%</small>
        </p>
      </div>

      <div className={styles.bar} aria-hidden>
        <span ref={bar} />
      </div>
    </div>
  );
}
