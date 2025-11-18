/* ===========================================================
   A83 HERO – FULL REPAIR v5 (scoped to #hero)
   - Tone-Bridge & Dots via ::before/::after auf .hero-wrapper (robust)
   - Stage/Aura
   - Hover-Glitch (deine Version)
   - Mobile-Video FILL (im Stage-Block; Ratio OFF)
   - Neon Wire =========================================================== */

  /* Stage global deckeln + zentrieren (gilt für alle Breakpoints) */
#hero #stage,
#hero .stage{
  max-inline-size: var(--stage-col-max); /* clamp(360px, 31vw, 620px) aus Vars */
  inline-size: 100%;
  margin-inline: auto;       /* Mitte halten */
  min-width: 0;              /* Grid-Shrink-Fix (Chrome/Android) */
}
  

/* ---------- Vars ---------- */
#hero{
  --brand-bg: #0F3F36;
  --radius: 16px;
  --fade: 240ms;
  /* Max-Breite der Stage-Spalte am Desktop (≈ 1/3 Seite) */
  --stage-col-max: clamp(460px, 41vw, 720px);
  
   

  /* Stage */
  --stage-ratio: 1/1;

  
  /* Hover-Glitch */
  --glitch-in: 900ms;
  --glitch-out: 700ms;
  --glitch-intensity: 8px;
  --glitch-scanlines: .55;
  --glitch-rgb-spread: 2px;

  /* Tone-Bridge (sichtbar, aber dezent) */
  --bridge-blend: soft-light;  /* overlay | soft-light | normal */
  --bridge-opacity: .20;       /* .16–.30 */
  --bridge-skew: -2.5deg;
  --bridge-amp: -0.06%;
  --bridge-dur: 16s;

  /* Aura */
  --aura-dur: 8s;
  --aura-scale: 1.055;
  --aura-op-min: .90;
  --aura-op-max: .99;

  /* Dots (ruhig) */
  --dots-size: 28px;
  --dots-color: rgba(255,255,255,.08);
  --dots-speed: 48s;
  --dots-shift-x: 0px;
  --dots-shift-y: -24px;
}

/* ---------- Grundstack ---------- */
#hero{ position: relative; background-color: var(--brand-bg); }
#hero .hero-wrapper{ position: relative; isolation: isolate; }
#hero .text, #hero .stage{ position: relative; z-index: 2; }

/* ===========================================================
   Dots (ruhig, sichtbar) – ::before auf .hero-wrapper
   =========================================================== */
#hero .hero-wrapper::before{
  content:"";
  position:absolute; inset:0; z-index:0; pointer-events:none;
  opacity:.85;
  background-image: radial-gradient(circle at 1px 1px, var(--dots-color) 1px, transparent 1px);
  background-size: var(--dots-size) var(--dots-size);
  animation: a83-dots-scroll var(--dots-speed) linear infinite;
  will-change: background-position;
}
@keyframes a83-dots-scroll{
  from { background-position: 0 0; }
  to   { background-position: var(--dots-shift-x) var(--dots-shift-y); }
}

/* ===========================================================
   Tone-Bridge (dezent sichtbar) – ::after auf .hero-wrapper
   =========================================================== */
