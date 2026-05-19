/* ══════════════════════════════════════════════
   RECORDS
══════════════════════════════════════════════ */
const GAME_INFO={
  1:{emoji:'🎨',name:'Поймай цвет',   unit:'очков',  color:'#4f6ef7',higher:true},
  2:{emoji:'🔍',name:'Найди лишнее',  unit:'очков',  color:'#f97316',higher:true},
  3:{emoji:'🌬️',name:'Пауза',         unit:'раундов',color:'#22c55e',higher:true},
  4:{emoji:'🔢',name:'Таблица Шульте',unit:'сек',    color:'#8b5cf6',higher:false},
  5:{emoji:'🧩',name:'Запомни ряд',   unit:'уровней',color:'#ff6b9d',higher:true},
};

function saveRecord(gameId,score){
  if(!currentUser||currentUser.login==='guest')return false;
  const gi=GAME_INFO[gameId];const prev=currentUser.records[gameId];
  const isNew=!prev||(gi.higher?score>prev.score:score<prev.score);
  if(isNew){
    currentUser.records[gameId]={score,date:new Date().toLocaleDateString('ru-RU')};
    const users=loadUsers();
    if(users[currentUser.login])users[currentUser.login].records=currentUser.records;
    saveUsers(users);
  }
  return isNew;
}
function getBest(gameId){return currentUser?currentUser.records[gameId]||null:null;}

function updateBestBadges(){
  for(let i=1;i<=5;i++){
    const el=document.getElementById('best-'+i);if(!el)continue;
    const b=getBest(i);
    if(b){const gi=GAME_INFO[i];el.innerHTML=`Рекорд: <b>${b.score} ${gi.unit}</b>`;}
    else el.textContent='';
  }
}

function renderProfile(){
  if(!currentUser)return;
  document.getElementById('profile-avatar-big').textContent=currentUser.name?currentUser.name[0].toUpperCase():'?';
  document.getElementById('profile-name-big').textContent=currentUser.name;
  document.getElementById('profile-since').textContent=currentUser.login==='guest'?'Гостевой режим':'Играет с '+currentUser.since;
  const grid=document.getElementById('records-grid');grid.innerHTML='';
  for(let i=1;i<=5;i++){
    const gi=GAME_INFO[i];const b=getBest(i);
    const card=document.createElement('div');card.className='record-card';
    card.style.setProperty('--card-color',gi.color);
    card.innerHTML=`<div class="record-game">${gi.emoji}</div><div class="record-title">${gi.name}</div>`+
      (b?`<div class="record-stat"><span class="record-label">Рекорд</span><span class="record-value">${b.score} ${gi.unit}</span></div>
          <div class="record-stat"><span class="record-label">Дата</span><span class="record-value">${b.date}</span></div>`
        :`<div class="record-empty">Ещё не играл</div>`);
    grid.appendChild(card);
  }
}

function renderLeaderboard(){
  const users=loadUsers();const box=document.getElementById('leaderboard-box');
  const scores=Object.entries(users).map(([login,u])=>{
    let total=0;for(let i=1;i<=5;i++){if(u.records&&u.records[i])total+=u.records[i].score;}
    return{login,name:u.name||login,total};
  }).sort((a,b)=>b.total-a.total).slice(0,10);
  if(!scores.length){box.innerHTML='<div class="lb-empty">Пока нет участников — будь первым!</div>';return;}
  const rc=['gold','silver','bronze'];
  box.innerHTML=scores.map((s,i)=>`
    <div class="lb-row">
      <div class="lb-rank ${rc[i]||''}">${i+1}</div>
      <div class="lb-name ${currentUser&&s.login===currentUser.login?'me':''}">${s.name}${currentUser&&s.login===currentUser.login?' (ты)':''}</div>
      <div class="lb-score">${s.total} очков</div>
    </div>`).join('');
}
