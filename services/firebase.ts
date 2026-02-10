import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut,
  onAuthStateChanged
} from "firebase/auth";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs,
  orderBy,
  limit,
  deleteDoc,
  doc
} from "firebase/firestore";
import { 
  getStorage, 
  ref, 
  uploadString, 
  getDownloadURL,
  deleteObject
} from "firebase/storage";
import { SavedTemplate, UserProfile } from "../types";

// Helper to get env vars safely
const getEnv = (key: string) => {
  // @ts-ignore
  return (typeof import.meta !== 'undefined' && import.meta.env?.[key]) || process.env?.[key] || "";
};

const firebaseConfig = {
  apiKey: getEnv("VITE_FIREBASE_API_KEY"),
  authDomain: getEnv("VITE_FIREBASE_AUTH_DOMAIN"),
  projectId: getEnv("VITE_FIREBASE_PROJECT_ID"),
  storageBucket: getEnv("VITE_FIREBASE_STORAGE_BUCKET"),
  messagingSenderId: getEnv("VITE_FIREBASE_MESSAGING_SENDER_ID"),
  appId: getEnv("VITE_FIREBASE_APP_ID")
};

let app;
let auth: any;
let db: any;
let storage: any;

try {
  if (firebaseConfig.apiKey) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
  } else {
    console.warn("Firebase configuration missing. Auth features will be disabled.");
  }
} catch (error) {
  console.error("Firebase initialization error:", error);
}

const googleProvider = new GoogleAuthProvider();

export const loginWithGoogle = async (): Promise<UserProfile | null> => {
  if (!auth) throw new Error("Firebase not configured");
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    return {
      uid: user.uid,
      displayName: user.displayName,
      email: user.email,
      photoURL: user.photoURL
    };
  } catch (error) {
    console.error("Login failed", error);
    throw error;
  }
};

export const logoutUser = async () => {
  if (!auth) return;
  await signOut(auth);
};

export const subscribeToAuth = (callback: (user: UserProfile | null) => void) => {
  if (!auth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, (user: any) => {
    if (user) {
      callback({
        uid: user.uid,
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL
      });
    } else {
      callback(null);
    }
  });
};

export const saveTemplate = async (template: Omit<SavedTemplate, 'id'>) => {
  if (!db || !storage) throw new Error("Firebase DB/Storage not configured");
  
  // Handle Base64 Images (AI Generated)
  // If the URL is a data URI, upload it to Storage first
  let backgroundUrl = template.background.url;
  
  if (backgroundUrl.startsWith('data:')) {
    try {
      const storageRef = ref(storage, `backgrounds/${template.createdBy}/${Date.now()}.png`);
      await uploadString(storageRef, backgroundUrl, 'data_url');
      backgroundUrl = await getDownloadURL(storageRef);
    } catch (e) {
      console.error("Failed to upload image", e);
      throw new Error("Failed to upload custom background image.");
    }
  }

  const cleanTemplate = {
    ...template,
    background: {
      ...template.background,
      url: backgroundUrl
    }
  };

  const docRef = await addDoc(collection(db, "templates"), cleanTemplate);
  return docRef.id;
};

export const deleteTemplate = async (templateId: string, backgroundUrl?: string) => {
  if (!db) throw new Error("Firebase DB not configured");

  try {
    // 1. Delete from Firestore
    await deleteDoc(doc(db, "templates", templateId));

    // 2. Delete from Storage if it's a firebase storage url
    if (backgroundUrl && backgroundUrl.includes("firebasestorage.googleapis.com")) {
      try {
        const imageRef = ref(storage, backgroundUrl);
        await deleteObject(imageRef);
      } catch (storageError) {
        console.warn("Could not delete associated image from storage", storageError);
        // Continue, as the template record is already gone
      }
    }
  } catch (error) {
    console.error("Error deleting template:", error);
    throw error;
  }
};

export type TemplateFilterType = 'public' | 'mine' | 'shared';

export const fetchTemplates = async (type: TemplateFilterType, user?: UserProfile) => {
  if (!db) return [];
  
  const templatesRef = collection(db, "templates");
  let q;

  try {
    if (type === 'mine' && user) {
      // Fetch My Templates
      q = query(templatesRef, where("createdBy", "==", user.uid), orderBy("createdAt", "desc"));
    } else if (type === 'shared' && user && user.email) {
      // Fetch Shared Templates
      // Note: This requires an index on 'sharedWith' array and 'createdAt'.
      q = query(templatesRef, where("sharedWith", "array-contains", user.email), orderBy("createdAt", "desc"));
    } else {
      // Fetch Community Templates (Default)
      q = query(templatesRef, where("isPublic", "==", true), orderBy("createdAt", "desc"), limit(20));
    }

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as SavedTemplate[];
  } catch (error: any) {
    console.error("Error fetching templates:", error);
    // Fallback for missing index errors
    if (error.code === 'failed-precondition') {
      console.warn("Index missing. Returning unsorted/filtered results temporarily.");
      // If index is missing, try a simpler query without sort
      if (type === 'shared' && user && user.email) {
         const simpleQ = query(templatesRef, where("sharedWith", "array-contains", user.email));
         const snap = await getDocs(simpleQ);
         return snap.docs.map(doc => ({id: doc.id, ...doc.data()})).sort((a,b) => b.createdAt - a.createdAt) as SavedTemplate[];
      }
    }
    throw error;
  }
};