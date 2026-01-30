import styles from "./FoldersList.module.css";
import { Folder } from "../folder/Folder";
import { Title } from "../title/Title";
import { TopBar } from "../top-bar/TopBar";
import { AddNewButton } from "../add-new-button/AddNewButton";
import { NavLink, useLoaderData, Form, redirect } from "react-router-dom";
import * as firebase from "../../firebase";

const Folders = ({ children }) => (
  <div className={styles["folders-column"]}>{children}</div>
);
const UserCreatedFolders = ({ children }) => (
  <div role="list" className={styles["folders-list"]}>
    {children}
  </div>
);

export async function createFolder(args) {
  const formData = await args.request.formData();
  const folderName = formData.get("folder-name");
  const data = await firebase.createFolder(folderName);
  return redirect(`/notes/${data.id}`);
}

export function FoldersList() {
  const folders = useLoaderData();

  return (
    <Folders>
      <TopBar>
        <Form method="post" action="/" aria-label="Utwórz nowy folder">
          <input
            name="folder-name"
            className={styles["new-folder-input"]}
            type="text"
            defaultValue="Nowy folder"
            placeholder="Nazwa folderu"
            aria-label="Nazwa nowego folderu"
          />
          <AddNewButton type="submit" aria-label="Dodaj nowy folder">
            +
          </AddNewButton>
        </Form>
        <NavLink
          to="/archive"
          className={styles["archive-link-mobile"]}
          aria-label="Przejdź do archiwum"
        >
          {({ isActive }) => (
            <Folder active={isActive} icon="archive">
              Archiwum
            </Folder>
          )}
        </NavLink>
      </TopBar>

      <Title className={styles["folders-title"]}>Foldery</Title>
      <UserCreatedFolders>
        {folders.map((folder, idx) => (
          <NavLink
            to={`/notes/${folder.id}`}
            key={idx}
            aria-label={`Folder ${folder.name}`}
          >
            {({ isActive }) => <Folder active={isActive}>{folder.name}</Folder>}
          </NavLink>
        ))}
      </UserCreatedFolders>
      <NavLink
        to="/archive"
        className={styles["archive-link"]}
        aria-label="Przejdź do archiwum"
      >
        {({ isActive }) => (
          <Folder active={isActive} icon="archive">
            Archiwum
          </Folder>
        )}
      </NavLink>
    </Folders>
  );
}

export default FoldersList;
