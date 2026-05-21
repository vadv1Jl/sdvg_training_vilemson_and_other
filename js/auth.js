/* ══════════════════════════════════════════════
   SCREEN MANAGEMENT
══════════════════════════════════════════════ */
function showScreen(id){
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

let activeTab='games';
function switchTab(tab){
  activeTab=tab;
  document.querySelectorAll('.tab-btn').forEach((b,i)=>{
    b.classList.toggle('active',['games','profile','leaderboard','team'][i]===tab);
  });
  document.querySelectorAll('.tab-content').forEach(c=>c.classList.remove('active'));
  document.getElementById('tab-'+tab).classList.add('active');
  if(tab==='profile')renderProfile();
  if(tab==='leaderboard')renderLeaderboard();
}

/* ══════════════════════════════════════════════
   AUTH — Firebase
══════════════════════════════════════════════ */
async function doLogin(){
  const login = document.getElementById('li-login').value.trim();
  const pass  = document.getElementById('li-pass').value;
  const err   = document.getElementById('li-error');
  err.classList.remove('visible');

  const email = login + '@sdvg.app';
  try {
    const cred = await _fbLib.signInWithEmailAndPassword(_auth, email, pass);
    await loadUserData(cred.user);
  } catch(e) {
    err.classList.add('visible');
  }
}

async function doRegister(){
  const name  = document.getElementById('reg-name').value.trim();
  const login = document.getElementById('reg-login').value.trim();
  const pass  = document.getElementById('reg-pass').value;
  const pass2 = document.getElementById('reg-pass2').value;
  ['reg-error-login','reg-error-pass','reg-error-match'].forEach(id=>document.getElementById(id).classList.remove('visible'));

  let ok = true;
  if(pass.length < 4){ document.getElementById('reg-error-pass').classList.add('visible'); ok=false; }
  if(pass !== pass2) { document.getElementById('reg-error-match').classList.add('visible'); ok=false; }
  if(!ok) return;

  const email = login + '@sdvg.app';
  try {
    const cred = await _fbLib.createUserWithEmailAndPassword(_auth, email, pass);
    const uid  = cred.user.uid;
    const userData = {
      name: name || login,
      login,
      since: new Date().toLocaleDateString('ru-RU'),
      records: {}
    };
    await _fbLib.setDoc(_fbLib.doc(_db, 'users', uid), userData);
    await loadUserData(cred.user);
  } catch(e) {
    if(e.code === 'auth/email-already-in-use'){
      document.getElementById('reg-error-login').classList.add('visible');
    }
  }
}

async function loadUserData(firebaseUser){
  const snap = await _fbLib.getDoc(_fbLib.doc(_db, 'users', firebaseUser.uid));
  if(snap.exists()){
    currentUser = { uid: firebaseUser.uid, ...snap.data() };
  } else {
    currentUser = { uid: firebaseUser.uid, name: 'Игрок', login: '', since: '—', records: {} };
  }
  // Подгружаем рекорды сразу
  try {
    const recSnap = await _fbLib.getDocs(
      _fbLib.collection(_db, 'users', firebaseUser.uid, 'records')
    );
    recSnap.forEach(d => { currentUser.records[Number(d.id)] = d.data(); });
  } catch(e){ console.error(e); }

  renderHeader();
  updateBestBadges();
  showScreen('screen-home');
  switchTab('games');
}

function guestMode(){
  currentUser = { uid: null, login:'guest', name:'Гость', since:'—', records:{} };
  renderHeader();
  updateBestBadges();
  showScreen('screen-home');
}

async function doLogout(){
  stopBreathing();
  clearAllTimers();
  if(g1.raf){ cancelAnimationFrame(g1.raf); g1.raf=null; }
  if(g1.reactionRaf){ cancelAnimationFrame(g1.reactionRaf); g1.reactionRaf=null; }
  g2StopTimer();
  await _fbLib.signOut(_auth);
  currentUser = null;
  renderHeader();
  showScreen('screen-login');
}

/* ══════════════════════════════════════════════
   HEADER
══════════════════════════════════════════════ */
function renderHeader(){
  const hr = document.getElementById('header-right');
  if(!currentUser){
    hr.innerHTML = '<button class="theme-btn" data-theme-toggle>🌙</button>';
    return;
  }
  const initials = currentUser.name ? currentUser.name[0].toUpperCase() : '?';
  hr.innerHTML = `
    <div class="user-chip" id="hdr-profile">
      <div class="user-avatar">${initials}</div>${currentUser.name}
    </div>
    <button class="logout-btn" id="hdr-logout">Выйти</button>
    <button class="theme-btn" data-theme-toggle>🌙</button>
  `;
  document.getElementById('hdr-profile').addEventListener('click',()=>{
    switchTab('profile'); showScreen('screen-home');
  });
  document.getElementById('hdr-logout').addEventListener('click', doLogout);
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  hr.querySelector('[data-theme-toggle]').textContent = isDark ? '☀️' : '🌙';
}

/* ══════════════════════════════════════════════
   ИНИЦИАЛИЗАЦИЯ
══════════════════════════════════════════════ */
window.addEventListener('DOMContentLoaded', ()=>{
  _fbLib.onAuthStateChanged(_auth, async (firebaseUser)=>{
    if(firebaseUser){
      await loadUserData(firebaseUser);
    } else {
      renderHeader();
      showScreen('screen-login');
    }
  });
});
