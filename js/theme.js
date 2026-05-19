/* ══════════════════════════════════════════════
   THEME
══════════════════════════════════════════════ */
(function(){
  const html=document.documentElement;
  let dark=matchMedia('(prefers-color-scheme:dark)').matches;
  try{if(localStorage.getItem('sdvg_theme'))dark=localStorage.getItem('sdvg_theme')==='dark';}catch{}

  function applyTheme(d){
    html.setAttribute('data-theme',d?'dark':'light');
    document.querySelectorAll('[data-theme-toggle]').forEach(b=>b.textContent=d?'☀️':'🌙');
  }
  applyTheme(dark);

  document.addEventListener('click',e=>{
    if(e.target.closest('[data-theme-toggle]')){
      dark=!dark; applyTheme(dark);
      try{localStorage.setItem('sdvg_theme',dark?'dark':'light');}catch{}
    }
  });
})();
