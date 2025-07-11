// Minimal Security Service - Only Screenshot and DevTools Prevention
class MinimalSecurityService {
  constructor() {
    this.isActive = false;
    this.violations = [];
    this.devToolsDetected = false;
    this.init();
  }

  init() {
    if (this.isActive) return;
    this.isActive = true;
    
    console.log('🔒 VaultSecure: Minimal security protection activated');
    
    // Only initialize screenshot and devtools prevention
    this.preventScreenshots();
    this.preventDevTools();
  }

  // Prevent screenshots only
  preventScreenshots() {
    // Block Print Screen key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'PrintScreen' || e.keyCode === 44) {
        e.preventDefault();
        this.showWarning('Screenshots are disabled on this site');
        this.reportViolation('Screenshot attempt blocked (Print Screen)');
        return false;
      }
      
      // Block Windows Snipping Tool (Win+Shift+S)
      if ((e.metaKey && e.shiftKey && e.key === 'S') || 
          (e.ctrlKey && e.shiftKey && e.key === 'S')) {
        e.preventDefault();
        this.showWarning('Screenshots are disabled on this site');
        this.reportViolation('Screenshot attempt blocked (Snipping Tool)');
        return false;
      }

      // Block Alt+Print Screen
      if (e.altKey && e.keyCode === 44) {
        e.preventDefault();
        this.showWarning('Screenshots are disabled on this site');
        this.reportViolation('Screenshot attempt blocked (Alt+Print Screen)');
        return false;
      }
    });
  }

  // Prevent developer tools only
  preventDevTools() {
    let checkCount = 0;

    const checkDevTools = () => {
      const threshold = 100; // More sensitive threshold
      const heightDiff = window.outerHeight - window.innerHeight;
      const widthDiff = window.outerWidth - window.innerWidth;

      // Multiple detection methods
      const devToolsDetected = 
        heightDiff > threshold || 
        widthDiff > threshold ||
        window.outerWidth - window.innerWidth > threshold ||
        window.outerHeight - window.innerHeight > threshold;

      if (devToolsDetected) {
        checkCount++;
        if (checkCount > 2 && !this.devToolsDetected) {
          this.devToolsDetected = true;
          this.handleDevToolsDetection();
          this.reportViolation('Developer tools detected');
        }
      } else {
        checkCount = 0;
        if (this.devToolsDetected) {
          this.devToolsDetected = false;
          this.restoreContent();
        }
      }
    };

    // Check more frequently for better detection
    setInterval(checkDevTools, 1000);

    // Block F12 key and common dev shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.key === 'F12') {
        e.preventDefault();
        this.showWarning('Developer tools access is disabled');
        this.reportViolation('F12 key blocked');
        return false;
      }
      
      // Block Ctrl+Shift+I (Inspect)
      if (e.ctrlKey && e.shiftKey && e.key === 'I') {
        e.preventDefault();
        this.showWarning('Developer tools access is disabled');
        this.reportViolation('Ctrl+Shift+I blocked');
        return false;
      }
      
      // Block Ctrl+Shift+J (Console)
      if (e.ctrlKey && e.shiftKey && e.key === 'J') {
        e.preventDefault();
        this.showWarning('Developer tools access is disabled');
        this.reportViolation('Ctrl+Shift+J blocked');
        return false;
      }
      
      // Block Ctrl+U (View Source)
      if (e.ctrlKey && e.key === 'U') {
        e.preventDefault();
        this.showWarning('View source is disabled');
        this.reportViolation('Ctrl+U blocked');
        return false;
      }
    });

    // Additional detection method using console
    let devtools = {open: false, orientation: null};
    const threshold2 = 160;
    
    setInterval(() => {
      if (window.outerHeight - window.innerHeight > threshold2 || 
          window.outerWidth - window.innerWidth > threshold2) {
        if (!devtools.open) {
          devtools.open = true;
          if (!this.devToolsDetected) {
            this.devToolsDetected = true;
            this.handleDevToolsDetection();
            this.reportViolation('Developer tools opened');
          }
        }
      } else {
        if (devtools.open) {
          devtools.open = false;
          if (this.devToolsDetected) {
            this.devToolsDetected = false;
            this.restoreContent();
          }
        }
      }
    }, 500);

    // Console detection method
    let consoleDetected = false;
    const detectConsole = () => {
      let devtools = false;
      const el = document.createElement('div');
      el.style.fontSize = '0px';
      el.style.setProperty('--devtools-detector', 'true');
      
      Object.defineProperty(el, 'id', {
        get: function() {
          devtools = true;
          return 'devtools-detector';
        },
        configurable: true
      });
      
      console.log(el);
      
      if (devtools && !consoleDetected) {
        consoleDetected = true;
        if (!this.devToolsDetected) {
          this.devToolsDetected = true;
          this.handleDevToolsDetection();
          this.reportViolation('Console accessed');
        }
      }
    };
    
    // Check for console periodically
    setInterval(detectConsole, 2000);
    
    // Detect debugger statement
    try {
      setInterval(() => {
        const start = performance.now();
        debugger;
        const end = performance.now();
        if (end - start > 100) {
          if (!this.devToolsDetected) {
            this.devToolsDetected = true;
            this.handleDevToolsDetection();
            this.reportViolation('Debugger detected');
          }
        }
      }, 3000);
    } catch (e) {
      // Ignore errors
    }
  }

  // Handle developer tools detection
  handleDevToolsDetection() {
    this.showWarning('Developer tools detected - Content protected');
    
    // Blur all images and add overlay
    const images = document.querySelectorAll('canvas, img, .gallery-item');
    images.forEach(img => {
      img.style.filter = 'blur(25px)';
      img.style.opacity = '0.3';
      img.style.transition = 'all 0.3s ease';
    });
    
    // Add security overlay
    this.showSecurityOverlay();
  }

  // Restore content when dev tools are closed
  restoreContent() {
    const images = document.querySelectorAll('canvas, img, .gallery-item');
    images.forEach(img => {
      img.style.filter = 'none';
      img.style.opacity = '1';
      img.style.transition = 'all 0.3s ease';
    });
    
    // Remove security overlay
    this.removeSecurityOverlay();
  }

  // Show security overlay
  showSecurityOverlay() {
    // Don't add multiple overlays
    if (document.querySelector('.devtools-overlay')) return;

    const overlay = document.createElement('div');
    overlay.className = 'devtools-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      z-index: 999998;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 24px;
      font-weight: bold;
      backdrop-filter: blur(10px);
      font-family: Arial, sans-serif;
      pointer-events: none;
    `;
    
    overlay.innerHTML = `
      <div style="text-align: center; padding: 20px;">
        <div style="font-size: 48px; margin-bottom: 20px;">🔒</div>
        <div style="margin-bottom: 15px;">CONTENT PROTECTED</div>
        <div style="font-size: 16px; opacity: 0.8;">
          Close developer tools to continue
        </div>
      </div>
    `;
    
    document.body.appendChild(overlay);
  }

  // Remove security overlay
  removeSecurityOverlay() {
    const overlay = document.querySelector('.devtools-overlay');
    if (overlay) {
      overlay.remove();
    }
  }

  // Show warning message
  showWarning(message) {
    // Only show if no existing warning
    if (document.querySelector('.security-warning')) return;

    const warning = document.createElement('div');
    warning.className = 'security-warning';
    warning.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: rgba(220, 38, 38, 0.95);
      color: white;
      padding: 15px 20px;
      border-radius: 8px;
      z-index: 999999;
      font-weight: bold;
      font-size: 14px;
      font-family: Arial, sans-serif;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
      border: 2px solid #dc2626;
      max-width: 300px;
    `;
    
    warning.innerHTML = `
      <div style="display: flex; align-items: center;">
        <span style="margin-right: 10px;">🚨</span>
        <span>${message}</span>
      </div>
    `;
    
    document.body.appendChild(warning);
    
    // Remove warning after 4 seconds
    setTimeout(() => {
      if (warning && warning.parentNode) {
        warning.parentNode.removeChild(warning);
      }
    }, 4000);
  }

  // Report security violation (simple logging)
  reportViolation(violation) {
    this.violations.push({
      violation,
      timestamp: new Date().toISOString()
    });

    console.warn('🔒 Security violation:', violation);
  }

  // Get violations for debugging
  getViolations() {
    return this.violations;
  }

  // Disable security if needed
  disable() {
    this.isActive = false;
    console.log('🔒 VaultSecure: Security protection disabled');
  }
}

// Create and export instance
const minimalSecurity = new MinimalSecurityService();
export default minimalSecurity;
