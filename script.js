let soundOn = true;
const tone = (f=700,d=120)=>{ if(!soundOn) return; try{ const a=new (window.AudioContext||window.webkitAudioContext)(); const o=a.createOscillator(); const g=a.createGain(); o.frequency.value=f; o.type='triangle'; o.connect(g); g.connect(a.destination); g.gain.setValueAtTime(0.05,a.currentTime); o.start(); setTimeout(()=>{o.stop();a.close();},d);}catch{} };

const tabs=[...document.querySelectorAll('.tab')];
const panels=[...document.querySelectorAll('.panel')];
tabs.forEach(t=> t.addEventListener('click', ()=>{
  tabs.forEach(x=>x.classList.remove('active')); panels.forEach(p=>p.classList.remove('active'));
  t.classList.add('active'); document.getElementById('panel-'+t.dataset.tab).classList.add('active');
}));

document.getElementById('soundBtn').addEventListener('click', e=>{ soundOn=!soundOn; e.target.textContent=soundOn?'🔈':'🔇'; });

let deferredPrompt=null;
window.addEventListener('beforeinstallprompt', (e)=>{ e.preventDefault(); deferredPrompt=e; document.getElementById('installBtn').style.display='inline-block'; });
document.getElementById('installBtn').addEventListener('click', async ()=>{ if(!deferredPrompt) return; deferredPrompt.prompt(); await deferredPrompt.userChoice; deferredPrompt=null; document.getElementById('installBtn').style.display='none'; });
if('serviceWorker' in navigator){ window.addEventListener('load',()=> navigator.serviceWorker.register('sw.js')); }

// 1) Rhyming
const rhymeData = [
  {base:'light', rhymes:['bright','kite','night','fight'], off:['late','leaf','laugh','road']},
  {base:'play', rhymes:['day','say','way','tray'], off:['pea','pen','sit','snow']},
  {base:'star', rhymes:['car','far','jar','guitar'], off:['storm','stone','stair','steam']},
  {base:'blue', rhymes:['true','you','shoe','zoo'], off:['book','boot','boo','bee']},
  {base:'cake', rhymes:['lake','make','bake','shake'], off:['kick','peek','pack','dock']},
  {base:'rain', rhymes:['train','brain','plain','gain'], off:['ring','ran','row','room']},
  {base:'mouse', rhymes:['house','blouse','spouse','douse'], off:['moss','moose','muse','maze']},
  {base:'snow', rhymes:['go','show','toe','glow'], off:['snail','snore','sneer','snack']},
  {base:'sing', rhymes:['ring','wing','king','thing'], off:['sang','song','sung','sink']},
  {base:'green', rhymes:['queen','seen','screen','bean'], off:['grain','grin','grind','grand']}
];
let rhymeScore=0;
const rhymePrompt=document.getElementById('rhymePrompt');
const rhymeAnswers=document.getElementById('rhymeAnswers');
const rhymeFeedback=document.getElementById('rhymeFeedback');
const rhymeScoreEl=document.getElementById('rhymeScore');
function newRhyme(){
  const pick = rhymeData[Math.floor(Math.random()*rhymeData.length)];
  rhymePrompt.textContent = 'Word: ' + pick.base;
  const options = [...pick.rhymes.slice(0,2), ...pick.off.slice(0,2)];
  options.sort(()=>Math.random()-0.5);
  rhymeAnswers.innerHTML='';
  let corrects=0;
  options.forEach(opt=>{
    const btn = document.createElement('button');
    btn.className='answer';
    btn.textContent=opt;
    btn.onclick=()=>{
      if(pick.rhymes.includes(opt)){ tone(900,120); rhymeFeedback.textContent='✅ Nice rhyme!'; rhymeScore++; corrects++; btn.disabled=true; }
      else { tone(300,120); rhymeFeedback.textContent='Not a rhyme. Try another.'; btn.disabled=true; }
      rhymeScoreEl.textContent=rhymeScore;
      if(corrects>=2){ setTimeout(newRhyme, 700); }
    };
    rhymeAnswers.appendChild(btn);
  });
}
document.getElementById('nextRhyme').addEventListener('click', newRhyme);
newRhyme();

