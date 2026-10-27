import type { ComponentProps } from "react";
import { cx } from "@/lib/cx";
import styles from "./Button.module.css";

type ButtonLinkProps = ComponentProps<"a"> & {
  variant?: "primary" | "secondary";
};

/** Botón del design system renderizado como enlace (las acciones de la landing navegan). */
export function ButtonLink({ variant = "primary", className, ...props }: ButtonLinkProps) {
  return <a className={cx(styles.button, styles[variant], className)} {...props} />;
}
