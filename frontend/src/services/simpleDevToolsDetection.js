// Simple DevTools Detection Service
// Clean, minimal approach that works reliably

class SimpleDevToolsDetection {
  constructor() {
    this.isActive = false;
    this.devToolsDetected = false;
    this.intervals = [];
    this.lastCheck = 0;
    this.checkCount = 0;
    this.maxChecks = 10;
    
    this.init();
  }

  init() {
    if (this.isActive) return;
    this.isActive = true;
    
    console.log('🔒 Simple DevTools Detection: Starting...');
    
    // Start monitoring
    this.startMonitoring();
    
    // Block keyboard shortcuts
    this.blockKeyboardShortcuts();
    
    // Setup cleanup
    window.addEventListener('beforeunload', () => this.cleanup());
  }

  startMonitoring() {
    // Check every 2 seconds
    const monitorInterval = setInterval(() => {
      this.checkDevTools();
    }, 2000);
    
    this.intervals.push(monitorInterval);
  }

  checkDevTools() {
    const now = Date.now();
    
    // Limit checks to prevent performance issues
    if (this.checkCount >= this.maxChecks) return;
    if (now - this.lastCheck < 1000) return;
    
    this.lastCheck = now;
    this.checkCount++;
    
    // Check if DevTools are closed (if previously detected)
    if (this.devToolsDetected) {
      this.checkIfDevToolsClosed();
      return;
    }
    
    // Method 1: Console detection using RegExp toString
    this.checkConsoleAccess();
    
    // Method 2: Window size detection (conservative)
    this.checkWindowSize();
  }

  checkConsoleAccess() {
    if (this.devToolsDetected) return;
    
    let consoleOpen = false;
    const element = document.createElement('div');
    
    Object.defineProperty(element, 'id', {
      get: function() {
        consoleOpen = true;
        return 'devtools-detector';
      },
      configurable: true
    });
    
    console.log('%c', 'color: transparent', element);
    
    if (consoleOpen) {
      this.triggerDetection('console');
    }
  }

  checkWindowSize() {
    if (this.devToolsDetected) return;
    
    const heightDiff = window.outerHeight - window.innerHeight;
    const widthDiff = window.outerWidth - window.innerWidth;
    
    // Stricter check for DevTools open
    const isDevToolsOpen = (
      heightDiff > 250 ||
      widthDiff > 250 ||
      (heightDiff > 180 && widthDiff > 180) ||
      window.outerWidth < window.innerWidth - 100 || // Ensure significant difference
      window.outerHeight < window.innerHeight - 100
    );
    
    if (isDevToolsOpen) {
      this.triggerDetection('window_size');
    }
  }
  
  checkIfDevToolsClosed() {
    const heightDiff = window.outerHeight - window.innerHeight;
    const widthDiff = window.outerWidth - window.innerWidth;
    
    // Check if DevTools are closed (smaller differences)
    const isDevToolsClosed = (
      heightDiff < 150 &&
      widthDiff < 150 &&
      window.outerWidth >= window.innerWidth &&
      window.outerHeight >= window.innerHeight
    );
    
    if (isDevToolsClosed) {
      this.restoreContent();
    }
  }

  blockKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Block F12
      if (e.key === 'F12') {
        e.preventDefault();
        this.showWarning('Developer tools access blocked');
        return false;
      }
      
      // Block Ctrl+Shift+I (Inspect)
      if (e.ctrlKey && e.shiftKey && e.key === 'I') {
        e.preventDefault();
        this.showWarning('Developer tools access blocked');
        return false;
      }
      
      // Block Ctrl+Shift+J (Console)
      if (e.ctrlKey && e.shiftKey && e.key === 'J') {
        e.preventDefault();
        this.showWarning('Developer tools access blocked');
        return false;
      }
      
      // Block Ctrl+Shift+C (Inspect Element)
      if (e.ctrlKey && e.shiftKey && e.key === 'C') {
        e.preventDefault();
        this.showWarning('Developer tools access blocked');
        return false;
      }
      
