/**
 * Firebase gallery store (Firestore, free Spark plan).
 * Exposes window.galleryStore so classic scripts (script.js, admin.html) can use it.
 * Photos are stored as compressed base64 in the "gallery" collection.
 */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore, collection, doc, setDoc, deleteDoc, onSnapshot, query, orderBy
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import {
  getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyA2Yo1enhCZSTGB5fjQ19l5gEUuct7aLYE",
  authDomain: "maniphysiotherapy-4c67c.firebaseapp.com",
  projectId: "maniphysiotherapy-4c67c",
  storageBucket: "maniphysiotherapy-4c67c.firebasestorage.app",
  messagingSenderId: "418606978647",
  appId: "1:418606978647:web:9b32ff83fc3239df52f512",
  measurementId: "G-JECXFL4QPS"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const COL = "gallery";

window.galleryStore = {
  ready: true,

  /** Live subscription: cb(photosArray) fires now and on every change (newest first). */
  subscribe(cb, onError) {
    const q = query(collection(db, COL), orderBy("createdAt", "desc"));
    return onSnapshot(
      q,
      snap => cb(snap.docs.map(d => ({ id: d.id, ...d.data() }))),
      err => { console.error("Gallery load failed:", err); if (onError) onError(err); }
    );
  },

  /** Sign in the admin (needed for write access per Firestore rules). */
  async signIn(email, password) {
    await signInWithEmailAndPassword(auth, email, password);
  },

  isSignedIn() {
    return !!auth.currentUser;
  },

  async authReady() {
    if (auth.authStateReady) {
      await auth.authStateReady();
    }
    return auth.currentUser;
  },

  getCurrentUser() {
    return auth.currentUser;
  },

  async signOut() {
    await signOut(auth);
  },

  async add({ title, category, dataUrl, uploadedAt }) {
    const id = String(Date.now());
    await setDoc(doc(db, COL, id), {
      title, category, dataUrl, uploadedAt, createdAt: Date.now()
    });
    return id;
  },

  async remove(id) {
    await deleteDoc(doc(db, COL, String(id)));
  }
};

window.dispatchEvent(new Event("galleryStoreReady"));