#hero .hero-wrapper::after{
  content:"";
  position:absolute; inset:0; z-index:1; pointer-events:none;
  opacity:0; /* nur Desktop sichtbar */
}
@media (min-width:1280px){
  #hero .hero-wrapper::after{
    left: clamp(48px, 7vw, 140px);
    right: clamp(140px, 18vw, 320px);
    top: 10%; bottom: 14%;
    clip-path: polygon(0% 42%, 64% 34%, 100% 42%, 100% 58%, 36% 66%, 0% 58%);
    transform: translateZ(0) skewX(var(--bridge-skew));
    will-change: transform, opacity, clip-path;

    mix-blend-mode: var(--bridge-blend);
    opacity: var(--bridge-opacity);

    /* Grund-Farben/Alphas – Patch kann das unten „boosten“ */
    background:
      radial-gradient(120% 100% at 25% 45%, rgba(255, 0, 128, .11), transparent 60%),
      radial-gradient(120% 120% at 65% 55%, rgba(0, 255, 255, .10), transparent 70%),
      linear-gradient(100deg, rgba(255,255,255,.02), rgba(255,255,255,.01) 60%, transparent 80%);

    animation: a83-bridge-drift var(--bridge-dur) ease-in-out infinite alternate;
  }
  @keyframes a83-bridge-drift{
    0%   { transform: translateZ(0) skewX(var(--bridge-skew)) translateY(0); }
    100% { transform: translateZ(0) skewX(var(--bridge-skew)) translateY(var(--bridge-amp)); }
  }
}

/* ===========================================================
   Stage Aura (knallig, aber regelbar via Patch)
   =========================================================== */
@media (min-width:1024px){
  #hero .stage-aura{
    position:absolute; inset:0; z-index:1; pointer-events:none;
    opacity:.96;
    filter: blur(52px) saturate(160%);
    background:
      radial-gradient(60% 72% at 72% 40%, rgba(0,255,255,.22), transparent 60%),
      radial-gradient(58% 62% at 42% 66%, rgba(255,0,128,.24), transparent 70%),
      radial-gradient(85% 95% at 50% 50%, rgba(255,255,255,.10), transparent 80%);
    animation: a83-aura-breathe var(--aura-dur) ease-in-out infinite alternate;
  }
  @keyframes a83-aura-breathe{
    0%   { transform: scale(1);                 opacity: var(--aura-op-min); }
    100% { transform: scale(var(--aura-scale)); opacity: var(--aura-op-max); }
  }
}

/* ===========================================================
   Stage (Bild/Video) + Hover-Glitch
   =========================================================== */
#hero #show-max{
  position: relative;
  width: 100%;
  aspect-ratio: var(--stage-ratio);
  overflow: hidden;
  border-radius: var(--radius);
  isolation: isolate;
}
#hero #show-max .layer-img,
#hero #show-max .layer-video{ position:absolute; inset:0; width:100%; height:100%; }

#hero #show-max .layer-img img{
  display:block; width:100%; height:100%;
  object-fit:cover; object-position:50% 50%;
}

#hero #show-max .layer-video{ opacity:0; transition: opacity var(--fade) ease; pointer-events:none; }
#hero #show-max .layer-video video{
  display:block !important; width:100% !important; height:100% !important;
  object-fit:cover !important; object-position:50% 50% !important;
}
#hero #show-max.show-video .layer-video{ opacity:1; }
#hero #show-max.show-video .layer-img { opacity:0; transition: opacity var(--fade) ease; }

/* Breakdance Video-Wrapper neutralisieren – nur in Stage */
#hero #show-max .layer-video .breakdance-video,
#hero #show-max .layer-video .breakdance-video-container,
#hero #show-max .layer-video .breakdance-video-wrapper,
#hero #show-max .layer-video .bd-video-container{
  position:absolute !important; inset:0 !important;
  width:100% !important; height:100% !important;
  padding:0 !important; margin:0 !important;
}
#hero #show-max .layer-video .breakdance-video-wrapper > *{
  position:absolute !important; inset:0 !important;
  width:100% !important; height:100% !important;
}
#hero #show-max .layer-video *{ max-width:100% !important; max-height:100% !important; }

/* ---------- Mobile: Video FILL (Ratio OFF + Min-Height) ---------- */
@media (max-width: 767px){
  #hero #show-max{
    aspect-ratio: auto;                /* <<< Ratio AUS auf Mobile */
    min-height: clamp(560px, 36svh, 760px);
    height:auto; width:100%; overflow:hidden;
  }
  #hero #show-max .layer-img, #hero #show-max .layer-video{ position:absolute; inset:0; }
  #hero #show-max .layer-img img{ object-fit:cover !important; object-position:50% 50% !important; }
  #hero #show-max .layer-video,
  #hero #show-max .layer-video *{
    position:absolute !important; inset:0 !important;
    width:100% !important; height:100% !important;
    padding:0 !important; margin:0 !important;
    max-width:100% !important; max-height:100% !important;
  }
  #hero #show-max .layer-video video{ object-fit:cover !important; object-position:50% 50% !important; }
}

