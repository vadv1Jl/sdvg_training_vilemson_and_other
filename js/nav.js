/* ══════════════════════════════════════════════
   NAVIGATION
══════════════════════════════════════════════ */
function goHome(){
  stopBreathing();
  clearAllTimers();
  if(g1.raf){cancelAnimationFrame(g1.raf);g1.raf=null;}
  if(g1.reactionRaf){cancelAnimationFrame(g1.reactionRaf);g1.reactionRaf=null;}
  g2StopTimer();
  updateBestBadges();
  showScreen('screen-home');
}

let allTimers=[];
function clearAllTimers(){
  allTimers.forEach(clearTimeout);
  allTimers=[];
  if(g4Timer){clearInterval(g4Timer);g4Timer=null;}
}

function startGame(n){
  if(g1.raf){cancelAnimationFrame(g1.raf);g1.raf=null;}
  if(g1.reactionRaf){cancelAnimationFrame(g1.reactionRaf);g1.reactionRaf=null;}
  g2StopTimer();
  clearAllTimers();
  ({1:initG1,2:initG2,3:initG3,4:initG4,5:initG5})[n]();
  showScreen('screen-'+n);
}

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
