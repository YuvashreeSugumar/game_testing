
(function(){
  const $ = (q,root=document)=>root.querySelector(q);
  const $$ = (q,root=document)=>Array.from(root.querySelectorAll(q));
  const sound = {
    on: true,
    play(name){ if(!this.on) return; const a = new Audio('assets/audio/'+name+'.wav'); a.volume = 0.5; a.play().catch(()=>{}); }
  };
  // theme
  const savedTheme = localStorage.getItem('pfg-theme') || 'light';
  if(savedTheme==='dark'){ document.documentElement.setAttribute('data-theme','dark'); }
  $('#themeToggle').addEventListener('click', ()=>{
    const dark = document.documentElement.getAttribute('data-theme')==='dark';
    document.documentElement.setAttribute('data-theme', dark? '' : 'dark');
    localStorage.setItem('pfg-theme', dark? 'light':'dark');
  });
  // sound
  $('#soundToggle').addEventListener('click', ()=>{ sound.on = !sound.on; $('#soundToggle').textContent = sound.on? '🔊':'🔇'; });
  // PWA install
  let deferredPrompt=null;
  window.addEventListener('beforeinstallprompt', e=>{ e.preventDefault(); deferredPrompt=e; $('#installBtn').style.display='inline-block'; });
  $('#installBtn').addEventListener('click', async ()=>{ if(!deferredPrompt) return; deferredPrompt.prompt(); await deferredPrompt.userChoice; deferredPrompt=null; $('#installBtn').style.display='none'; });

  // Screens
  const menu = $('#menu'), game = $('#game'), gameArea = $('#gameArea');
  function gotoMenu(){ menu.classList.add('active'); game.classList.remove('active'); gameArea.innerHTML=''; $('#gameMsg').textContent=''; }
  function gotoGame(){ menu.classList.remove('active'); game.classList.add('active'); }
  $('#backBtn').addEventListener('click', ()=>{ sound.play('click'); gotoMenu(); });

  // Game routing
  let currentGame = null;
  const titles = {
    rhyme: 'Rhyming Words',
    english: 'English Puzzle',
    missing: 'Missing Item Memory',
    money: 'Money Memory',
    math: 'Maths Quiz'
  };
  $$('.game-btn').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const k = btn.dataset.game; currentGame = k;
      $('#gameTitle').textContent = titles[k];
      $('#tutorialTitle').textContent = 'How to play — ' + titles[k];
      $('#tutorialText').textContent = window.PFGames.getTutorial(k);
      $('#tutorial').classList.remove('hidden');
      $('#gameArea').classList.add('hidden');
      gotoGame(); sound.play('click');
    });
  });

  // start / new
  $('#startBtn').addEventListener('click', ()=>{
    sound.play('click');
    const lvl = Number($('#levelSelect').value);
    $('#tutorial').classList.add('hidden');
    $('#gameArea').classList.remove('hidden');
    window.PFGames.start(currentGame, lvl, gameArea, msg=>$('#gameMsg').textContent=msg, sound);
  });
  $('#newGameBtn').addEventListener('click', ()=>{
    if(!currentGame) return;
    sound.play('click');
    const lvl = Number($('#levelSelect').value);
    window.PFGames.start(currentGame, lvl, gameArea, msg=>$('#gameMsg').textContent=msg, sound);
  });

  // SW register
  if('serviceWorker' in navigator){ window.addEventListener('load', ()=> navigator.serviceWorker.register('service-worker.js').catch(()=>{}) ); }

  // expose for debug
  window.PFSpa = { gotoMenu, gotoGame };
})();
