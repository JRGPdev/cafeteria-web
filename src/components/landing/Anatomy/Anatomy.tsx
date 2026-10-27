import { SceneSection } from "@/components/landing/SceneSection/SceneSection";
import { SectionHeading } from "@/components/landing/SectionHeading/SectionHeading";
import { Reveal } from "@/components/ui/Reveal/Reveal";
import { ANATOMY } from "@/content/landing";
import styles from "./Anatomy.module.css";

export function Anatomy() {
  return (
    <SceneSection id="anatomia" labelledBy="anatomia-title" className={styles.anatomy}>
      <SectionHeading id="anatomia-title" eyebrow={ANATOMY.eyebrow} title={ANATOMY.title} body={ANATOMY.body} />

      {/* En escritorio ancho estas piezas se rotulan sobre el 3D; aquí quedan para pantallas menores y lectores de pantalla. */}
      <ol className={styles.parts}>
        {ANATOMY.parts.map((part, i) => (
          <li key={part.index}>
            <Reveal delay={240 + i * 90} className={styles.part}>
              <span className={styles.index}>{part.index}</span>
              <div>
                <h3 className={styles.partTitle}>{part.title}</h3>
                <p className={styles.partDetail}>{part.detail}</p>
              </div>
            </Reveal>
          </li>
        ))}
      </ol>
    </SceneSection>
  );
}
