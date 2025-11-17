/* Off-Canvas A83 - v13.5 + SCROLL TONE DETECTION
   - FIXED: Scroll detection runs independently from menu
   - Scroll-based data-tone detection for header color changes
   - Wordmark & Burger init glitch animations
   - Custom Burger with Open/Reset-Animation
   - ESC/Close: clean reset (aria-expanded=false, .is-open weg) + recoil
   - Wild Glitch: Card pulses + Slice-Glitches; Link-Bursts
   - Terminal-Hint: fa-terminal + $ command /Title (data-title), HINT ALWAYS SINGLE-LINE
*/

/* === A83 Global Guard: avoid running in wp-admin / builder and prevent duplicates === */
(function A83_GUARD_WRAPPER(){
  var d=document, de=d.documentElement, b=d.body;
  var A83_IS_ADMIN   = location.pathname.indexOf('/wp-admin/')!==-1 || de.classList.contains('wp-admin');
  var A83_IS_BUILDER = !!(de.classList.contains('breakdance-builder-active')
                       || (b && b.classList && b.classList.contains('breakdance-is-frontend-builder'))
                       || window.BreakdanceEditorActive
                       || (window.BreakdanceFrontend && window.BreakdanceFrontend.isEditorActive));
  if(A83_IS_ADMIN || A83_IS_BUILDER){
    console.info('[A83] guard: skip off-canvas/scroll-tone in admin/builder');
    return;
  }
  if(window.__A83_OCV135_INIT__){
    console.info('[A83] already initialized, skipping duplicate');
    return;
  }
  window.__A83_OCV135_INIT__ = true;

// ===== SCROLL TONE DETECTION (INDEPENDENT!) =====
// This runs SEPARATELY and doesn't depend on menu elements
(function(){
  console.log('[SCROLL-TONE] Script loaded');

  // Pause tone updates while the off-canvas overlay is active (blur + body lock)
  const html = document.documentElement;
  let tonePaused = false;

  // Helper to check nav state from the main script (data-nav-state on <html>)
  const getNavState = () => html.getAttribute('data-nav-state') || 'closed';
  
  function updateHeaderTone(){
    const header = document.getElementById('site-header');
    
    if(!header) {
      console.warn('[SCROLL-TONE] ✗ Header #site-header not found');
      return;
    }
    
    // Get all sections with data-tone attribute
    const sections = document.querySelectorAll('[data-tone]');
    if(!sections.length) {
      console.warn('[SCROLL-TONE] ✗ No sections with [data-tone] attribute found');
      header.setAttribute('data-tone', 'light');
      return;
    }
    
    // Get current scroll position
    const scrollTop = window.scrollY || window.pageYOffset;
    const headerHeight = header.offsetHeight || 60;
    const checkPoint = scrollTop + headerHeight + 10;
    
    let currentTone = null;
    let closestSection = null;
    let closestDistance = Infinity;
    
    // Find which section the checkpoint is in
    sections.forEach(section => {
      const rect = section.getBoundingClientRect();
      const sectionTop = scrollTop + rect.top;
      const sectionBottom = sectionTop + rect.height;
      
      // If checkpoint is within this section
      if(checkPoint >= sectionTop && checkPoint <= sectionBottom){
        const tone = section.getAttribute('data-tone');
        if(tone) {
          currentTone = tone;
          closestSection = section;
        }
      }
      
      // Also track closest section in case we're between sections
      const distanceToTop = Math.abs(checkPoint - sectionTop);
      if(distanceToTop < closestDistance){
        closestDistance = distanceToTop;
        if(!currentTone){
          currentTone = section.getAttribute('data-tone');
          closestSection = section;
        }
      }
    });
    
    // Fallback to first section if nothing found
    if(!currentTone){
      currentTone = sections[0].getAttribute('data-tone') || 'light';
    }
    
    // Update header data-tone if changed
    const previousTone = header.getAttribute('data-tone');
    if(previousTone !== currentTone){
      header.setAttribute('data-tone', currentTone);
      document.documentElement.setAttribute('data-tone', currentTone);
      console.log(`[SCROLL-TONE] ✓ Changed: ${previousTone} → ${currentTone} at scroll ${Math.round(scrollTop)}px`);
    }
  }

  // Throttled scroll handler
  let scrollTicking = false;
  function onScroll(){
    if(tonePaused) return; // ignore scroll while nav overlay is open/locking
    if(!scrollTicking){
      window.requestAnimationFrame(()=>{
        if(!tonePaused) updateHeaderTone();
        scrollTicking = false;
      });
      scrollTicking = true;
    }
  }

  // Initialize scroll detection with multiple fallbacks
  function initScrollTone(){
    const header = document.getElementById('site-header');
    const sections = document.querySelectorAll('[data-tone]');
    
    console.log('[SCROLL-TONE] Initializing...', {
      header: header ? '✓ found' : '✗ missing',
      sections: sections.length + ' found',
      tones: [...sections].map(s => s.getAttribute('data-tone')).join(', ')
    });
    
    if(!header){
      console.error('[SCROLL-TONE] ✗ CRITICAL: Header #site-header not found!');
      return false;
    }
    
    if(!sections.length){
      console.error('[SCROLL-TONE] ✗ CRITICAL: No [data-tone] sections found!');
      return false;
    }
    
    // Observe nav overlay state to pause/resume tone detection
    const navObs = new MutationObserver(()=>{
      const s = getNavState();
      if(s === 'opening' || s === 'open'){
        // Freeze tone while the blur overlay covers the page and scrolling is locked
        tonePaused = true;
      }else{
        // Resume and recompute immediately after close
        tonePaused = false;
        updateHeaderTone();
      }
    });
    navObs.observe(html, { attributes:true, attributeFilter:['data-nav-state'] });

    // Refresh tone on custom resume event from nav script
    document.addEventListener('a83:tone-resume', ()=> { if(!tonePaused) updateHeaderTone(); });

    // Set up event listeners
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    document.addEventListener('visibilitychange', ()=> { if(!tonePaused) updateHeaderTone(); }, { passive:true });
    
    // Initial update
    updateHeaderTone();
    console.log('[SCROLL-TONE] ✓ Active! Initial tone:', header.getAttribute('data-tone'));

    // Expose updater for other scripts (read-only)
    window.A83_updateHeaderTone = updateHeaderTone;
    
    return true;
  }

  // Multiple initialization attempts
  let initialized = false;
  
  // Attempt 1: If DOM already ready
  if(document.readyState === 'interactive' || document.readyState === 'complete'){
    console.log('[SCROLL-TONE] DOM already ready');
    initialized = initScrollTone();
  }
  
  // Attempt 2: DOMContentLoaded
  if(!initialized){
    document.addEventListener('DOMContentLoaded', ()=>{
      console.log('[SCROLL-TONE] DOMContentLoaded event');
      initialized = initScrollTone();
    });
  }
  
  // Attempt 3: Delayed fallback (for Breakdance)
  setTimeout(()=>{
    if(!initialized){
      console.log('[SCROLL-TONE] Delayed fallback init');
      initialized = initScrollTone();
    }
  }, 500);
  
  // Attempt 4: Window load
  window.addEventListener('load', ()=>{
    if(!initialized){
      console.log('[SCROLL-TONE] Window load init');
      initialized = initScrollTone();
    }
  });
})();

// ===== OFF-CANVAS NAVIGATION =====
(function(){
  const html = document.documentElement;

  // ===== Refs
  const overlay   = document.getElementById('nav-overlay');
  const card      = overlay?.querySelector('.nav-card');
  const navHead   = overlay?.querySelector('.nav-head');
  const menu      = overlay?.querySelector('.nav-menu');
  const closeSlot = overlay?.querySelector('#nav-close-slot, .nav-close-slot');
  const homeSlot  = document.querySelector('.burger-home-slot, .burger-slot');
  const burger    = homeSlot?.querySelector('#nav-trigger, .a83-burger, .nav-toggle');
  const wordmark  = document.querySelector('.brand-wordmark');
  const header    = document.getElementById('site-header');
  let   hintEl    = overlay?.querySelector('.nav-hint');

  if(!overlay || !card || !navHead || !menu || !closeSlot || !homeSlot || !burger){
    console.warn('[NAV-MENU] Setup incomplete - menu will not work', {overlay, card, navHead, menu, closeSlot, homeSlot, burger});
    console.log('[NAV-MENU] But scroll-tone detection should still work!');
    
    // Still try to init animations for wordmark/burger if they exist
    if(wordmark || burger){
      setTimeout(()=> initAnimations(), 500);
    }
    
    return; // Exit but don't block scroll detection
  }

  console.log('[NAV-MENU] ✓ All menu elements found');

  // Close-Button ensure
  let closeBtn = closeSlot.querySelector('.nav-close-btn');
  if(!closeBtn){
    closeBtn = document.createElement('button');
    closeBtn.className = 'nav-close-btn';
    closeBtn.setAttribute('aria-label','Menu schließen');
    closeBtn.innerHTML = '✕';
    closeSlot.appendChild(closeBtn);
  }

  // Hint-Element ensure
  if(!hintEl){
    hintEl = document.createElement('div');
    hintEl.className = 'nav-hint';
    overlay.appendChild(hintEl);
  }

  // ===== Timings (read from CSS, with fallbacks)
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

  // Burger animation times
  const BURGER_OPEN_DUR  = Math.min(360, T_BURGER);
  const BURGER_RESET_DUR = 240;

  // Close-Glitch short wait before "closing" state
  const CLOSE_GLITCH_DELAY = 140;

  // ===== State
  let state='closed', lastFocused=null, scrollY=0, ignoreNext=false;

  // ===== Helpers
  const isIOS      = ()=>/iP(ad|hone|od)/.test(navigator.userAgent);
  const prefersRM  = ()=> window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const setState   = s => { state=s; html.setAttribute('data-nav-state', s); };

  // Burger state
  const setExpanded   = b => burger.setAttribute('aria-expanded', b ? 'true' : 'false');
  const setBurgerOpen = (on) => {
    setExpanded(!!on);
    burger.classList.toggle('is-open', !!on);
    burger.setAttribute('aria-pressed', on ? 'true' : 'false');
  };

  // Burger animations (via CSS classes)
  function playBurgerOpen(){
    burger.classList.add('is-anim');
    void burger.offsetWidth; // reflow
    burger.classList.add('is-open');
    setTimeout(()=> burger.classList.remove('is-anim'), BURGER_OPEN_DUR);
  }
  
  function playBurgerReset(){
    burger.classList.add('is-recoiling');
    burger.classList.remove('is-open');
    setTimeout(()=> burger.classList.remove('is-recoiling'), BURGER_RESET_DUR);
  }

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

  // Geometry
  const slotRect   = ()=> homeSlot.getBoundingClientRect();
  const burgerRect = ()=> (burger.getBoundingClientRect?.() || slotRect());

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

  // Focus-Trap & ESC
  const fsel='a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';
  const focusables = ()=> card.querySelectorAll(fsel);
  
  function onTabTrap(e){
    if(!(state==='opening'||state==='open') || e.key!=='Tab') return;
    const f = focusables(); if(!f.length) return;
    const first=f[0], last=f[f.length-1];
    if(e.shiftKey && document.activeElement===first){ e.preventDefault(); last.focus(); }
    else if(!e.shiftKey && document.activeElement===last){ e.preventDefault(); first.focus(); }
  }
  
  function onEsc(e){
    if(e.key==='Escape' && (state==='open'||state==='opening')){
      closeNav('esc');
    }
  }

  const pulse = (el, cls, ms) => { if(!el) return; el.classList.add(cls); setTimeout(()=>el.classList.remove(cls), ms); };

  // WILD: Slice-Glitch
  function createSliceGlitch(){
    if(prefersRM()) return null;
    const baseCount = (window.innerWidth < 768) ? 4 : 7;
    const count = baseCount + Math.floor(Math.random()*2);
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

      const sh = Math.max(8, Math.round(Math.random() * (h*0.12)));
      let st = Math.round(Math.random() * (h - sh - 4));
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

  // Stronger Link-Glitch with multiple bursts
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

  // ===== INIT ANIMATIONS =====
  function initAnimations(){
    if(prefersRM()) return;
    
    // Wordmark init glitch
    if(wordmark){
      // Ensure data-text attribute for glitch effect
      if(!wordmark.hasAttribute('data-text')){
        wordmark.setAttribute('data-text', wordmark.textContent.trim());
      }
      
      setTimeout(()=>{
        wordmark.classList.add('wordmark-init');
        setTimeout(()=>{
          wordmark.classList.remove('wordmark-init');
        }, 720);
      }, 180); // slight delay for page load
    }
    
    // Burger init glitch
    if(burger){
      setTimeout(()=>{
        burger.classList.add('burger-init');
        setTimeout(()=>{
          burger.classList.remove('burger-init');
        }, 780);
      }, 420); // after wordmark
    }
  }

  // Run init animations when DOM ready
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', initAnimations);
  } else {
    initAnimations();
  }

  // ===== OPEN NAV =====
  function openNav(){
    if(state!=='closed') return;
    lastFocused = document.activeElement;

    // Burger visual open + aria
    playBurgerOpen();
    setBurgerOpen(true);

    overlay.setAttribute('aria-hidden','false');
    // Snapshot tone just before we lock scroll (purely informative; actual pause is handled in first IIFE)
    try { if (window.A83_updateHeaderTone) window.A83_updateHeaderTone(); } catch(e){}
    lockBody();

    card.classList.add('card-primed');
    syncCloseSizeToBurger();
    setCardFromTrigger();

    setTimeout(()=>{
      card.offsetHeight; // Reflow
      card.classList.remove('card-primed');
      setState('opening');

      // Card Glitch Pulse
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

        // X later glitch in
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

  // ===== CLOSE NAV =====
  function closeNav(){
    if(state!=='open' && state!=='opening') return;

    // Short visual pulse before out
    if(!prefersRM()){
      pulse(card, 'glitch-strong', 220);
      pulse(menu, 'glitch-once',   200);
    }

    // Burger: Recoil animation start
    playBurgerReset();
    
    // aria/State early back (slightly delayed so recoil stays visible)
    setTimeout(()=> setBurgerOpen(false), Math.min(120, BURGER_RESET_DUR * 0.35));

    // Switch to "closing"; Card-Out + Blur-Out run via CSS
    setTimeout(()=>{
      setState('closing');
      card.style.pointerEvents='none'; // prevent spam clicks

      const TOTAL = T_CARD_OUT + T_CLOSE_GAP + T_BACKDROP_OUT + 40;
      setTimeout(()=>{
        overlay.setAttribute('aria-hidden','true');
        unlockBody();
        try { window.requestAnimationFrame(()=> { document.dispatchEvent(new Event('a83:tone-resume')); }); } catch(e){}
        setState('closed');

        // Safety: Burger state clean
        setBurgerOpen(false);

        // Cleanup
        overlay.classList.remove('hint-visible');
        card.classList.remove('glitch','glitch-strong');
        menu.classList.remove('glitch-once','glitch-strong');
        menu.querySelectorAll('.g1,.g2,.g3').forEach(n=>n.classList.remove('g1','g2','g3'));
        closeBtn.classList.remove('x-glitch');
        card.querySelectorAll('.gl-slices').forEach(n=>n.remove());
        card.style.pointerEvents='';

        window.removeEventListener('resize', syncCloseSizeToBurger);

        if(lastFocused && lastFocused.focus) lastFocused.focus(); 
        else burger.focus();
        
        document.removeEventListener('keydown', onTabTrap, true);
        document.removeEventListener('keydown', onEsc,     true);
      }, TOTAL);
    }, CLOSE_GLITCH_DELAY);
  }

  // Clicks
  burger.addEventListener('click', ()=>{
    if(ignoreNext){ ignoreNext=false; return; }
    if(state==='closed') openNav(); 
    else if(state==='open') closeNav();
  });
  
  closeBtn.addEventListener('click', ()=>{
    if(state==='open' || state==='opening'){ closeNav(); }
  });

  // ARIA / Dialog
  burger.setAttribute('aria-controls','nav-overlay');
  burger.setAttribute('aria-expanded','false');
  overlay.setAttribute('role','dialog');
  overlay.setAttribute('aria-modal','true');
  overlay.setAttribute('aria-hidden','true');

  console.log('[NAV-MENU] ✓ Menu initialized successfully');
})();
})();