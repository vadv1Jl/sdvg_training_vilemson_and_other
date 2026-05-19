/* ══════════════════════════════════════════════
   RECORDS
══════════════════════════════════════════════ */
const GAME_INFO={
  1:{emoji:'🎨',name:'Поймай цвет',    unit:'мс',     color:'#4f6ef7', higher:false, label:'Среднее время реакции'},
  2:{emoji:'🔍',name:'Найди лишнее',   unit:'сек',    color:'#f97316', higher:false, label:'Время (с штрафами)'},
  4:{emoji:'🔢',name:'Таблица Шульте', unit:'сек',    color:'#8b5cf6', higher:false, label:'Время прохождения'},
  5:{emoji:'🧩',name:'Запомни ряд',    unit:'уровней',color:'#ff6b9d', higher:true,  label:'Максимальный уровень'},
};

const RECORD_GAME_IDS=[1,2,4,5];

function saveRecord(gameId,score){
  if(!currentUser||currentUser.login==='guest')return false;
  const gi=GAME_INFO[gameId];
  if(!gi)return false;
  const prev=currentUser.records[gameId];
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
    const gi=GAME_INFO[i];
    if(!gi){el.textContent='';continue;}
    const b=getBest(i);
    if(b){el.innerHTML=`Рекорд: <b>${b.score} ${gi.unit}</b>`;}
    else el.textContent='';
  }
}

/* ─── ПРОФИЛЬ: рекорды по разделам с кнопками ─── */
let profileActiveGame=1;

function renderProfile(){
  if(!currentUser)return;
  document.getElementById('profile-avatar-big').textContent=currentUser.name?currentUser.name[0].toUpperCase():'?';
  document.getElementById('profile-name-big').textContent=currentUser.name;
  document.getElementById('profile-since').textContent=currentUser.login==='guest'?'Гостевой режим':'Играет с '+currentUser.since;

  const grid=document.getElementById('records-grid');
  grid.innerHTML=`
    <div class="profile-tab-row" id="profile-tab-row">
      ${RECORD_GAME_IDS.map(id=>`
        <button class="profile-tab-btn${id===profileActiveGame?' active':''}"
          data-gid="${id}"
          style="--btn-color:${GAME_INFO[id].color}">
          ${GAME_INFO[id].emoji} ${GAME_INFO[id].name}
        </button>`).join('')}
    </div>
    <div id="profile-record-detail"></div>
  `;

  document.querySelectorAll('.profile-tab-btn').forEach(btn=>{
    btn.addEventListener('click',()=>{
      profileActiveGame=Number(btn.dataset.gid);
      document.querySelectorAll('.profile-tab-btn').forEach(b=>b.classList.toggle('active',b===btn));
      renderProfileDetail(profileActiveGame);
    });
  });

  renderProfileDetail(profileActiveGame);
}

function renderProfileDetail(gameId){
  const gi=GAME_INFO[gameId];
  const b=getBest(gameId);
  const box=document.getElementById('profile-record-detail');
  box.innerHTML=`
    <div class="profile-detail-card" style="--card-color:${gi.color}">
      <div class="pdc-emoji">${gi.emoji}</div>
      <div class="pdc-name">${gi.name}</div>
      ${b
        ?`<div class="pdc-stat">
            <span class="pdc-label">${gi.label}</span>
            <span class="pdc-value">${b.score} ${gi.unit}</span>
          </div>
          <div class="pdc-stat">
            <span class="pdc-label">Дата</span>
            <span class="pdc-value">${b.date}</span>
          </div>`
        :`<div class="pdc-empty">Ещё не играл в эту игру</div>`
      }
    </div>`;
}

/* ─── ТАБЛИЦЫ ЛИДЕРОВ ПО КАЖДОЙ ИГРЕ ─── */
let lbActiveTab=1;

function renderLeaderboard(){
  const tabRow=document.getElementById('lb-tab-row');
  if(!tabRow.children.length){
    RECORD_GAME_IDS.forEach((id,i)=>{
      const gi=GAME_INFO[id];
      const btn=document.createElement('button');
      btn.className='lb-tab-btn'+(i===0?' active':'');
      btn.textContent=gi.emoji+' '+gi.name;
      btn.dataset.game=id;
      btn.addEventListener('click',()=>{
        lbActiveTab=id;
        document.querySelectorAll('.lb-tab-btn').forEach(b=>b.classList.toggle('active',Number(b.dataset.game)===id));
        renderLbTable(id);
      });
      tabRow.appendChild(btn);
    });
  }
  renderLbTable(lbActiveTab);
}

function renderLbTable(gameId){
  const gi=GAME_INFO[gameId];
  const users=loadUsers();
  const box=document.getElementById('leaderboard-box');

  const rows=Object.entries(users)
    .filter(([,u])=>u.records&&u.records[gameId])
    .map(([login,u])=>({login,name:u.name||login,score:u.records[gameId].score,date:u.records[gameId].date}))
    .sort((a,b)=>gi.higher?b.score-a.score:a.score-b.score)
    .slice(0,10);

  if(!rows.length){
    box.innerHTML=`<div class="lb-empty">Никто ещё не играл в «${gi.name}» — будь первым!</div>`;
    return;
  }

  const medals=['🥇','🥈','🥉'];
  box.innerHTML=`
    <table class="lb-table">
      <thead>
        <tr>
          <th>#</th>
          <th>Игрок</th>
          <th>${gi.label}</th>
          <th>Дата</th>
        </tr>
      </thead>
      <tbody>
        ${rows.map((r,i)=>`
          <tr class="${currentUser&&r.login===currentUser.login?'lb-me':''}">
            <td class="lb-rank-cell">${medals[i]||i+1}</td>
            <td class="lb-name-cell">${r.name}${currentUser&&r.login===currentUser.login?' <span class="lb-you">(ты)</span>':''}</td>
            <td class="lb-score-cell">${r.score} ${gi.unit}</td>
            <td class="lb-date-cell">${r.date}</td>
          </tr>`).join('')}
      </tbody>
    </table>`;
}
