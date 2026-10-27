import { SceneSection } from "@/components/landing/SceneSection/SceneSection";
import { SectionHeading } from "@/components/landing/SectionHeading/SectionHeading";
import { Reveal } from "@/components/ui/Reveal/Reveal";
import { ORIGIN } from "@/content/landing";
import styles from "./Origin.module.css";

export function Origin() {
  return (
    <SceneSection
      id="origen"
      labelledBy="origen-title"
      className={styles.origin}
      backdrop={<div className={styles.split} />}
    >
      <SectionHeading id="origen-title" eyebrow={ORIGIN.eyebrow} title={ORIGIN.title} body={ORIGIN.body} />

      <Reveal delay={260}>
        <ul className={styles.chips} aria-label="Orígenes actuales">
          {ORIGIN.origins.map((origin) => (
            <li key={origin} className={styles.chip}>
              {origin}
            </li>
          ))}
        </ul>
      </Reveal>

      <Reveal delay={340}>
        <p className={styles.note}>{ORIGIN.note}</p>
      </Reveal>
    </SceneSection>
  );
}
