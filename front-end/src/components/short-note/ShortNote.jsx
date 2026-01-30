import styles from "./ShortNote.module.css";
import clsx from "clsx";

export function ShortNote({ note, active }) {
  return (
    <div
      className={clsx(styles["short-note"], active && styles.active)}
      role="listitem"
    >
      <div className={styles.title}>{note.title}</div>
      <div className={styles.body}>{note.body}</div>
    </div>
  );
}
