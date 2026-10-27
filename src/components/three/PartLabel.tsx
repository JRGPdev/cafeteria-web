import type { Ref } from "react";
import styles from "./PartLabel.module.css";

interface PartLabelProps {
  ref?: Ref<HTMLDivElement>;
  index: string;
  title: string;
  detail: string;
}

/**
 * Etiqueta DOM de una pieza 3D. `CoffeeAssembly` la posiciona cada frame
 * proyectando el ancla 3D a pantalla y controla su opacidad.
 */
export function PartLabel({ ref, index, title, detail }: PartLabelProps) {
  return (
    <div ref={ref} className={styles.anchor}>
      <div className={styles.label}>
        <span className={styles.line} aria-hidden />
        <span className={styles.index}>{index}</span>
        <strong className={styles.title}>{title}</strong>
        <span className={styles.detail}>{detail}</span>
      </div>
    </div>
  );
}
