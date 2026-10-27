import { BRAND } from "@/content/landing";
import styles from "./Footer.module.css";

export function Footer() {
  return (
    <footer className={styles.footer} data-theme="dark">
      <p className={styles.brand}>{BRAND.name}</p>
      <p className={styles.copy}>
        © {BRAND.name}. Hecho con calma.
      </p>
    </footer>
  );
}
