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
  limit 
} from "firebase/firestore";
import { 
  getStorage, 
  ref, 
  uploadString, 
  getDownloadURL 
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

export const fetchTemplates = async (isPublic: boolean = true, userId?: string) => {
  if (!db) return [];
  
  const templatesRef = collection(db, "templates");
  let q;

  if (userId && !isPublic) {
    // Fetch My Templates
    q = query(templatesRef, where("createdBy", "==", userId), orderBy("createdAt", "desc"));
  } else {
    // Fetch Community Templates
    q = query(templatesRef, where("isPublic", "==", true), orderBy("createdAt", "desc"), limit(20));
  }

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as SavedTemplate[];
};
