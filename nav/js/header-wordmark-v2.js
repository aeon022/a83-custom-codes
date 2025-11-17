
/* A83 Wordmark Tone — CLEAN v2 (marker-based, passt zu deiner Struktur) */
(function(){
  const header = document.querySelector('.site-header');
  const wrap   = document.getElementById('brand-wordmark');
  const link   = wrap?.querySelector('.wm-link');
  if(!header || !wrap || !link){
    console.warn('[wm] missing .site-header / #brand-wordmark / .wm-link');
    return;
  }
  // Text für Pseudos
  const txt = (link.textContent || '').trim();
  link.setAttribute('data-text', txt);

  // Markierte Sektionen
  const sections = Array.from(document.querySelectorAll('[data-tone="dark"], [data-tone="light"]'));

  function headerProbeY(){
    // Adminbar berücksichtigen, ohne Position zu verändern
    const admin = document.getElementById('wpadminbar');
    const adminH = (admin && getComputedStyle(admin).position==='fixed') ? admin.offsetHeight : 0;
    // knapp unter der Header-Unterkante messen
    return (header.getBoundingClientRect().height || 0) + adminH + 1;
  }

  function toneAtHeader(){
    const y = headerProbeY();
    const x = Math.round(window.innerWidth * 0.5);
    // zuerst direkte Hit-Chain
    const chain = (document.elementsFromPoint && document.elementsFromPoint(x,y)) || [];
    for(const el of chain){
      const s = el.closest && el.closest('[data-tone="dark"], [data-tone="light"]');
      if(s) return s.getAttribute('data-tone');
    }
    // fallback: bounding-Check
    for(const s of sections){
      const r = s.getBoundingClientRect();
      if(r.top <= y && r.bottom >= y) return s.getAttribute('data-tone');
    }
    return 'dark';
  }

  function applyTone(tone){
    header.classList.toggle('hdr-tone-light', tone==='light');
    header.classList.toggle('hdr-tone-dark',  tone!=='light');
  }

  function glitchTick(){
    document.documentElement.classList.add('wm-glitch');
    setTimeout(()=>document.documentElement.classList.remove('wm-glitch'), 260);
  }

  // Boot: voll → glitch → dim
  function boot(){
    applyTone(toneAtHeader());
    link.classList.remove('is-dim');
    glitchTick();
    setTimeout(()=> link.classList.add('is-dim'), 600);
  }

  // Hover: voll + glitch, Out: dim + glitch
  let hoverT;
  wrap.addEventListener('mouseenter', ()=>{
    if(hoverT) { clearTimeout(hoverT); hoverT=null; }
    link.classList.remove('is-dim'); glitchTick();
  });
  wrap.addEventListener('mouseleave', ()=>{
    hoverT = setTimeout(()=>{ link.classList.add('is-dim'); glitchTick(); }, 60);
  });

  // Scroll/Resize rAF-drosseln
  let raf=0;
  function onFlow(){
    if(raf) return;
    raf = requestAnimationFrame(()=>{ raf=0; applyTone(toneAtHeader()); });
  }
  window.addEventListener('scroll', onFlow, {passive:true});
  window.addEventListener('resize', onFlow, {passive:true});
  window.addEventListener('orientationchange', onFlow);

  // Nav-State: offen = hell
  const html = document.documentElement;
  new MutationObserver(()=>{
    const s = html.getAttribute('data-nav-state');
    if(s==='opening' || s==='open') applyTone('dark'); else onFlow();
  }).observe(html, {attributes:true, attributeFilter:['data-nav-state']});

  boot();
})();
