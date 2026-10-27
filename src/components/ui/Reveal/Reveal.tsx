"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { cx } from "@/lib/cx";
import styles from "./Reveal.module.css";

interface RevealProps {
  children: ReactNode;
  /** Retraso en ms para escalonar varios elementos. */
  delay?: number;
  className?: string;
}

/**
 * Aparece al entrar en pantalla y se oculta al salir,
 * así la animación se repite al volver con el scroll.
 */
export function Reveal({ children, delay = 0, className }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), {
      rootMargin: "0px 0px -12% 0px",
      threshold: 0.15,
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cx(styles.reveal, visible && styles.visible, className)}
      style={{ "--reveal-delay": `${delay}ms` } as CSSProperties}
    >
      {children}
    </div>
  );
}