/* ---------- Hover-Glitch (unchanged) ---------- */
#hero #show-max .gfx-glitch{ position:absolute; inset:0; pointer-events:none; opacity:0; mix-blend-mode:screen; }
#hero #show-max.glitching .gfx-glitch{ opacity:1; }
#hero #show-max.glitching::before{
  content:""; position:absolute; inset:-1px;
  background: repeating-linear-gradient(to bottom, rgba(255,255,255,0.06) 0 2px, rgba(0,0,0,0.06) 2px 4px);
  opacity: var(--glitch-scanlines); mix-blend-mode: soft-light; animation: a83-flicker 90ms steps(2) infinite;
}
#hero #show-max.glitching::after{
  content:""; position:absolute; inset:0;
  background: radial-gradient(100% 140% at 0% 0%, rgba(255,0,64,.12), transparent 50%),
              radial-gradient(100% 140% at 100% 100%, rgba(0,255,255,.10), transparent 50%);
  mix-blend-mode: color-dodge; opacity:.6; animation: a83-pulse 560ms ease-in-out infinite;
}
#hero #show-max .gfx-glitch .g-slice{
  position:absolute; left:-10px; right:-10px; height:6%;
  background: linear-gradient(90deg, rgba(255,0,64,.50), rgba(0,255,255,.35) 60%, transparent 80%),
              repeating-linear-gradient(0deg, rgba(255,255,255,.10) 0 2px, transparent 2px 4px);
  transform:translateX(0); filter:saturate(1.5) contrast(1.2); opacity:0;
}
#hero #show-max.glitch-in  .gfx-glitch .g-slice{ animation: a83-slice-in  var(--glitch-in)  ease-in forwards; }
#hero #show-max.glitch-out .gfx-glitch .g-slice{ animation: a83-slice-out var(--glitch-out) ease-out forwards; }
#hero #show-max .gfx-glitch .g-slice:nth-child(1){ top:8%;  animation-delay: 0ms; }
#hero #show-max .gfx-glitch .g-slice:nth-child(2){ top:22%; animation-delay: 40ms; }
#hero #show-max .gfx-glitch .g-slice:nth-child(3){ top:38%; animation-delay: 80ms; }
#hero #show-max .gfx-glitch .g-slice:nth-child(4){ top:55%; animation-delay:120ms; }
#hero #show-max .gfx-glitch .g-slice:nth-child(5){ top:71%; animation-delay:160ms; }
#hero #show-max .gfx-glitch .g-slice:nth-child(6){ top:86%; animation-delay:200ms; }
@keyframes a83-slice-in{
  0%{opacity:0; transform:translateX(0);}
  15%{opacity:1; transform:translateX(calc(var(--glitch-intensity) * -1));}
  30%{transform:translateX(calc(var(--glitch-intensity))); }
  45%{transform:translateX(calc(var(--glitch-intensity) * -0.5));}
  60%{transform:translateX(calc(var(--glitch-intensity) * 0.8));}
  80%{transform:translateX(0);} 100%{opacity:0;}
}
@keyframes a83-slice-out{
  0%{opacity:0; transform:translateX(0);}
  20%{opacity:1; transform:translateX(calc(var(--glitch-intensity))); }
  40%{transform:translateX(calc(var(--glitch-intensity) * -1));}
  60%{transform:translateX(calc(var(--glitch-intensity) * 0.6));}
  80%{transform:translateX(0);} 100%{opacity:0;}
}
@keyframes a83-jitter{ 0%{transform:translate(0,0);} 50%{transform:translate(1px,-1px);} 100%{transform:translate(0,0);} }
@keyframes a83-flicker{ 0%,100%{opacity:.4;} 50%{opacity:.7;} }
@keyframes a83-pulse{ 0%,100%{opacity:.4; transform:scale(1);} 50%{opacity:.7; transform:scale(1.01);} }



