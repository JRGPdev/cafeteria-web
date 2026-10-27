import type { ReactNode } from "react";
import { cx } from "@/lib/cx";
import styles from "./SceneSection.module.css";

interface SceneSectionProps {
  id: string;
  children: ReactNode;
  /** Columna de texto: a la izquierda, derecha o centrada (deja sitio a la taza). */
  align?: "start" | "end" | "center";
  /** Fuerza la paleta oscura del design system en esta sección. */
  theme?: "light" | "dark";
  /** Elementos decorativos detrás de la escena 3D. */
  backdrop?: ReactNode;
  className?: string;
  labelledBy?: string;
}

/**
 * Sección de la landing que actúa como "parada" de la escena 3D
 * (ver `data-scene-section` en lib/scene-progress).
 */
export function SceneSection({
  id,
  children,
  align = "start",
  theme = "light",
  backdrop,
  className,
  labelledBy,
}: SceneSectionProps) {
  return (
    <section
      id={id}
      data-scene-section
      data-theme={theme === "dark" ? "dark" : undefined}
      aria-labelledby={labelledBy}
      className={cx(styles.section, className)}
    >
      {backdrop && (
        <div className={styles.backdrop} aria-hidden>
          {backdrop}
        </div>
      )}
      <div className={cx(styles.inner, styles[align])}>
        <div className={styles.content}>{children}</div>
      </div>
    </section>
  );
}
