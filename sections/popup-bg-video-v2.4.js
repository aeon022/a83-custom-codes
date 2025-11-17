/* ===== A83 Breakdance Popup BG-Video with SOUND — v2.4 =====
   Popup ID: #max-popup
   Open Button/Icon ID: #open-max
   - spielt unmuted im selben User-Gesture
   - pausiert & mutet wieder beim Schließen (egal wie geschlossen wird)
   - verteidigt kurz gegen "re-mute" vom Builder (nur während offen)
*/
(function(){
  const POPUP_ID   = 'max-popup';
  const OPEN_SEL   = '#open-max';

  const popup = document.getElementById(POPUP_ID);
  if(!popup){ console.warn('[A83] Popup not found:', POPUP_ID); return; }

  /* ---------- helpers ---------- */
  const isVisible = el => {
    if(!el) return false;
    const cs = getComputedStyle(el);
    return cs.display !== 'none' && el.getAttribute('aria-hidden') !== 'true';
  };

  function findVideo(){
    return popup.querySelector('video, .bd-video-background video, .breakdance-video-background video');
  }

  function ensureSources(video){
    const lazy = video ? video.querySelectorAll('source[data-src]') : [];
    if(lazy && lazy.length){
      lazy.forEach(s => { if(!s.src) s.src = s.getAttribute('data-src'); });
      try{ video.load(); }catch(e){}
    }
  }

  function hardUnmute(video){
    try{
      video.setAttribute('playsinline','');
      video.setAttribute('webkit-playsinline','');
      video.removeAttribute('muted');
      video.muted  = false;
      video.volume = 1.0;
    }catch(e){}
  }

  async function playWithSound(video){
    hardUnmute(video);
    try{ await video.play(); }
    catch(err){ console.warn('[A83] Autoplay with sound blocked (iOS silent mode/policy).', err); }
  }

  function stopAndMute(video){
    if(!video) return;
    try{ video.pause(); }catch(e){}
    try{ video.currentTime = 0; }catch(e){}
    try{
      video.muted = true;
      video.volume = 0;
      // optional: Quellen NICHT entfernen, sonst nächstes Öffnen ggf. schwarz bis .load()
    }catch(e){}
  }

  // gegen "re-mute" verteidigen (nur solange offen)
  function defendAgainstRemute(video){
    if(!video) return ()=>{};
    const attrObs = new MutationObserver(muts=>{
      for(const m of muts){
        if(m.type==='attributes' && m.attributeName==='muted'){
          // während offen wollen wir Ton
          hardUnmute(video);
        }
      }
    });
    attrObs.observe(video, {attributes:true, attributeFilter:['muted']});

    const t0 = Date.now();
    const poll = setInterval(()=>{
      hardUnmute(video);
      if(Date.now()-t0 > 2500) clearInterval(poll);
    }, 150);

    return ()=>{ try{attrObs.disconnect();}catch(e){} clearInterval(poll); };
  }

  /* ---------- state ---------- */
  let activeVideo = null;
  let cleanupRemute = null;

  function onPopupOpened(){
    const v = findVideo();
    if(!v) return;
    activeVideo = v;

    ensureSources(v);
    cleanupRemute = defendAgainstRemute(v);
    playWithSound(v);

    // Auto-Close bei Ende
    const onEnd = ()=>{
      try{ v.pause(); }catch(e){}
      closePopupSafe();
    };
    v.addEventListener('ended', onEnd, {once:true});
  }

  function onPopupClosed(){
    // Video zuverlässig stoppen + muten
    stopAndMute(activeVideo);
    if(cleanupRemute){ cleanupRemute(); cleanupRemute = null; }
    activeVideo = null;
  }

  // möglichst viele Close-Wege abdecken
  function closePopupSafe(){
    // 1) Offizielle BD-APIs
    try{
      if(window.BreakdancePopup?.close){ window.BreakdancePopup.close(POPUP_ID); return; }
      if(window.breakdancePopup?.close){ window.breakdancePopup.close(POPUP_ID); return; }
    }catch(e){}
    // 2) ESC (viele Popups hören darauf)
    try{
      const ev = new KeyboardEvent('keydown', {key:'Escape', code:'Escape', bubbles:true});
      document.dispatchEvent(ev);
    }catch(e){}
    // 3) Fallback: Popup hart verstecken
    try{
      popup.setAttribute('aria-hidden','true');
      popup.style.display = 'none';
    }catch(e){}
  }

  /* ---------- Beobachter: sichtbar/unsichtbar ---------- */
  let prevVisible = isVisible(popup);
  const visObs = new MutationObserver(()=>{
    const vis = isVisible(popup);
    if(vis && !prevVisible){ onPopupOpened(); }
    if(!vis && prevVisible){ onPopupClosed(); }
    prevVisible = vis;
  });
  visObs.observe(popup, {attributes:true, attributeFilter:['style','class','aria-hidden','data-open']});

  /* ---------- Open-Button im selben Gesture ---------- */
  const openBtn = document.querySelector(OPEN_SEL) || document.querySelector(`[aria-controls="${POPUP_ID}"]`);
  if(openBtn){
    const handler = ()=>{
      // BD öffnet Popup; Tick später Video vorbereiten
      setTimeout(()=>{ if(isVisible(popup)) onPopupOpened(); }, 0);
    };
    openBtn.addEventListener('pointerdown', handler, {capture:true});
    openBtn.addEventListener('click',       handler, {capture:true});
  }else{
    console.warn('[A83] Open trigger not found:', OPEN_SEL);
  }

  // Falls Popup initial schon offen war:
  if(isVisible(popup)) onPopupOpened();

  console.info('[A83] Popup video sound control ready (v2.4) for #' + POPUP_ID);
})();
