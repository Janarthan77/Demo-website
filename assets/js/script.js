/**
 * ASSIST - Senior Developer Architecture
 * Advanced Animations, Observers, and Core Logic
 */

class AssistApp {
  constructor() {
    this.DOM = {
      themeToggle: document.getElementById('themeToggle'),
      rtlToggle: document.getElementById('rtlToggle'),
      mobileToggle: document.getElementById('mobileMenuToggle'),
      navMenu: document.getElementById('navMenu'),
      header: document.querySelector('header'),
      fadeElements: document.querySelectorAll('.fade-up'),
      magneticElements: document.querySelectorAll('[data-magnetic]')
    };
    
    this.cursor = null;
    this.init();
  }

  init() {
    this.initTheme();
    this.initRTL();
    this.initMobileMenu();
    this.initScrollObserver();
    this.initLenis();
    
    // Only init advanced cursor/magnetic effects on non-touch devices
    if (window.matchMedia("(pointer: fine)").matches) {
      this.initCursor();
      this.initMagneticEffects();
    }
    
    // Header scroll effect
    window.addEventListener('scroll', () => {
      if (!this.DOM.header) return;
      if (window.scrollY > 150) {
        this.DOM.header.classList.add('scrolled');
      } else {
        this.DOM.header.classList.remove('scrolled');
      }
    }, { passive: true });
  }

  // ==========================================
  // 1. ADVANCED SCROLL OBSERVER
  // ==========================================
  initScrollObserver() {
    if (!this.DOM.fadeElements.length) return;

    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.15 // Trigger when 15% visible
    };

    const observer = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target); // Only animate once
        }
      });
    }, observerOptions);

    this.DOM.fadeElements.forEach(el => observer.observe(el));
  }

  // ==========================================
  // 2. CUSTOM TRAILING CURSOR
  // ==========================================
  initCursor() {
    // Create cursor element
    this.cursor = document.createElement('div');
    this.cursor.classList.add('custom-cursor');
    document.body.appendChild(this.cursor);

    let mouseX = 0, mouseY = 0;
    let cursorX = 0, cursorY = 0;

    // Track mouse position
    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    // Smooth trailing animation loop
    const animateCursor = () => {
      // Ease factor (0.1 = smooth drag)
      cursorX += (mouseX - cursorX) * 0.15;
      cursorY += (mouseY - cursorY) * 0.15;
      
      this.cursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0) translate(-50%, -50%)`;
      requestAnimationFrame(animateCursor);
    };
    requestAnimationFrame(animateCursor);

    // Expand cursor on clickable elements
    const clickables = document.querySelectorAll('a, button, input, [data-magnetic]');
    clickables.forEach(el => {
      el.addEventListener('mouseenter', () => this.cursor.classList.add('active'));
      el.addEventListener('mouseleave', () => this.cursor.classList.remove('active'));
    });

    // Hide cursor over iframes/videos to prevent frozen glitch
    const hideZones = document.querySelectorAll('iframe, .video-wrapper');
    hideZones.forEach(el => {
      el.addEventListener('mouseenter', () => this.cursor.style.opacity = '0');
      el.addEventListener('mouseleave', () => this.cursor.style.opacity = '1');
    });
  }

  // ==========================================
  // 3. MAGNETIC HOVER EFFECTS
  // ==========================================
  initMagneticEffects() {
    if (!this.DOM.magneticElements.length) return;

    this.DOM.magneticElements.forEach(el => {
      el.addEventListener('mousemove', (e) => {
        const position = el.getBoundingClientRect();
        const x = e.clientX - position.left - position.width / 2;
        const y = e.clientY - position.top - position.height / 2;
        
        // Move element slightly towards mouse (strength factor 0.3)
        el.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
      });

      el.addEventListener('mouseleave', () => {
        el.style.transform = `translate(0px, 0px)`;
        // Reset transition for smooth snap back
        el.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
        setTimeout(() => {
          el.style.transition = ''; // Remove inline transition so it follows CSS rules during hover
        }, 500);
      });
    });
  }

  // ==========================================
  // 4. THEME & RTL MANAGEMENT (Legacy)
  // ==========================================
  initTheme() {
    if (!this.DOM.themeToggle) return;
    
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    this.updateThemeIcons(savedTheme);

    this.DOM.themeToggle.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'light' ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
      this.updateThemeIcons(next);
    });
  }

  updateThemeIcons(theme) {
    const darkIcon = this.DOM.themeToggle.querySelector('.theme-icon-dark');
    const lightIcon = this.DOM.themeToggle.querySelector('.theme-icon-light');
    if(darkIcon && lightIcon) {
      if (theme === 'dark') {
        darkIcon.style.display = 'none';
        lightIcon.style.display = 'block';
      } else {
        darkIcon.style.display = 'block';
        lightIcon.style.display = 'none';
      }
    }
  }

  initRTL() {
    if (!this.DOM.rtlToggle) return;
    
    const savedDir = localStorage.getItem('dir') || 'ltr';
    document.documentElement.setAttribute('dir', savedDir);
    this.DOM.rtlToggle.textContent = savedDir === 'ltr' ? 'RTL' : 'LTR';

    this.DOM.rtlToggle.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('dir');
      const next = current === 'ltr' ? 'rtl' : 'ltr';
      document.documentElement.setAttribute('dir', next);
      localStorage.setItem('dir', next);
      this.DOM.rtlToggle.textContent = next === 'ltr' ? 'RTL' : 'LTR';
    });
  }

  initMobileMenu() {
    if (!this.DOM.mobileToggle || !this.DOM.navMenu) return;
    
    // Dynamically add the Inquiry CTA to the mobile menu
    const navList = this.DOM.navMenu.querySelector('ul');
    if (navList && !navList.querySelector('.mobile-only-cta')) {
      const mobileCTA = document.createElement('li');
      mobileCTA.className = 'mobile-only-cta';
      mobileCTA.innerHTML = `<a href="contact.html" class="btn btn-primary" style="display: flex; justify-content: center; width: 100%; padding: 0.75rem 2rem;">Start Project Inquiry</a>`;
      navList.appendChild(mobileCTA);
    }

    const burgerSVG = `<svg class="burger-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>`;
    const closeSVG = `<svg class="close-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;

    this.DOM.mobileToggle.addEventListener('click', () => {
      this.DOM.navMenu.classList.toggle('active');
      const isActive = this.DOM.navMenu.classList.contains('active');
      this.DOM.mobileToggle.innerHTML = isActive ? closeSVG : burgerSVG;
    });
  }

  // ==========================================
  // 5. ACCORDION LOGIC
  // ==========================================
  initAccordions() {
    const accordions = document.querySelectorAll('.accordion');
    accordions.forEach(acc => {
      const header = acc.querySelector('.accordion-header');
      if (!header) return;
      header.addEventListener('click', () => {
        // Optional: close others
        accordions.forEach(other => {
          if (other !== acc) other.classList.remove('active');
        });
        acc.classList.toggle('active');
      });
    });
  }

  // ==========================================
  // 6. SMOOTH SCROLLING (Lenis)
  // ==========================================
  initLenis() {
    try {
      if (typeof Lenis === 'undefined') {
        console.warn('Lenis scroll library not loaded.');
        return;
      }
      const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        direction: 'vertical',
        gestureDirection: 'vertical',
        smooth: true,
        mouseMultiplier: 1,
        smoothTouch: false,
        touchMultiplier: 2,
        infinite: false,
      });

      function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);
    } catch (e) {
      console.error('Lenis initialization failed:', e);
    }
  }
}

// Initialize application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.assistApp = new AssistApp();
  window.assistApp.initAccordions();
});
