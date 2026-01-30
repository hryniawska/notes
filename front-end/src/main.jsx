import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { App } from "./App";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { NotesList } from "./components/notes-list/NotesList";
import { Note } from "./components/note/Note";
import { NotFound } from "./components/not-found/NotFound";
import { createFolder } from "./components/folders-list/FoldersList";
import { createNote } from "./components/notes-list/NotesList";
import { updateNote } from "./components/note/Note";
import { moveToArchive } from "./components/note/Note";
import { deleteFromArchive } from "./components/note/Note";
import { restoreFromArchive } from "./components/note/Note";
import * as firebase from "./firebase";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <NotFound />,
    shouldRevalidate: ({ formAction }) => {
      if (formAction === "/") {
        return true;
      } else {
        return false;
      }
    },
    loader: async () => {
      return firebase.getFolders();
    },
    action: createFolder,
    children: [
      {
        index: true,
        element: null,
      },
      {
        path: "/notes/:folderId",
        element: <NotesList />,
        errorElement: <NotFound />,
        loader: async ({ params }) => {
          return firebase.getNotesByFolder(params.folderId);
        },
        action: createNote,
        children: [
          {
            path: "note/:noteId",
            element: <Note />,
            errorElement: <NotFound />,
            shouldRevalidate: ({ formAction }) => {
              if (formAction) {
                return false;
              } else {
                return true;
              }
            },
            loader: async ({ params }) => {
              const note = await firebase.getNote(params.noteId);
              if (!note) {
                throw new Error();
              }
              return note;
            },
            action: updateNote,
            children: [
              {
                path: "delete",
                action: moveToArchive,
              },
            ],
          },
        ],
      },
      {
        path: "archive",
        element: <NotesList />,
        errorElement: <NotFound />,
        loader: async () => {
          return firebase.getArchiveNotes();
        },
        children: [
          {
            path: "note/:noteId",
            element: <Note />,
            errorElement: <NotFound />,
            shouldRevalidate: ({ formAction }) => {
              if (formAction) {
                return false;
              } else {
                return true;
              }
            },
            loader: async ({ params }) => {
              const note = await firebase.getArchivedNote(params.noteId);
              if (!note) {
                throw new Error();
              }
              return note;
            },
            children: [
              {
                path: "delete",
                action: deleteFromArchive,
              },
              {
                path: "restore",
                action: restoreFromArchive,
              },
            ],
          },
        ],
      },
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
