import style from "./Title.module.css";
import clsx from "clsx";

export function Title({ children, className }) {
  return <p className={clsx(style.title, className)}>{children}</p>;
}
