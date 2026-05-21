/* ══════════════════════════════════════════════
   MAIN — точка входа, инициализация Firebase
══════════════════════════════════════════════ */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword,
  signOut, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  getFirestore, doc, getDoc, setDoc,
  collection, getDocs
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

/* ── Firebase init ── */
const firebaseConfig = {
  apiKey: "AIzaSyCjanVE3pFykVrDJ4glr4CVlBNc-anF8q8",
  authDomain: "sdvg-training.firebaseapp.com",
  projectId: "sdvg-training",
  storageBucket: "sdvg-training.firebasestorage.app",
  messagingSenderId: "111805203850",
  appId: "1:111805203850:web:2735c89af125be1bccf473"
};

const _app  = initializeApp(firebaseConfig);
const _auth = getAuth(_app);
const _db   = getFirestore(_app);

/* ── Делаем глобальными для остальных файлов ── */
window._auth  = _auth;
window._db    = _db;
window._fbLib = {
  createUserWithEmailAndPassword, signInWithEmailAndPassword,
  signOut, onAuthStateChanged,
  doc, getDoc, setDoc, collection, getDocs
};
