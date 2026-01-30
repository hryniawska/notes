import RemoveIcon from "../../assets/remove.svg";
import RestoreIcon from "../../assets/restore.svg";
import styles from "./Note.module.css";
import { TopBar } from "../top-bar/TopBar";
import {
  Form,
  useLoaderData,
  useSubmit,
  redirect,
  useLocation,
  useResolvedPath,
} from "react-router-dom";
import { debounce } from "../../utils/debounce";
import { useCallback } from "react";
import clsx from "clsx";
import * as firebase from "../../firebase";

const NoteEditor = ({ children }) => (
  <div className={styles["note-editor"]}>{children}</div>
);

export async function updateNote({ request, params }) {
  const formData = await request.formData();
  const title = formData.get("title");
  const body = formData.get("body");
  await firebase.updateNote(params.noteId, title, body);
  return null;
}

export async function moveToArchive({ params }) {
  const note = await firebase.getNote(params.noteId);
  if (!note) {
    throw new Error();
  }

  await firebase.moveToArchive(params.noteId);
  return redirect(`/notes/${note.folderId}`);
}

export async function deleteFromArchive({ params }) {
  await firebase.deleteFromArchive(params.noteId);
  return redirect(`/archive`);
}

export async function restoreFromArchive({ request, params }) {
  const archivedNote = await firebase.getArchivedNote(params.noteId);
  if (!archivedNote) {
    throw new Error();
  }

  await firebase.restoreFromArchive(params.noteId);
  return redirect(`/notes/${archivedNote.folderId}`);
}

export function Note() {
  const note = useLoaderData();
  const submit = useSubmit();
  const location = useLocation();
  const path = useResolvedPath();

  const onChangeSubmit = useCallback(
    debounce((event) => {
      const form = event.target.closest("form");
      submit(form, { method: "PATCH" });
    }, 300),
    [debounce, submit],
  );

  return (
    <div className={styles.container}>
      <TopBar>
        {path.pathname.includes("/archive") && (
          <Form
            method="POST"
            action="restore"
            aria-label="Przywróć notatkę z archiwum"
          >
            <button className={styles.button} aria-label="Przywróć notatkę">
              <img
                className={styles.image}
                src={RestoreIcon}
                alt="Ikona przywracania"
              />
            </button>
          </Form>
        )}
        <Form method="DELETE" action="delete" aria-label="Usuń notatkę">
          <button
            className={clsx(
              styles.button,
              styles.delete,
              path.pathname.includes("archive") && styles["align-right"],
            )}
            aria-label={
              path.pathname.includes("/archive")
                ? "Usuń na zawsze"
                : "Przenieś do archiwum"
            }
          >
            <img
              className={styles.image}
              src={RemoveIcon}
              alt="Ikona usuwania"
            />
          </button>
        </Form>
      </TopBar>

      <Form
        method="PATCH"
        onChange={onChangeSubmit}
        aria-label="Edytuj notatkę"
      >
        <NoteEditor key={note.id}>
          <input
            type="text"
            name="title"
            defaultValue={note.title}
            readOnly={location.pathname.includes("/archive")}
            disabled={location.pathname.includes("/archive")}
            aria-label="Tytuł notatki"
            placeholder="Tytuł notatki"
          />
          <textarea
            name="body"
            defaultValue={note.body}
            readOnly={location.pathname.includes("/archive")}
            disabled={location.pathname.includes("/archive")}
            aria-label="Treść notatki"
            placeholder="Treść notatki"
          />
        </NoteEditor>
      </Form>
    </div>
  );
}