      // Block Ctrl+U (View Source)
      if (e.ctrlKey && e.key === 'u') {
        e.preventDefault();
        this.showWarning('View source blocked');
        return false;
      }
    });
  }

  triggerDetection(method) {
    if (this.devToolsDetected) return;

    // Ensure detection is only triggered once
    this.devToolsDetected = true;
    console.log('🔒 DevTools detected via:', method);

    // Apply protection only once
    if (!document.querySelector('.devtools-overlay')) {
      this.applyProtection();
    }

    // Show warning only once
    if (!document.querySelector('.devtools-warning')) {
      this.showWarning('Developer tools detected - Content protected');
    }
  }

  applyProtection() {
    const body = document.body;
    
    // Add blur effect
    body.style.cssText += `
      filter: blur(10px) !important;
      -webkit-filter: blur(10px) !important;
      transition: filter 0.3s ease !important;
      pointer-events: none !important;
      user-select: none !important;
    `;
    
    // Show overlay
    this.showOverlay();
    
    // Disable interactions
    this.disableInteractions();
  }

  showOverlay() {
    if (document.querySelector('.devtools-overlay')) return;
    
    const overlay = document.createElement('div');
    overlay.className = 'devtools-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.9);
      z-index: 999999;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-family: Arial, sans-serif;
    `;
    
    overlay.innerHTML = `
      <div style="text-align: center; padding: 40px;">
        <div style="font-size: 48px; margin-bottom: 20px;">🔒</div>
        <div style="font-size: 24px; margin-bottom: 15px;">Access Blocked</div>
        <div style="font-size: 16px; margin-bottom: 15px;">
          Developer tools detected. Please close them to continue.
        </div>
        <div style="font-size: 14px; opacity: 0.8;">
          This content is protected from unauthorized access.
        </div>
      </div>
    `;
    
    document.body.appendChild(overlay);
  }

  showWarning(message) {
    if (document.querySelector('.devtools-warning')) return;
    
    const warning = document.createElement('div');
    warning.className = 'devtools-warning';
    warning.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: rgba(255, 0, 0, 0.9);
      color: white;
      padding: 15px;
      border-radius: 5px;
      z-index: 999999;
      font-weight: bold;
      font-size: 14px;
      max-width: 300px;
    `;
    
    warning.innerHTML = `
      <div style="display: flex; align-items: center;">
        <span style="margin-right: 10px;">⚠️</span>
        <span>${message}</span>
      </div>
    `;
    
    document.body.appendChild(warning);
    
    setTimeout(() => {
      if (warning.parentNode) {
        warning.parentNode.removeChild(warning);
      }
    }, 3000);
  }

  disableInteractions() {
    const preventEvent = (e) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    };
    
    document.addEventListener('contextmenu', preventEvent, true);
    document.addEventListener('selectstart', preventEvent, true);
    document.addEventListener('dragstart', preventEvent, true);
    document.addEventListener('copy', preventEvent, true);
    
    this.preventEventHandler = preventEvent;
  }

  // Check if DevTools are currently open based on window size
  isDevToolsOpen() {
    const heightDiff = window.outerHeight - window.innerHeight;
    const widthDiff = window.outerWidth - window.innerWidth;
    
    return (
      heightDiff > 250 ||
      widthDiff > 250 ||
      window.outerWidth < window.innerWidth - 100 ||
      window.outerHeight < window.innerHeight - 100
    );
  }
  
  // Restore content when DevTools are closed
  restoreContent() {
    this.devToolsDetected = false;
    this.checkCount = 0; // Reset check count to allow re-detection
    
    console.log('🔒 DevTools closed - restoring content');
    
    // Remove overlay
    const overlay = document.querySelector('.devtools-overlay');
    if (overlay) overlay.remove();
    
    // Remove blur
    document.body.style.filter = '';
    document.body.style.webkitFilter = '';
    document.body.style.pointerEvents = '';
    document.body.style.userSelect = '';
    
    // Re-enable interactions
    if (this.preventEventHandler) {
      document.removeEventListener('contextmenu', this.preventEventHandler, true);
      document.removeEventListener('selectstart', this.preventEventHandler, true);
      document.removeEventListener('dragstart', this.preventEventHandler, true);
      document.removeEventListener('copy', this.preventEventHandler, true);
      this.preventEventHandler = null;
    }
  }

  // Reset detection (for testing)
  reset() {
    this.devToolsDetected = false;
    this.checkCount = 0;
    
    // Remove overlay
    const overlay = document.querySelector('.devtools-overlay');
    if (overlay) overlay.remove();
    
    // Remove blur
    document.body.style.filter = '';
    document.body.style.webkitFilter = '';
    document.body.style.pointerEvents = '';
    document.body.style.userSelect = '';
    
    // Re-enable interactions
    if (this.preventEventHandler) {
      document.removeEventListener('contextmenu', this.preventEventHandler, true);
      document.removeEventListener('selectstart', this.preventEventHandler, true);
      document.removeEventListener('dragstart', this.preventEventHandler, true);
      document.removeEventListener('copy', this.preventEventHandler, true);
      this.preventEventHandler = null;
    }
    
    console.log('🔒 DevTools detection reset');
  }

  // Disable detection
  disable() {
    this.isActive = false;
    this.cleanup();
    this.reset();
    console.log('🔒 DevTools detection disabled');
  }

  // Cleanup
  cleanup() {
    this.intervals.forEach(interval => clearInterval(interval));
    this.intervals = [];
  }

  // Get status
  getStatus() {
    return {
      isActive: this.isActive,
      devToolsDetected: this.devToolsDetected,
      checkCount: this.checkCount,
      isDevToolsOpen: this.isDevToolsOpen()
    };
  }
}

// Create and export singleton instance
const simpleDevToolsDetection = new SimpleDevToolsDetection();

// Make available globally for testing
if (typeof window !== 'undefined') {
  window.simpleDevToolsDetection = simpleDevToolsDetection;
}

export default simpleDevToolsDetection;
