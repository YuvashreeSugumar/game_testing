
window.PFGames = (function(){
  const $ = (q,root=document)=>root.querySelector(q);
  function shuffle(a){ for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]];} return a; }

  // ---------- Rhyming Words ----------
  const rhymeSets = [
    {base:'cat',rhymes:['bat','hat','mat','sat'], offs:['cup','cow','cab','cap']},
    {base:'play',rhymes:['day','say','way','tray'], offs:['pool','pen','pan','pin']},
    {base:'light',rhymes:['night','kite','bright','fight'], offs:['leaf','line','lift','lip']},
    {base:'cake',rhymes:['lake','make','bake','shake'], offs:['cook','book','took','tack']},
    {base:'green',rhymes:['queen','seen','bean','screen'], offs:['grain','grip','grow','greet']},
    {base:'sing',rhymes:['ring','wing','king','thing'], offs:['song','sank','sung','sand']},
  ];
  function startRhyme(lvl, mount, setMsg, sound){
    mount.innerHTML='';
    const box = document.createElement('div'); box.className='info'; mount.appendChild(box);
    const data = rhymeSets[Math.floor(Math.random()*rhymeSets.length)];
    box.innerHTML = `<b>Find words that rhyme with “${data.base}”.</b>`;
    let opts=[];
    if(lvl===1) opts=[...data.rhymes.slice(0,2), ...data.offs.slice(0,2)];
    else if(lvl===2) opts=[...data.rhymes.slice(0,3), data.offs[0]];
    else opts=[...data.rhymes]; // all rhymes only; all are correct
    shuffle(opts);
    const choices = document.createElement('div'); choices.className='grid'; mount.appendChild(choices);
    let found=0, need = Math.min(data.rhymes.length, opts.filter(o=>data.rhymes.includes(o)).length);
    opts.forEach(o=>{
      const b=document.createElement('button'); b.className='answer'; b.textContent=o;
      b.addEventListener('click', ()=>{
        if(data.rhymes.includes(o)){ b.disabled=true; b.style.opacity=.7; sound.play('correct'); setMsg('Nice rhyme!'); found++; if(found>=need) setMsg('Great job! All rhymes found.'); }
        else { sound.play('wrong'); setMsg('Not a rhyme — try another.'); b.disabled=true; }
      });
      choices.appendChild(b);
    });
  }

  // ---------- English Puzzle (jumble/synonym/antonym) ----------
  const words = [
    {w:'happy',syn:'joyful',ant:'sad'},{w:'tiny',syn:'small',ant:'huge'},{w:'brave',syn:'courageous',ant:'cowardly'},
    {w:'quick',syn:'fast',ant:'slow'},{w:'bright',syn:'shiny',ant:'dull'},{w:'silent',syn:'quiet',ant:'noisy'},
    {w:'ancient',syn:'old',ant:'modern'},{w:'cozy',syn:'comfy',ant:'harsh'},{w:'calm',syn:'peaceful',ant:'angry'}
  ];
  function jumble(s){ return shuffle(s.split('')).join(''); }
  function startEnglish(lvl, mount, setMsg, sound){
    mount.innerHTML='';
    const pick = words[Math.floor(Math.random()*words.length)];
    const modes = lvl===1? ['jumble'] : lvl===2? ['jumble','syn'] : ['jumble','syn','ant'];
    const task = modes[Math.floor(Math.random()*modes.length)];
    const card = document.createElement('div'); card.className='info'; mount.appendChild(card);
    if(task==='jumble'){
      const j = jumble(pick.w);
      card.innerHTML = `Unscramble the letters to form a word: <b>${j}</b>`;
      const input = document.createElement('input'); input.className='card'; input.placeholder='type word'; input.style.width='100%';
      const btn = document.createElement('button'); btn.className='cta'; btn.textContent='Check';
      btn.onclick=()=>{ if(input.value.trim().toLowerCase()===pick.w){ sound.play('correct'); setMsg('Correct!'); } else { sound.play('wrong'); setMsg('Try again.'); } };
      mount.appendChild(input); mount.appendChild(btn);
    } else if(task==='syn'){
      card.innerHTML = `Pick a <b>synonym</b> (same meaning) for “${pick.w}”.`;
      const options = shuffle([pick.syn,'sad','tall','soft','rough','slow']).slice(0,4); if(!options.includes(pick.syn)) options[0]=pick.syn; shuffle(options);
      const box=document.createElement('div'); box.className='grid'; mount.appendChild(box);
      options.forEach(o=>{
        const b=document.createElement('button'); b.className='answer'; b.textContent=o;
        b.onclick=()=>{ if(o===pick.syn){ sound.play('correct'); setMsg('Correct synonym!'); } else { sound.play('wrong'); setMsg('Nope — try again.'); b.disabled=true; } };
        box.appendChild(b);
      });
    } else {
      card.innerHTML = `Pick an <b>antonym</b> (opposite) for “${pick.w}”.`;
      const options = shuffle([pick.ant,'happy','tiny','strong','bright','loud']).slice(0,4); if(!options.includes(pick.ant)) options[0]=pick.ant; shuffle(options);
      const box=document.createElement('div'); box.className='grid'; mount.appendChild(box);
      options.forEach(o=>{
        const b=document.createElement('button'); b.className='answer'; b.textContent=o;
        b.onclick=()=>{ if(o===pick.ant){ sound.play('correct'); setMsg('Correct antonym!'); } else { sound.play('wrong'); setMsg('Not that one — try again.'); b.disabled=true; } };
        box.appendChild(b);
      });
    }
  }

  // ---------- Missing Item Memory ----------
  const items = ['💖','🧩','⭐','🎀','🍬','🌈','🎈','🍭'];
  function startMissing(lvl, mount, setMsg, sound){
    mount.innerHTML='';
    const count = lvl===1?4: lvl===2?5:6;
    const chosen = shuffle(items.slice()).slice(0,count);
    const tray = document.createElement('div'); tray.className='grid'; mount.appendChild(tray);
    chosen.forEach(it=>{ const d=document.createElement('div'); d.className='card'; d.textContent=it; tray.appendChild(d); });
    setMsg('Memorize the items…');
    setTimeout(()=>{
      const missingCount = lvl===3?2:1;
      const missing = shuffle(chosen.slice()).slice(0,missingCount);
      tray.innerHTML='';
      chosen.filter(x=>!missing.includes(x)).forEach(it=>{ const d=document.createElement('div'); d.className='card'; d.textContent=it; tray.appendChild(d); });
      const options = shuffle(items.slice()).slice(0,4); if(!options.includes(missing[0])) options[0]=missing[0];
      const box = document.createElement('div'); box.className='grid'; mount.appendChild(box);
      options.forEach(o=>{
        const b=document.createElement('button'); b.className='answer'; b.textContent=o;
        b.onclick=()=>{ if(missing.includes(o)){ sound.play('correct'); setMsg('Correct!'); } else { sound.play('wrong'); setMsg('No — try again.'); b.disabled=true; } };
        box.appendChild(b);
      });
    }, 3000);
  }

  // ---------- Money Memory (match value with coins) ----------
  function coinBreak(v){ const d=[50,20,10,5,2,1], out=[]; let t=v; for(const x of d){ while(t>=x){ out.push(x); t-=x; } } return out; }
  function startMoney(lvl, mount, setMsg, sound){
    mount.innerHTML='';
    const count = lvl===1?3: lvl===2?4:6;
    const values = shuffle([7,9,11,13,16,18,22,25,27,30,37,41]).slice(0,count);
    const cards=[]; values.forEach(v=>{ cards.push({k:v,txt:'₹'+v}); cards.push({k:v,txt:coinBreak(v).map(x=>'₹'+x).join(' + ')}); });
    shuffle(cards);
    const grid = document.createElement('div'); grid.className='grid'; mount.appendChild(grid);
    let first=null, second=null, lock=false, pairs=0;
    cards.forEach(c=>{
      const b=document.createElement('button'); b.className='card'; b.dataset.k=c.k; b.textContent=c.txt;
      b.onclick=()=>{
        if(lock || b.classList.contains('done')) return;
        if(!first){ first=b; b.classList.add('open'); sound.play('click'); return; }
        if(!second){ second=b; b.classList.add('open'); lock=true;
          setTimeout(()=>{
            if(first.dataset.k===second.dataset.k){ first.classList.add('done'); second.classList.add('done'); sound.play('correct'); pairs++; setMsg('Match!'); }
            else { first.classList.remove('open'); second.classList.remove('open'); sound.play('wrong'); setMsg('Try again.'); }
            first=second=null; lock=false;
          }, 500);
        }
      };
      grid.appendChild(b);
    });
  }

  // ---------- Maths Quiz ----------
  function randInt(a,b){ return Math.floor(Math.random()*(b-a+1))+a; }
  function makeProblem(lvl){
    const ops = lvl===1? ['+','-'] : lvl===2? ['+','-','×'] : ['+','-','×','÷'];
    const op = ops[randInt(0,ops.length-1)];
    let a,b,ans;
    if(op==='+'){ a=randInt(2,20*lvl); b=randInt(2,20*lvl); ans=a+b; }
    else if(op==='-'){ a=randInt(5,25*lvl); b=randInt(2,a); ans=a-b; }
    else if(op==='×'){ a=randInt(2,10*lvl); b=randInt(2,10); ans=a*b; }
    else { // division with integer result
      b=randInt(2,10); ans=randInt(2,10*lvl); a=b*ans;
    }
    return {text:`${a} ${op} ${b} = ?`, ans};
  }
  function startMath(lvl, mount, setMsg, sound){
    mount.innerHTML='';
    const card=document.createElement('div'); card.className='info'; mount.appendChild(card);
    function next(){
      const p=makeProblem(lvl);
      card.innerHTML = `<b>Solve:</b> ${p.text}`;
      input.value=''; setMsg('');
      input.onkeyup=(e)=>{ if(e.key==='Enter') check(); };
      function check(){
        const v=parseInt(input.value,10);
        if(v===p.ans){ sound.play('correct'); setMsg('Correct!'); next(); }
        else { sound.play('wrong'); setMsg('Not quite — try again.'); }
      }
      btn.onclick=check;
    }
    const input=document.createElement('input'); input.className='card'; input.placeholder='your answer'; input.style.width='100%';
    const btn=document.createElement('button'); btn.className='cta'; btn.textContent='Check';
    mount.appendChild(input); mount.appendChild(btn);
    next();
  }

  // Public API
  function getTutorial(key){
    switch(key){
      case 'rhyme': return 'Tap the words that rhyme with the given word. In hard mode, all options rhyme!';
      case 'english': return 'Solve the English puzzle: unscramble a word, or choose a synonym/antonym depending on level.';
      case 'missing': return 'Memorize the items for 3 seconds, then pick the item(s) that disappeared.';
      case 'money': return 'Match the price with a set of coins (₹50, ₹20, ₹10, ₹5, ₹2, ₹1).';
      case 'math': return 'Answer math problems. Levels add subtraction, multiplication, and division.';
      default: return 'Have fun!';
    }
  }
  function start(key, lvl, mount, setMsg, sound){
    if(key==='rhyme') startRhyme(lvl, mount, setMsg, sound);
    else if(key==='english') startEnglish(lvl, mount, setMsg, sound);
    else if(key==='missing') startMissing(lvl, mount, setMsg, sound);
    else if(key==='money') startMoney(lvl, mount, setMsg, sound);
    else if(key==='math') startMath(lvl, mount, setMsg, sound);
    else mount.textContent='Unknown game.';
  }
  return { start, getTutorial };
})();
