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
    
    // Method 1: Enhanced Window Size Detection
    this.setupEnhancedResizeDetection();
    
    // Method 2: Console Detection (Chrome/Edge)
    this.setupConsoleDetection();
    
    // Method 3: Debugger Detection (All browsers)
    this.setupDebuggerDetection();
    
    // Method 4: DevTools Object Detection (Firefox)
    this.setupFirefoxDetection();
    
    // Method 5: Orientation Detection (Mobile)
    this.setupOrientationDetection();
    
    // Method 6: Keyboard Shortcuts
    this.setupKeyboardDetection();
    
    // Method 7: Continuous monitoring
    this.setupContinuousMonitoring();
    
    // Method 8: Page visibility API
    this.setupPageVisibilityDetection();
  }

// Method 1: Enhanced Resize Detection
  setupEnhancedResizeDetection() {
    const RESIZE_THRESHOLD = 160;
    let previousOuterWidth = window.outerWidth;
    let previousOuterHeight = window.outerHeight;

    const resizeCheck = () => {
      const widthChanged = Math.abs(window.outerWidth - previousOuterWidth) > RESIZE_THRESHOLD;
      const heightChanged = Math.abs(window.outerHeight - previousOuterHeight) > RESIZE_THRESHOLD;
      const isDevToolsOpen = widthChanged || heightChanged;

      if (isDevToolsOpen && !this.devToolsDetected) {
        this.triggerDevToolsDetection('enhanced_resize');
        previousOuterWidth = window.outerWidth;
        previousOuterHeight = window.outerHeight;
      } else if (!isDevToolsOpen && this.devToolsDetected) {
        this.triggerDevToolsClose();
      }
    };

    window.addEventListener('resize', resizeCheck);
    this.intervals.push(setInterval(resizeCheck, 300)); // For browsers without resize events
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

  // Method 3: Debugger Detection (Enhanced)
  setupDebuggerDetection() {
    const detectDebugger = () => {
      const start = performance.now();
      debugger;
      const end = performance.now();

      if (end - start > 100) {
        this.triggerDevToolsDetection('enhanced_debugger');
      }
    };

    const interval = setInterval(detectDebugger, 2000);
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
  
  // Method 4: Firefox DevTools Detection
  setupFirefoxDetection() {
    const interval = setInterval(() => {
      if (typeof window.navigator.webdriver !== 'undefined' || 
          window.outerHeight - window.innerHeight > 200 ||
          window.outerWidth - window.innerWidth > 200) {
        if (!this.devToolsDetected) {
          this.triggerDevToolsDetection('firefox_detection');
        }
      }
    }, 1000);
    
    this.intervals.push(interval);
  }

  // Method 5: Orientation Detection (Mobile)
  setupOrientationDetection() {
    let initialScreenHeight = screen.height;
    let initialScreenWidth = screen.width;
    
    const checkOrientation = () => {
      const currentScreenHeight = screen.height;
      const currentScreenWidth = screen.width;
      
      // Detect if screen dimensions changed significantly (possible devtools)
      if (Math.abs(currentScreenHeight - initialScreenHeight) > 100 ||
          Math.abs(currentScreenWidth - initialScreenWidth) > 100) {
        if (!this.devToolsDetected) {
          this.triggerDevToolsDetection('orientation_change');
        }
      }
    };
    
    window.addEventListener('orientationchange', checkOrientation);
    this.intervals.push(setInterval(checkOrientation, 1000));
  }

  // Method 7: Continuous Monitoring
  setupContinuousMonitoring() {
    const monitorInterval = setInterval(() => {
      // Multiple detection methods combined
      const heightDiff = window.outerHeight - window.innerHeight;
      const widthDiff = window.outerWidth - window.innerWidth;
      
      // Check for devtools in different positions
      const isDevToolsOpen = 
        heightDiff > 150 || // Bottom devtools
        widthDiff > 150 ||  // Side devtools
        (screen.availHeight - window.outerHeight) > 150 || // Top devtools
        (screen.availWidth - window.outerWidth) > 150; // Side devtools
      
      if (isDevToolsOpen && !this.devToolsDetected) {
        this.triggerDevToolsDetection('continuous_monitoring');
      } else if (!isDevToolsOpen && this.devToolsDetected) {
        this.triggerDevToolsClose();
      }
    }, 500);
    
    this.intervals.push(monitorInterval);
  }
  
  // Method 8: Page Visibility API Detection
  setupPageVisibilityDetection() {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Recheck devtools state when page becomes visible
        setTimeout(() => {
          this.forceCheckDevTools();
        }, 100);
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Also check on focus
    window.addEventListener('focus', handleVisibilityChange);
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

  // Handle developer tools detection - enhanced approach
  handleDevToolsDetection() {
    console.log('🔒 DevTools detected - applying full site protection');
    
    // Add blur class to body for better control
    const bodyElement = document.body;
    bodyElement.classList.add('devtools-detected');
    bodyElement.style.filter = 'blur(10px)';
    bodyElement.style.transition = 'filter 0.5s ease';
    bodyElement.style.pointerEvents = 'none';
    
    // Show overlay and warning
    this.showSecurityOverlay();
    this.showWarning('Developer tools detected - Website protected');
  }

  // Restore content when dev tools are closed
  restoreContent() {
    console.log('🔒 DevTools closed - restoring content');
    
    // Remove blur class and styles from body
    const bodyElement = document.body;
    bodyElement.classList.remove('devtools-detected');
    bodyElement.style.filter = 'none';
    bodyElement.style.pointerEvents = 'auto';
    
    // Remove security overlay
    this.removeSecurityOverlay();
    
    // Remove any existing warnings
    const existingWarnings = document.querySelectorAll('.security-warning');
    existingWarnings.forEach(warning => warning.remove());
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

  // Cleanup method to clear intervals and observers
  cleanup() {
    // Clear all intervals
    this.intervals.forEach(interval => clearInterval(interval));
    this.intervals = [];
    
    // Disconnect all observers
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    
    // Restore content if needed
    if (this.devToolsDetected) {
      this.restoreContent();
      this.devToolsDetected = false;
    }
    
    console.log('🔒 VaultSecure: All detection methods cleaned up');
  }
  
  // Disable security if needed
  disable() {
    this.isActive = false;
    this.cleanup();
    console.log('🔒 VaultSecure: Security protection disabled');
  }
  
  // Force check devtools state (for debugging)
  forceCheckDevTools() {
    const heightDiff = window.outerHeight - window.innerHeight;
    const widthDiff = window.outerWidth - window.innerWidth;
    
    console.log('Current dimensions:', {
      outerHeight: window.outerHeight,
      innerHeight: window.innerHeight,
      outerWidth: window.outerWidth,
      innerWidth: window.innerWidth,
      heightDiff,
      widthDiff,
      devToolsDetected: this.devToolsDetected
    });
    
    const isDevToolsOpen = heightDiff > 150 || widthDiff > 150;
    
    if (isDevToolsOpen && !this.devToolsDetected) {
      this.triggerDevToolsDetection('manual_check');
    } else if (!isDevToolsOpen && this.devToolsDetected) {
      this.triggerDevToolsClose();
    }
  }
}

// Create and export instance
const comprehensiveSecurity = new ComprehensiveSecurityService();
export default comprehensiveSecurity;
