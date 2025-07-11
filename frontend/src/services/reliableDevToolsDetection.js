// Reliable DevTools Detection Service
// Based on proven library techniques and research

class ReliableDevToolsDetection {
  constructor() {
    this.isActive = false;
    this.devToolsDetected = false;
    this.intervals = [];
    this.listeners = [];
    this.config = {
      interval: 1000,
      threshold: 160,
      maxAttempts: 5,
      debounceTime: 300
    };
    this.state = {
      attempts: 0,
      lastDetectionTime: 0,
      isMonitoring: false
    };
    
    this.init();
  }

  init() {
    if (this.isActive) return;
    this.isActive = true;
    
    console.log('🔒 Reliable DevTools Detection: Initializing...');
    
    // Start detection
    this.startDetection();
    
    // Block keyboard shortcuts
    this.blockKeyboardShortcuts();
    
    // Setup cleanup
    window.addEventListener('beforeunload', () => this.cleanup());
  }

  startDetection() {
    if (this.state.isMonitoring) return;
    this.state.isMonitoring = true;
    
    // Method 1: Console toString detection (most reliable)
    this.startConsoleDetection();
    
    // Method 2: Window size detection (fallback)
    this.startSizeDetection();
    
    // Method 3: Debugger detection (careful use)
    this.startDebuggerDetection();
    
    // Method 4: Performance timing detection
    this.startPerformanceDetection();
  }

  // Method 1: Console toString detection - Most reliable
  startConsoleDetection() {
    const consoleInterval = setInterval(() => {
      if (this.state.attempts >= this.config.maxAttempts) {
        clearInterval(consoleInterval);
        return;
      }
      
      this.checkConsoleAccess();
      this.state.attempts++;
    }, this.config.interval);
    
    this.intervals.push(consoleInterval);
  }

  checkConsoleAccess() {
    let devToolsOpen = false;
    
    // Create a regex with custom toString
    const detector = /./;
    detector.toString = () => {
      devToolsOpen = true;
      return 'DevTools';
    };
    
    // This will call toString when DevTools console is open
    try {
      console.log('%c', detector);
      console.clear(); // Clear immediately
    } catch (e) {
      // Ignore errors
    }
    
    if (devToolsOpen) {
      this.triggerDetection('console');
    }
  }

  // Method 2: Window size detection - Fallback method
  startSizeDetection() {
    let lastCheck = 0;
    
    const checkSize = () => {
      const now = Date.now();
      if (now - lastCheck < this.config.debounceTime) return;
      lastCheck = now;
      
      const heightDiff = window.outerHeight - window.innerHeight;
      const widthDiff = window.outerWidth - window.innerWidth;
      
      // Dynamic threshold based on screen size
      const screenArea = window.screen.width * window.screen.height;
      const threshold = screenArea > (1920 * 1080) ? 200 : this.config.threshold;
      
      const isDevToolsOpen = (
        heightDiff > threshold ||
        widthDiff > threshold ||
        window.outerWidth < window.innerWidth ||
        window.outerHeight < window.innerHeight
      );
      
      if (isDevToolsOpen && !this.devToolsDetected) {
        this.triggerDetection('window_size');
      } else if (!isDevToolsOpen && this.devToolsDetected) {
        this.restoreContent();
      }
    };
    
    // Check on resize
    window.addEventListener('resize', checkSize);
    this.listeners.push(['resize', checkSize]);
    
    // Initial check
    checkSize();
    
    // Periodic check
    const sizeInterval = setInterval(checkSize, this.config.interval * 2);
    this.intervals.push(sizeInterval);
  }

  // Method 3: Debugger detection - Use sparingly
  startDebuggerDetection() {
    const debuggerInterval = setInterval(() => {
      const start = performance.now();
      
      // This will pause if debugger is open
      // We wrap it in try-catch to avoid issues
      try {
        const func = new Function('debugger');
        func();
      } catch (e) {
        // Ignore errors
      }
      
      const end = performance.now();
      const duration = end - start;
      
      // If execution took too long, debugger might be open
      if (duration > 100) {
        this.triggerDetection('debugger');
      }
    }, this.config.interval * 5); // Less frequent
    
    this.intervals.push(debuggerInterval);
  }

