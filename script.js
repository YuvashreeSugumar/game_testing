
// Pastel Guardians — Remastered: full game logic for 5 mini-games, light/dark, levels, PWA install, SW register
(function(){
  // utilities
  function $(q, root=document){ return root.querySelector(q); }
  function $all(q, root=document){ return Array.from(root.querySelectorAll(q)); }
  function shuffle(a){ for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]];} return a; }
  function tone(freq=700,dur=80){ try{ if(!window.soundOn) return; const a=new (window.AudioContext||window.webkitAudioContext)(); const o=a.createOscillator(); const g=a.createGain(); o.type='sine'; o.frequency.value=freq; o.connect(g); g.connect(a.destination); g.gain.setValueAtTime(0.04,a.currentTime); o.start(); setTimeout(()=>{ o.stop(); a.close(); }, dur);}catch{} }

  // Theme toggle
  const themeToggle = $('#themeToggle');
  const savedTheme = localStorage.getItem('pg-theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme === 'dark' ? 'dark' : 'light');
  if(savedTheme==='dark') themeToggle.checked = true;
  themeToggle.addEventListener('change', e=>{
    const dark = e.target.checked; document.documentElement.setAttribute('data-theme', dark? 'dark':'light'); localStorage.setItem('pg-theme', dark? 'dark':'light');
  });

  // PWA install prompt
  let deferredPrompt = null;
  window.addEventListener('beforeinstallprompt', e=>{ e.preventDefault(); deferredPrompt = e; $('#installBtn').style.display='inline-block'; });
  $('#installBtn').addEventListener('click', async ()=>{ if(!deferredPrompt) return; deferredPrompt.prompt(); await deferredPrompt.userChoice; deferredPrompt=null; $('#installBtn').style.display='none'; });

  // Sound toggle
  window.soundOn = true;
  $('#soundToggle').addEventListener('click', function(){ window.soundOn = !window.soundOn; this.textContent = window.soundOn? '🔈':'🔇'; });

  // Tabs
  $all('.tab').forEach(btn=> btn.addEventListener('click', ()=>{
    $all('.tab').forEach(b=>b.classList.remove('active'));
    $all('.panel').forEach(p=>p.classList.remove('active'));
    btn.classList.add('active'); document.getElementById('panel-'+btn.dataset.tab).classList.add('active');
  }));

  // ---------------- Rhyming Game ----------------
  const rhymeSets = [
    {base:'cat',rhymes:['bat','hat','sat','mat'],offs:['cow','car','cup','cut']},
    {base:'light',rhymes:['bright','kite','night','fight'],offs:['leaf','lane','lift','lick']},
    {base:'play',rhymes:['day','say','way','tray'],offs:['pool','pen','pig','pan']},
    {base:'star',rhymes:['car','far','jar','guitar'],offs:['stone','stain','stork','stomp']},
    {base:'blue',rhymes:['true','you','shoe','zoo'],offs:['book','bench','bag','ball']},
    {base:'rain',rhymes:['train','brain','plain','gain'],offs:['ring','ran','row','room']},
    {base:'cake',rhymes:['lake','make','bake','shake'],offs:['cook','coin','cold','came']},
    {base:'sing',rhymes:['ring','wing','king','thing'],offs:['song','swing','sunk','sang']},
    {base:'green',rhymes:['seen','queen','bean','screen'],offs:['grain','grip','grow','greet']},
  ];
  let rhymeScore = 0;
  function loadRhyme(){
    $('#rhymeMsg').textContent='';
    const lvl = Number($('#rhymeLevel').value);
    const pick = rhymeSets[Math.floor(Math.random()*rhymeSets.length)];
    $('#rhymePrompt').textContent = pick.base;
    let options = [];
    if(lvl===1){ options = [...pick.rhymes.slice(0,2), ...pick.offs.slice(0,2)]; }
    else if(lvl===2){ options = [...pick.rhymes.slice(0,3), pick.offs[0]]; }
    else { options = [...pick.rhymes.slice(0,4)]; }
    options = shuffle(options);
    const container = $('#rhymeChoices'); container.innerHTML='';
    options.forEach(opt=>{
      const b=document.createElement('button'); b.className='answer'; b.textContent=opt;
      b.addEventListener('click', ()=>{
        if(pick.rhymes.includes(opt)){ tone(900,120); $('#rhymeMsg').textContent='Nice rhyme!'; rhymeScore++; $('#rhymeScore').textContent=rhymeScore; b.disabled=true; }
        else { tone(300,120); $('#rhymeMsg').textContent='Not a rhyme — try another.'; b.disabled=true; }
      });
      container.appendChild(b);
    });
  }
  $('#rhymeNext').addEventListener('click', loadRhyme);
  loadRhyme();

  // ---------------- Memory Word Game ----------------
  const mwPairs = [
    ['brave','showing courage'],['ancient','very old'],['glimpse','a quick look'],['fragile','easily broken'],
    ['drowsy','sleepy'],['gigantic','very large'],['timid','shy'],['eager','excited'],['cozy','warm & comfy'],['polish','to make shiny']
  ];
  let mwState={};
  function startMemWord(){
    $('#mwMsg').textContent='';
    const lvl=Number($('#mwLevel').value);
    const count = lvl===1?4: lvl===2?6:8;
    const chosen = shuffle(mwPairs.slice()).slice(0,count);
    const cards = [];
    chosen.forEach(([w,m])=>{ cards.push({type:'w',text:w,key:w}); cards.push({type:'m',text:m,key:w}); });
    shuffle(cards);
    const grid = $('#mwGrid'); grid.innerHTML='';
    mwState={first:null,second:null,lock:false,matches:0,moves:0,total:count};
    $('#mwMoves').textContent='0';
    cards.forEach(c=>{
      const btn=document.createElement('button'); btn.className='card'; btn.textContent=c.text; btn.dataset.key=c.key;
      btn.addEventListener('click', ()=>{
        if(mwState.lock || btn.classList.contains('matched')) return;
        if(!mwState.first){ mwState.first=btn; btn.classList.add('open'); tone(700,70); return; }
        if(!mwState.second){ mwState.second=btn; btn.classList.add('open'); mwCheck(); }
      });
      grid.appendChild(btn);
    });
  }
  function mwCheck(){
    mwState.lock=true; mwState.moves++; $('#mwMoves').textContent = mwState.moves;
    if(mwState.first.dataset.key === mwState.second.dataset.key){
      tone(900,120);
      setTimeout(()=>{
        mwState.first.classList.add('matched'); mwState.second.classList.add('matched');
        mwState.first.classList.remove('open'); mwState.second.classList.remove('open');
        mwState.first=null; mwState.second=null; mwState.lock=false; mwState.matches++;
        if(mwState.matches>=mwState.total) $('#mwMsg').textContent='All matched! Great memory!';
      },300);
    } else {
      tone(300,120);
      setTimeout(()=>{ mwState.first.classList.remove('open'); mwState.second.classList.remove('open'); mwState.first=null; mwState.second=null; mwState.lock=false; },700);
    }
  }
  $('#mwNew').addEventListener('click', startMemWord);
  startMemWord();

  // ---------------- Missing Item Memory ----------------
  const missItems = ['star','flower','mask','crown','diamond'];
  let missRound=0, missAnswer=null;
  function missStart(){
    $('#missMsg').textContent='';
    missRound++; $('#missRound').textContent=missRound;
    const lvl=Number($('#missLevel').value); const count = lvl===1?3: lvl===2?4:5;
    const chosen = shuffle(missItems.slice()).slice(0,count);
    const tray = $('#missTray'); tray.innerHTML='';
    chosen.forEach(it=>{ const d=document.createElement('div'); d.className='tile'; d.innerHTML=`<img src="assets/img/${it}.png" alt="${it}" style="width:72%;height:72%"/>`; tray.appendChild(d); });
    $('#missMsg').textContent='Memorize the items...';
    setTimeout(()=>{
      const missingCount = lvl===3?2:1;
      const missing = shuffle(chosen.slice()).slice(0,missingCount);
      missAnswer = missing;
      tray.innerHTML='';
      chosen.filter(x=>!missing.includes(x)).forEach(it=>{ const d=document.createElement('div'); d.className='tile'; d.innerHTML=`<img src="assets/img/${it}.png" alt="${it}" style="width:72%;height:72%"/>`; tray.appendChild(d); });
      const opts = shuffle(missItems.slice()).slice(0,4);
      if(!opts.includes(missing[0])) opts[0]=missing[0];
      $('#missChoices').innerHTML='';
      opts.forEach(o=>{
        const b=document.createElement('button'); b.className='answer'; b.innerHTML=`<img src="assets/img/${o}.png" style="width:36px;height:36px;vertical-align:middle"> ${o}`;
        b.addEventListener('click', ()=>{
          if(missing.includes(o)){ tone(900,120); $('#missMsg').textContent='Correct!'; } else { tone(300,120); $('#missMsg').textContent=`No — it was ${missing.join(', ')}.`; }
        });
        $('#missChoices').appendChild(b);
      });
    },3500);
  }
  $('#missStart').addEventListener('click', missStart);

  // ---------------- Money Memory ----------------
  const prices = [7,9,11,13,16,18,22,25,27,30,37,41];
  let moneyState={};
  function coinDecompose(total){
    const denoms=[50,20,10,5,2,1]; let t=total; const arr=[];
    for(const d of denoms){ while(t>=d){ arr.push(d); t-=d; } } return arr;
  }
  function moneyNew(){
    $('#moneyMsg').textContent='';
    const lvl=Number($('#moneyLevel').value); const count = lvl===1?3: lvl===2?4:6;
    const chosen = shuffle(prices.slice()).slice(0,count);
    const cards=[];
    chosen.forEach(v=>{ cards.push({k:''+v,txt:'₹'+v}); cards.push({k:''+v,txt: coinDecompose(v).map(x=>'₹'+x).join(' + ')}); });
    shuffle(cards);
    const grid=$('#moneyGrid'); grid.innerHTML='';
    moneyState={first:null,second:null,lock:false,pairs:0,total:count};
    cards.forEach(c=>{
      const btn=document.createElement('button'); btn.className='card'; btn.dataset.key=c.k; btn.textContent=c.txt;
      btn.addEventListener('click', ()=>{
        if(moneyState.lock || btn.classList.contains('done')) return;
        if(!moneyState.first){ moneyState.first=btn; btn.classList.add('open'); tone(700,70); return; }
        if(!moneyState.second){ moneyState.second=btn; btn.classList.add('open'); moneyCheck(); }
      });
      grid.appendChild(btn);
    });
  }
  function moneyCheck(){
    moneyState.lock=true;
    if(moneyState.first.dataset.key === moneyState.second.dataset.key){
      tone(900,120);
      setTimeout(()=>{ moneyState.first.classList.add('done'); moneyState.second.classList.add('done'); moneyState.first.classList.remove('open'); moneyState.second.classList.remove('open'); moneyState.first=null; moneyState.second=null; moneyState.lock=false; moneyState.pairs++; $('#moneyScore').textContent = moneyState.pairs; if(moneyState.pairs>=moneyState.total) $('#moneyMsg').textContent='All matched! Great!'; },300);
    } else {
      tone(300,120); setTimeout(()=>{ moneyState.first.classList.remove('open'); moneyState.second.classList.remove('open'); moneyState.first=null; moneyState.second=null; moneyState.lock=false; },700);
    }
  }
  $('#moneyNew').addEventListener('click', moneyNew);
  moneyNew();

  // ---------------- Spot the Difference ----------------
  const scenes = [{A:'assets/spot/scene1_A.png',B:'assets/spot/scene1_B.png',diff: 'assets/spot/scene1_diffs.json'},{A:'assets/spot/scene2_A.png',B:'assets/spot/scene2_B.png',diff:'assets/spot/scene2_diffs.json'}];
  let spotIdx=0, found=0;
  function loadSpot(){
    found=0; $('#spotFound').textContent=found;
    const s = scenes[spotIdx % scenes.length]; spotIdx++;
    $('#spotA').src = s.A; $('#spotB').src = s.B; $('#spotMsg').textContent='Tap differences in the right image.';
  }
  $('#spotNew').addEventListener('click', loadSpot);
  $('#spotB').addEventListener('click', function(ev){
    const rect = ev.currentTarget.getBoundingClientRect();
    const x = ev.clientX - rect.left, y = ev.clientY - rect.top;
    // mark visually
    const dot = document.createElement('div'); dot.style.position='absolute'; dot.style.width='18px'; dot.style.height='18px'; dot.style.border='3px solid var(--accent)'; dot.style.borderRadius='50%'; dot.style.left = (ev.currentTarget.offsetLeft + x - 9) + 'px'; dot.style.top = (ev.currentTarget.offsetTop + y - 9) + 'px'; dot.style.pointerEvents='none';
    ev.currentTarget.parentElement.appendChild(dot);
    found++; $('#spotFound').textContent = found; tone(850,120);
    if(found>=6) $('#spotMsg').textContent='Great! You found six differences.';
  });
  loadSpot();

  // Service worker registration (best effort)
  if('serviceWorker' in navigator){ window.addEventListener('load', ()=>{ navigator.serviceWorker.register('sw.js').catch(()=>{}); }); }

})(); // end IIFE