// 2) Memory Word (match word to meaning)
const mwData = [
  ['brave','not scared; showing courage'],
  ['ancient','very old; from long ago'],
  ['glimpse','a quick look'],
  ['fragile','easily broken'],
  ['drowsy','sleepy and tired'],
  ['gigantic','very, very large'],
  ['timid','shy or nervous'],
  ['eager','excited and ready'],
  ['cozy','warm and comfortable'],
  ['polish','to make shiny by rubbing']
];
const mwGrid=document.getElementById('mwGrid'), mwFeedback=document.getElementById('mwFeedback'), mwMoves=document.getElementById('mwMoves');
let mwFirst=null, mwSecond=null, mwLock=false, mwPairs=0, mwMovesCt=0;
function newMemWord(){
  mwGrid.innerHTML=''; mwFeedback.textContent=''; mwFirst=mwSecond=null; mwLock=false; mwPairs=0; mwMovesCt=0; mwMoves.textContent='0';
  const chosen = mwData.sort(()=>Math.random()-0.5).slice(0,6);
  const cards = chosen.flatMap(([w,m])=>([{type:'w',text:w,key:w},{type:'m',text:m,key:w}]));
  cards.sort(()=>Math.random()-0.5);
  cards.forEach(c=>{
    const el=document.createElement('button'); el.className='card'; el.textContent=c.text; el.dataset.key=c.key; el.onclick=()=> mwFlip(el);
    mwGrid.appendChild(el);
  });
}
function mwFlip(card){
  if(mwLock || card.classList.contains('done') || card.classList.contains('open')) return;
  card.classList.add('open');
  if(!mwFirst){ mwFirst=card; tone(700,70); return; }
  if(!mwSecond){ mwSecond=card; mwMovesCt++; mwMoves.textContent=mwMovesCt; mwCheck(); }
}
function mwCheck(){
  mwLock=true;
  if(mwFirst.dataset.key===mwSecond.dataset.key){
    tone(900,120); setTimeout(()=>{ mwFirst.classList.add('done'); mwSecond.classList.add('done'); mwFirst=null; mwSecond=null; mwLock=false; mwPairs++; if(mwPairs>=6){ mwFeedback.textContent='🎉 All matched! Great memory!'; } }, 300);
  } else {
    tone(300,120); setTimeout(()=>{ mwFirst.classList.remove('open'); mwSecond.classList.remove('open'); mwFirst=null; mwSecond=null; mwLock=false; }, 600);
  }
}
document.getElementById('newMemWord').addEventListener('click', newMemWord);
newMemWord();

// 3) Missing Item
const missTray=document.getElementById('missTray'), missChoices=document.getElementById('missChoices'), missFeedback=document.getElementById('missFeedback'), missRound=document.getElementById('missRound');
const items = ['star','flower','crown','mask','diamond'];
let missShown=[], missAnswer=null, round=0;
function missStart(){
  round++; missRound.textContent=round; missFeedback.textContent='Look carefully for 4 seconds...';
  missShown = items.slice().sort(()=>Math.random()-0.5).slice(0,4);
  missTray.innerHTML=''; missChoices.innerHTML='';
  missShown.forEach(n=>{
    const t=document.createElement('div'); t.className='tile'; t.innerHTML=`<img alt="${n}" src="assets/img/${n}.png">`; missTray.appendChild(t);
  });
  setTimeout(()=>{
    const missing = missShown[Math.floor(Math.random()*missShown.length)];
    missAnswer = missing;
    missTray.innerHTML='';
    missShown.filter(n=>n!==missing).forEach(n=>{
      const t=document.createElement('div'); t.className='tile'; t.innerHTML=`<img alt="${n}" src="assets/img/${n}.png">`; missTray.appendChild(t);
    });
    missFeedback.textContent='Which item is missing?';
    const opts = items.slice().sort(()=>Math.random()-0.5).slice(0,3);
    if(!opts.includes(missing)) opts[0]=missing; opts.sort(()=>Math.random()-0.5);
    opts.forEach(n=>{
      const b=document.createElement('button'); b.className='answer'; b.innerHTML=`<img alt="${n}" src="assets/img/${n}.png" style="width:40px;height:40px;vertical-align:middle"> ${n}`;
      b.onclick=()=>{
        if(n===missAnswer){ tone(900,120); missFeedback.textContent='✅ Correct!'; } else { tone(300,120); missFeedback.textContent='Not quite. It was '+missAnswer+'.'; }
      };
      missChoices.appendChild(b);
    });
  }, 4000);
}
document.getElementById('missStart').addEventListener('click', missStart);

