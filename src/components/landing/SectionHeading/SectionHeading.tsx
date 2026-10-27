import { Reveal } from "@/components/ui/Reveal/Reveal";
import styles from "./SectionHeading.module.css";

interface SectionHeadingProps {
  id: string;
  eyebrow: string;
  title: string;
  body?: string;
}

export function SectionHeading({ id, eyebrow, title, body }: SectionHeadingProps) {
  return (
    <>
      <Reveal>
        <p className={styles.eyebrow}>{eyebrow}</p>
      </Reveal>
      <Reveal delay={90}>
        <h2 id={id} className={styles.title}>
          {title}
        </h2>
      </Reveal>
      {body && (
        <Reveal delay={180}>
          <p className={styles.body}>{body}</p>
        </Reveal>
      )}
    </>
  );
}
