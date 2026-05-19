/* ══════════════════════════════════════════════
   GAMES — все 5 игр
══════════════════════════════════════════════ */

/* ─── GAME 1 — Поймай цвет ─── */
const COLORS=[
  {name:'Красный',hex:'#ef4444'},{name:'Синий',hex:'#3b82f6'},
  {name:'Зелёный',hex:'#22c55e'},{name:'Жёлтый',hex:'#facc15'},
  {name:'Фиолетовый',hex:'#a855f7'},{name:'Оранжевый',hex:'#f97316'},
];
let g1={score:0,round:0,answered:false,raf:null,reactionStart:0,reactionRaf:null,times:[]};

function initG1(){
  g1={score:0,round:0,answered:false,raf:null,reactionStart:0,reactionRaf:null,times:[]};
  document.getElementById('g1-score').textContent=0;
  document.getElementById('g1-reaction').textContent='';
  g1Round();
}

function g1Round(){
  if(g1.round>=10){
    const avg=g1.times.length?Math.round(g1.times.reduce((a,b)=>a+b,0)/g1.times.length):0;
    showResult(
      avg<600?'🏆':avg<1000?'😊':'💪',
      avg<600?'Молниеносно!':avg<1000?'Хорошо!':'Тренируйся!',
      `Очки: ${g1.score}/10 • Среднее время: ${avg} мс`,
      1, avg
    );
    return;
  }
  g1.round++;g1.answered=false;
  document.getElementById('g1-round').textContent=g1.round;
  document.getElementById('g1-feedback').textContent='';
  document.getElementById('g1-reaction').textContent='⏱ 0 мс';

  const s=[...COLORS].sort(()=>Math.random()-0.5);
  const target=s[0],opts=s.slice(0,4).sort(()=>Math.random()-0.5);
  const t=document.getElementById('g1-target');
  t.textContent=target.name;t.style.color=target.hex;t.style.borderColor=target.hex;

  const op=document.getElementById('g1-options');op.innerHTML='';
  opts.forEach(c=>{
    const b=document.createElement('button');b.className='g1-btn';
    b.style.background=c.hex;b.setAttribute('aria-label',c.name);
    b.addEventListener('click',()=>g1Ans(b,c===target,target));
    op.appendChild(b);
  });

  const bar=document.getElementById('timer-bar');
  bar.style.transition='none';bar.style.width='100%';

  // Таймер реакции
  g1.reactionStart=Date.now();
  const reactionEl=document.getElementById('g1-reaction');
  const tickReaction=()=>{
    if(g1.answered)return;
    reactionEl.textContent=`⏱ ${Date.now()-g1.reactionStart} мс`;
    g1.reactionRaf=requestAnimationFrame(tickReaction);
  };
  g1.reactionRaf=requestAnimationFrame(tickReaction);

  const t0=Date.now(),dur=5000;
  const tick=()=>{
    if(g1.answered)return;
    const left=1-(Date.now()-t0)/dur;
    if(left<=0){bar.style.width='0%';if(!g1.answered)g1Ans(null,false,target,true);return;}
    bar.style.width=(left*100)+'%';
    bar.style.background=left>0.5?'var(--color-primary)':left>0.25?'var(--color-warning)':'var(--color-error)';
    g1.raf=requestAnimationFrame(tick);
  };
  g1.raf=requestAnimationFrame(tick);
}

function g1Ans(btn,ok,target,timeout=false){
  if(g1.answered)return;
  g1.answered=true;
  if(g1.raf)cancelAnimationFrame(g1.raf);
  if(g1.reactionRaf)cancelAnimationFrame(g1.reactionRaf);

  const elapsed=Date.now()-g1.reactionStart;
  const fb=document.getElementById('g1-feedback');
  const reactionEl=document.getElementById('g1-reaction');

  if(ok){
    g1.score++;
    g1.times.push(elapsed);
    document.getElementById('g1-score').textContent=g1.score;
    btn.classList.add('correct');
    fb.textContent='✅ Правильно!';fb.style.color='var(--color-success)';
    reactionEl.textContent=`⚡ ${elapsed} мс`;
  } else {
    fb.textContent=timeout?'⏰ Время!':'❌ Не то!';
    fb.style.color='var(--color-error)';
    reactionEl.textContent=timeout?'⏰ Время вышло':'❌ Ошибка';
    if(btn)btn.classList.add('wrong');
  }
  allTimers.push(setTimeout(g1Round,1000));
}

