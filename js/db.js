/* ══════════════════════════════════════════════
   DATA LAYER — localStorage
══════════════════════════════════════════════ */
const DB_KEY='sdvg_users';
const SESSION_KEY='sdvg_session';

function loadUsers(){try{return JSON.parse(localStorage.getItem(DB_KEY))||{};}catch{return {};}}
function saveUsers(u){localStorage.setItem(DB_KEY,JSON.stringify(u));}
function loadSession(){try{return localStorage.getItem(SESSION_KEY)||null;}catch{return null;}}
function saveSession(login){try{localStorage.setItem(SESSION_KEY,login);}catch{}}
function clearSession(){try{localStorage.removeItem(SESSION_KEY);}catch{}}

let currentUser=null;

function hashPass(p){
  let h=0;
  for(let i=0;i<p.length;i++){h=((h<<5)-h)+p.charCodeAt(i);h|=0;}
  return h.toString(16);
}
