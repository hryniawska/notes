import styles from "./AddNewButton.module.css";

export function AddNewButton({ children, ...props }) {
  return (
    <button className={styles["add-new-button"]} {...props}>
      {children}
    </button>
  );
}