/* ===========================================================
   FINAL PATCH – Dots/Bridge sichtbar + Fallback + DEV-Hilfen
   - Editor-kompatibel (≥1024px)
   - Dots: sanfter Drift
   - Bridge: sichtbar auf Gradient-BG (Overlay)
   - Fallback: falls .hero-wrapper fehlt -> direkt auf #hero
   =========================================================== */

/* 0) DEV-Hilfen – zum Testen kurz aktivieren, danach wieder auskommentieren */
/* #hero .hero-wrapper::before { outline: 1px dashed rgba(0,255,255,.7) !important; }  */ /* Dots-Layer */
/* #hero .hero-wrapper::after  { outline: 1px dashed rgba(255,0,128,.7) !important; }  */ /* Bridge-Layer */

/* 1) Sanfter Boost der Intensitäten (ohne zu übertreiben) */
#hero{
  /* Dots */
  --dots-color: rgba(255,255,255,.10); /* vorher .08 */
  --dots-speed: 42s;                   /* Drift-Tempo */
  --dots-shift-x: 0px;
  --dots-shift-y: -34px;               /* sichtbarer als % */

  /* Bridge */
  --bridge-blend: overlay;             /* kräftiger als soft-light; bei Bedarf soft-light/normal */
  --bridge-opacity: .34;               /* .22–.32 okay */
}

/* 2) Standard: Bridge-Layer unter 1024px ausblenden */
#hero .tone-bridge{ opacity: 0; }
#hero .hero-wrapper::after{ opacity: 0; }

/* 3) Aktiv ab 1024px – gilt für .tone-bridge (Element) UND ::after (Pseudo) */
@media (min-width:1024px){
  #hero{
    --bridge-skew: -2.5deg;
    --bridge-amp:  -0.06%;
    --bridge-dur:  16s;
  }

  /* Gemeinsamer Stil für BEIDE Varianten */
  #hero .tone-bridge,
  #hero .hero-wrapper::after{
    content: ""; /* wirkt nur beim ::after, Element ignoriert’s */
    position: absolute; inset: 0; z-index: 1; pointer-events: none;

    /* Position + Form */
    left: clamp(48px, 7vw, 140px);
    right: clamp(140px, 18vw, 320px);
    top: 10%; bottom: 14%;
    clip-path: polygon(0% 42%, 64% 34%, 100% 42%, 100% 58%, 36% 66%, 0% 58%);
    transform: translateZ(0) skewX(var(--bridge-skew));
    will-change: transform, opacity, clip-path;

    /* Mischung + Farbe (sichtbar auf dunklem/Gradient BG) */
    mix-blend-mode: var(--bridge-blend);
    opacity: var(--bridge-opacity);
    background:
      radial-gradient(120% 100% at 25% 45%, rgba(255, 0, 128, .18), transparent 60%),
      radial-gradient(120% 120% at 65% 55%, rgba(0, 255, 255, .16), transparent 70%),
      linear-gradient(100deg, rgba(255,255,255,.040), rgba(255,255,255,.018) 60%, transparent 80%);

    /* dezente Bewegung */
    animation: a83-bridge-drift var(--bridge-dur) ease-in-out infinite alternate;
  }

  @keyframes a83-bridge-drift{
    0%   { transform: translateZ(0) skewX(var(--bridge-skew)) translateY(0); }
    100% { transform: translateZ(0) skewX(var(--bridge-skew)) translateY(var(--bridge-amp)); }
  }

  /* 3a) Fallback ab 1024px: wenn .hero-wrapper fehlt/anders heißt -> Bridge/Dots direkt auf #hero */
  @supports(selector(:has(*))){
    /* Dots direkt auf #hero */
    #hero:not(:has(.hero-wrapper))::before{
      content:"";
      position:absolute; inset:0; z-index:0; pointer-events:none;
      opacity:.85;
      background-image: radial-gradient(circle at 1px 1px, var(--dots-color) 1px, transparent 1px);
      background-size: var(--dots-size, 28px) var(--dots-size, 28px);
      animation: a83-dots-scroll var(--dots-speed) linear infinite;
      will-change: background-position;
      /* DEV: outline zum schnellen Check */
      /* outline: 1px dashed rgba(0,255,255,.7); */
      
    }

    /* Bridge direkt auf #hero */
    #hero:not(:has(.hero-wrapper))::after{
      content:"";
      position:absolute; inset:0; z-index:1; pointer-events:none;

      left: clamp(48px, 7vw, 140px);
      right: clamp(140px, 18vw, 320px);
      top: 10%; bottom: 14%;
      clip-path: polygon(0% 42%, 64% 34%, 100% 42%, 100% 58%, 36% 66%, 0% 58%);
      transform: translateZ(0) skewX(var(--bridge-skew));
      will-change: transform, opacity, clip-path;

      mix-blend-mode: var(--bridge-blend);
      opacity: var(--bridge-opacity);
      background:
        radial-gradient(120% 100% at 25% 45%, rgba(255, 0, 128, .18), transparent 60%),
        radial-gradient(120% 120% at 65% 55%, rgba(0, 255, 255, .16), transparent 70%),
        linear-gradient(100deg, rgba(255,255,255,.040), rgba(255,255,255,.018) 60%, transparent 80%);
      animation: a83-bridge-drift var(--bridge-dur) ease-in-out infinite alternate;

      /* DEV: outline zum schnellen Check */
      /* outline: 1px dashed rgba(255,0,128,.7); */
      
    }
  }
}

