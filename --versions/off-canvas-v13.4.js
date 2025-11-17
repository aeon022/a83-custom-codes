/* Off-Canvas A83 — v13.4
   (WILD + Hint single-line hard + Smooth Close mit Blur-Delay)
   - No-Teleport; Close im nav-head; Morph aus Header-Slot
   - ESC/Close: sofortiger Reset des DP-Burgers (≡)
   - Wild Glitch: Card pulses + Slice-Glitches; Link-Bursts
   - Close-Glitch: kurzer Puls, dann weicher Card-Out; Blur-Out startet mit Delay
   - Terminal-Hint: fa-terminal + $ command /Title (data-title), HINT IMMER EINZEILIG (Grid)
*/
(function(){
  const html = document.documentElement;

  // ===== Refs
  const overlay   = document.getElementById('nav-overlay');
  const card      = overlay?.querySelector('.nav-card');
  const navHead   = overlay?.querySelector('.nav-head');
  const menu      = overlay?.querySelector('.nav-menu');
  const closeSlot = overlay?.querySelector('#nav-close-slot, .nav-close-slot');
  const homeSlot  = document.querySelector('.burger-home-slot');
  const burger    = homeSlot?.querySelector('#nav-trigger');
  let   hintEl    = overlay?.querySelector('.nav-hint');

  if(!overlay || !card || !navHead || !menu || !closeSlot || !homeSlot || !burger){
    console.warn('[nav] Setup unvollständig', {overlay, card, navHead, menu, closeSlot, homeSlot, burger});
    return;
  }

  // Close-Button sicherstellen
  let closeBtn = closeSlot.querySelector('.nav-close-btn');
  if(!closeBtn){
    closeBtn = document.createElement('button');
    closeBtn.className = 'nav-close-btn';
    closeBtn.setAttribute('aria-label','Menü schließen');
    closeBtn.innerHTML = '✕';
    closeSlot.appendChild(closeBtn);
  }

  // Hint-Element sicherstellen
  if(!hintEl){
    hintEl = document.createElement('div');
    hintEl.className = 'nav-hint';
    overlay.appendChild(hintEl);
  }

  // ===== Timings (aus CSS lesen, Fallbacks)
  const cssMs = (name, fallback) => {
    const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    if(!v) return fallback;
    if(v.endsWith('ms')) return parseInt(v,10);
    if(v.endsWith('s'))  return Math.round(parseFloat(v)*1000);
    const n = parseInt(v,10); return isNaN(n) ? fallback : n;
  };
  const T_BURGER       = cssMs('--t-burger',       350);
  const T_CARD_IN      = cssMs('--t-card',         680);
  const T_CARD_OUT     = cssMs('--t-card-out',     420);
  const T_BACKDROP_OUT = cssMs('--t-backdrop-out', 320);
  const T_CLOSE_GAP    = cssMs('--t-close-gap',     60);
  const G_CARD         = cssMs('--glitch-card-dur',640);
  const G_LINK         = cssMs('--glitch-link-dur',520);

  // Close-Glitch kurze Wartezeit, bevor "closing" State aktiviert wird
  const CLOSE_GLITCH_DELAY = 140; // ms

  // ===== State
  let state='closed', lastFocused=null, scrollY=0, ignoreNext=false, dpResetDone=false;

  // ===== Helpers
  const isIOS      = ()=>/iP(ad|hone|od)/.test(navigator.userAgent);
  const prefersRM  = ()=> window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const setState   = s => { state=s; html.setAttribute('data-nav-state', s); };
  const setExpanded= b => burger.setAttribute('aria-expanded', b ? 'true' : 'false');
  const dpButton   = () =>
    burger.querySelector('button, [role="button"], .dan-burger, .hamburger, .dan-burger-animated--distorsionv3') || burger;

  function setScrollbarComp(on){
    const sbw = window.innerWidth - document.documentElement.clientWidth;
    html.style.setProperty('--sbw', on ? (sbw+'px') : '0px');
  }
  function lockBody(){
    setScrollbarComp(true);
    html.classList.add('nav-lock');
    if(isIOS()){
      scrollY = window.scrollY||window.pageYOffset;
      document.body.classList.add('nav-fixed');
      document.body.style.top = `-${scrollY}px`;
    }else{
      document.body.classList.add('nav-fixed');
    }
  }
  function unlockBody(){
    html.classList.remove('nav-lock');
    document.body.classList.remove('nav-fixed');
    document.body.style.top='';
    if(isIOS()) window.scrollTo(0, scrollY||0);
    setScrollbarComp(false);
  }

  // Geometrie
  const slotRect   = ()=> homeSlot.getBoundingClientRect();
  const burgerRect = ()=> (dpButton().getBoundingClientRect?.() || burger.getBoundingClientRect());

  function setCardFromTrigger(){
    const s = slotRect();
    const c = card.getBoundingClientRect();
    card.style.setProperty('--from-x',     (s.right - c.right) + 'px');
    card.style.setProperty('--from-y',     (s.top   - c.top)   + 'px');
    card.style.setProperty('--from-scale', '.94');
  }

  function syncCloseSizeToBurger(){
    const r = burgerRect();
    const w = Math.round(r.width)  + 'px';
    const h = Math.round(r.height) + 'px';
    overlay.style.setProperty('--burger-w', w);
    overlay.style.setProperty('--burger-h', h);
    closeSlot.style.setProperty('min-width', w);
  }

  // ===== Terminal-Hint (single-line enforced)
  const CMD_PREFIX = '$ ';
  const CMD_VARIANTS = [
    t => `open /${t}`,
    t => `lynx /${t}`,
    t => `ssh guest@host:/${t}`,
    t => `cat /${t}/README`,
    t => `curl /${t}`,
    t => `cd /${t} && ls`,
  ];
  const slug = s => (s||'').trim()
     .replace(/[äÄ]/g,'ae').replace(/[öÖ]/g,'oe').replace(/[üÜ]/g,'ue').replace(/ß/g,'ss')
     .replace(/\s+/g,'') || 'page';
  const fmtCmd = t => CMD_PREFIX + CMD_VARIANTS[Math.floor(Math.random()*CMD_VARIANTS.length)](slug(t));

  function enforceSingleLineHint(){
    const hs = hintEl.style;
    hs.setProperty('display','inline-grid','important');
    hs.setProperty('grid-auto-flow','column','important');
    hs.setProperty('grid-template-columns','auto minmax(0,1fr)','important');
    hs.setProperty('white-space','nowrap','important');
    hs.setProperty('overflow','hidden','important');
    hs.setProperty('text-overflow','ellipsis','important');
    hs.setProperty('width','max-content','important');
    hs.setProperty('max-width','calc(100vw - 32px)','important');

    const cmd = hintEl.querySelector('.cmd');
    if(cmd){
      const cs = cmd.style;
      cs.setProperty('min-width','0','important');
      cs.setProperty('overflow','hidden','important');
      cs.setProperty('text-overflow','ellipsis','important');
      cs.setProperty('white-space','nowrap','important');
    }
  }
  function setTermHintFrom(el){
    const title = el?.getAttribute('data-title') || el?.dataset?.title || (el?.textContent||'').trim() || '';
    hintEl.innerHTML = `<i class="fa-solid fa-terminal" aria-hidden="true"></i>&nbsp;<span class="cmd">${fmtCmd(title)}</span>`;
    enforceSingleLineHint();
  }
  function initHints(){
    const items = [...menu.querySelectorAll('.nav-link, a')];
    if(!items.length) return;
    const show = el => { setTermHintFrom(el); overlay.classList.add('hint-visible'); };
    const hide = () => overlay.classList.remove('hint-visible');
    items.forEach(el=>{
      el.addEventListener('mouseenter', ()=> show(el));
      el.addEventListener('focusin',    ()=> show(el));
    });
    menu.addEventListener('mouseleave', hide);
    menu.addEventListener('focusout', e=>{ if(!menu.contains(e.relatedTarget)) hide(); });
  }

  // Fokus-Trap & ESC
  const fsel='a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';
  const focusables = ()=> card.querySelectorAll(fsel);
  function onTabTrap(e){
    if(!(state==='opening'||state==='open') || e.key!=='Tab') return;
    const f = focusables(); if(!f.length) return;
    const first=f[0], last=f[f.length-1];
    if(e.shiftKey && document.activeElement===first){ e.preventDefault(); last.focus(); }
    else if(!e.shiftKey && document.activeElement===last){ e.preventDefault(); first.focus(); }
  }

  function resetDpVisual(){
    if(dpResetDone) return;
    const inner = dpButton();
    if(inner){ ignoreNext = true; inner.click(); } // visuellen DP-State rückgängig machen
    setExpanded(false);
    dpResetDone = true;
  }

  const pulse = (el, cls, ms) => { if(!el) return; el.classList.add(cls); setTimeout(()=>el.classList.remove(cls), ms); };

  // WILD: Slice-Glitch
  function createSliceGlitch(){
    if(prefersRM()) return null;
    const baseCount = (window.innerWidth < 768) ? 4 : 7;
    const count = baseCount + Math.floor(Math.random()*2); // 4–5 / 7–8
    const dur = Math.max(420, Math.min(900, Math.round(G_CARD*1.05)));

    const box = document.createElement('div');
    box.className = 'gl-slices';
    box.style.setProperty('--gl-slice-dur', dur + 'ms');
    box.setAttribute('aria-hidden','true');

    const h = card.clientHeight || 400;
    const used = new Set();

    for(let i=0;i<count;i++){
      const slice = document.createElement('div');
      slice.className = 'gl-slice';

      const sh = Math.max(8, Math.round(Math.random()* (h*0.12)));
      let st = Math.round(Math.random()*(h - sh - 4));
      const key = Math.round(st/10)*10;
      if(used.has(key)) st = Math.max(0, Math.min(h-sh-4, st+12));
      used.add(key);

      slice.style.top    = st + 'px';
      slice.style.height = sh + 'px';

      const v = (Math.random() < 0.5) ? 'a83-slice-shift' : 'a83-slice-skew';
      const delay = Math.round(Math.random()*140);
      slice.style.animation = `${v} var(--gl-slice-dur) steps(14) ${delay}ms both`;

      box.appendChild(slice);
    }
    card.appendChild(box);
    setTimeout(()=> { box.remove(); }, dur + 120);
    return box;
  }

  // Stärkerer Link-Glitch mit mehrfachen Bursts
  function glitchLinksWild(){
    const items = [...menu.querySelectorAll('.nav-link, a')];
    if(!items.length || prefersRM()) return;
    menu.classList.add('glitch-strong');

    items.forEach((el, i)=>{
      const base = i*90 + Math.round(Math.random()*120);
      setTimeout(()=> el.classList.add('g1'), base);
      setTimeout(()=> el.classList.remove('g1'), base + G_LINK*0.6);

      const b2 = base + 80 + Math.round(Math.random()*140);
      setTimeout(()=> el.classList.add('g2'), b2);
      setTimeout(()=> el.classList.remove('g2'), b2 + G_LINK*0.5);

      const b3 = b2 + 140;
      setTimeout(()=> el.classList.add('g3'), b3);
      setTimeout(()=> el.classList.remove('g3'), b3 + 220);
    });

    setTimeout(()=> menu.classList.remove('glitch-strong'), G_LINK + 720);
  }

  function onEsc(e){
    if(e.key==='Escape' && (state==='open'||state==='opening')){
      resetDpVisual(); // sofortiger DP-Reset
      closeNav('esc');
    }
  }

  // ===== Öffnen
  function openNav(){
    if(state!=='closed') return;
    lastFocused = document.activeElement;
    dpResetDone = false;

    closeBtn.classList.add('x-hidden');   // Close-X später einglitchen

    overlay.setAttribute('aria-hidden','false');
    setExpanded(true);
    lockBody();

    card.classList.add('card-primed');
    syncCloseSizeToBurger();
    setCardFromTrigger();

    setTimeout(()=>{
      card.offsetHeight;                  // Reflow
      card.classList.remove('card-primed');
      setState('opening');

      // Card Glitch Puls(e)
      if(!prefersRM()){
        pulse(card, 'glitch', G_CARD);
        setTimeout(()=> pulse(card, 'glitch-strong', Math.round(G_CARD*0.8)), Math.round(G_CARD*0.35));
        createSliceGlitch();
        setTimeout(()=> createSliceGlitch(), Math.round(G_CARD*0.45));
      }

      document.addEventListener('keydown', onTabTrap, true);
      document.addEventListener('keydown', onEsc,     true);

      setTimeout(()=>{
        setState('open');

        // Links: Standard + Wild Bursts
        if(!prefersRM()){
          pulse(menu, 'glitch-once', Math.max(360, G_LINK*0.8));
          glitchLinksWild();
        }

        // X später einglitchen
        setTimeout(()=>{
          closeBtn.classList.remove('x-hidden');
          if(!prefersRM()) pulse(closeBtn, 'x-glitch', 420);
        },  Math.max(140, Math.round(G_LINK*0.45)));

        initHints();
        const f = focusables();
        if(f.length) f[0].focus();
        else { const h1=navHead.querySelector('h1'); if(h1){ h1.setAttribute('tabindex','-1'); h1.focus(); } }
      }, T_CARD_IN);
    }, T_BURGER);

    window.addEventListener('resize', syncCloseSizeToBurger);
  }

  // ===== Schließen (Smooth: erst Glitch, dann closing -> Blur-Out mit Delay)
  function closeNav(){
    if(state!=='open' && state!=='opening') return;

    // Glitch-Puls sichtbar (während state noch "open" ist)
    if(!prefersRM()){
      pulse(card, 'glitch-strong', 220);
      pulse(menu, 'glitch-once',   200);
    }

    // nach kurzer Verzögerung in "closing"; Card beginnt weiches Out, Blur-Out folgt via CSS-Delay
    setTimeout(()=>{
      setState('closing');
      resetDpVisual();              // DP-Burger sofort visuell zurücksetzen
      card.style.pointerEvents='none'; // Spam-Klicks verhindern

      // Gesamtdauer bis zum finalen Hide:
      // Card-Out (T_CARD_OUT) + Gap (T_CLOSE_GAP) + Backdrop-Out (T_BACKDROP_OUT) + kleine Marge
      const TOTAL = T_CARD_OUT + T_CLOSE_GAP + T_BACKDROP_OUT + 40;

      setTimeout(()=>{
        overlay.setAttribute('aria-hidden','true');
        unlockBody();
        setState('closed');

        // Cleanup
        overlay.classList.remove('hint-visible');
        card.classList.remove('glitch','glitch-strong');
        menu.classList.remove('glitch-once','glitch-strong');
        menu.querySelectorAll('.g1,.g2,.g3').forEach(n=>n.classList.remove('g1','g2','g3'));
        closeBtn.classList.remove('x-glitch');
        card.querySelectorAll('.gl-slices').forEach(n=>n.remove());
        card.style.pointerEvents='';

        window.removeEventListener('resize', syncCloseSizeToBurger);

        if(lastFocused && lastFocused.focus) lastFocused.focus(); else burger.focus();
        document.removeEventListener('keydown', onTabTrap, true);
        document.removeEventListener('keydown', onEsc,     true);
      }, TOTAL);
    }, CLOSE_GLITCH_DELAY);
  }

  // Clicks
  burger.addEventListener('click', ()=>{
    if(ignoreNext){ ignoreNext=false; return; }
    if(state==='closed') openNav(); else if(state==='open') closeNav();
  });
  closeBtn.addEventListener('click', ()=>{
    if(state==='open' || state==='opening'){ resetDpVisual(); closeNav(); }
  });

  // ARIA / Dialog
  burger.setAttribute('aria-controls','nav-overlay');
  burger.setAttribute('aria-expanded','false');
  overlay.setAttribute('role','dialog');
  overlay.setAttribute('aria-modal','true');
  overlay.setAttribute('aria-hidden','true');

  console.info('[nav] init ok (v13.4)');
})();