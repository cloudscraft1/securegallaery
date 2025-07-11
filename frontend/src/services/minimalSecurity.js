// Maximum Aggressive Security Service - Ultimate DevTools Protection
class MaximumSecurityService {
  constructor() {
    this.isActive = false;
    this.violations = [];
    this.devToolsDetected = false;
    this.blockAttempts = 0;
    this.securityLevel = 'MAXIMUM';
    this.init();
  }

  init() {
    if (this.isActive) return;
    this.isActive = true;
    
    console.log('🔒 VaultSecure: MAXIMUM AGGRESSIVE security protection activated');
    
    // Initialize all aggressive protection methods
    this.preventScreenshots();
    this.preventDevTools();
    this.implementUltimateDevToolsBlocking();
    this.activateAntiTamperingMeasures();
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

  // ULTIMATE DEVELOPER TOOLS BLOCKING - Most Aggressive Methods
  implementUltimateDevToolsBlocking() {
    console.log('🚨 Implementing ULTIMATE DevTools blocking...');
    
    // 1. Infinite Loop on DevTools Detection
    let infiniteLoopActive = false;
    const createInfiniteLoop = () => {
      if (infiniteLoopActive) return;
      infiniteLoopActive = true;
      
      const loopFunction = () => {
        while (true) {
          const start = performance.now();
          debugger;
          const end = performance.now();
          if (end - start > 100) {
            // DevTools detected - create resource intensive loop
            this.handleCriticalSecurityBreach();
            break;
          }
          break;
        }
      };
      
      // Run loop periodically
      setInterval(loopFunction, 100);
    };
    
    // 2. Memory Intensive Operations on DevTools
    const memoryBomb = () => {
      if (this.devToolsDetected) {
        const arrays = [];
        for (let i = 0; i < 1000; i++) {
          arrays.push(new Array(1000000).fill('SECURITY_VIOLATION'));
        }
        setTimeout(() => {
          arrays.length = 0; // Clear memory
        }, 5000);
      }
    };
    
    // 3. Aggressive Page Reloading
    const aggressiveReload = () => {
      if (this.devToolsDetected && this.blockAttempts > 3) {
        this.showCriticalAlert('SECURITY BREACH DETECTED - RELOADING PAGE');
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      }
    };
    
    // 4. Block ALL Possible DevTools Access Methods
    const blockAllDevToolsAccess = () => {
      // Block right-click completely
      document.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        this.blockAttempts++;
        this.showWarning('Right-click completely disabled');
        this.reportViolation('Right-click blocked');
        return false;
      }, true);
      
      // Block all function keys
      document.addEventListener('keydown', (e) => {
        const blockedKeys = [
          'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12',
          'PrintScreen', 'Insert', 'Delete', 'Home', 'End', 'PageUp', 'PageDown'
        ];
        
        if (blockedKeys.includes(e.key)) {
          e.preventDefault();
          e.stopPropagation();
          this.blockAttempts++;
          this.showWarning(`${e.key} key blocked`);
          this.reportViolation(`${e.key} key blocked`);
          return false;
        }
        
        // Block ALL Ctrl combinations
        if (e.ctrlKey) {
          e.preventDefault();
          e.stopPropagation();
          this.blockAttempts++;
          this.showWarning('Ctrl combinations blocked');
          this.reportViolation(`Ctrl+${e.key} blocked`);
          return false;
        }
        
        // Block ALL Alt combinations
        if (e.altKey) {
          e.preventDefault();
          e.stopPropagation();
          this.blockAttempts++;
          this.showWarning('Alt combinations blocked');
          this.reportViolation(`Alt+${e.key} blocked`);
          return false;
        }
      }, true);
    };
    
    // 5. Continuous Page Monitoring
    const continuousMonitoring = () => {
      setInterval(() => {
        // Check if DevTools are open
        const threshold = 50; // Very sensitive
        const heightDiff = window.outerHeight - window.innerHeight;
        const widthDiff = window.outerWidth - window.innerWidth;
        
        if (heightDiff > threshold || widthDiff > threshold) {
          this.blockAttempts++;
          this.handleCriticalSecurityBreach();
          memoryBomb();
          aggressiveReload();
        }
      }, 100); // Check every 100ms
    };
    
    // 6. Console Hijacking
    const hijackConsole = () => {
      const originalConsole = window.console;
      
      // Override all console methods
      const methods = ['log', 'warn', 'error', 'info', 'debug', 'trace', 'dir', 'table'];
      methods.forEach(method => {
        window.console[method] = () => {
          this.blockAttempts++;
          this.showCriticalAlert('CONSOLE ACCESS DENIED');
          this.reportViolation(`Console ${method} blocked`);
          this.handleCriticalSecurityBreach();
        };
      });
      
      // Block console.clear
      window.console.clear = () => {
        this.showCriticalAlert('CONSOLE CLEAR BLOCKED');
        this.reportViolation('Console clear blocked');
      };
    };
    
