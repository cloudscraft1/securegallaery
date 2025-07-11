// Comprehensive Security Service - Advanced DevTools Detection
class ComprehensiveSecurityService {
  constructor() {
    this.isActive = false;
    this.violations = [];
    this.devToolsDetected = false;
    this.detectionMethods = [];
    this.observers = [];
    this.intervals = [];
    this.sessionId = this.generateSessionId();
    this.init();
  }

  init() {
    if (this.isActive) return;
    this.isActive = true;
    
    console.log('🔒 VaultSecure: Comprehensive security protection activated');
    
    // Initialize all detection methods
    this.preventScreenshots();
    this.initializeAdvancedDevToolsDetection();
    this.setupBackendCommunication();
  }

  generateSessionId() {
    return 'sec_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
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

  // Setup backend communication
  setupBackendCommunication() {
    this.backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
    
    // Report initial session
    this.reportToBackend('session_start', {
      sessionId: this.sessionId,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString()
    });
  }

  // Report to backend
  async reportToBackend(event, data) {
    try {
      await fetch(`${this.backendUrl}/api/security-event`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-ID': this.sessionId
        },
        body: JSON.stringify({
          event,
          data,
          timestamp: new Date().toISOString()
        })
      });
    } catch (error) {
      console.warn('Failed to report to backend:', error);
    }
  }

  // Comprehensive developer tools detection
  initializeAdvancedDevToolsDetection() {
    console.log('🔒 Initializing advanced DevTools detection...');
    
    // Method 1: Window Size Detection with ResizeObserver
    this.setupResizeObserver();
    
    // Method 2: Console Detection
    this.setupConsoleDetection();
    
    // Method 3: Debugger Detection
    this.setupDebuggerDetection();
    
    // Method 4: Performance Analysis
    this.setupPerformanceAnalysis();
    
    // Method 5: DOM Manipulation Detection
    this.setupDOMDetection();
    
    // Method 6: Keyboard Shortcuts
    this.setupKeyboardDetection();
    
    // Method 7: Firebug Detection
    this.setupFirebugDetection();
    
    // Method 8: Context Detection
    this.setupContextDetection();
  }

  // Method 1: ResizeObserver for window changes
  setupResizeObserver() {
    if (window.ResizeObserver) {
      const resizeObserver = new ResizeObserver(() => {
        this.checkWindowSize();
      });
      resizeObserver.observe(document.body);
      this.observers.push(resizeObserver);
    }
    
    // Fallback interval check
    const interval = setInterval(() => {
      this.checkWindowSize();
    }, 300);
    this.intervals.push(interval);
  }

  checkWindowSize() {
    const heightDiff = window.outerHeight - window.innerHeight;
    const widthDiff = window.outerWidth - window.innerWidth;
    
    // More sophisticated detection
    const isDevToolsOpen = 
      heightDiff > 80 || 
      widthDiff > 80 ||
      (window.outerWidth < window.innerWidth) ||
      (window.outerHeight < window.innerHeight);
    
    if (isDevToolsOpen && !this.devToolsDetected) {
      console.log('🔒 DevTools detected via window size! Height diff:', heightDiff, 'Width diff:', widthDiff);
      this.triggerDevToolsDetection('window_size', { heightDiff, widthDiff });
    } else if (!isDevToolsOpen && this.devToolsDetected) {
      console.log('🔒 DevTools closed via window size!');
      this.triggerDevToolsClose();
    }
  }

  // Method 2: Console Detection
  setupConsoleDetection() {
    const interval = setInterval(() => {
      let devtoolsOpen = false;
      const element = document.createElement('div');
      
      Object.defineProperty(element, 'id', {
        get: function() {
          devtoolsOpen = true;
          return 'console-detection';
        },
        configurable: true
      });
      
      console.log('%c', 'color: transparent', element);
      
      if (devtoolsOpen && !this.devToolsDetected) {
        console.log('🔒 DevTools detected via console!');
        this.triggerDevToolsDetection('console_access', {});
      }
    }, 1000);
    
    this.intervals.push(interval);
  }

  // Method 3: Debugger Detection
  setupDebuggerDetection() {
    const interval = setInterval(() => {
      const start = performance.now();
      debugger;
      const end = performance.now();
      
      if (end - start > 100) {
        if (!this.devToolsDetected) {
          console.log('🔒 DevTools detected via debugger! Time:', end - start, 'ms');
          this.triggerDevToolsDetection('debugger_timing', { timeDiff: end - start });
        }
      }
    }, 2000);
    
    this.intervals.push(interval);
  }

  // Method 4: Performance Analysis
  setupPerformanceAnalysis() {
    const interval = setInterval(() => {
      // Check for performance anomalies
      const entries = performance.getEntriesByType('navigation');
      if (entries.length > 0) {
        const timing = entries[0];
        const loadTime = timing.loadEventEnd - timing.navigationStart;
        
        // Detect if page load is suspiciously slow (possible debugging)
        if (loadTime > 5000 && !this.devToolsDetected) {
          console.log('🔒 Suspicious load time detected:', loadTime, 'ms');
          this.reportToBackend('suspicious_performance', { loadTime });
        }
      }
    }, 5000);
    
    this.intervals.push(interval);
  }

  // Method 5: DOM Manipulation Detection
  setupDOMDetection() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === 1) {
              const tagName = node.tagName?.toLowerCase();
              if (tagName === 'script' || tagName === 'style') {
                console.log('🔒 Suspicious DOM injection detected:', tagName);
                this.reportToBackend('dom_injection', { tagName });
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
    
    this.observers.push(observer);
  }

  // Method 6: Keyboard Detection
  setupKeyboardDetection() {
    document.addEventListener('keydown', (e) => {
      // Block F12 key
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
      
      // Block Ctrl+Shift+C (Inspect Element)
      if (e.ctrlKey && e.shiftKey && e.key === 'C') {
        e.preventDefault();
        this.showWarning('Developer tools access is disabled');
        this.reportViolation('Ctrl+Shift+C blocked');
        return false;
      }
      
      // Block Ctrl+U (View Source)
      if (e.ctrlKey && e.key === 'u') {
        e.preventDefault();
        this.showWarning('View source is disabled');
        this.reportViolation('Ctrl+U blocked');
        return false;
      }
    });
  }
  
  // Method 7: Firebug Detection
  setupFirebugDetection() {
    const interval = setInterval(() => {
      if (window.console && window.console.firebug) {
        console.log('🔒 Firebug detected!');
        this.triggerDevToolsDetection('firebug', {});
      }
    }, 1000);
    
    this.intervals.push(interval);
  }
  
  // Method 8: Context Detection
  setupContextDetection() {
    // Check if running in a different context (like devtools)
    const interval = setInterval(() => {
      const threshold = 500;
      const before = performance.now();
      
      // This operation is slower in devtools
      for (let i = 0; i < 100; i++) {
        console.log('');
      }
      
      const after = performance.now();
      const timeDiff = after - before;
      
      if (timeDiff > threshold && !this.devToolsDetected) {
        console.log('🔒 DevTools detected via context timing! Time:', timeDiff, 'ms');
        this.triggerDevToolsDetection('context_timing', { timeDiff });
      }
    }, 3000);
    
    this.intervals.push(interval);
  }
  
  // Trigger DevTools Detection
  triggerDevToolsDetection(method, data) {
    if (this.devToolsDetected) return;
    
    this.devToolsDetected = true;
    console.log('🔒 DevTools detected via:', method, data);
    
    // Report to backend
    this.reportToBackend('devtools_detected', {
      method,
      data,
      sessionId: this.sessionId,
      userAgent: navigator.userAgent,
      url: window.location.href
    });
    
    // Apply protection
    this.handleDevToolsDetection();
    this.reportViolation(`Developer tools detected (${method})`);
  }
  
  // Trigger DevTools Close
  triggerDevToolsClose() {
    if (!this.devToolsDetected) return;
    
    this.devToolsDetected = false;
    console.log('🔒 DevTools closed!');
    
    // Report to backend
    this.reportToBackend('devtools_closed', {
      sessionId: this.sessionId,
      timestamp: new Date().toISOString()
    });
    
    // Restore content
    this.restoreContent();
  }

  // Handle developer tools detection - balanced approach
  handleDevToolsDetection() {
    this.showWarning('Developer tools detected - Content protected');
    
    console.log('🔒 DevTools detected - applying image protection');
    
// Blur entire site for high-level security
    const bodyElement = document.body;
    bodyElement.style.filter = 'blur(10px)';
    bodyElement.style.transition = 'filter 0.5s ease';
    
    // Add simple security overlay only on gallery area
    this.showSecurityOverlay();
  }

  // Restore content when dev tools are closed
  restoreContent() {
    console.log('🔒 DevTools closed - restoring content');
    
// Restore entire site
    const bodyElement = document.body;
    bodyElement.style.filter = 'none';
    
    // Remove security overlay
    this.removeSecurityOverlay();
  }

  // Show security overlay - covers entire page
  showSecurityOverlay() {
    // Don't add multiple overlays
    if (document.querySelector('.devtools-overlay')) return;

    const overlay = document.createElement('div');
    overlay.className = 'devtools-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.5);
      z-index: 999998;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 18px;
      font-weight: bold;
      font-family: Arial, sans-serif;
      pointer-events: none;
      backdrop-filter: blur(5px);
      -webkit-backdrop-filter: blur(5px);
    `;
    
    overlay.innerHTML = `
      <div style="text-align: center; padding: 30px; background: rgba(0, 0, 0, 0.8); border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
        <div style="font-size: 48px; margin-bottom: 20px;">🔒</div>
        <div style="font-size: 24px; margin-bottom: 12px;">Website Protected</div>
        <div style="font-size: 14px; opacity: 0.9; line-height: 1.4;">
          Close developer tools to access the website
        </div>
      </div>
    `;
    
    // Add to body
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
const comprehensiveSecurity = new ComprehensiveSecurityService();
export default comprehensiveSecurity;
