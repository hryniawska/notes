import styles from "./NotesList.module.css";
import { Title } from "../title/Title";
import { AddNewButton } from "../add-new-button/AddNewButton";
import { TopBar } from "../top-bar/TopBar";
import { ShortNote } from "../short-note/ShortNote";
import {
  useLoaderData,
  NavLink,
  Outlet,
  Form,
  redirect,
  useLocation,
} from "react-router-dom";
import * as firebase from "../../firebase";

const NotesContainer = ({ children }) => (
  <div className={styles["notes-container"]}>{children}</div>
);

const Notes = ({ children }) => (
  <div className={styles["notes-list"]} role="list">
    {children}
  </div>
);

export async function createNote({ params }) {
  const data = await firebase.createNote(
    "Nowa notatka",
    "Treść notatki",
    params.folderId,
  );
  return redirect(`/notes/${data.folderId}/note/${data.id}`);
}

export function NotesList() {
  const notes = useLoaderData();
  const location = useLocation();

  return (
    <NotesContainer>
      <Notes>
        <TopBar>
          <Title>Notatki</Title>
          <Form method="POST" aria-label="Utwórz nową notatkę">
            <AddNewButton type="submit" aria-label="Dodaj nową notatkę">
              +
            </AddNewButton>
          </Form>
        </TopBar>

        {notes.map((note, idx) => (
          <NavLink
            to={
              location.pathname.includes("/archive")
                ? `/archive/note/${note.id}`
                : `/notes/${note.folderId}/note/${note.id}`
            }
            key={idx}
            aria-label={`Notatka: ${note.title || "Bez tytułu"}`}
          >
            {({ isActive }) => (
              <ShortNote active={isActive} note={note}></ShortNote>
            )}
          </NavLink>
        ))}
      </Notes>
      <Outlet />
    </NotesContainer>
  );
}
