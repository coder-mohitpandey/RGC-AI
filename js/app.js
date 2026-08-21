/**
 * RGC AI Assistant - Global Application Logic & Interactivity
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initLanguageSwitcher();
});

// Toggle Side Navigation Menu
function initNavigation() {
  const menuBtn = document.getElementById('menu-toggle-btn');
  const navDropdown = document.getElementById('nav-menu-dropdown');

  if (menuBtn && navDropdown) {
    menuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      navDropdown.classList.toggle('active');
    });

    document.addEventListener('click', (e) => {
      if (!navDropdown.contains(e.target) && e.target !== menuBtn) {
        navDropdown.classList.remove('active');
      }
    });
  }
}

// Toggle Language Switcher Dropdown
function initLanguageSwitcher() {
  const langBtn = document.getElementById('lang-btn');
  const langDropdown = document.getElementById('lang-dropdown');
  const currentLangLabel = document.getElementById('current-lang-label');

  if (langBtn && langDropdown) {
    langBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      langDropdown.classList.toggle('active');
    });

    document.querySelectorAll('.lang-option').forEach(option => {
      option.addEventListener('click', () => {
        const selectedLang = option.getAttribute('data-lang');
        if (currentLangLabel) {
          currentLangLabel.textContent = option.textContent.trim();
        }
        langDropdown.classList.remove('active');
        
        // Show notification toast
        showToast(`Language changed to ${option.textContent.trim()}`);
      });
    });

    document.addEventListener('click', () => {
      langDropdown.classList.remove('active');
    });
  }
}

// Utility Toast Notification
function showToast(message) {
  let toast = document.getElementById('app-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'app-toast';
    toast.style.cssText = `
      position: fixed;
      bottom: 80px;
      left: 50%;
      transform: translateX(-50%) translateY(20px);
      background: rgba(30, 41, 59, 0.9);
      color: #ffffff;
      padding: 10px 20px;
      border-radius: 20px;
      font-size: 0.85rem;
      backdrop-filter: blur(8px);
      box-shadow: 0 10px 25px rgba(0,0,0,0.2);
      z-index: 999;
      opacity: 0;
      transition: all 0.3s ease;
      pointer-events: none;
    `;
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.style.opacity = '1';
  toast.style.transform = 'translateX(-50%) translateY(0)';

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-50%) translateY(20px)';
  }, 2500);
}
