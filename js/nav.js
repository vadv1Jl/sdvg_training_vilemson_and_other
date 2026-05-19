/* ══════════════════════════════════════════════
   NAVIGATION
══════════════════════════════════════════════ */
function goHome(){stopBreathing();clearAllTimers();updateBestBadges();showScreen('screen-home');}

let allTimers=[];
function clearAllTimers(){allTimers.forEach(clearTimeout);allTimers=[];if(g4Timer){clearInterval(g4Timer);g4Timer=null;}}

function startGame(n){clearAllTimers();({1:initG1,2:initG2,3:initG3,4:initG4,5:initG5})[n]();showScreen('screen-'+n);}

function showResult(emoji,title,scoreText,gameId,rawScore){
  document.getElementById('result-emoji').textContent=emoji;
  document.getElementById('result-title').textContent=title;
  document.getElementById('result-score').textContent=scoreText;
  const isNew=saveRecord(gameId,rawScore);
  document.getElementById('result-record-badge').style.display=isNew?'inline-block':'none';
  const old=document.getElementById('result-replay');
  const btn=old.cloneNode(true);old.parentNode.replaceChild(btn,old);
  btn.addEventListener('click',()=>startGame(gameId));
  updateBestBadges();showScreen('screen-result');
}
