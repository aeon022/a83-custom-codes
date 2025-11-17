/* === A83 SCROLL-TONE DEBUG HUD — v1.2 (non-invasive) ===
   - zeigt live: Header-Tone, erkannte Section, Pause-Status (Overlay), CheckPoint-Position
   - alternativer Tone-Detector (elementFromPoint + Luminanz-Fallback)
   - Tools: Force Tone -> setzt #site-header[data-tone], Highlight/Pin, Logs
   - keine Abhängigkeiten; keine Änderungen am bestehenden v13.5 Script nötig
*/
(function(){
  const NS = 'a83-tone-debug';
  if (window.__A83_TONE_DEBUG__) return; // nur einmal
  window.__A83_TONE_DEBUG__ = true;

  const html    = document.documentElement;
  const header  = document.getElementById('site-header');

  // ---- Style (eingespritzt) ----
  const css = `
  #${NS}-box{position:fixed;inset:auto 10px 10px auto;z-index:99999;
    font:12px/1.35 ui-monospace,Menlo,Consolas,monospace;color:#0ff;background:#101314ee;
    border:1px solid #244; border-radius:10px; padding:10px 10px 8px; box-shadow:0 6px 30px #0007;
    backdrop-filter: blur(6px) saturate(130%); width: 320px}
  #${NS}-box b{color:#fff}
  #${NS}-box .row{display:flex;justify-content:space-between;gap:10px;margin:4px 0}
  #${NS}-box .row .val{color:#9ee}
  #${NS}-box .warn{color:#ff6}
  #${NS}-box .bad{color:#f88}
  #${NS}-box .ok{color:#8f8}
  #${NS}-box .btns{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}
  #${NS}-box button{all:unset;cursor:pointer;border:1px solid #2a3; padding:4px 7px; border-radius:7px}
  #${NS}-box button:hover{background:#0b1518}
  #${NS}-dot{position:fixed;left:50%;transform:translateX(-50%);width:10px;height:10px;border-radius:999px;
    background:#0ff;box-shadow:0 0 0 3px #0ff4, 0 0 16px #0ff; pointer-events:none; z-index:99998}
  .${NS}-hl{outline:2px dashed #0ff; outline-offset:-2px; position:relative}
  .${NS}-hl::after{content:'[data-tone]'; position:absolute; top:4px; left:4px; font:10px ui-monospace;
    background:#0ff; color:#000; padding:2px 4px; border-radius:4px}
  `;
  const style = document.createElement('style'); style.textContent = css; document.head.appendChild(style);

  // ---- HUD ----
  const box = document.createElement('div');
  box.id = `${NS}-box`;
  box.innerHTML = `
    <div class="row"><b>SCROLL-TONE DEBUG</b><span class="val" id="${NS}-state">…</span></div>
    <div class="row"><span>Header tone</span><span class="val" id="${NS}-hdr">–</span></div>
    <div class="row"><span>Detected (data-tone)</span><span class="val" id="${NS}-det">–</span></div>
    <div class="row"><span>Alt (luminance)</span><span class="val" id="${NS}-alt">–</span></div>
    <div class="row"><span>Sections [data-tone]</span><span class="val" id="${NS}-cnt">0</span></div>
    <div class="row"><span>Nav state</span><span class="val" id="${NS}-nav">–</span></div>
    <div class="row"><span>CheckPoint Y</span><span class="val" id="${NS}-cp">–</span></div>
    <div class="btns">
      <button id="${NS}-force-dark">Force dark</button>
      <button id="${NS}-force-light">Force light</button>
      <button id="${NS}-clear">Clear force</button>
      <button id="${NS}-pin">Pin highlight</button>
      <button id="${NS}-hide">Hide HUD</button>
    </div>
  `;
  document.body.appendChild(box);

  const $ = id => box.querySelector('#'+id);
  const elHdr = $(`${NS}-hdr`);
  const elDet = $(`${NS}-det`);
  const elAlt = $(`${NS}-alt`);
  const elCnt = $(`${NS}-cnt`);
  const elNav = $(`${NS}-nav`);
  const elCP  = $(`${NS}-cp`);
  const elState = $(`${NS}-state`);

  // CheckPoint Marker
  const dot = document.createElement('div'); dot.id = `${NS}-dot`; document.body.appendChild(dot);

  // Helpers
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
  const navState = () => html.getAttribute('data-nav-state') || 'closed';
  const secs = () => Array.from(document.querySelectorAll('[data-tone]'));
  const isPaused = () => {
    const s = navState();
    return (s === 'opening' || s === 'open' || html.classList.contains('nav-lock'));
  };

  // get element under header +10px using elementFromPoint
  function sampleUnderHeader(){
    if(!header) return {el:null, y: 0};
    const hRect = header.getBoundingClientRect();
    const y = clamp(hRect.bottom + 10, 0, window.innerHeight - 1);
    const x = Math.round(window.innerWidth/2);
    const el = document.elementFromPoint(x, y);
    return {el, y};
  }

  // walk up to first [data-tone]
  function findDataTone(el){
    let cur = el;
    while(cur && cur !== document.documentElement){
      if(cur.hasAttribute && cur.hasAttribute('data-tone')){
        return {tone: cur.getAttribute('data-tone'), section: cur};
      }
      cur = cur.parentNode;
    }
    // fallback: nearest section intersecting the checkpoint
    const st = window.scrollY + (header?.offsetHeight||60) + 10;
    let best=null, bestDist=Infinity;
    for(const s of secs()){
      const r = s.getBoundingClientRect();
      const top = window.scrollY + r.top;
      const bottom = top + r.height;
      if(st>=top && st<=bottom){ return {tone: s.getAttribute('data-tone'), section: s}; }
      const d = Math.min(Math.abs(st-top), Math.abs(st-bottom));
      if(d < bestDist){ bestDist = d; best = s; }
    }
    return best ? {tone: best.getAttribute('data-tone'), section: best} : {tone:null, section:null};
  }

  // compute tone by background luminance of first non-transparent ancestor
  function altToneByLuminance(el){
    function parseRGBA(c){
      const m = c.match(/rgba?\(([^)]+)\)/i); if(!m) return null;
      const parts = m[1].split(',').map(v=>parseFloat(v.trim()));
      const [r,g,b,a=1] = parts;
      return {r,g,b,a};
    }
    function relLum({r,g,b}){
      function toLin(v){ v/=255; return (v<=0.03928)? v/12.92 : Math.pow((v+0.055)/1.055,2.4); }
      const R=toLin(r), G=toLin(g), B=toLin(b);
      return 0.2126*R + 0.7152*G + 0.0722*B;
    }
    let cur = el;
    while(cur && cur !== document.documentElement){
      const cs = getComputedStyle(cur);
      const bg = cs.backgroundColor;
      const rgba = parseRGBA(bg);
      if(rgba && rgba.a > 0.02){
        const L = relLum(rgba);
        // Helle Fläche -> 'light' (Header soll dunkle Schrift nehmen)
        return { tone: (L > 0.5 ? 'light' : 'dark'), L, el: cur };
      }
      cur = cur.parentElement;
    }
    return { tone: null, L: null, el: null };
  }

  let lastHL=null, pinHL=false;

  function highlight(section){
    if(pinHL) return; // pinned
    if(lastHL) lastHL.classList.remove(`${NS}-hl`);
    if(section) { section.classList.add(`${NS}-hl`); lastHL = section; }
  }

  function ui(){
    const paused = isPaused();
    const hdrTone = header ? header.getAttribute('data-tone') : null;

    const {el, y} = sampleUnderHeader();
    dot.style.top = `${y}px`;

    const dataTone = findDataTone(el);
    const alt      = altToneByLuminance(el || document.body);

    // UI fill
    elState.textContent = paused ? 'paused (overlay)' : 'active';
    elState.className = paused ? 'warn' : 'ok';
    elHdr.textContent = hdrTone || '–';
    elDet.textContent = dataTone.tone || '∅';
    elAlt.textContent = alt.tone ? `${alt.tone} (L=${alt.L?.toFixed(2)})` : '∅';
    elCnt.textContent = String(secs().length);
    elNav.textContent = navState();
    elCP.textContent  = `viewport ${Math.round(y)}px`;

    // mismatch warning in console
    if(hdrTone && dataTone.tone && hdrTone !== dataTone.tone){
      console.warn('[A83 DEBUG] Header tone ≠ data-tone:', {header:hdrTone, dataTone:dataTone.tone, section:dataTone.section});
    }

    // highlight
    highlight(dataTone.section);
  }

  // Controls
  box.querySelector('#'+NS+'-force-dark').addEventListener('click', ()=>{
    if(!header) return;
    header.setAttribute('data-tone','dark'); console.log('[A83 DEBUG] force tone: dark');
    ui();
  });
  box.querySelector('#'+NS+'-force-light').addEventListener('click', ()=>{
    if(!header) return;
    header.setAttribute('data-tone','light'); console.log('[A83 DEBUG] force tone: light');
    ui();
  });
  box.querySelector('#'+NS+'-clear').addEventListener('click', ()=>{
    if(!header) return;
    header.removeAttribute('data-tone'); console.log('[A83 DEBUG] cleared header data-tone');
    ui();
  });
  box.querySelector('#'+NS+'-pin').addEventListener('click', ()=>{
    pinHL = !pinHL;
    box.querySelector('#'+NS+'-pin').textContent = pinHL ? 'Unpin highlight' : 'Pin highlight';
  });
  box.querySelector('#'+NS+'-hide').addEventListener('click', ()=>{
    box.style.display = 'none';
    dot.style.display = 'none';
  });

  // React to changes
  const rafTick = ()=> { ui(); requestAnimationFrame(rafTick); };
  requestAnimationFrame(rafTick);

  window.addEventListener('scroll', ui, {passive:true});
  window.addEventListener('resize', ui, {passive:true});
  document.addEventListener('visibilitychange', ui, {passive:true});

  // Wenn das Hauptscript den Nav-State ändert, sehen wir es über data-nav-state automatisch.
  // Trotzdem mini-Event für manuelles Resume:
  document.addEventListener('a83:tone-resume', ui);

  console.info('[A83 DEBUG] HUD ready. Look top-right.');
})();