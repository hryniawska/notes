import { initializeApp } from "firebase/app";
import {
  getDatabase,
  ref,
  push,
  get,
  set,
  remove,
  query,
  orderByChild,
  equalTo,
} from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBZrH8urTLPrdmzpFVk_FCtipyhPjtGxcI",
  authDomain: "notes-146bd.firebaseapp.com",
  projectId: "notes-146bd",
  databaseURL:
    "https://notes-146bd-default-rtdb.europe-west1.firebasedatabase.app",
  storageBucket: "notes-146bd.firebasestorage.app",
  messagingSenderId: "599771691003",
  appId: "1:599771691003:web:fc08b5b85f0e8e53ae7d5e",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Folders API
export const getFolders = async () => {
  try {
    const foldersRef = ref(database, "folders");
    const snapshot = await get(foldersRef);

    if (snapshot.exists()) {
      const folders = [];
      const data = snapshot.val();
      // Handle both array format (from json-server) and object format (from Firebase)
      if (Array.isArray(data)) {
        data.forEach((folder, index) => {
          if (folder) {
            folders.push({ id: String(index), ...folder });
          }
        });
      } else {
        Object.entries(data).forEach(([key, value]) => {
          if (value) {
            folders.push({ id: key, ...value });
          }
        });
      }
      return folders;
    }
    return [];
  } catch (error) {
    console.error("Error getting folders:", error);
    return [];
  }
};

export const createFolder = async (name) => {
  try {
    const foldersRef = ref(database, "folders");
    const newFolderRef = push(foldersRef);
    await set(newFolderRef, { name });
    return { id: newFolderRef.key, name };
  } catch (error) {
    console.error("Error creating folder:", error);
    throw error;
  }
};

// Notes API
export const getNotesByFolder = async (folderId) => {
  try {
    const notesRef = ref(database, "notes");
    const snapshot = await get(notesRef);

    if (snapshot.exists()) {
      const notes = [];
      const data = snapshot.val();

      if (Array.isArray(data)) {
        data.forEach((note, index) => {
          if (note && String(note.folderId) === String(folderId)) {
            notes.push({ id: String(index), ...note });
          }
        });
      } else {
        Object.entries(data).forEach(([key, value]) => {
          if (value && String(value.folderId) === String(folderId)) {
            notes.push({ id: key, ...value });
          }
        });
      }
      return notes;
    }
    return [];
  } catch (error) {
    console.error("Error getting notes:", error);
    return [];
  }
};

export const getNote = async (noteId) => {
  try {
    const noteRef = ref(database, `notes/${noteId}`);
    const snapshot = await get(noteRef);

    if (snapshot.exists()) {
      return { id: noteId, ...snapshot.val() };
    }
    return null;
  } catch (error) {
    console.error("Error getting note:", error);
    return null;
  }
};

export const createNote = async (title, body, folderId) => {
  try {
    const notesRef = ref(database, "notes");
    const snapshot = await get(notesRef);

    if (snapshot.exists() && Array.isArray(snapshot.val())) {
      // Array format - find the next available index
      const notesArray = snapshot.val();
      const newId = notesArray.length;
      const noteRef = ref(database, `notes/${newId}`);
      const newNote = { title, body, folderId, id: newId };
      await set(noteRef, newNote);
      return { id: String(newId), title, body, folderId };
    } else {
      // Object format - use push
      const newNoteRef = push(notesRef);
      await set(newNoteRef, { title, body, folderId });
      return { id: newNoteRef.key, title, body, folderId };
    }
  } catch (error) {
    console.error("Error creating note:", error);
    throw error;
  }
};

export const updateNote = async (noteId, title, body) => {
  try {
    const noteRef = ref(database, `notes/${noteId}`);
    const snapshot = await get(noteRef);

    if (snapshot.exists()) {
      const currentData = snapshot.val();
      await set(noteRef, { ...currentData, title, body });
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error updating note:", error);
    throw error;
  }
};

export const deleteNote = async (noteId) => {
  try {
    const noteRef = ref(database, `notes/${noteId}`);
    await remove(noteRef);
    return true;
  } catch (error) {
    console.error("Error deleting note:", error);
    throw error;
  }
};

// Archive API
export const getArchiveNotes = async () => {
  try {
    const archiveRef = ref(database, "archive");
    const snapshot = await get(archiveRef);

    if (snapshot.exists()) {
      const notes = [];
      const data = snapshot.val();

      if (Array.isArray(data)) {
        data.forEach((note, index) => {
          if (note) {
            notes.push({ id: String(index), ...note });
          }
        });
      } else {
        Object.entries(data).forEach(([key, value]) => {
          if (value) {
            notes.push({ id: key, ...value });
          }
        });
      }
      return notes;
    }
    return [];
  } catch (error) {
    console.error("Error getting archive:", error);
    return [];
  }
};

export const getArchivedNote = async (noteId) => {
  try {
    const noteRef = ref(database, `archive/${noteId}`);
    const snapshot = await get(noteRef);

    if (snapshot.exists()) {
      return { id: noteId, ...snapshot.val() };
    }
    return null;
  } catch (error) {
    console.error("Error getting archived note:", error);
    return null;
  }
};

export const moveToArchive = async (noteId) => {
  try {
    const noteRef = ref(database, `notes/${noteId}`);
    const snapshot = await get(noteRef);

    if (snapshot.exists()) {
      const noteData = snapshot.val();
      const archiveRef = ref(database, "archive");

      // Check if archive is an array or object
      const archiveSnapshot = await get(archiveRef);
      if (archiveSnapshot.exists() && Array.isArray(archiveSnapshot.val())) {
        // Array format - append to array
        const archiveArray = archiveSnapshot.val();
        archiveArray.push(noteData);
        await set(archiveRef, archiveArray);
      } else {
        // Object format - use push
        const newArchiveRef = push(archiveRef);
        await set(newArchiveRef, noteData);
      }

      await remove(noteRef);
      return { id: noteId, ...noteData };
    }
    return null;
  } catch (error) {
    console.error("Error moving to archive:", error);
    throw error;
  }
};

export const restoreFromArchive = async (noteId) => {
  try {
    const archiveNoteRef = ref(database, `archive/${noteId}`);
    const snapshot = await get(archiveNoteRef);

    if (snapshot.exists()) {
      const noteData = snapshot.val();
      const notesRef = ref(database, "notes");

      // Check if notes is an array or object
      const notesSnapshot = await get(notesRef);
      if (notesSnapshot.exists() && Array.isArray(notesSnapshot.val())) {
        // Array format - append to array
        const notesArray = notesSnapshot.val();
        notesArray.push(noteData);
        await set(notesRef, notesArray);
      } else {
        // Object format - use push
        const newNoteRef = push(notesRef);
        await set(newNoteRef, noteData);
      }

      await remove(archiveNoteRef);
      return { id: noteId, ...noteData };
    }
    return null;
  } catch (error) {
    console.error("Error restoring from archive:", error);
    throw error;
  }
};

export const deleteFromArchive = async (noteId) => {
  try {
    const archiveNoteRef = ref(database, `archive/${noteId}`);
    await remove(archiveNoteRef);
    return true;
  } catch (error) {
    console.error("Error deleting from archive:", error);
    throw error;
  }
};
