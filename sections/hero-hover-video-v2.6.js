// Hover→Video HARD GLITCH Controller — v2.6
(function(){
  const trigger = document.getElementById('hover-max');
  const stage   = document.getElementById('show-max');
  if(!trigger || !stage) return;

  const videoWrap = stage.querySelector('.layer-video');
  const videoEl   = stage.querySelector('.layer-video video');
  const prefersRM = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Timing aus CSS-Variablen
  const cssMs = (name, fallback) => {
    const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    if(!v) return fallback;
    if(v.endsWith('ms')) return parseInt(v,10);
    if(v.endsWith('s'))  return Math.round(parseFloat(v)*1000);
    const n = parseInt(v,10); return isNaN(n) ? fallback : n;
  };
  const T_IN  = cssMs('--gv-in',  720);
  const T_OUT = cssMs('--gv-out', 520);

  let tOut=null, tKick=null, touchOn=false;

  const clearTimers = () => { if(tOut){clearTimeout(tOut);tOut=null;} if(tKick){clearTimeout(tKick);tKick=null;} };

  // Slices: mehr, kräftiger, zwei Wellen
  function makeSlices(duration, wave=1){
    if(prefersRM()) return;
    const box = document.createElement('div');
    box.className = 'gv-slices';
    const h = stage.clientHeight || 400;

    const base = (window.innerWidth < 768) ? 6 : 10; // mehr Slices als zuvor
    const count = base + Math.floor(Math.random()*3); // +0..2

    const used = new Set();
    for(let i=0;i<count;i++){
      const s = document.createElement('div');
      s.className = 'gv-slice';
      const sh = Math.max(10, Math.round(Math.random()*(h*0.16))); // höher
      let st = Math.round(Math.random()*(h - sh - 4));
      const key = Math.round(st/8)*8;
      if(used.has(key)) st = Math.max(0, Math.min(h-sh-4, st+10));
      used.add(key);

      s.style.top = st + 'px';
      s.style.height = sh + 'px';

      const kf = (Math.random() < 0.5) ? 'gv-slice-shift' : 'gv-slice-skew';
      const delay = Math.round(Math.random()*120) + (wave===2 ? 90 : 0); // 2. Welle etwas später
      const dur = Math.max(420, duration - (wave===2 ? 80 : 0));
      s.style.animation = `${kf} ${dur}ms steps(16) ${delay}ms both`;

      box.appendChild(s);
    }
    stage.appendChild(box);
    setTimeout(()=> box.remove(), duration + 260);
  }

  // Tear Bars
  function makeBars(duration){
    if(prefersRM()) return;
    const bars = document.createElement('div');
    bars.className = 'gv-bars';
    stage.appendChild(bars);
    setTimeout(()=> bars.remove(), duration + 120);
  }

  function glitchIn(){
    if(prefersRM()) return;
    stage.classList.add('gv-in', 'gv-kick');     // Pseudo + Overshoot
    makeSlices(T_IN, 1);
    setTimeout(()=> makeSlices(T_IN, 2), 120);   // zweite Welle
    makeBars(T_IN);

    // Kick wieder lösen
    tKick = setTimeout(()=>{
      stage.classList.remove('gv-kick');
      stage.classList.add('gv-relax');
      setTimeout(()=> stage.classList.remove('gv-relax'), 260);
    }, Math.max(260, T_IN * 0.45));

    setTimeout(()=> stage.classList.remove('gv-in'), T_IN + 60);
  }

  function glitchOut(){
    if(prefersRM()) return;
    stage.classList.add('gv-out');               // Pseudo-Layer aktiv
    makeSlices(T_OUT, 1);
    makeBars(T_OUT);
    setTimeout(()=> stage.classList.remove('gv-out'), T_OUT + 60);
  }

  function enableVideo(){
    clearTimers();
    stage.classList.add('show-video');
    if(videoEl){ try{ videoEl.muted = true; videoEl.play().catch(()=>{}); }catch(e){} }
    glitchIn();
  }

  function disableVideo(){
    clearTimers();
    glitchOut();
    // nach sichtbarem Out erst abschalten
    tOut = setTimeout(()=>{
      stage.classList.remove('show-video');
      if(videoEl){ try{ videoEl.pause(); videoEl.currentTime=0; }catch(e){} }
    }, Math.max(T_OUT, 300));
  }

  /* Interaktionen */
  trigger.addEventListener('mouseenter', enableVideo);
  trigger.addEventListener('mouseleave', disableVideo);
  trigger.addEventListener('focusin',    enableVideo);
  trigger.addEventListener('focusout',   disableVideo);

  // Touch
  const maybeToggle = (e)=>{
    if(e.type==='touchstart'){ e.preventDefault(); }
    touchOn = !touchOn;
    touchOn ? enableVideo() : disableVideo();
  };
  trigger.addEventListener('touchstart', maybeToggle, {passive:false});
  trigger.addEventListener('click', (e)=>{
    if(matchMedia('(hover: none)').matches){
      e.preventDefault();
      maybeToggle(e);
    }
  });
  document.addEventListener('click', (e)=>{
    if(!touchOn) return;
    if(!trigger.contains(e.target) && !stage.contains(e.target)){
      touchOn = false; disableVideo();
    }
  });
})();
