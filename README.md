# a83-custom-codes

Dieses Repository sammelt benutzerdefinierte CSS- und JavaScript-Codes, die speziell für eine Website entwickelt wurden, die mit WordPress und dem **Breakdance Builder** erstellt wurde. Der Code dient der Erweiterung der Standardfunktionalität, der Behebung von Builder-spezifischen Problemen (z. B. "Scroll-Jumps") und der Implementierung eines stark stilisierten, "glitchy" Markendesigns.

## Hauptfunktionen

* **Hochentwickeltes Off-Canvas-Menü:** Eine komplett eigene Navigation (`off-canvas-v13.5.js`, `header-unified-v14.1.css`), die ein "Wild Glitch"-Theme, sanfte Animationen und eine "No-Teleport"-Logik (kein Springen der Seite beim Öffnen/Schließen) implementiert.
* **Dynamische Header-Anpassung ("Scroll Tone Detection"):** Der Header (Logo und Burger-Icon) ändert seine Farbe (hell/dunkel) automatisch, je nachdem, über welchem Seitenabschnitt (mit `data-tone`-Attribut) er sich befindet.
* **Visuelle "Glitch"-Ästhetik:** Wiederkehrende Glitch- und Jitter-Animationen für das Wordmark-Logo, Links und UI-Elemente, um ein konsistentes, "digitales" Branding zu gewährleisten.
* **Interaktive Sektions-Features:** Beinhaltet Skripte für:
    * Hero-Sektionen mit Video-Hover-Effekten (`hero-hover-video-v3.0.css`).
    * Steuerung von Hintergrundvideos in Breakdance-Popups mit Ton (`popup-bg-video-v2.4.js`).
* **Debugging-Werkzeuge:** Eine Sammlung von Skripten im `debug/`-Ordner zur Diagnose von Scroll-Verhalten, Klick-Events, "Scroll-Tone"-Status (`debug-scroll-hud.js`) und CSS-Problemen.

## Wichtige Komponenten

### 1. Off-Canvas & Scroll-Tone (v13.5 / v14.1)

Dies ist das Herzstück des Repositorys.
* **`nav/js/off-canvas-v13_5_FINAL.js`** (oder `backup/`): Dies ist die primäre JavaScript-Datei. Sie enthält:
    * Einen "Global Guard", um die Ausführung im `wp-admin`-Backend oder im Breakdance-Builder zu verhindern.
    * Die Logik für die **Scroll Tone Detection**, die den `data-tone` des `<html>`-Tags basierend auf der Scroll-Position setzt.
    * Die vollständige Steuerung für das Öffnen/Schließen des Off-Canvas-Menüs (`lockBody`, `unlockBody`, Glitch-Trigger).
    * Die "Terminal-Hint"-Anzeige im Menü.
* **`nav/css/off-canvas-v13_5_FINAL+ADDON+SafeArea.css`** (oder `versions/`): Das zugehörige CSS, das das gesamte Styling für das Off-Canvas-Overlay, die Menü-Karte, das Burger-Icon, das Wasserzeichen und die Glitch-Animationen definiert.

### 2. Debugging-Suite

Der `debug/`-Ordner ist entscheidend für die Wartung:
* **`debug-scroll-hud.js`**: Blendetein Live-HUD (Head-Up-Display) auf der Website ein, das den aktuellen `data-tone`, die erkannte Sektion und den Status der Menü-Sperre anzeigt.
* **`Ultimate-Debug.js` / `DEBUGGING-SCRIPT-CONSOLE.js`**: Skripte, die in der Browser-Konsole ausgeführt werden können, um Event-Listener (Klicks, Pointerdown) zu überwachen und Konflikte zu identifizieren, die zu "Scroll-Jumps" führen.
* **`logs/`**: Enthält Log-Dateien von Debugging-Sitzungen.

### 3. Sektions-Module

Diese Skripte/Stile werden vermutlich nur auf bestimmten Seiten oder in bestimmten Sektionen geladen:
* **`sections/hero-hover-video-v...`**: Aktiviert ein Video, wenn der Benutzer über eine bestimmte Hero-Sektion hovert, inklusive Glitch-Übergang.
* **`sections/popup-bg-video-v...`**: Modifiziert ein Breakdance-Popup, um ein Hintergrundvideo mit Ton abzuspielen, sobald das Popup geöffnet wird.

## Projektstruktur

a83-custom-codes/
├── --versions/       # Archiv älterer Iterationen und Tests
├── backup/           # Manuelle Backups von stabilen Versionen
├── debug/            # Diagnose-Skripte, HUDs und Logs
│   └── logs/
├── global/           # Globale Utility-Klassen (z.B. Terminal-Icon)
│   └── css/
├── nav/              # Kern-Code für die Hauptnavigation
│   ├── css/          # Styling für Header, Wordmark, Burger, Off-Canvas
│   └── js/           # Logik für Header, Wordmark, Off-Canvas
├── sections/         # Code für spezifische Seitensektionen (Hero, Popups)
└── tests/            # Eigenständige HTML-Dateien zum Testen von Funktionen


## Verwendung

1.  **Integration:** Der Code ist für die Einbindung in eine WordPress-Website (z.B. über ein Code-Snippets-Plugin oder direkt im Child-Theme) vorgesehen.
2.  **Abhängigkeiten:** Die Skripte (`off-canvas-v13_5_FINAL.js`) sind so konzipiert, dass sie die notwendigen HTML-Elemente (`#nav-overlay`, `#nav-trigger` etc.) finden, die im Breakdance Builder erstellt wurden.
3.  **Scroll-Tone Setup:** Damit die "Scroll-Tone Detection" funktioniert, müssen die Sektionen im Breakdance Builder ein Attribut `data-tone` mit dem Wert `light` oder `dark` erhalten.