  // Method 4: Performance timing detection
  startPerformanceDetection() {
    const performanceInterval = setInterval(() => {
      const start = performance.now();
      
      // Simple computation
      for (let i = 0; i < 1000; i++) {
        Math.random();
      }
      
      const end = performance.now();
      const duration = end - start;
      
      // If execution is unusually slow, might indicate debugging
      if (duration > 50) {
        this.triggerDetection('performance');
      }
    }, this.config.interval * 3);
    
    this.intervals.push(performanceInterval);
  }

  // Block keyboard shortcuts
  blockKeyboardShortcuts() {
    const keyHandler = (e) => {
      const blockedKeys = [
        e.key === 'F12',
        e.ctrlKey && e.shiftKey && e.key === 'I',
        e.ctrlKey && e.shiftKey && e.key === 'J',
        e.ctrlKey && e.shiftKey && e.key === 'C',
        e.ctrlKey && e.key === 'U',
        e.metaKey && e.altKey && e.key === 'I', // Mac
        e.metaKey && e.altKey && e.key === 'J', // Mac
        e.metaKey && e.altKey && e.key === 'C'  // Mac
      ];
      
      if (blockedKeys.some(Boolean)) {
        e.preventDefault();
        e.stopPropagation();
        this.showWarning('Developer tools access blocked');
        return false;
      }
    };
    
    document.addEventListener('keydown', keyHandler);
    this.listeners.push(['keydown', keyHandler]);
  }

  // Trigger detection
  triggerDetection(method) {
    const now = Date.now();
    
    // Debounce detection
    if (now - this.state.lastDetectionTime < this.config.debounceTime) {
      return;
    }
    
    if (this.devToolsDetected) return;
    
    this.devToolsDetected = true;
    this.state.lastDetectionTime = now;
    
    console.log('🔒 DevTools detected via:', method);
    
    // Apply protection
    this.applyProtection();
    
    // Show warning
    this.showWarning('Developer tools detected - Content protected');
  }

  // Apply protection
  applyProtection() {
    const body = document.body;
    
    // Add blur and disable interactions
    body.style.cssText += `
      filter: blur(15px) !important;
      -webkit-filter: blur(15px) !important;
      -moz-filter: blur(15px) !important;
      transition: filter 0.3s ease !important;
      pointer-events: none !important;
      user-select: none !important;
      -webkit-user-select: none !important;
      -moz-user-select: none !important;
    `;
    
    // Show blocking overlay
    this.showBlockingOverlay();
    
    // Disable all interactions
    this.disableAllInteractions();
  }

