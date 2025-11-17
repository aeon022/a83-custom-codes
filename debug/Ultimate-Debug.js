(function A83_DEBUG_V8() {
    console.clear();
    console.log("%c===== A83 DEBUG SCRIPT v8 (AUTOPSIE) GESTARTET ======", "color: #e54666; font-size: 1.2em; font-weight: bold;");

    // ===== 1. CSS-CHECK (Kennen wir schon, aber zur Bestätigung) =====
    console.groupCollapsed("%c[A83-Debug] 1. CSS Pointer-Events Status", "color: blue; font-weight: bold;");
    try {
        const header = document.getElementById('site-header');
        const wordmark = header.querySelector('.brand-wordmark');
        const burgerSlot = header.querySelector('.burger-home-slot');
        console.log(`Header (#site-header):       %c${getComputedStyle(header).pointerEvents}`, "font-weight: bold; color: green;");
        console.log(`Wordmark (.brand-wordmark):    %c${getComputedStyle(wordmark).pointerEvents}`, "font-weight: bold; color: green;");
        console.log(`Burger Slot (.burger-home-slot): %c${getComputedStyle(burgerSlot).pointerEvents}`, "font-weight: bold; color: green;");
        console.log("%cCSS-Fix ist KORREKT.", "color: green;");
    } catch (e) { console.warn("CSS-Check fehlgeschlagen."); }
    console.groupEnd();

    // ===== 2. LOCK/UNLOCK FUNKTIONS-ANALYSE (DER SCHLÜSSEL) =====
    console.group("%c[A83-Debug] 2. Analyse der lock/unlockBody Funktionen", "color: blue; font-weight: bold;");
    let hasPositionFixedLock = false;
    try {
        // Wir suchen nach der originalen, korrekten Logik
        if (typeof lockBody === 'function' && lockBody.toString().includes("position: fixed")) {
            console.log("%cINFO: 'lockBody' scheint die korrekte 'position: fixed' Logik zu verwenden. (GUT)", "color: green;");
            hasPositionFixedLock = true;
        } else {
            console.error("ALARM: 'lockBody' verwendet die VEREINFACHTE (fehlerhafte) Version. Dies verursacht den 'Öffnen'-Sprung.");
        }
        
        if (typeof unlockBody === 'function' && unlockBody.toString().includes("restoreScroll")) {
             console.log("%cINFO: 'unlockBody' scheint die korrekte 'restoreScroll' Logik zu verwenden. (GUT)", "color: green;");
        } else {
            console.error("ALARM: 'unlockBody' verwendet die VEREINFACHTE (fehlerhafte) Version. Dies verursacht den 'Schließen'-Sprung.");
        }
    } catch (e) {
        console.error("Fehler: 'lockBody' oder 'unlockBody' sind nicht global definiert. Das Skript 'a83-off-canvas.js' muss sie im globalen Scope (window) verfügbar machen, oder dieser Test schlägt fehl.");
    }
    console.groupEnd();
    
    // ===== 3. DER EVENT-SPION (v8) =====
    console.log("%c[A83-Debug] 3. Event-Spion (v8) ist aktiv. Bitte klicke jetzt:", "color: blue; font-weight: bold;");
    console.log("  1. Klicke auf den BURGER (um zu ÖFFNEN)");
    console.log("  2. Klicke auf das 'X' (um zu SCHLIESSEN)");

    // Wir brauchen nur EINEN Listener auf der höchsten Ebene, um den Burger-Klick abzufangen
    const masterListener = (e) => {
        const target = e.target;
        const isBurger = target.closest('.burger-home-slot');
        const isCloseBtn = target.closest('.nav-close-btn');

        if (!isBurger && !isCloseBtn) {
            // Ignoriere alle anderen Klicks
            return;
        }
        
        // Es ist entweder der Burger oder der Close-Button
        const currentScroll = window.scrollY || window.pageYOffset;
        
        if (isBurger) {
            console.group(`%c[SPION] 'pointerdown' auf BURGER bei ${currentScroll}px`, "color: #e54666; font-weight: bold;");
            console.log("-> Stoppe Event (verhindert Breakdance-Konflikt)...");
            e.preventDefault();
            e.stopImmediatePropagation();
            
            console.log("-> Rufe jetzt 'openNav()' auf (falls im Skript vorhanden)...");
            // Wir müssen 'openNav' manuell aufrufen, da wir das Event gestoppt haben
            // (Wir müssen 'state' und 'openNav' aus dem Skript erraten)
            try {
                 const state = document.documentElement.getAttribute('data-nav-state') || 'closed';
                 if (state === 'closed' && typeof openNav === 'function') {
                    openNav();
                 } else if (state === 'open' && typeof closeNav === 'function') {
                    closeNav(); // Falls man auf den Burger klickt, um zu schließen
                 }
            } catch(err) { console.error("Konnte 'openNav' nicht finden.", err); }
            
            // Verzögerter Check: Hat die Seite gesprungen?
            setTimeout(() => {
                const newScroll = window.scrollY || window.pageYOffset;
                console.log(`-> CHECK (nach 100ms): Scroll ist jetzt bei ${newScroll}px.`);
                if (Math.abs(newScroll - currentScroll) > 20) {
                     console.error("-> FEHLER: Sprung erkannt! 'lockBody' ist fehlerhaft.");
                } else {
                     console.log("%c-> ERFOLG: Sprung beim ÖFFNEN verhindert.", "color: green;");
                }
                console.groupEnd();
            }, 100);
        }
        
        if (isCloseBtn) {
            console.group(`%c[SPION] 'click' auf CLOSE bei ${currentScroll}px`, "color: #e54666; font-weight: bold;");
            console.log("-> Standard 'closeNav()' wird aufgerufen...");
            // Der 'closeBtn' hat seinen eigenen Listener, wir beobachten nur
            
            // Verzögerter Check nach der Schließ-Animation
            setTimeout(() => {
                const newScroll = window.scrollY || window.pageYOffset;
                console.log(`-> CHECK (nach 800ms): Scroll ist jetzt bei ${newScroll}px.`);
                // Wir erwarten, dass die Scroll-Position wiederhergestellt wurde (oder nahe dran ist)
                if (Math.abs(newScroll - currentScroll) > 50) {
                     console.error(`-> FEHLER: Sprung beim Schließen! 'unlockBody' hat die Position ${currentScroll}px nicht wiederhergestellt.`);
                } else {
                     console.log("%c-> ERFOLG: Sprung beim SCHLIESSEN verhindert.", "color: green;");
                }
                console.groupEnd();
            }, 800); // Muss länger sein als die 'TOTAL' Schließ-Animation
        }
    };

    // ALLES entfernen, um sauber zu starten
    try { window.A83_DEBUG_STOP_V8(); } catch(e) {}
    
    // Wir brauchen den globalen 'pointerdown'-Fänger
    window.addEventListener('pointerdown', masterListener, true); // true = Capture!
    // Wir brauchen auch einen 'click'-Fänger für den Close-Button (der später im DOM erscheint)
    document.getElementById('nav-overlay').addEventListener('click', masterListener, true);
    
    window.A83_DEBUG_STOP_V8 = function() {
        window.removeEventListener('pointerdown', masterListener, true);
        try {
            document.getElementById('nav-overlay').removeEventListener('click', masterListener, true);
        } catch(e) {}
        console.log("%c===== A83 DEBUG SCRIPT v8 GESTOPPT ======", "color: gray;");
        console.log("Bitte lade die Seite neu (F5), um die Spione vollständig zu entfernen.");
    };
})();