/* ─── GAME 2 — Найди лишнее ─── */
const G2_SETS=[
  {main:'🐶',odd:'🐱'},{main:'⭐',odd:'🌙'},{main:'🍎',odd:'🍊'},
  {main:'🚗',odd:'🚕'},{main:'🌺',odd:'🌸'},{main:'🐟',odd:'🐠'},
  {main:'🏠',odd:'🏡'},{main:'🎈',odd:'🎉'},
];
let g2={score:0,lives:3,round:0,locked:false,errors:0,timerStart:0,timerRaf:null};

function initG2(){
  g2={score:0,lives:3,round:0,locked:false,errors:0,timerStart:Date.now(),timerRaf:null};
  document.getElementById('g2-score').textContent=0;
  document.getElementById('g2-lives').textContent=3;
  document.getElementById('g2-timer').textContent='⏱ 0.0 с';
  const rd=document.getElementById('g2-rounds');rd.innerHTML='';
  for(let i=0;i<8;i++){const d=document.createElement('div');d.className='round-dot';rd.appendChild(d);}
  g2StartTimer();
  g2Round();
}

function g2StartTimer(){
  const el=document.getElementById('g2-timer');
  const tick=()=>{
    if(!g2.timerRaf)return;
    const base=(Date.now()-g2.timerStart)/1000;
    const penalty=g2.errors*5;
    const total=base+penalty;
    el.textContent=`⏱ ${total.toFixed(1)} с${g2.errors>0?' (+'+g2.errors*5+'с штраф)':''}`;
    g2.timerRaf=requestAnimationFrame(tick);
  };
  g2.timerRaf=requestAnimationFrame(tick);
}

function g2StopTimer(){
  if(g2.timerRaf){cancelAnimationFrame(g2.timerRaf);g2.timerRaf=null;}
}

function g2Round(){
  if(g2.round>=8||g2.lives<=0){
    g2StopTimer();
    const base=(Date.now()-g2.timerStart)/1000;
    const penalty=g2.errors*5;
    const total=parseFloat((base+penalty).toFixed(1));
    showResult(
      g2.score>=7?'🏆':g2.score>=4?'😊':'💪',
      g2.lives>0?'Молодец!':'Попробуй ещё!',
      `Найдено: ${g2.score}/8 • Время: ${total}с • Ошибок: ${g2.errors} (+${g2.errors*5}с)`,
      2, total
    );
    return;
  }
  g2.locked=false;
  document.getElementById('g2-feedback').textContent='';
  const dots=document.querySelectorAll('#g2-rounds .round-dot');
  dots.forEach((d,i)=>{d.classList.toggle('done',i<g2.round);d.classList.toggle('current',i===g2.round);});
  const set=G2_SETS[g2.round%G2_SETS.length];
  const items=Array(15).fill(set.main).concat([set.odd]).sort(()=>Math.random()-0.5);
  const grid=document.getElementById('g2-grid');grid.innerHTML='';
  items.forEach(em=>{
    const cell=document.createElement('div');cell.className='g2-cell';cell.textContent=em;
    cell.addEventListener('click',()=>g2Click(cell,em===set.odd));
    grid.appendChild(cell);
  });
}

function g2Click(cell,ok){
  if(g2.locked)return;g2.locked=true;
  const fb=document.getElementById('g2-feedback');
  if(ok){
    cell.classList.add('correct');g2.score++;g2.round++;
    document.getElementById('g2-score').textContent=g2.score;
    fb.textContent='✅ Нашёл!';fb.style.color='var(--color-success)';
  } else {
    cell.classList.add('wrong');g2.lives--;g2.errors++;
    document.getElementById('g2-lives').textContent=g2.lives;
    fb.textContent='❌ Не то! +5с штраф';fb.style.color='var(--color-error)';
  }
  allTimers.push(setTimeout(g2Round,1000));
}

