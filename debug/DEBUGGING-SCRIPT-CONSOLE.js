(function A83_DEBUG_RUN() {
    console.clear();
    console.log("%c===== A83 DEBUG SCRIPT GESTARTET ======", "color: #e54666; font-size: 1.2em; font-weight: bold;");

    const header = document.getElementById('site-header');
    if (!header) {
        console.error("FEHLER: Header (#site-header) nicht gefunden. Skript gestoppt.");
        return;
    }

    const wordmark = header.querySelector('.brand-wordmark');
    const burgerSlot = header.querySelector('.burger-home-slot');

    if (!wordmark || !burgerSlot) {
        console.error("FEHLER: Wordmark (.brand-wordmark) oder Burger (.burger-home-slot) nicht gefunden.");
    }

    // ===== TEIL 1: CSS-STATUS PRÜFEN =====
    // Wir prüfen die *berechneten* (tatsächlichen) CSS-Werte.
    console.groupCollapsed("%c[A83-Debug] 1. CSS Pointer-Events Status", "color: blue; font-weight: bold;");
    try {
        const headerEvents = getComputedStyle(header).pointerEvents;
        const wordmarkEvents = getComputedStyle(wordmark).pointerEvents;
        const burgerEvents = getComputedStyle(burgerSlot).pointerEvents;

        console.log(`Header (#site-header):       %c${headerEvents}`, `font-weight: bold; color: ${headerEvents === 'none' ? 'green' : 'red'};`);
        console.log(`Wordmark (.brand-wordmark):    %c${wordmarkEvents}`, `font-weight: bold; color: ${wordmarkEvents === 'auto' ? 'green' : 'red'};`);
        console.log(`Burger Slot (.burger-home-slot): %c${burgerEvents}`, `font-weight: bold; color: ${burgerEvents === 'auto' ? 'green' : 'red'};`);

        if (headerEvents !== 'none' || wordmarkEvents !== 'auto' || burgerEvents !== 'auto') {
            console.warn("WARNUNG: Der CSS-Fix (pointer-events) wird NICHT korrekt angewendet! Breakdance überschreibt ihn wahrscheinlich. Stelle sicher, dass der CSS-Fix mit '!important' geladen wird.");
        } else {
            console.log("%cINFO: Der CSS-Fix (pointer-events) scheint korrekt geladen zu sein.", "color: green;");
        }
    } catch (e) {
        console.error("Fehler beim Prüfen der CSS-Stile:", e);
    }
    console.groupEnd();

    // ===== TEIL 2: EVENT-SPION =====
    // Wir lauschen auf 'pointerdown', da dies VOR 'click' feuert und oft von GSAP/BD genutzt wird.
    const eventsToSpyOn = ['pointerdown', 'mousedown', 'click'];

    const debugListener = function(e) {
        const target = e.target;
        const isBurger = target.closest('.burger-home-slot');
        const isWordmark = target.closest('.brand-wordmark');

        console.group(`%c[A83-Debug] 2. Event Abgefangen: ${e.type}`, "color: #e54666; font-weight: bold;");
        console.log("Geklicktes Element:", target);
        console.log("Ist es Burger? ->", !!isBurger);
        console.log("Ist es Wordmark? ->", !!isWordmark);

        // Das ist der "böse" Klick
        if (!isBurger && !isWordmark) {
            console.warn("LEERER HEADER GEKLICKT! -> Event wird jetzt aggressiv gestoppt, um den Sprung zu verhindern.");
            e.preventDefault();
            e.stopImmediatePropagation(); // Stoppt andere Listener (wie GSAP)
            console.log("preventDefault() & stopImmediatePropagation() aufgerufen.");
        } else {
            console.log("GÜLTIGER KLICK (Burger/Wordmark) -> Event wird durchgelassen.");
        }
        console.groupEnd();
    };

    // Wir nutzen 'true' (Capture Phase), um VOR Breakdance zu feuern.
    eventsToSpyOn.forEach(evt => {
        header.addEventListener(evt, debugListener, true);
    });

    console.log("%c[A83-Debug] Event-Spion ist jetzt aktiv.", "color: blue; font-weight: bold;");
    console.log("Bitte klicke jetzt auf der Seite herum:");
    console.log("  1. Klicke auf den leeren Header-Bereich.");
    console.log("  2. Klicke auf das Wordmark.");
    console.log("  3. Klicke auf den Burger.");
    console.log("Beobachte die Konsolen-Ausgaben.");

    // Funktion zum Stoppen des Debuggers
    window.A83_DEBUG_STOP = function() {
        eventsToSpyOn.forEach(evt => {
            header.removeEventListener(evt, debugListener, true);
        });
        console.log("%c===== A83 DEBUG SCRIPT GESTOPPT ======", "color: gray; font-size: 1.2em; font-weight: bold;");
    };
    console.log("Tippe 'A83_DEBUG_STOP()' in die Konsole, um den Spion zu beenden.");

})();