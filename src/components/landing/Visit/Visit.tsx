import { SceneSection } from "@/components/landing/SceneSection/SceneSection";
import { SectionHeading } from "@/components/landing/SectionHeading/SectionHeading";
import { ButtonLink } from "@/components/ui/Button/Button";
import { Reveal } from "@/components/ui/Reveal/Reveal";
import { VISIT } from "@/content/landing";
import styles from "./Visit.module.css";

export function Visit() {
  return (
    <SceneSection
      id="visitanos"
      theme="dark"
      align="center"
      labelledBy="visitanos-title"
      className={styles.visit}
      backdrop={<div className={styles.glow} />}
    >
      <SectionHeading id="visitanos-title" eyebrow={VISIT.eyebrow} title={VISIT.title} body={VISIT.body} />

      <Reveal delay={240}>
        <dl className={styles.hours}>
          {VISIT.hours.map((slot) => (
            <div key={slot.days} className={styles.slot}>
              <dt>{slot.days}</dt>
              <dd>{slot.time}</dd>
            </div>
          ))}
        </dl>
        <p className={styles.address}>{VISIT.address}</p>
      </Reveal>

      <Reveal delay={320}>
        <div className={styles.actions}>
          <ButtonLink href={VISIT.primary.href}>{VISIT.primary.label}</ButtonLink>
          <ButtonLink href={VISIT.secondary.href} variant="secondary">
            {VISIT.secondary.label}
          </ButtonLink>
        </div>
      </Reveal>
    </SceneSection>
  );
}
