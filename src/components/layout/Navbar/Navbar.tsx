import { ButtonLink } from "@/components/ui/Button/Button";
import { BRAND, NAV_LINKS } from "@/content/landing";
import styles from "./Navbar.module.css";

function CupIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M4 9h12v4a6 6 0 0 1-6 6h0a6 6 0 0 1-6-6V9Z" />
      <path d="M16 10.5h1.5a2.5 2.5 0 0 1 0 5H15.5" />
      <path d="M8 3.5c0 1 1 1.5 1 2.5M12 3.5c0 1 1 1.5 1 2.5" />
      <path d="M3 21.5h14" />
    </svg>
  );
}

export function Navbar() {
  return (
    <header className={styles.header}>
      <nav className={styles.nav} aria-label="Principal">
        <a href="#inicio" className={styles.brand}>
          <CupIcon />
          <span>{BRAND.name}</span>
        </a>

        <ul className={styles.links}>
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <a href={link.href} className={styles.link}>
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <ButtonLink href="#visitanos" className={styles.cta}>
          Reservar
        </ButtonLink>
      </nav>
    </header>
  );
}
