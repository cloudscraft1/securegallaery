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

// Method 1: Enhanced Window Size Detection
  setupEnhancedResizeDetection() {
    let lastResizeTime = 0;
    let resizeTimeout;
    
    const checkWindowSize = () => {
      const now = Date.now();
      if (now - lastResizeTime < 500) return; // Debounce
      
      const heightDiff = window.outerHeight - window.innerHeight;
      const widthDiff = window.outerWidth - window.innerWidth;
      
      // Multiple detection criteria for better accuracy
      const isDevToolsOpen = 
        heightDiff > 160 || // DevTools panel height
        widthDiff > 160 ||  // DevTools panel width
        (window.outerWidth < 800 && heightDiff > 80) || // Small window adjustment
        (window.outerHeight < 600 && widthDiff > 80) ||  // Small window adjustment
        (window.devicePixelRatio && heightDiff > 200) || // High DPI screens
        (window.screen.availHeight - window.outerHeight > 100 && heightDiff > 100); // Taskbar consideration
      
      if (isDevToolsOpen && !this.devToolsDetected) {
        console.log('🔒 DevTools detected - Height diff:', heightDiff, 'Width diff:', widthDiff);
        this.triggerDevToolsDetection('window_size_enhanced', { heightDiff, widthDiff });
        lastResizeTime = now;
      } else if (!isDevToolsOpen && this.devToolsDetected) {
        console.log('🔒 DevTools closed - Height diff:', heightDiff, 'Width diff:', widthDiff);
        this.triggerDevToolsClose();
        lastResizeTime = now;
      }
    };
    
    // Listen to resize events with debouncing
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(checkWindowSize, 100);
    });
    
    // Initial check
    checkWindowSize();
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

  // Method 2: Advanced Console Detection
  setupConsoleDetection() {
    let consoleCheckCount = 0;
    const maxConsoleChecks = 5; // Limit console checks to prevent performance issues
    
    const consoleCheck = () => {
      if (consoleCheckCount >= maxConsoleChecks) return;
      
      let devtoolsOpen = false;
      const element = document.createElement('div');
      
      Object.defineProperty(element, 'id', {
        get: function() {
          devtoolsOpen = true;
          return 'console-detection';
        },
        configurable: true
      });
      
      // Use a more sophisticated console detection
      const originalLog = console.log;
      let consoleOpened = false;
      
      console.log = function() {
        consoleOpened = true;
        return originalLog.apply(console, arguments);
      };
      
      console.log('%c', 'color: transparent', element);
      console.log = originalLog; // Restore original
      
      if ((devtoolsOpen || consoleOpened) && !this.devToolsDetected) {
        console.log('🔒 DevTools detected via console access!');
        this.triggerDevToolsDetection('console_access', { method: devtoolsOpen ? 'property' : 'log' });
        consoleCheckCount++;
      }
    };
    
    // Check console access every 2 seconds, but limit the number of checks
    const interval = setInterval(() => {
      if (consoleCheckCount < maxConsoleChecks) {
        consoleCheck();
      } else {
        clearInterval(interval);
      }
    }, 2000);
    
    this.intervals.push(interval);
  }

  // Method 3: Debugger Detection (Disabled - too aggressive)
  setupDebuggerDetection() {
    // Disabled to reduce false positives
    console.log('🔒 Debugger detection disabled to prevent false positives');
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
  
  // Method 4: Firefox DevTools Detection (Simplified)
  setupFirefoxDetection() {
    const interval = setInterval(() => {
      if (window.outerHeight - window.innerHeight > 250 ||
          window.outerWidth - window.innerWidth > 250) {
        if (!this.devToolsDetected) {
          console.log('🔒 Firefox DevTools detected - Height diff:', window.outerHeight - window.innerHeight, 'Width diff:', window.outerWidth - window.innerWidth);
          this.triggerDevToolsDetection('firefox_detection');
        }
      }
    }, 2000); // Reduced frequency
    
    this.intervals.push(interval);
  }

  // Method 5: Orientation Detection (Disabled - causes false positives)
  setupOrientationDetection() {
    // Disabled to reduce false positives on mobile and desktop
    console.log('🔒 Orientation detection disabled to prevent false positives');
  }

  // Method 7: Intelligent Continuous Monitoring
  setupContinuousMonitoring() {
    let consecutiveDetections = 0;
    let consecutiveNormalStates = 0;
    const DETECTION_THRESHOLD = 3; // Require 3 consecutive detections
    const NORMAL_THRESHOLD = 2; // Require 2 consecutive normal states
    
    const monitorInterval = setInterval(() => {
      const heightDiff = window.outerHeight - window.innerHeight;
      const widthDiff = window.outerWidth - window.innerWidth;
      
      // Dynamic thresholds based on screen size
      const screenArea = window.screen.width * window.screen.height;
      const isLargeScreen = screenArea > (1920 * 1080);
      const baseThreshold = isLargeScreen ? 180 : 160;
      
      // More sophisticated detection logic
      const isDevToolsOpen = 
        heightDiff > baseThreshold || 
        widthDiff > baseThreshold ||
        (heightDiff > 120 && widthDiff > 120) || // Both dimensions changed
        (window.outerWidth < window.innerWidth) || // Impossible normal state
        (window.outerHeight < window.innerHeight); // Impossible normal state
      
      if (isDevToolsOpen) {
        consecutiveDetections++;
        consecutiveNormalStates = 0;
        
        if (consecutiveDetections >= DETECTION_THRESHOLD && !this.devToolsDetected) {
          console.log('🔒 DevTools detected after', consecutiveDetections, 'consecutive checks - Height diff:', heightDiff, 'Width diff:', widthDiff);
          this.triggerDevToolsDetection('continuous_monitoring', { 
            heightDiff, 
            widthDiff, 
            consecutiveDetections,
            screenArea
          });
        }
      } else {
        consecutiveNormalStates++;
        consecutiveDetections = 0;
        
        if (consecutiveNormalStates >= NORMAL_THRESHOLD && this.devToolsDetected) {
          console.log('🔒 DevTools closed after', consecutiveNormalStates, 'consecutive normal checks');
          this.triggerDevToolsClose();
        }
      }
    }, 800); // Slightly more frequent for better responsiveness
    
    this.intervals.push(monitorInterval);
  }
  
  // Method 8: Page Visibility API Detection (Simplified)
  setupPageVisibilityDetection() {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Only recheck if already detected to avoid false positives
        if (this.devToolsDetected) {
          setTimeout(() => {
            this.forceCheckDevTools();
          }, 500);
        }
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
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
    console.log('🔒 DevTools detected - applying comprehensive protection');
    
    // Apply multiple layers of protection
    const bodyElement = document.body;
    const htmlElement = document.documentElement;
    
    // Add classes for CSS-based protection
    bodyElement.classList.add('devtools-detected', 'security-blur');
    htmlElement.classList.add('devtools-detected');
    
    // Apply inline styles as backup (higher specificity)
    bodyElement.style.cssText += `
      filter: blur(15px) !important;
      -webkit-filter: blur(15px) !important;
      -moz-filter: blur(15px) !important;
      transition: filter 0.3s ease !important;
      pointer-events: none !important;
      user-select: none !important;
      -webkit-user-select: none !important;
      -moz-user-select: none !important;
    `;
    
    // Additional protection for all images and content
    const allElements = document.querySelectorAll('*');
    allElements.forEach(element => {
      if (element.tagName !== 'SCRIPT' && element.tagName !== 'STYLE') {
        element.style.cssText += 'filter: blur(5px) !important;';
      }
    });
    
    // Show overlay and warning
    this.showSecurityOverlay();
    this.showWarning('Developer tools detected - Content protected');
    
    // Disable all interactions
    document.addEventListener('selectstart', this.preventAction, true);
    document.addEventListener('contextmenu', this.preventAction, true);
    document.addEventListener('dragstart', this.preventAction, true);
    document.addEventListener('drop', this.preventAction, true);
  }

  // Restore content when dev tools are closed
  restoreContent() {
    console.log('🔒 DevTools closed - restoring content');
    
    // Remove protection classes
    const bodyElement = document.body;
    const htmlElement = document.documentElement;
    
    bodyElement.classList.remove('devtools-detected', 'security-blur');
    htmlElement.classList.remove('devtools-detected');
    
    // Clear inline styles
    bodyElement.style.filter = '';
    bodyElement.style.webkitFilter = '';
    bodyElement.style.mozFilter = '';
    bodyElement.style.pointerEvents = '';
    bodyElement.style.userSelect = '';
    bodyElement.style.webkitUserSelect = '';
    bodyElement.style.mozUserSelect = '';
    
    // Restore all elements
    const allElements = document.querySelectorAll('*');
    allElements.forEach(element => {
      if (element.tagName !== 'SCRIPT' && element.tagName !== 'STYLE') {
        element.style.filter = '';
      }
    });
    
    // Remove security overlay
    this.removeSecurityOverlay();
    
    // Remove any existing warnings
    const existingWarnings = document.querySelectorAll('.security-warning');
    existingWarnings.forEach(warning => warning.remove());
    
    // Re-enable interactions
    document.removeEventListener('selectstart', this.preventAction, true);
    document.removeEventListener('contextmenu', this.preventAction, true);
    document.removeEventListener('dragstart', this.preventAction, true);
    document.removeEventListener('drop', this.preventAction, true);
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
  
  // Utility method to prevent actions
  preventAction = (e) => {
    e.preventDefault();
    e.stopPropagation();
    return false;
  }
  
  // Enhanced force check with multiple detection methods
  forceCheckDevTools() {
    const heightDiff = window.outerHeight - window.innerHeight;
    const widthDiff = window.outerWidth - window.innerWidth;
    const screenArea = window.screen.width * window.screen.height;
    const isLargeScreen = screenArea > (1920 * 1080);
    const baseThreshold = isLargeScreen ? 180 : 160;
    
    console.log('🔧 Force DevTools Check - Current dimensions:', {
      outerHeight: window.outerHeight,
      innerHeight: window.innerHeight,
      outerWidth: window.outerWidth,
      innerWidth: window.innerWidth,
      heightDiff,
      widthDiff,
      screenArea,
      isLargeScreen,
      baseThreshold,
      devToolsDetected: this.devToolsDetected
    });
    
    // Use enhanced detection logic
    const isDevToolsOpen = 
      heightDiff > baseThreshold || 
      widthDiff > baseThreshold ||
      (heightDiff > 120 && widthDiff > 120) ||
      (window.outerWidth < window.innerWidth) ||
      (window.outerHeight < window.innerHeight);
    
    if (isDevToolsOpen && !this.devToolsDetected) {
      console.log('🔒 Force check: DevTools detected with enhanced logic');
      this.triggerDevToolsDetection('manual_check_enhanced', {
        heightDiff,
        widthDiff,
        screenArea,
        method: 'force_check'
      });
    } else if (!isDevToolsOpen && this.devToolsDetected) {
      console.log('🔒 Force check: DevTools closed');
      this.triggerDevToolsClose();
    }
    
    return {
      isDevToolsOpen,
      heightDiff,
      widthDiff,
      currentState: this.devToolsDetected
    };
  }
}

// Create and export instance
const comprehensiveSecurity = new ComprehensiveSecurityService();

// Add debugging utilities to window for testing
if (typeof window !== 'undefined') {
  window.debugDevTools = {
    checkDimensions: () => {
      const heightDiff = window.outerHeight - window.innerHeight;
      const widthDiff = window.outerWidth - window.innerWidth;
      console.log('Current browser dimensions:', {
        outerHeight: window.outerHeight,
        innerHeight: window.innerHeight,
        outerWidth: window.outerWidth,
        innerWidth: window.innerWidth,
        heightDiff,
        widthDiff,
        devToolsDetected: comprehensiveSecurity.devToolsDetected,
        isDevToolsOpen: heightDiff > 200 || widthDiff > 200
      });
    },
    forceCheck: () => comprehensiveSecurity.forceCheckDevTools(),
    getViolations: () => comprehensiveSecurity.getViolations(),
    disable: () => comprehensiveSecurity.disable(),
    cleanup: () => comprehensiveSecurity.cleanup()
  };
}

export default comprehensiveSecurity;