    // 7. DOM Manipulation Detection
    const protectDOM = () => {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'childList') {
            mutation.addedNodes.forEach((node) => {
              if (node.nodeType === 1) { // Element node
                const tagName = node.tagName?.toLowerCase();
                if (tagName === 'script' || tagName === 'iframe' || tagName === 'embed') {
                  this.blockAttempts++;
                  this.showCriticalAlert('DOM MANIPULATION DETECTED');
                  this.reportViolation(`Unauthorized ${tagName} injection`);
                  node.remove();
                }
              }
            });
          }
        });
      });
      
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
    };
    
    // Activate all ultimate blocking methods
    createInfiniteLoop();
    blockAllDevToolsAccess();
    continuousMonitoring();
    hijackConsole();
    protectDOM();
  }
  
  // Anti-Tampering Measures
  activateAntiTamperingMeasures() {
    // Disable text selection globally
    document.addEventListener('selectstart', (e) => {
      e.preventDefault();
      this.reportViolation('Text selection blocked');
      return false;
    }, true);
    
    // Disable drag and drop
    document.addEventListener('dragstart', (e) => {
      e.preventDefault();
      this.reportViolation('Drag operation blocked');
      return false;
    }, true);
    
    // Block copy/paste/cut
    ['copy', 'cut', 'paste'].forEach(event => {
      document.addEventListener(event, (e) => {
        e.preventDefault();
        this.showWarning(`${event} operation blocked`);
        this.reportViolation(`${event} operation blocked`);
      }, true);
    });
    
    // Add CSS protection
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
        pointer-events: auto !important;
      }
      
      img, canvas, video {
        -webkit-user-drag: none !important;
        -webkit-user-select: none !important;
        -moz-user-select: none !important;
        user-select: none !important;
      }
    `;
    document.head.appendChild(style);
  }
  
  // Handle Critical Security Breach
  handleCriticalSecurityBreach() {
    this.showCriticalAlert('🚨 CRITICAL SECURITY BREACH DETECTED');
    
    // Maximum blur and opacity
    const elements = document.querySelectorAll('*');
    elements.forEach(el => {
      if (el.tagName !== 'SCRIPT' && el.tagName !== 'STYLE') {
        el.style.filter = 'blur(50px)';
        el.style.opacity = '0.1';
        el.style.transition = 'all 0.1s ease';
      }
    });
    
    // Show maximum security overlay
    this.showMaximumSecurityOverlay();
  }
  
  // Show Maximum Security Overlay
  showMaximumSecurityOverlay() {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(255, 0, 0, 0.9);
      z-index: 999999;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 32px;
      font-weight: bold;
      font-family: Arial, sans-serif;
      text-align: center;
      backdrop-filter: blur(20px);
    `;
    
    overlay.innerHTML = `
      <div>
        <div style="font-size: 64px; margin-bottom: 20px; animation: pulse 1s infinite;">🚨</div>
        <div style="margin-bottom: 15px;">CRITICAL SECURITY BREACH</div>
        <div style="font-size: 24px; margin-bottom: 15px;">UNAUTHORIZED ACCESS DETECTED</div>
        <div style="font-size: 18px; opacity: 0.9;">Developer tools access is strictly prohibited</div>
        <div style="font-size: 16px; margin-top: 20px; opacity: 0.8;">This incident has been logged</div>
      </div>
    `;
    
    document.body.appendChild(overlay);
    
    // Make it very difficult to remove
    Object.freeze(overlay);
    Object.seal(overlay);
  }
  
  // Show Critical Alert
  showCriticalAlert(message) {
    const alert = document.createElement('div');
    alert.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(255, 0, 0, 0.95);
      color: white;
      padding: 30px;
      border-radius: 10px;
      z-index: 999999;
      font-weight: bold;
      font-size: 20px;
      font-family: Arial, sans-serif;
      text-align: center;
      border: 3px solid #ff0000;
      box-shadow: 0 0 50px rgba(255, 0, 0, 0.5);
      animation: shake 0.5s infinite;
    `;
    
    alert.innerHTML = `
      <div style="font-size: 32px; margin-bottom: 15px;">🚨</div>
      <div>${message}</div>
    `;
    
    document.body.appendChild(alert);
    
    // Add shake animation
    const shakeStyle = document.createElement('style');
    shakeStyle.textContent = `
      @keyframes shake {
        0% { transform: translate(-50%, -50%) rotate(0deg); }
        25% { transform: translate(-50%, -50%) rotate(5deg); }
        50% { transform: translate(-50%, -50%) rotate(0deg); }
        75% { transform: translate(-50%, -50%) rotate(-5deg); }
        100% { transform: translate(-50%, -50%) rotate(0deg); }
      }
    `;
    document.head.appendChild(shakeStyle);
    
    setTimeout(() => {
      if (alert.parentNode) {
        alert.parentNode.removeChild(alert);
      }
    }, 5000);
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
const maximumSecurity = new MaximumSecurityService();
export default maximumSecurity;