// 4) Money Memory
const moneyGrid=document.getElementById('moneyGrid'), moneyFeedback=document.getElementById('moneyFeedback'), moneyScoreEl=document.getElementById('moneyScore');
let moneyScore=0, moneyPairs=0, moneyFirst=null, moneySecond=null, moneyLock=false;
const prices = [7,9,11,13,16,18,22,25,27,30,37,41];
function makeCoins(total){
  const denoms=[50,20,10,5,2,1]; let t=total; const arr=[];
  for(const d of denoms){ while(t>=d){ arr.push(d); t-=d; } }
  return arr;
}
function newMoneyRound(){
  moneyGrid.innerHTML=''; moneyFeedback.textContent=''; moneyPairs=0; moneyFirst=null; moneySecond=null; moneyLock=false;
  const chosen = prices.slice().sort(()=>Math.random()-0.5).slice(0,6);
  const cards = chosen.flatMap(v=> ([{type:'price', key:''+v, text:'₹'+v},{type:'coins', key:''+v, text: makeCoins(v).map(c=>'₹'+c).join(' + ')}]));
  cards.sort(()=>Math.random()-0.5);
  cards.forEach(c=>{
    const el=document.createElement('button'); el.className='card'; el.dataset.key=c.key; el.textContent=c.text; el.onclick=()=> moneyFlip(el);
    moneyGrid.appendChild(el);
  });
}
function moneyFlip(card){
  if(moneyLock || card.classList.contains('done') || card.classList.contains('open')) return;
  card.classList.add('open'); tone(700,70);
  if(!moneyFirst){ moneyFirst=card; return; }
  if(!moneySecond){ moneySecond=card; moneyCheck(); }
}
function moneyCheck(){
  moneyLock=true;
  if(moneyFirst.dataset.key===moneySecond.dataset.key){
    tone(900,120); setTimeout(()=>{ moneyFirst.classList.add('done'); moneySecond.classList.add('done'); moneyFirst=null; moneySecond=null; moneyLock=false; moneyPairs++; moneyScore++; moneyScoreEl.textContent=moneyScore; if(moneyPairs>=6){ moneyFeedback.textContent='🎉 Great money sense!'; } }, 300);
  } else {
    tone(300,120); setTimeout(()=>{ moneyFirst.classList.remove('open'); moneySecond.classList.remove('open'); moneyFirst=null; moneySecond=null; moneyLock=false; }, 600);
  }
}
document.getElementById('newMoney').addEventListener('click', newMoneyRound);
newMoneyRound();

// 5) Spot the Difference
const scenes=[{A:'assets/spot/scene1_A.png',B:'assets/spot/scene1_B.png'},{A:'assets/spot/scene2_A.png',B:'assets/spot/scene2_B.png'}];
let spotIndex=0, spotFound=0;
const spotA=document.getElementById('spotA'), spotB=document.getElementById('spotB'), spotFoundEl=document.getElementById('spotFound'), spotFeedback=document.getElementById('spotFeedback');
function loadSpot(){
  const s=scenes[spotIndex%scenes.length]; spotIndex++; spotFound=0; spotFoundEl.textContent=spotFound;
  spotA.src=s.A; spotB.src=s.B; spotFeedback.textContent='Tap on Scene B where you see a difference.';
}
function markClick(ev){
  const img=ev.currentTarget; const wrap=img.parentElement;
  const r=img.getBoundingClientRect(); const x=ev.clientX-r.left, y=ev.clientY-r.top;
  const dot=document.createElement('div');
  dot.style.position='absolute'; dot.style.left=(img.offsetLeft + x - 8)+'px'; dot.style.top=(img.offsetTop + y - 8)+'px';
  dot.style.width='16px'; dot.style.height='16px'; dot.style.border='3px solid #ff69b4'; dot.style.borderRadius='50%'; dot.style.pointerEvents='none';
  wrap.appendChild(dot);
  spotFound++; spotFoundEl.textContent=spotFound; tone(850,120);
  if(spotFound>=6){ spotFeedback.textContent='🎉 You found six!'; }
}
document.getElementById('spotNew').addEventListener('click', loadSpot);
spotB.addEventListener('click', markClick);
loadSpot();

// PWA
