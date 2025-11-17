/* ===== ULTIMATE JUMP DIAGNOSTIC =====
   Kopiere das KOMPLETT in die Console (F12) auf deiner Live-Seite!
   Dann klicke auf den Header und schicke mir den Output!
*/

console.clear();
console.log('=== JUMP DIAGNOSTIC ACTIVE ===\n');

// 1. Find problematic elements
const header = document.getElementById('site-header') || document.querySelector('header');
const wordmark = document.querySelector('.brand-wordmark');
const burger = document.getElementById('nav-trigger') || document.querySelector('.a83-burger');

console.log('1. ELEMENTS:');
console.log('Header:', header);
console.log('Wordmark:', wordmark);
console.log('Burger:', burger);

// 2. Check all links in header
if(header){
  const allLinks = header.querySelectorAll('a, [href]');
  console.log('\n2. LINKS IN HEADER:', allLinks.length);
  
  allLinks.forEach((link, i) => {
    console.log(`Link ${i}:`, {
      tag: link.tagName,
      href: link.getAttribute('href'),
      computed_href: link.href,
      class: link.className,
      id: link.id,
      text: link.textContent?.substring(0, 30)
    });
  });
}

// 3. Install GLOBAL click logger
console.log('\n3. INSTALLING CLICK LOGGER...');
console.log('Klicke jetzt LANGSAM auf verschiedene Stellen im Header!\n');

let clickCount = 0;

// Log ALL clicks
document.addEventListener('click', function(e){
  clickCount++;
  
  console.log(`\n=== CLICK #${clickCount} ===`);
  console.log('Target:', e.target);
  console.log('Target tag:', e.target.tagName);
  console.log('Target class:', e.target.className);
  console.log('Target id:', e.target.id);
  
  // Find closest link
  const link = e.target.closest('a');
  if(link){
    console.log('⚠️ LINK FOUND:', {
      href: link.getAttribute('href'),
      computed: link.href,
      text: link.textContent?.substring(0, 30)
    });
  } else {
    console.log('✓ No link found');
  }
  
  // Check scroll position BEFORE
  const scrollBefore = window.scrollY;
  console.log('Scroll BEFORE:', scrollBefore);
  
  // Check after a tiny delay
  setTimeout(() => {
    const scrollAfter = window.scrollY;
    console.log('Scroll AFTER:', scrollAfter);
    
    if(scrollAfter !== scrollBefore){
      console.error('🚨 JUMP DETECTED!', scrollBefore, '→', scrollAfter);
      console.log('Element that caused jump:', e.target);
    } else {
      console.log('✓ No jump');
    }
  }, 50);
  
}, true); // Capture phase!

// 4. Check for Lenis
console.log('\n4. LENIS CHECK:');
console.log('Lenis exists:', !!window.lenis);
if(window.lenis){
  console.log('Lenis scroll:', window.lenis.scroll);
  console.log('Lenis options:', window.lenis.options);
}

// 5. Check body lock state
console.log('\n5. BODY STATE:');
console.log('Body position:', getComputedStyle(document.body).position);
console.log('Body top:', document.body.style.top);
console.log('HTML classes:', document.documentElement.className);

console.log('\n=== READY! Klicke jetzt auf den Header! ===');
console.log('Teste:');
console.log('1. Burger');
console.log('2. Wordmark');
console.log('3. Leerer Header-Bereich');
console.log('\nSchicke mir dann ALLES was in Console steht!');