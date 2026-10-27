import { SceneSection } from "@/components/landing/SceneSection/SceneSection";
import { SectionHeading } from "@/components/landing/SectionHeading/SectionHeading";
import { Reveal } from "@/components/ui/Reveal/Reveal";
import { ESPRESSO } from "@/content/landing";
import styles from "./Espresso.module.css";

export function Espresso() {
  return (
    <SceneSection id="espresso" align="end" labelledBy="espresso-title" className={styles.espresso}>
      <SectionHeading id="espresso-title" eyebrow={ESPRESSO.eyebrow} title={ESPRESSO.title} body={ESPRESSO.body} />

      <dl className={styles.stats}>
        {ESPRESSO.stats.map((stat, i) => (
          <Reveal key={stat.label} delay={260 + i * 110} className={styles.stat}>
            <dt className={styles.label}>{stat.label}</dt>
            <dd className={styles.value}>
              {stat.value}
              <span className={styles.unit}>{stat.unit}</span>
            </dd>
          </Reveal>
        ))}
      </dl>
    </SceneSection>
  );
}
