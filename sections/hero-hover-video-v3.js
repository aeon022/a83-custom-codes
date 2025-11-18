/* ============================================================
   A83 HERO – Hover→Video + DOUBLE GLITCH (self-contained) v3
   Erwartet in der Section:
   - #hero  (Section-ID zum Scoping)
   - #show-max  (Stage-Container, position:relative; overflow:hidden)
   - #hover-max (Trigger unter der Stage)
   - .layer-img > img   (Bild)
   - .layer-video > video (Video)
   CSS: siehe vorherige Antworten (Aspect-Ratio, Wrapper-Fix, Keyframes)
   ============================================================ */
(() => {
  const root   = document.getElementById('hero');
  if(!root) return;

  const stage  = root.querySelector('#show-max');
  const trig   = root.querySelector('#hover-max');
  if(!stage || !trig) return;

  const video  = stage.querySelector('.layer-video video');

  // ---------- Helpers ----------
  const prefersRM = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // CSS-Var in ms lesen (zuerst am Stage, dann :root), z.B. --glitch-in: 900ms | 0.9s
  const cssTimeMs = (el, name, fallbackMs) => {
    const read = (node) => (node && getComputedStyle(node).getPropertyValue(name).trim()) || '';
    let v = read(el) || read(document.documentElement);
    if(!v) return fallbackMs;
    if(v.endsWith('ms')) return parseInt(v,10) || fallbackMs;
    if(v.endsWith('s'))  return Math.round(parseFloat(v)*1000) || fallbackMs;
    const n = parseInt(v,10); return isNaN(n) ? fallbackMs : n;
  };

  // Basis-Overlay (.gfx-glitch) mit 6 .g-slice sicherstellen (falls im DOM nicht vorhanden)
  const ensureBaseGlitchOverlay = () => {
    let overlay = stage.querySelector('.gfx-glitch');
    if(!overlay){
      overlay = document.createElement('div');
      overlay.className = 'gfx-glitch';
      overlay.style.position = 'absolute';
      overlay.style.inset = '0';
      overlay.style.pointerEvents = 'none';
      stage.appendChild(overlay);
    }
    const need = 6;
    const have = overlay.querySelectorAll('.g-slice').length;
    for(let i=have;i<need;i++){
      const s = document.createElement('div');
      s.className = 'g-slice';
      overlay.appendChild(s);
    }
  };
  ensureBaseGlitchOverlay();

  // Extra-Glitch: vertikale Cross-Slices (werden pro Burst erzeugt und wieder entfernt)
  function makeVSlices(duration){
    if(prefersRM()) return;
    const wrap = document.createElement('div');
    wrap.className = 'gv-vslices'; // CSS kümmert sich um Anim
    const base  = (window.innerWidth < 768) ? 6 : 10;
    const count = base + Math.floor(Math.random()*4); // +0..3
    for(let i=0;i<count;i++){
      const s = document.createElement('div');
      s.className = 'gv-vslice';
      const w  = 6 + Math.round(Math.random()*16);     // 6%..22%
      const x  = Math.round(Math.random()*(100 - w));  // 0..(100-w)
      const delay = Math.round(Math.random()*140);
      const dur   = Math.max(420, duration - Math.round(Math.random()*120));
      s.style.width = w + '%';
      s.style.left  = x + '%';
      s.style.animation = `gv-vslice-jitter ${dur}ms steps(18) ${delay}ms both`;
      wrap.appendChild(s);
    }
    stage.appendChild(wrap);
    setTimeout(()=> wrap.remove(), duration + 260);
  }

  // Extra-Glitch: Block „Tear“-Pops
  function makeBlocks(duration){
    if(prefersRM()) return;
    const wrap = document.createElement('div');
    wrap.className = 'gv-blocks';
    const base  = (window.innerWidth < 768) ? 3 : 5;
    const count = base + Math.floor(Math.random()*3); // +0..2
    for(let i=0;i<count;i++){
      const b = document.createElement('div');
      b.className = 'gv-block';
      const ww = (window.innerWidth < 768) ? (18 + Math.random()*22) : (18 + Math.random()*28);
      const hh = 6 + Math.random()*16;
      const left = Math.random()*(100 - ww);
      const top  = Math.random()*(100 - hh);
      const delay = Math.round(Math.random()*100);
      const dur   = Math.max(420, duration - Math.round(Math.random()*140));
      b.style.width  = ww + '%';
      b.style.height = hh + '%';
      b.style.left   = left + '%';
      b.style.top    = top + '%';
      b.style.animation = `gv-block-pop ${dur}ms steps(16) ${delay}ms both`;
      wrap.appendChild(b);
    }
    stage.appendChild(wrap);
    setTimeout(()=> wrap.remove(), duration + 200);
  }

  // Glitch-Burst-Controller (klassenbasiert; CSS-Animationen laufen automatisch)
  let glitchTimer = null;
  function glitchBurst(mode /* 'in' | 'out' */){
    stage.classList.remove('glitching','glitch-in','glitch-out');
    if(glitchTimer) { clearTimeout(glitchTimer); glitchTimer = null; }
    const T = cssTimeMs(stage, mode === 'in' ? '--glitch-in' : '--glitch-out', mode === 'in' ? 900 : 700);

    // Basis-Glitch aktivieren (Scanlines, Slices, RGB-Split)
    stage.classList.add('glitching', mode === 'in' ? 'glitch-in' : 'glitch-out');

    // Extra-Layer feuern
    makeVSlices(T);
    setTimeout(()=> makeBlocks(T), mode === 'in' ? 60 : 30);

    // Auto-Cleanup
    glitchTimer = setTimeout(()=>{
      stage.classList.remove('glitching','glitch-in','glitch-out');
      glitchTimer = null;
    }, T);
  }

  // Video-Helpers
  const playVideo = () => {
    if(!video) return;
    try {
      video.muted = true;
      // mini skip, damit kein schwarzer 0-Frame sichtbar ist
      if (video.currentTime < 0.05) video.currentTime = 0.05;
      video.play().catch(()=>{});
    } catch(e){}
  };
  const stopVideo = () => {
    if(!video) return;
    try {
      video.pause();
      video.currentTime = 0;
    } catch(e){}
  };

  // ---------- Public Actions ----------
  const enable = () => {
    glitchBurst('in');
    stage.classList.add('show-video');   // CSS blendet Video ein, Bild aus
    playVideo();
  };
  const disable = () => {
    glitchBurst('out');
    stage.classList.remove('show-video');
    stopVideo();
  };

  // ---------- Events ----------
  // Desktop: Hover/Focus
  trig.addEventListener('mouseenter', enable);
  trig.addEventListener('mouseleave', disable);
  trig.addEventListener('focusin',   enable);
  trig.addEventListener('focusout',  disable);

  // Mobile: Tap Toggle + Outside Close
  let touchOn = false;
  const toggle = () => { touchOn = !touchOn; touchOn ? enable() : disable(); };
  trig.addEventListener('touchstart', (e)=>{ e.preventDefault(); toggle(); }, { passive:false });
  trig.addEventListener('click', (e)=>{
    if (matchMedia('(hover: none)').matches){
      e.preventDefault(); toggle();
    }
  });
  document.addEventListener('click', (e)=>{
    if(!touchOn) return;
    if(!trig.contains(e.target) && !stage.contains(e.target)){
      touchOn = false; disable();
    }
  });

  // Video Setup
  if(video){
    video.setAttribute('playsinline','');
    video.setAttribute('muted','');
    video.addEventListener('loadedmetadata', ()=>{
      try{ if (video.currentTime < 0.05) video.currentTime = 0.05; }catch(e){}
    });
  }

  // Offscreen pausieren (Akkuschonung)
  if('IntersectionObserver' in window && video){
    const io = new IntersectionObserver((entries)=>{
      entries.forEach(entry=>{
        if(entry.isIntersecting){
          if(stage.classList.contains('show-video')) playVideo();
        } else {
          stopVideo();
        }
      });
    }, { threshold: 0.15 });
    io.observe(stage);
  }

  // Optional: Debug-Hooks in der Konsole
  window.A83Hero = {
    enable, disable,
    burstIn:  () => glitchBurst('in'),
    burstOut: () => glitchBurst('out')
  };
})();