/* ─── GAME 3 — Пауза ─── */
let g3Active=false,g3Cycle=0,g3Timer=null;

function initG3(){
  g3Active=false;g3Cycle=0;
  document.getElementById('g3-phase').textContent='Нажми «Старт»';
  document.getElementById('g3-counter').textContent='';
  document.getElementById('g3-circle').className='';
  document.getElementById('g3-start-btn').style.display='';
  document.getElementById('g3-stop-btn').style.display='none';
}
function startBreathing(){
  g3Active=true;g3Cycle=0;
  document.getElementById('g3-start-btn').style.display='none';
  document.getElementById('g3-stop-btn').style.display='';
  g3Phase('inhale',4);
}
function g3Phase(phase,secs){
  if(!g3Active)return;
  const circle=document.getElementById('g3-circle');
  const phaseEl=document.getElementById('g3-phase');
  const counterEl=document.getElementById('g3-counter');
  const labels={inhale:'🌬️ Вдох',hold:'🫁 Задержи',exhale:'😮‍💨 Выдох'};
  circle.className=phase==='inhale'?'inhale':'exhale';
  phaseEl.textContent=labels[phase];
  let t=secs;counterEl.textContent=t;
  if(g3Timer)clearInterval(g3Timer);
  g3Timer=setInterval(()=>{
    t--;counterEl.textContent=t;
    if(t<=0){
      clearInterval(g3Timer);
      if(!g3Active)return;
      if(phase==='inhale')g3Phase('hold',7);
      else if(phase==='hold')g3Phase('exhale',8);
      else{
        g3Cycle++;
        document.getElementById('g3-counter').textContent=`Цикл ${g3Cycle}`;
        allTimers.push(setTimeout(()=>{if(g3Active)g3Phase('inhale',4);},1000));
      }
    }
  },1000);
}
function stopBreathing(){
  g3Active=false;if(g3Timer){clearInterval(g3Timer);g3Timer=null;}
  if(g3Cycle>0)showResult('🌿','Молодец!',`Выполнено циклов: ${g3Cycle}`,3,g3Cycle);
  else initG3();
}

/* ─── GAME 4 — Таблица Шульте ─── */
let g4Timer=null,g4Start=0,g4Next=1,g4Errors=0;

function initG4(){
  g4Next=1;g4Errors=0;
  document.getElementById('g4-time').textContent='0.0';
  document.getElementById('g4-target-num').textContent=1;
  document.getElementById('g4-feedback').textContent='Нажимай числа от 1 до 25 по порядку!';
  const nums=[...Array(25)].map((_,i)=>i+1).sort(()=>Math.random()-0.5);
  const grid=document.getElementById('g4-grid');grid.innerHTML='';
  nums.forEach(n=>{
    const cell=document.createElement('div');cell.className='g4-cell';cell.textContent=n;
    cell.addEventListener('click',()=>g4Click(cell,n));
    grid.appendChild(cell);
  });
  g4Start=Date.now();
  if(g4Timer)clearInterval(g4Timer);
  g4Timer=setInterval(()=>{
    document.getElementById('g4-time').textContent=((Date.now()-g4Start)/1000).toFixed(1);
  },100);
}

function g4Click(cell,n){
  if(n===g4Next){
    cell.classList.add('found');cell.style.pointerEvents='none';
    g4Next++;document.getElementById('g4-target-num').textContent=g4Next;
    if(g4Next>25){
      clearInterval(g4Timer);
      const elapsed=((Date.now()-g4Start)/1000).toFixed(1);
      showResult('⚡','Таблица пройдена!',`Время: ${elapsed} сек | Ошибок: ${g4Errors}`,4,parseFloat(elapsed));
    }
  } else {
    g4Errors++;cell.classList.add('error');
    document.getElementById('g4-feedback').textContent=`❌ Ошибок: ${g4Errors}`;
    allTimers.push(setTimeout(()=>cell.classList.remove('error'),400));
  }
}

