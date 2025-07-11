// Global Security Service for VaultSecure Gallery
class SecurityService {
  constructor() {
    this.isActive = false;
    this.violations = [];
    this.protectionLevel = 'maximum';
    this.init();
  }

  init() {
    if (this.isActive) return;
    this.isActive = true;
    
    console.log('🔒 VaultSecure: Global security protection activated');
    
    // Initialize all protection methods
    this.preventScreenshots();
    this.preventDevTools();
    this.preventCloning();
    this.preventSaving();
    this.preventInspection();
    this.preventKeyboardShortcuts();
    this.addVisualProtection();
    this.monitorSuspiciousActivity();
  }

  // Prevent screenshots and screen capture
  preventScreenshots() {
    // Block Print Screen key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'PrintScreen' || e.keyCode === 44) {
        e.preventDefault();
        this.reportViolation('Screenshot attempt blocked (Print Screen)');
        this.showWarning('Screenshots are disabled on this site');
        return false;
      }
      
      // Block Windows Snipping Tool (Win+Shift+S)
      if ((e.metaKey && e.shiftKey && e.key === 'S') || 
          (e.ctrlKey && e.shiftKey && e.key === 'S')) {
        e.preventDefault();
        this.reportViolation('Screenshot attempt blocked (Snipping Tool)');
        this.showWarning('Screenshots are disabled on this site');
        return false;
      }
    });

    // Block Alt+Print Screen
    document.addEventListener('keydown', (e) => {
      if (e.altKey && e.keyCode === 44) {
        e.preventDefault();
        this.reportViolation('Screenshot attempt blocked (Alt+Print Screen)');
        this.showWarning('Screenshots are disabled on this site');
        return false;
      }
    });

    // Monitor for screen recording detection
    let isHidden = false;
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && !isHidden) {
        isHidden = true;
        this.reportViolation('Possible screen recording detected');
      } else if (!document.hidden && isHidden) {
        isHidden = false;
        // Brief blur to prevent recording
        this.temporaryBlur();
      }
    });
  }

  // Prevent developer tools access
  preventDevTools() {
    let devToolsOpen = false;
    let checkCount = 0;

    const checkDevTools = () => {
      const threshold = 160;
      const heightDiff = window.outerHeight - window.innerHeight;
      const widthDiff = window.outerWidth - window.innerWidth;

      if (heightDiff > threshold || widthDiff > threshold) {
        checkCount++;
        if (checkCount > 3 && !devToolsOpen) {
          devToolsOpen = true;
          this.reportViolation('Developer tools detected');
          this.handleDevToolsDetection();
        }
      } else {
        checkCount = 0;
        if (devToolsOpen) {
          devToolsOpen = false;
          this.restoreContent();
        }
      }
    };

    // Check every second
    setInterval(checkDevTools, 1000);

    // Block F12 key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'F12') {
        e.preventDefault();
        this.reportViolation('F12 key blocked');
        this.showWarning('Developer tools access is disabled');
        return false;
      }
    });

    // Block common developer shortcuts
    document.addEventListener('keydown', (e) => {
      const blockedCombos = [
        { ctrl: true, shift: true, key: 'I' }, // Inspect
        { ctrl: true, shift: true, key: 'J' }, // Console
        { ctrl: true, shift: true, key: 'C' }, // Inspect Element
        { ctrl: true, key: 'U' }, // View Source
      ];

      const isBlocked = blockedCombos.some(combo => {
        const ctrlMatch = combo.ctrl ? e.ctrlKey : true;
        const shiftMatch = combo.shift ? e.shiftKey : true;
        return ctrlMatch && shiftMatch && combo.key === e.key;
      });

      if (isBlocked) {
        e.preventDefault();
        this.reportViolation(`Developer shortcut blocked: ${e.key}`);
        this.showWarning('Developer tools access is disabled');
        return false;
      }
    });
  }

  // Prevent site cloning and iframe embedding
  preventCloning() {
    // Prevent iframe embedding
    if (window !== window.top) {
      this.reportViolation('Site embedded in iframe - potential cloning');
      this.showWarning('This site cannot be embedded');
      window.top.location = window.location;
      return;
    }

    // Add anti-cloning headers check
    const checkHeaders = () => {
      // Monitor for suspicious requests
      const originalFetch = window.fetch;
      window.fetch = function(...args) {
        const url = args[0];
        if (typeof url === 'string' && !url.includes(window.location.origin)) {
          console.warn('🔒 External request detected:', url);
        }
        return originalFetch.apply(this, args);
      };
    };

    checkHeaders();

    // Prevent domain spoofing
    const checkDomain = () => {
      const allowedDomains = [
        'localhost',
        '127.0.0.1',
        'onrender.com',
        'render.com',
        'netlify.app',
        'vercel.app'
      ];

      const currentDomain = window.location.hostname;
      const isAllowed = allowedDomains.some(domain => 
        currentDomain.includes(domain) || currentDomain === domain
      );

      if (!isAllowed && currentDomain !== '') {
        this.reportViolation(`Unauthorized domain: ${currentDomain}`);
        console.warn('🔒 Domain verification failed');
      }
    };

    checkDomain();
  }

  // Prevent saving and downloading
  preventSaving() {
    // Block save shortcuts
    document.addEventListener('keydown', (e) => {
      const blockedSaveKeys = [
        { ctrl: true, key: 's' }, // Ctrl+S
        { ctrl: true, key: 'S' }, // Ctrl+S
        { ctrl: true, key: 'p' }, // Ctrl+P
        { ctrl: true, key: 'P' }, // Ctrl+P
      ];

      const isBlocked = blockedSaveKeys.some(combo => {
        return combo.ctrl === e.ctrlKey && combo.key === e.key;
      });

      if (isBlocked) {
        e.preventDefault();
        this.reportViolation(`Save shortcut blocked: ${e.key}`);
        this.showWarning('Saving is disabled on this site');
        return false;
      }
    });

    // Block print functionality
    window.addEventListener('beforeprint', (e) => {
      e.preventDefault();
      this.reportViolation('Print attempt blocked');
      this.showWarning('Printing is disabled on this site');
    });
  }

  // Prevent right-click and inspection
  preventInspection() {
    // Block right-click context menu
    document.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      this.reportViolation('Right-click blocked');
      this.showCustomContextMenu(e);
      return false;
    });

    // Block text selection
    document.addEventListener('selectstart', (e) => {
      e.preventDefault();
      this.reportViolation('Text selection blocked');
      return false;
    });

    // Block drag and drop
    document.addEventListener('dragstart', (e) => {
      e.preventDefault();
      this.reportViolation('Drag operation blocked');
      return false;
    });

    // Block copy/cut/paste
    ['copy', 'cut', 'paste'].forEach(event => {
      document.addEventListener(event, (e) => {
        e.preventDefault();
        this.reportViolation(`${event} operation blocked`);
        this.showWarning(`${event} is disabled on this site`);
      });
    });
  }

  // Prevent keyboard shortcuts
  preventKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Block F10 (menu)
      if (e.key === 'F10' || (e.altKey && e.key === 'F10')) {
        e.preventDefault();
        this.reportViolation('Menu access blocked');
        this.showWarning('Menu access is disabled');
        return false;
      }

      // Block F1 (help)
      if (e.key === 'F1') {
        e.preventDefault();
        this.reportViolation('Help menu blocked');
        return false;
      }

      // Block Ctrl+Shift+Delete (clear data)
      if (e.ctrlKey && e.shiftKey && e.key === 'Delete') {
        e.preventDefault();
        this.reportViolation('Clear data shortcut blocked');
        return false;
      }
    });
  }

  // Add visual protection
  addVisualProtection() {
    // Add CSS to prevent selection and dragging
    const style = document.createElement('style');
    style.textContent = `
      * {
        -webkit-user-select: none !important;
        -moz-user-select: none !important;
        -ms-user-select: none !important;
        user-select: none !important;
        -webkit-user-drag: none !important;
        -webkit-touch-callout: none !important;
        -webkit-tap-highlight-color: transparent !important;
      }
      
      img, canvas, video {
        pointer-events: none !important;
        -webkit-user-select: none !important;
        -moz-user-select: none !important;
        user-select: none !important;
        -webkit-user-drag: none !important;
      }
      
      .protected-content {
        position: relative;
        overflow: hidden;
      }
      
      .protected-content::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        background: transparent;
        z-index: 1;
      }
    `;
    document.head.appendChild(style);
  }

  // Monitor suspicious activity
  monitorSuspiciousActivity() {
    // Monitor console access
    const originalConsole = window.console;
    let consoleWarned = false;
    
    Object.keys(originalConsole).forEach(key => {
      if (typeof originalConsole[key] === 'function') {
        window.console[key] = function(...args) {
          if (!consoleWarned) {
            consoleWarned = true;
            this.reportViolation('Console access detected');
          }
          return originalConsole[key].apply(originalConsole, args);
        }.bind(this);
      }
    });

    // Monitor for automated tools
    const checkAutomation = () => {
      if (navigator.webdriver) {
        this.reportViolation('Automated browser detected');
        this.showWarning('Automated access detected');
      }
    };

    checkAutomation();
  }

  // Handle developer tools detection
  handleDevToolsDetection() {
    this.showWarning('Developer tools detected - Content protected');
    
    // Blur all protected content
    const protectedElements = document.querySelectorAll('.protected-content, canvas, img');
    protectedElements.forEach(element => {
      element.style.filter = 'blur(20px)';
      element.style.opacity = '0.3';
    });

    // Show overlay
    this.showSecurityOverlay();
  }

  // Restore content when dev tools are closed
  restoreContent() {
    const protectedElements = document.querySelectorAll('.protected-content, canvas, img');
    protectedElements.forEach(element => {
      element.style.filter = 'none';
      element.style.opacity = '1';
    });

    // Remove overlay
    const overlay = document.querySelector('.security-overlay');
    if (overlay) {
      overlay.remove();
    }
  }

  // Show security overlay
  showSecurityOverlay() {
    const existing = document.querySelector('.security-overlay');
    if (existing) return;

    const overlay = document.createElement('div');
    overlay.className = 'security-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      z-index: 999999;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 24px;
      font-weight: bold;
      backdrop-filter: blur(10px);
      font-family: Arial, sans-serif;
    `;
    
    overlay.innerHTML = `
      <div style="text-align: center;">
        <div style="font-size: 48px; margin-bottom: 20px;">🔒</div>
        <div>SECURITY PROTECTION ACTIVE</div>
        <div style="font-size: 16px; margin-top: 10px; opacity: 0.8;">
          Close developer tools to continue
        </div>
      </div>
    `;
    
    document.body.appendChild(overlay);
  }

  // Temporary blur effect
  temporaryBlur() {
    const protectedElements = document.querySelectorAll('.protected-content, canvas, img');
    protectedElements.forEach(element => {
      element.style.filter = 'blur(15px)';
      setTimeout(() => {
        element.style.filter = 'none';
      }, 2000);
    });
  }

  // Show custom context menu
  showCustomContextMenu(e) {
    const menu = document.createElement('div');
    menu.style.cssText = `
      position: fixed;
      top: ${e.clientY}px;
      left: ${e.clientX}px;
      background: rgba(0, 0, 0, 0.9);
      color: white;
      padding: 10px;
      border-radius: 5px;
      font-size: 12px;
      z-index: 999999;
      font-family: Arial, sans-serif;
      border: 1px solid #333;
    `;
    
    menu.innerHTML = `
      <div style="padding: 5px 10px; color: #888;">Copy Image (Disabled)</div>
      <div style="padding: 5px 10px; color: #888;">Save Image (Disabled)</div>
      <div style="padding: 5px 10px; color: #888;">Inspect (Disabled)</div>
      <div style="padding: 5px 10px; color: #4CAF50;">🔒 Protected by VaultSecure</div>
    `;
    
    document.body.appendChild(menu);
    
    setTimeout(() => {
      if (menu.parentNode) {
        menu.parentNode.removeChild(menu);
      }
    }, 3000);
    
    const removeMenu = () => {
      if (menu.parentNode) {
        menu.parentNode.removeChild(menu);
      }
      document.removeEventListener('click', removeMenu);
    };
    
    document.addEventListener('click', removeMenu);
  }

  // Show warning message
  showWarning(message) {
    const warning = document.createElement('div');
    warning.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: rgba(220, 38, 38, 0.95);
      color: white;
      padding: 15px 20px;
      border-radius: 5px;
      z-index: 999999;
      font-weight: bold;
      font-size: 14px;
      font-family: Arial, sans-serif;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
      border: 2px solid #dc2626;
    `;
    
    warning.innerHTML = `
      <div style="display: flex; align-items: center;">
        <span style="margin-right: 10px;">🚨</span>
        <span>${message}</span>
      </div>
    `;
    
    document.body.appendChild(warning);
    
    setTimeout(() => {
      if (warning.parentNode) {
        warning.parentNode.removeChild(warning);
      }
    }, 5000);
  }

  // Report security violation
  reportViolation(violation) {
    this.violations.push({
      violation,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    });

    console.warn('🔒 Security violation:', violation);

    // Send to backend if available
    try {
      fetch('/api/security-violation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          violation,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href
        })
      }).catch(() => {}); // Silent fail
    } catch (e) {
      // Silent fail
    }
  }

  // Get violation history
  getViolations() {
    return this.violations;
  }

  // Disable security (for testing)
  disable() {
    this.isActive = false;
    console.log('🔒 VaultSecure: Security protection disabled');
  }
}

// Create global instance
const securityService = new SecurityService();

export default securityService;