/* 4) Dots-Animation (für den Drift; falls oben noch nicht definiert) */
@keyframes a83-dots-scroll{
  from { background-position: 0 0; }
  to   { background-position: var(--dots-shift-x, 0px) var(--dots-shift-y, -24px); }
}

/* 5) Optional: Statik-Pattern der Section kappen, wenn es die Dots überdeckt
   -> Bei eigenem Section-Pattern bitte diese Zeile auskommentieren */
#hero{ background-image: none !important; }

/* 6) Safety: #hero als Stacking Context (für die Fallback-Pseudos) */
#hero{ position: relative; }



/* ===================================================================== */

/* PATCH: Tech Micro-Lines sichtbar (über den Dots, dezente Mischung) */
#hero{
  --lines-alpha: .08;   /* 0.04–0.10 (höher = sichtbarer) */
  --lines-gap: 26px;    /* Abstand der Linien; 22–32px testen */
}

#hero .hero-wrapper::before{
  /* Reihenfolge: Linien zuerst (= oben), Dots zuletzt (= unten) */
  background-image:
    repeating-linear-gradient(
      115deg,
      rgba(255,255,255, var(--lines-alpha)) 0 1px,
      transparent 1px var(--lines-gap)
    ),
    repeating-linear-gradient(
      295deg,
      rgba(255,255,255, calc(var(--lines-alpha) * .8)) 0 1px,
      transparent 1px var(--lines-gap)
    ),
    radial-gradient(circle at 1px 1px, var(--dots-color) 1px, transparent 1px);
  background-size:
    var(--lines-gap) var(--lines-gap),
    var(--lines-gap) var(--lines-gap),
    var(--dots-size) var(--dots-size);
  background-position:
    0 0, 0 0, 0 0; /* wird von deiner a83-dots-scroll Animation mitbewegt */
  background-blend-mode:
    soft-light, soft-light, normal; /* Linien dezent, Dots normal soft-light, soft-light, normal */
}