/* ─── GAME 5 — Запомни ряд ─── */
let g5={level:1,score:0,seq:[],input:[],phase:'show'};
const G5_EMOJIS=['🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐨','🐯'];

function initG5(){
  g5={level:1,score:0,seq:[],input:[],phase:'show'};
  document.getElementById('g5-score').textContent=0;
  document.getElementById('g5-level-num').textContent=1;
  g5NewRound();
}
function g5NewRound(){
  g5.seq=[];g5.input=[];g5.phase='show';
  const len=Math.min(3+g5.level-1,10);
  const pool=[...G5_EMOJIS].sort(()=>Math.random()-0.5).slice(0,Math.min(len+2,10));
  for(let i=0;i<len;i++)g5.seq.push(pool[Math.floor(Math.random()*pool.length)]);
  const seq=document.getElementById('g5-seq');seq.innerHTML='';
  g5.seq.forEach(()=>{const d=document.createElement('div');d.className='g5-indicator';seq.appendChild(d);});
  document.getElementById('g5-instruction').textContent='Запоминай...';
  document.getElementById('g5-level').textContent=`Уровень ${g5.level} • Длина: ${len}`;
  const cards=document.getElementById('g5-cards');cards.innerHTML='';
  pool.forEach(em=>{
    const c=document.createElement('div');c.className='g5-card disabled';c.textContent=em;
    cards.appendChild(c);
  });
  g5Show();
}
function g5Show(){
  const indicators=document.querySelectorAll('#g5-seq .g5-indicator');
  let i=0;
  const showNext=()=>{
    if(i>0)indicators[i-1].classList.remove('active');
    if(i>=g5.seq.length){
      allTimers.push(setTimeout(()=>{
        document.getElementById('g5-instruction').textContent='Повтори последовательность!';
        g5.phase='input';
        document.querySelectorAll('.g5-card').forEach(c=>{
          c.classList.remove('disabled');
          const em=c.textContent;
          c.addEventListener('click',()=>g5Pick(c,em));
        });
      },500));
      return;
    }
    indicators[i].classList.add('active');
    const cards=document.querySelectorAll('.g5-card');
    cards.forEach(c=>{if(c.textContent===g5.seq[i]){c.classList.add('highlight');allTimers.push(setTimeout(()=>c.classList.remove('highlight'),400));}});
    i++;allTimers.push(setTimeout(showNext,700));
  };
  showNext();
}
function g5Pick(cell,em){
  if(g5.phase!=='input')return;
  const idx=g5.input.length;
  g5.input.push(em);
  const indicators=document.querySelectorAll('#g5-seq .g5-indicator');
  if(em===g5.seq[idx]){
    indicators[idx].classList.add('correct');cell.classList.add('correct');
    allTimers.push(setTimeout(()=>cell.classList.remove('correct'),300));
    if(g5.input.length===g5.seq.length){
      g5.phase='done';g5.score++;g5.level++;
      document.getElementById('g5-score').textContent=g5.score;
      document.getElementById('g5-level-num').textContent=g5.level;
      document.querySelectorAll('.g5-card').forEach(c=>c.classList.add('disabled'));
      if(g5.level>10){showResult('🏆','Мастер памяти!',`Пройдено уровней: ${g5.score}`,5,g5.score);return;}
      allTimers.push(setTimeout(g5NewRound,1000));
    }
  } else {
    g5.phase='done';indicators[idx].classList.add('wrong');cell.classList.add('wrong');
    document.querySelectorAll('.g5-card').forEach(c=>c.classList.add('disabled'));
    allTimers.push(setTimeout(()=>{
      cell.classList.remove('wrong');
      g5.level=Math.max(1,g5.level-1);
      document.getElementById('g5-level-num').textContent=g5.level;
      g5NewRound();
    },1300));
  }
}