  // Show blocking overlay
  showBlockingOverlay() {
    if (document.querySelector('.devtools-blocking-overlay')) return;
    
    const overlay = document.createElement('div');
    overlay.className = 'devtools-blocking-overlay';
    overlay.style.cssText = `
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      width: 100vw !important;
      height: 100vh !important;
      background: rgba(0, 0, 0, 0.95) !important;
      z-index: 2147483647 !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      color: white !important;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
      backdrop-filter: blur(10px) !important;
      -webkit-backdrop-filter: blur(10px) !important;
    `;
    
    overlay.innerHTML = `
      <div style="text-align: center; padding: 60px 40px; max-width: 500px;">
        <div style="font-size: 64px; margin-bottom: 30px; animation: pulse 2s infinite;">🔒</div>
        <div style="font-size: 28px; margin-bottom: 20px; font-weight: bold; color: #ff6b6b;">
          Access Blocked
        </div>
        <div style="font-size: 18px; margin-bottom: 20px; line-height: 1.6;">
          Developer tools have been detected. This content is protected.
        </div>
        <div style="font-size: 16px; margin-bottom: 20px; opacity: 0.8;">
          Please close all developer tools to continue.
        </div>
        <div style="font-size: 14px; opacity: 0.6; padding: 20px; background: rgba(255, 255, 255, 0.1); border-radius: 10px;">
          This security measure protects the website content and user privacy.
        </div>
      </div>
    `;
    
    document.body.appendChild(overlay);
    
    // Add pulse animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes pulse {
        0%, 100% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.05); opacity: 0.8; }
      }
    `;
    document.head.appendChild(style);
  }

  // Disable all interactions
  disableAllInteractions() {
    const preventAll = (e) => {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      return false;
    };
    
    const events = ['contextmenu', 'selectstart', 'dragstart', 'drop', 'copy', 'cut', 'paste'];
    events.forEach(event => {
      document.addEventListener(event, preventAll, true);
      this.listeners.push([event, preventAll]);
    });
    
    // Disable scrolling
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
  }

  // Show warning
  showWarning(message) {
    if (document.querySelector('.devtools-warning')) return;
    
    const warning = document.createElement('div');
    warning.className = 'devtools-warning';
    warning.style.cssText = `
      position: fixed !important;
      top: 20px !important;
      right: 20px !important;
      background: rgba(255, 0, 0, 0.95) !important;
      color: white !important;
      padding: 15px 20px !important;
      border-radius: 8px !important;
      z-index: 2147483646 !important;
      font-weight: bold !important;
      font-size: 14px !important;
      max-width: 300px !important;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3) !important;
      animation: slideIn 0.3s ease-out !important;
    `;
    
    warning.innerHTML = `
      <div style="display: flex; align-items: center;">
        <span style="margin-right: 10px;">⚠️</span>
        <span>${message}</span>
      </div>
    `;
    
    document.body.appendChild(warning);
    
    // Add slide animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
    `;
    document.head.appendChild(style);
    
    // Auto remove
    setTimeout(() => {
      if (warning.parentNode) {
        warning.parentNode.removeChild(warning);
      }
    }, 4000);
  }

  // Restore content when DevTools are closed
  restoreContent() {
    if (!this.devToolsDetected) return;
    
    this.devToolsDetected = false;
    console.log('🔒 DevTools closed - restoring content');
    
    // Remove overlay
    const overlay = document.querySelector('.devtools-blocking-overlay');
    if (overlay) overlay.remove();
    
    // Remove blur and restore styles
    const body = document.body;
    body.style.filter = '';
    body.style.webkitFilter = '';
    body.style.mozFilter = '';
    body.style.pointerEvents = '';
    body.style.userSelect = '';
    body.style.webkitUserSelect = '';
    body.style.mozUserSelect = '';
    body.style.overflow = '';
    document.documentElement.style.overflow = '';
    
    // Remove interaction blockers
    this.listeners.forEach(([event, handler]) => {
      if (['contextmenu', 'selectstart', 'dragstart', 'drop', 'copy', 'cut', 'paste'].includes(event)) {
        document.removeEventListener(event, handler, true);
      }
    });
    
    // Reset state
    this.state.attempts = 0;
    this.state.lastDetectionTime = 0;
  }

  // Public API methods
  isDevToolsOpen() {
    const heightDiff = window.outerHeight - window.innerHeight;
    const widthDiff = window.outerWidth - window.innerWidth;
    const threshold = this.config.threshold;
    
    return (
      heightDiff > threshold ||
      widthDiff > threshold ||
      window.outerWidth < window.innerWidth ||
      window.outerHeight < window.innerHeight
    );
  }

  forceCheck() {
    this.checkConsoleAccess();
    return {
      detected: this.devToolsDetected,
      isOpen: this.isDevToolsOpen(),
      state: this.state
    };
  }

  reset() {
    this.devToolsDetected = false;
    this.state.attempts = 0;
    this.state.lastDetectionTime = 0;
    this.restoreContent();
    console.log('🔒 DevTools detection reset');
  }

  disable() {
    this.isActive = false;
    this.cleanup();
    this.reset();
    console.log('🔒 DevTools detection disabled');
  }

  getStatus() {
    return {
      isActive: this.isActive,
      devToolsDetected: this.devToolsDetected,
      isDevToolsOpen: this.isDevToolsOpen(),
      state: this.state,
      config: this.config
    };
  }

  // Cleanup
  cleanup() {
    // Clear intervals
    this.intervals.forEach(interval => clearInterval(interval));
    this.intervals = [];
    
    // Remove listeners
    this.listeners.forEach(([event, handler]) => {
      document.removeEventListener(event, handler, true);
    });
    this.listeners = [];
    
    this.state.isMonitoring = false;
  }
}

// Create and export singleton instance
const reliableDevToolsDetection = new ReliableDevToolsDetection();

// Make available globally for testing
if (typeof window !== 'undefined') {
  window.reliableDevToolsDetection = reliableDevToolsDetection;
  
  // Debug utilities
  window.devToolsDebug = {
    getStatus: () => reliableDevToolsDetection.getStatus(),
    forceCheck: () => reliableDevToolsDetection.forceCheck(),
    reset: () => reliableDevToolsDetection.reset(),
    disable: () => reliableDevToolsDetection.disable(),
    isOpen: () => reliableDevToolsDetection.isDevToolsOpen()
  };
}

export default reliableDevToolsDetection;