/* ==============================
   A83 HERO – NEON WIRE (clean)
   ============================== */

#hero{
  /* Nur diese Werte musst du ggf. anfassen */
  --wire-angle: -10deg;     /* -12 … -6 */
  --wire-thickness: 2px;
  --wire-baseline: 58%;     /* gemeinsame Höhe */
  --wire-join-overlap: 18px;/* kaschiert die Naht Text→Stage */
  --wire-into-stage: 520px; /* wie weit „hinter“ das Visual */

  --wire-core-alpha: .90;   /* Look */
  --wire-glow-alpha: .30;
  --wire-speed: 8s;
}

/* Text stapeln wir über Stage; Buttons immer sichtbar */
#hero #text, #hero .text{ position:relative; z-index:3; overflow:visible; }
#hero #text > *, #hero .text > *{ position:relative; z-index:4; } /* Buttons/Headlines oben */
#hero #stage, #hero .stage{ position:relative; z-index:2; }

/* --- Segment A: im Text, bis an die Stage-Kante --- */
#hero #text .neon-wire,
#hero .text .neon-wire{
  position:absolute; z-index:2; pointer-events:none;
  left:100%; top:var(--wire-baseline);
  /* Breite setzt JS (gemessen) – hier nur Höhe & Drehung */
  height: var(--wire-thickness);
  transform: translateY(-50%) rotate(var(--wire-angle));
  transform-origin: left center;
}
#hero #text .neon-wire::before,
#hero .text .neon-wire::before{
  content:""; position:absolute; inset:0; border-radius:999px;
  background: linear-gradient(90deg,
    rgba(255,0,128,0) 0%,
    rgba(255,0,128,var(--wire-core-alpha)) 12%,
    rgba(0,255,255,var(--wire-core-alpha)) 50%,
    rgba(255,0,128,var(--wire-core-alpha)) 88%,
    rgba(255,0,128,0) 100%);
  background-size:200% 100%;
  -webkit-mask-image: linear-gradient(to right, transparent 0 5%, #000 15% 85%, transparent 95% 100%);
          mask-image: linear-gradient(to right, transparent 0 5%, #000 15% 85%, transparent 95% 100%);
  animation: a83-wire-flow var(--wire-speed) linear infinite;
  filter: saturate(150%);
}
#hero #text .neon-wire::after,
#hero .text .neon-wire::after{
  content:""; position:absolute; left:-12px; right:-12px; top:-10px; bottom:-10px;
  border-radius:999px; background:inherit; filter:blur(16px) saturate(160%);
  opacity: var(--wire-glow-alpha);
}

/* End-Knoten (deine zwei <i></i>) */
#hero #text .neon-wire i,
#hero .text .neon-wire i{
  position:absolute; top:50%; transform:translateY(-50%);
  width:10px; height:10px; border-radius:999px; pointer-events:none;
  background:
    radial-gradient(circle, rgba(255,0,128,.70), rgba(255,0,128,0) 60%),
    radial-gradient(circle, rgba(0,255,255,.55), rgba(0,255,255,0) 70%);
  filter:blur(1px) saturate(150%); opacity:.6;
}
#hero #text .neon-wire i:first-child,
#hero .text .neon-wire i:first-child{ left:-6px; }
#hero #text .neon-wire i:last-child,
#hero .text .neon-wire i:last-child{ right:-6px; }

