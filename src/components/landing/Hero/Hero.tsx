import type { CSSProperties } from "react";
import { SceneSection } from "@/components/landing/SceneSection/SceneSection";
import { ButtonLink } from "@/components/ui/Button/Button";
import { HERO } from "@/content/landing";
import styles from "./Hero.module.css";

export function Hero() {
  const words = HERO.title.split(" ");

  return (
    <SceneSection
      id="inicio"
      theme="dark"
      labelledBy="hero-title"
      className={styles.hero}
      backdrop={
        <>
          <div className={styles.glow} />
          <span className={styles.watermark}>espresso</span>
        </>
      }
    >
      <p className={styles.eyebrow}>{HERO.eyebrow}</p>

      <h1 id="hero-title" className={styles.title} aria-label={HERO.title}>
        {words.map((word, i) => (
          <span key={`${word}-${i}`} className={styles.word} aria-hidden>
            <span style={{ "--i": i } as CSSProperties}>{word}</span>
          </span>
        ))}
      </h1>

      <p className={styles.body}>{HERO.body}</p>

      <div className={styles.actions}>
        <ButtonLink href={HERO.primary.href}>{HERO.primary.label}</ButtonLink>
        <ButtonLink href={HERO.secondary.href} variant="secondary">
          {HERO.secondary.label}
        </ButtonLink>
      </div>

      <a href="#anatomia" className={styles.scrollHint}>
        <span className={styles.scrollLine} aria-hidden />
        {HERO.scrollHint}
      </a>
    </SceneSection>
  );
}
