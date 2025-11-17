debugging




/* ===== ULTIMATE DEBUG VERSION =====
   Kopiere das KOMPLETT in Footer Scripts
   Ersetzt dein aktuelles Script temporär
*/

console.clear();
console.log('🔍 DEBUG VERSION ACTIVE');

// Track EVERYTHING
let debugLog = [];
function log(msg){
  const timestamp = Date.now();
  debugLog.push({time: timestamp, msg: msg});
  console.log(`[${timestamp}] ${msg}`);
}

// Monitor scroll position CONSTANTLY
let lastScrollY = window.scrollY;
setInterval(() => {
  const currentY = window.scrollY;
  if(Math.abs(currentY - lastScrollY) > 5){
    log(`📊 SCROLL: ${lastScrollY} → ${currentY} (diff: ${currentY - lastScrollY})`);
    lastScrollY = currentY;
  }
}, 50);

// Monitor ALL click events
document.addEventListener('click', (e) => {
  log(`🖱️ CLICK: ${e.target.tagName} ${e.target.className} ${e.target.id}`);
}, true);

// Monitor body position changes
const observer = new MutationObserver(() => {
  const position = document.body.style.position;
  const top = document.body.style.top;
  if(position === 'fixed'){
    log(`🔒 BODY FIXED: top=${top}`);
  } else if(position === ''){
    log(`🔓 BODY UNFIXED`);
  }
});
observer.observe(document.body, { 
  attributes: true, 
  attributeFilter: ['style'] 
});

// Monitor nav-state changes
const navObserver = new MutationObserver(() => {
  const state = document.documentElement.getAttribute('data-nav-state');
  log(`🎯 NAV-STATE: ${state}`);
});
navObserver.observe(document.documentElement, { 
  attributes: true, 
  attributeFilter: ['data-nav-state'] 
});

// Your actual menu code (simplified)
const burger = document.getElementById('nav-trigger') || document.querySelector('.a83-burger');
const overlay = document.getElementById('nav-overlay');

if(!burger || !overlay){
  log('❌ MISSING: burger or overlay');
} else {
  log('✅ FOUND: burger and overlay');
  
  let isOpen = false;
  let savedScroll = 0;
  
  burger.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if(!isOpen){
      // OPEN
      log('🎬 OPENING MENU');
      savedScroll = window.scrollY;
      log(`💾 SAVED SCROLL: ${savedScroll}`);
      
      // Set state
      document.documentElement.setAttribute('data-nav-state', 'opening');
      
      // Lock body
      document.body.style.position = 'fixed';
      document.body.style.top = `-${savedScroll}px`;
      document.body.style.width = '100%';
      log(`🔒 LOCKED AT: ${savedScroll}`);
      
      // Show overlay
      overlay.style.display = 'block';
      
      setTimeout(() => {
        document.documentElement.setAttribute('data-nav-state', 'open');
        isOpen = true;
      }, 100);
      
    } else {
      // CLOSE
      log('🎬 CLOSING MENU');
      log(`📍 WILL RESTORE TO: ${savedScroll}`);
      
      document.documentElement.setAttribute('data-nav-state', 'closing');
      
      // Unlock body
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      log(`🔓 UNLOCKED`);
      
      // Restore scroll
      log(`⏪ RESTORING SCROLL TO: ${savedScroll}`);
      window.scrollTo(0, savedScroll);
      
      const afterScroll = window.scrollY;
      log(`✅ SCROLL AFTER RESTORE: ${afterScroll}`);
      
      if(Math.abs(afterScroll - savedScroll) > 5){
        log(`⚠️ MISMATCH! Expected ${savedScroll}, got ${afterScroll}`);
      }
      
      // Hide overlay
      setTimeout(() => {
        overlay.style.display = 'none';
        document.documentElement.setAttribute('data-nav-state', 'closed');
        isOpen = false;
        
        const finalScroll = window.scrollY;
        log(`🏁 FINAL SCROLL: ${finalScroll}`);
        
        if(Math.abs(finalScroll - savedScroll) > 5){
          log(`🚨 JUMP DETECTED! ${savedScroll} → ${finalScroll}`);
        }
      }, 300);
    }
  });
}

log('✅ DEBUG VERSION LOADED');
log('👉 Scrolle runter, öffne/schließe Menu, und kopiere ALLES aus Console!');