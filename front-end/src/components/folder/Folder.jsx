import styles from "./Folder.module.css";
import FolderIcon from "../../assets/folder.svg";
import ArchiveIcon from "../../assets/remove.svg";
import clsx from "clsx";

export function Folder({ children, active, icon }) {
  return (
    <div
      className={clsx(
        styles.folder,
        active && styles.active,
        icon === "archive" && styles.archive
      )}
      role="listitem"
    >
      <img
        src={icon === "archive" ? ArchiveIcon : FolderIcon}
        alt={icon === "archive" ? "Ikona archiwum" : "Ikona folderu"}
      />
      {children}
    </div>
  );
}