/* --- Segment B: in der Stage (hinter Bild/Video) --- */
#hero #show-max{ position:relative; }
#hero #show-max .neon-wire-under{
  position:absolute; z-index:0; pointer-events:none;
  left: calc(0px - var(--wire-join-overlap)); /* Naht überdeckt Stage-Left */
  top: var(--wire-baseline);
  /* Breite setzt JS (gemessen / Var) */
  height: var(--wire-thickness);
  transform: translateY(-50%) rotate(var(--wire-angle));
  transform-origin: left center;
}
#hero #show-max .neon-wire-under::before{
  content:""; position:absolute; inset:0; border-radius:999px;
  background: linear-gradient(90deg,
    rgba(255,0,128,0) 0%,
    rgba(255,0,128,var(--wire-core-alpha)) 12%,
    rgba(0,255,255,var(--wire-core-alpha)) 50%,
    rgba(255,0,128,var(--wire-core-alpha)) 88%,
    rgba(255,0,128,0) 100%);
  background-size:200% 100%;
  -webkit-mask-image: linear-gradient(to right, transparent 0 3%, #000 10% 90%, transparent 97% 100%);
          mask-image: linear-gradient(to right, transparent 0 3%, #000 10% 90%, transparent 97% 100%);
  animation: a83-wire-flow var(--wire-speed) linear infinite;
  filter: saturate(150%);
}
#hero #show-max .neon-wire-under::after{
  content:""; position:absolute; left:-12px; right:-12px; top:-10px; bottom:-10px;
  border-radius:999px; background:inherit; filter:blur(16px) saturate(160%);
  opacity: var(--wire-glow-alpha);
}

/* Keyframes */
@keyframes a83-wire-flow{
  from{ background-position:0% 50%; }
  to  { background-position:200% 50%; }
}

/* Mobile ausblenden (wenn gewünscht) */
@media (max-width:1279px){
  #hero #text .neon-wire,
  #hero .text .neon-wire,
  #hero #show-max .neon-wire-under{ display:none; }
}




/* ===== Stacking so, dass das Wire-Ende UNTER der Stage verschwindet ===== */
#hero #stage, #hero .stage{
  position: relative;
  z-index: 5; /* Stage über dem Wire */
}
#hero #text, #hero .text{
  position: relative;
  z-index: 4;            /* Text-Spalte unter Stage */
  overflow: visible;
}
/* Inhalt der Text-Spalte (Buttons, Headlines) bewusst ÜBER alles */
#hero #text > *, #hero .text > *{
  position: relative;
  z-index: 6;
}

/* Wire im Text bleibt unterhalb der Stage, aber über dem Text-Background */
#hero #text .neon-wire, #hero .text .neon-wire{
  position: absolute;
  z-index: 3; /* < Stage(5), > Text-Hintergrund(4) */
  pointer-events: none;
  left: 100%;
  top: var(--wire-baseline, 58%);
  height: var(--wire-thickness, 2px);
  transform: translateY(-50%) rotate(var(--wire-angle, -10deg));
  transform-origin: left center;
  /* KEINE feste width hier – die setzt JS pixelgenau */
}

/* Unter der Stage verlaufendes Segment bleibt hinter Bild/Video */
#hero #show-max{ position: relative; }
#hero #show-max .neon-wire-under{
  position: absolute;
  z-index: 0; /* hinter .layer-img (1) & .layer-video (2) */
  pointer-events: none;
  left: 0; /* kein negativer Overlap nötig – Stage liegt drüber */
  top: var(--wire-baseline, 58%);
  height: var(--wire-thickness, 2px);
  transform: translateY(-50%) rotate(var(--wire-angle, -10deg));
  transform-origin: left center;
}

/* End-Knoten bleiben wie gehabt (die 2 <i></i>), der rechte verschwindet unter der Stage */
#hero #text .neon-wire i,
#hero .text .neon-wire i{
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 10px; height: 10px; border-radius: 999px;
  pointer-events: none;
  background:
    radial-gradient(circle, rgba(255,0,128,.70), rgba(255,0,128,0) 60%),
    radial-gradient(circle, rgba(0,255,255,.55), rgba(0,255,255,0) 70%);
  filter: blur(1px) saturate(150%);
  opacity: .6;
}
#hero #text .neon-wire i:first-child,
#hero .text .neon-wire i:first-child{ left: -6px; }
#hero #text .neon-wire i:last-child,
#hero .text .neon-wire i:last-child{  right: -6px; }


