
/* ===== A83 Header + Off-Canvas — Unified v14.1 ===== */
(function(){
  const html = document.documentElement;

  /* Refs */
  const overlay = document.getElementById('nav-overlay');
  const card    = overlay?.querySelector('.nav-card');
  const navHead = overlay?.querySelector('.nav-head') || overlay;
  const menu    = overlay?.querySelector('.nav-menu');
  const homeSlot= document.querySelector('.burger-home-slot');
  const burger  = homeSlot?.querySelector('#nav-trigger.nav-toggle');
  const wmWrap  = document.getElementById('brand-wordmark');
  const wmLink  = wmWrap?.querySelector('.wm-link');

  if(!overlay || !card || !menu || !homeSlot || !burger){
    console.warn('[A83] Setup unvollständig', {overlay, card, menu, homeSlot, burger});
    return;
  }

  /* Timings aus CSS */
  const cssMs=(name,fb)=>{const v=getComputedStyle(document.documentElement).getPropertyValue(name).trim(); if(!v)return fb; if(v.endsWith('ms'))return parseInt(v,10); if(v.endsWith('s'))return Math.round(parseFloat(v)*1000); const n=parseInt(v,10); return isNaN(n)?fb:n;};
  const T_BURGER=cssMs('--t-burger',280), T_CARD_IN=cssMs('--t-card',680), T_CARD_OUT=cssMs('--t-card-out',420),
        T_BACKDROP_OUT=cssMs('--t-backdrop-out',320), T_CLOSE_GAP=cssMs('--t-close-gap',60);
  const G_CARD=640, G_LINK=520, CLOSE_GLITCH_DELAY=120, BURGER_OPEN_DUR=Math.min(260,T_BURGER), BURGER_RESET_DUR=220;

  /* X-Button sicherstellen */
  let closeBtn = overlay.querySelector('.nav-close-btn');
  if(!closeBtn){
    closeBtn = document.createElement('button');
    closeBtn.className = 'nav-close-btn x-hidden';
    closeBtn.setAttribute('aria-label','Menü schließen');
    closeBtn.textContent = '✕';
    (overlay.querySelector('#nav-close-slot,.nav-close-slot') || navHead).appendChild(closeBtn);
  }

  /* Body-Lock helpers */
  const isIOS = ()=>/iP(ad|hone|od)/.test(navigator.userAgent);
  function setScrollbarComp(on){ const sbw=window.innerWidth-document.documentElement.clientWidth; html.style.setProperty('--sbw', on?(sbw+'px'):'0px'); }
  let scrollY=0;
  function lockBody(){ setScrollbarComp(true); html.classList.add('nav-lock'); if(isIOS()){ scrollY=window.scrollY||window.pageYOffset; document.body.classList.add('nav-fixed'); document.body.style.top = `-${scrollY}px`; }else document.body.classList.add('nav-fixed'); }
  function unlockBody(){ html.classList.remove('nav-lock'); document.body.classList.remove('nav-fixed'); document.body.style.top=''; if(isIOS()) window.scrollTo(0,scrollY||0); setScrollbarComp(false); }

  /* Karte aus Burger morphen */
  function setCardFromTrigger(){
    const s = homeSlot.getBoundingClientRect(), c = card.getBoundingClientRect();
    card.style.setProperty('--from-x', (s.right - c.right)+'px');
    card.style.setProperty('--from-y', (s.top   - c.top)+'px');
    card.style.setProperty('--from-scale','.94');
  }
  function syncCloseSizeToBurger(){
    const r=burger.getBoundingClientRect(); const w=Math.round(r.width)+'px', h=Math.round(r.height)+'px';
    overlay.style.setProperty('--burger-w', w); overlay.style.setProperty('--burger-h', h);
  }

  /* Terminal-Hints (einmalig) */
  let hintEl = overlay.querySelector('.nav-hint'); if(!hintEl){ hintEl=document.createElement('div'); hintEl.className='nav-hint'; overlay.appendChild(hintEl); }
  const CMD_PREFIX='$ '; const CMD_VARIANTS=[t=>`open /${t}`,t=>`lynx /${t}`,t=>`ssh guest@host:/${t}`,t=>`cat /${t}/README`,t=>`curl /${t}`,t=>`cd /${t} && ls`];
  const slug=s=>(s||'').trim().replace(/[äÄ]/g,'ae').replace(/[öÖ]/g,'oe').replace(/[üÜ]/g,'ue').replace(/ß/g,'ss').replace(/\s+/g,'')||'page';
  const fmt=t=>CMD_PREFIX+CMD_VARIANTS[Math.floor(Math.random()*CMD_VARIANTS.length)](slug(t||''));
  function showHintFor(el){ const title = (el?.getAttribute('data-title') || el?.textContent || '').trim(); hintEl.innerHTML=`<i class="fa-solid fa-terminal" aria-hidden="true"></i>&nbsp;<span class="cmd">${fmt(title)}</span>`; overlay.classList.add('hint-visible'); }
  function initHints(){ const items=[...menu.querySelectorAll('.nav-link, a')]; if(!items.length) return; const hide=()=>overlay.classList.remove('hint-visible'); items.forEach(el=>{ el.addEventListener('mouseenter',()=>showHintFor(el)); el.addEventListener('focusin',()=>showHintFor(el)); }); menu.addEventListener('mouseleave',hide); menu.addEventListener('focusout',e=>{ if(!menu.contains(e.relatedTarget)) hide(); }); }

  /* Burger states */
  function burgerOpen(){ burger.classList.add('is-anim'); void burger.offsetWidth; burger.classList.add('is-open'); setTimeout(()=>burger.classList.remove('is-anim'), BURGER_OPEN_DUR); }
  function burgerReset(){ burger.classList.add('is-recoiling'); burger.classList.remove('is-open'); setTimeout(()=>burger.classList.remove('is-recoiling'), BURGER_RESET_DUR); }
  burger.addEventListener('mouseenter', ()=>{ if(state==='closed'){ burger.classList.add('burst'); setTimeout(()=>burger.classList.remove('burst'),260); }});
  burger.addEventListener('mouseleave', ()=>{/* bleibt gedimmt automatisch */});

  /* Wordmark: schneller start, dann dim; hover glitch */
  function wmSet(state){ wmWrap?.setAttribute('data-wm', state); }
  function wmBurst(){ if(!wmLink) return; wmLink.classList.add('wm-burst'); setTimeout(()=>wmLink.classList.remove('wm-burst'), 280); }
  wmSet('lit'); setTimeout(()=>wmSet('dim'), 420);
  wmLink?.addEventListener('mouseenter', ()=>{ wmSet('lit'); wmBurst(); });
  wmLink?.addEventListener('mouseleave', ()=>{ wmBurst(); wmSet('dim'); });

  /* Tone per Section */
  (function initHeaderTone(){
    const sections=[...document.querySelectorAll('[data-header-tone]')];
    if(!sections.length){ html.setAttribute('data-header-tone','dark'); return; }
    const sentinels=sections.map(sec=>{ const s=document.createElement('span'); s.className='tone-sentinel'; s.style.cssText='position:absolute;left:0;right:0;top:0;height:1px;pointer-events:none;'; if(getComputedStyle(sec).position==='static') sec.style.position='relative'; s.dataset.tone=sec.getAttribute('data-header-tone')||'dark'; sec.prepend(s); return s; });
    const headerH=Math.max(40, document.querySelector('.site-header')?.offsetHeight || 52);
    const obs=new IntersectionObserver((entries)=>{ entries.forEach(e=>{ if(e.isIntersecting){ html.setAttribute('data-header-tone', e.target.dataset.tone==='light'?'light':'dark'); wmSet('dim'); } }); }, {root:null, rootMargin:`-${headerH}px 0px -95% 0px`, threshold:0});
    sentinels.forEach(s=>obs.observe(s));
  })();

  /* Glitch helpers */
  const pulse=(el,cls,ms)=>{ if(!el) return; el.classList.add(cls); setTimeout(()=>el.classList.remove(cls),ms); };
  function createSliceGlitch(){
    if(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const box=document.createElement('div'); box.className='gl-slices'; box.style.setProperty('--gl-slice-dur','760ms'); box.setAttribute('aria-hidden','true');
    const h=card.clientHeight||400; const count=(innerWidth<768?4:7)+(Math.random()<.5?0:1);
    for(let i=0;i<count;i++){ const sl=document.createElement('div'); sl.className='gl-slice';
      const sh=Math.max(8,Math.round(Math.random()*(h*0.12))); const st=Math.max(0,Math.round(Math.random()*(h-sh-4)));
      sl.style.top=st+'px'; sl.style.height=sh+'px'; const v=(Math.random()<.5)?'a83-slice-shift':'a83-slice-skew'; const delay=Math.round(Math.random()*140);
      sl.style.animation=`${v} var(--gl-slice-dur) steps(14) ${delay}ms both`; box.appendChild(sl);
    }
    card.appendChild(box); setTimeout(()=>box.remove(),980);
  }

  /* ESC & FocusTrap */
  let state='closed', lastFocused=null;
  function onEsc(e){ if(e.key==='Escape' && (state==='open'||state==='opening')) closeNav(); }
  document.addEventListener('keydown', onEsc, true);
  const fsel='a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';
  const focusables=()=>card.querySelectorAll(fsel);
  function onTabTrap(e){ if(!(state==='opening'||state==='open') || e.key!=='Tab') return; const f=focusables(); if(!f.length) return; const first=f[0], last=f[f.length-1]; if(e.shiftKey && document.activeElement===first){ e.preventDefault(); last.focus(); } else if(!e.shiftKey && document.activeElement===last){ e.preventDefault(); first.focus(); } }

  /* Öffnen */
  function openNav(){
    if(state!=='closed') return;
    lastFocused=document.activeElement; burgerOpen(); burger.classList.add('burst'); setTimeout(()=>burger.classList.remove('burst'),260);

    overlay.setAttribute('aria-hidden','false'); lockBody();
    card.classList.add('card-primed'); syncCloseSizeToBurger(); setCardFromTrigger();

    setTimeout(()=>{ card.offsetHeight; card.classList.remove('card-primed'); state='opening'; html.setAttribute('data-nav-state','opening');

      pulse(card,'glitch', G_CARD); setTimeout(()=>pulse(card,'glitch-strong',Math.round(G_CARD*0.8)),Math.round(G_CARD*0.35));
      createSliceGlitch(); setTimeout(createSliceGlitch, 320);

      document.addEventListener('keydown', onTabTrap, true);

      setTimeout(()=>{ state='open'; html.setAttribute('data-nav-state','open');

        // Links: Stagger + Bursts
        const items=[...menu.querySelectorAll('.nav-link, a')];
        items.forEach((el,i)=>{
          const base=i*90+Math.round(Math.random()*120);
          setTimeout(()=>el.classList.add('g1'),base);
          setTimeout(()=>el.classList.remove('g1'),base+G_LINK*0.6);
          const b2=base+80+Math.round(Math.random()*140);
          setTimeout(()=>el.classList.add('g2'),b2);
          setTimeout(()=>el.classList.remove('g2'),b2+G_LINK*0.5);
          const b3=b2+140;
          setTimeout(()=>el.classList.add('g3'),b3);
          setTimeout(()=>el.classList.remove('g3'),b3+220);
        });

        // Close-X einglitchen
        closeBtn.classList.remove('x-hidden'); pulse(closeBtn,'x-glitch',420);

        initHints();
        const f=focusables(); if(f.length) f[0].focus();
      }, T_CARD_IN);
    }, T_BURGER);

    window.addEventListener('resize', syncCloseSizeToBurger);
  }

  /* Schließen */
  function closeNav(){
    if(state!=='open' && state!=='opening') return;
    pulse(card,'glitch-strong',200); pulse(menu,'glitch-once',180); burgerReset();

    setTimeout(()=>{ state='closing'; html.setAttribute('data-nav-state','closing'); card.style.pointerEvents='none';
      const TOTAL=T_CARD_OUT+T_CLOSE_GAP+T_BACKDROP_OUT+40;
      setTimeout(()=>{ overlay.setAttribute('aria-hidden','true'); unlockBody(); state='closed'; html.setAttribute('data-nav-state','closed'); card.style.pointerEvents='';
        overlay.classList.remove('hint-visible'); window.removeEventListener('resize', syncCloseSizeToBurger); document.removeEventListener('keydown', onTabTrap, true);
        lastFocused && lastFocused.focus?.();
      }, TOTAL);
    }, CLOSE_GLITCH_DELAY);
  }

  /* Clicks */
  burger.addEventListener('click', ()=>{ if(state==='closed') openNav(); else if(state==='open') closeNav(); });
  closeBtn.addEventListener('click', ()=>{ if(state==='open'||state==='opening') closeNav(); });

  /* ARIA */
  burger.setAttribute('aria-controls','nav-overlay'); burger.setAttribute('aria-expanded','false');
  overlay.setAttribute('role','dialog'); overlay.setAttribute('aria-modal','true'); overlay.setAttribute('aria-hidden','true');

  console.info('[A83] unified v14.1 ready');
})();
