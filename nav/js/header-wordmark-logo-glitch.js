<script>
/* A83 Wordmark Destructive Glitch v2.0 */
(function(){
  const root  = document.getElementById('brand-wordmark');
  if(!root){ console.warn('[wordmark] #brand-wordmark fehlt'); return; }
  const base  = root.querySelector('img');
  if(!base){ console.warn('[wordmark] <img> im Wordmark fehlt'); return; }

  /* N Ghost-Slices generieren (abwechselnd Cyan/Magenta) */
  const N = 6; // Anzahl Slices
  const src = base.getAttribute('src');
  const ghosts = [];

  function makeSlice(idx){
    const g = document.createElement('img');
    g.src = src; g.alt = ''; g.decoding = 'async';
    g.className = 'wm-ghost ' + (idx % 2 ? 'c' : 'm');
    // Zufälliges vertikales Segment ausschneiden (zerstören):
    // top in %, h in % → clip-path: inset(T% 0 B% 0)
    const top = Math.max(0, Math.min(88, Math.round(Math.random()*88)));
    const h   = Math.max(6, Math.round(6 + Math.random()*16));
    const bottom = Math.max(0, 100 - (top + h));
    g.style.clipPath = `inset(${top}% 0 ${bottom}% 0)`;
    // leicht versetzen – jede Scheibe anderes Delay
    const dly = Math.round(Math.random()*120);
    g.style.animationDelay = dly + 'ms';
    // kleine Start-Versatzrichtung
    const dir = (Math.random() < .5 ? -1 : 1) * (1 + Math.random()*2);
    g.style.setProperty('--wm-jx', dir);
    ghosts.push(g);
    root.appendChild(g);
  }

  for(let i=0;i<N;i++) makeSlice(i);

  /* Glitch-Burst: Ghosts sichtbar, jitter + random translateX */
  function burst(duration = 560){
    // steps/Duration dynamisch
    root.style.setProperty('--wm-burst', duration + 'ms');
    root.style.setProperty('--wm-steps', 14 + Math.floor(Math.random()*6));
    root.classList.add('g-active');
    ghosts.forEach((g,i)=>{
      // kleiner horizontaler Offset je Slice
      const off = ((i%2?1:-1) * (1 + Math.random()*2)) + 'px';
      g.style.transform = `translateX(${off})`;
    });
    // nach Ende wieder neutralisieren
    setTimeout(()=>{
      root.classList.remove('g-active');
      ghosts.forEach(g=> g.style.transform = 'translateX(0)');
    }, duration + 20);
  }

  /* Intro nur einmal pro Session */
  const key='a83WordmarkIntro2';
  if(sessionStorage.getItem(key) !== '1'){
    burst(720);                  // kräftiger Start
    setTimeout(()=> root.classList.add('idle-dim'), 760);
    sessionStorage.setItem(key, '1');
  }else{
    root.classList.add('idle-dim');
  }

  /* Hover rein: Dim aus + Burst */
  const onEnter = ()=>{
    root.classList.remove('idle-dim');
    burst(520);
  };

  /* Hover raus: kurzer Out-Burst + wieder dimmen */
  const onLeave = ()=>{
    burst(420);
    setTimeout(()=> root.classList.add('idle-dim'), 440);
  };

  root.addEventListener('pointerenter', onEnter);
  root.addEventListener('focusin',     onEnter);
  root.addEventListener('pointerleave',onLeave);
  root.addEventListener('focusout',    onLeave);

  // „Alive“-Bursts im Idle, sporadisch
  (function loop(){
    const t = 14000 + Math.round(Math.random()*9000);
    setTimeout(()=>{
      if(root.classList.contains('idle-dim')) burst(420);
      loop();
    }, t);
  })();
})();
</script>