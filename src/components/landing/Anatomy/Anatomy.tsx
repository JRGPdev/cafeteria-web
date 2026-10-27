import { SceneSection } from "@/components/landing/SceneSection/SceneSection";
import { SectionHeading } from "@/components/landing/SectionHeading/SectionHeading";
import { ANATOMY } from "@/content/landing";
import styles from "./Anatomy.module.css";

export function Anatomy() {
  return (
    <SceneSection id="anatomia" labelledBy="anatomia-title" className={styles.anatomy}>
      <SectionHeading id="anatomia-title" eyebrow={ANATOMY.eyebrow} title={ANATOMY.title} body={ANATOMY.body} />
    </SceneSection>
  );
}
