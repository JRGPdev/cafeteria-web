"use client";

import { useEffect, useState } from "react";
import { SECTIONS } from "@/content/landing";
import { cx } from "@/lib/cx";
import { getSceneProgress } from "@/lib/scene-progress";
import styles from "./SectionIndicator.module.css";

/** Puntos laterales que muestran en qué parada de la historia estás. */
export function SectionIndicator() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setActive(Math.round(getSceneProgress())));
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <nav className={styles.indicator} aria-label="Secciones">
      <ol>
        {SECTIONS.map((section, i) => (
          <li key={section.id}>
            <a
              href={`#${section.id}`}
              className={cx(styles.dot, i === active && styles.active)}
              aria-current={i === active ? "true" : undefined}
            >
              <span className={styles.label}>{section.label}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
