// Advanced DevTools Detection Service - Enhanced Version
// This service provides improved detection accuracy and proper blur effects

class AdvancedDevToolsDetection {
  constructor() {
    this.isActive = false;
    this.devToolsDetected = false;
    this.detectionMethods = new Map();
    this.observers = [];
    this.intervals = [];
    this.thresholds = this.calculateDynamicThresholds();
    this.detectionState = {
      consecutiveDetections: 0,
      consecutiveNormalStates: 0,
      lastDetectionTime: 0,
      falsePositiveCount: 0
    };
    this.config = {
      DETECTION_THRESHOLD: 2,    // Require 2 consecutive detections (less aggressive)
      NORMAL_THRESHOLD: 2,       // Require 2 consecutive normal states
      DEBOUNCE_TIME: 200,        // Minimum time between checks
      MAX_FALSE_POSITIVES: 1,    // Maximum allowed false positives
      RESET_INTERVAL: 15000      // Reset false positive counter every 15 seconds
    };
    
    this.init();
  }

  init() {
    if (this.isActive) return;
    this.isActive = true;
    
    console.log('🔒 Advanced DevTools Detection: Initializing enhanced protection');
    
    // Calculate dynamic thresholds based on current environment
    this.calculateDynamicThresholds();
    
    // Initialize detection methods
    this.initializeDetectionMethods();
    
    // Start monitoring
    this.startMonitoring();
    
    // Setup cleanup on page unload
    window.addEventListener('beforeunload', () => this.cleanup());
  }

  calculateDynamicThresholds() {
    const screenWidth = window.screen.width;
    const screenHeight = window.screen.height;
    const pixelRatio = window.devicePixelRatio || 1;
    const screenArea = screenWidth * screenHeight;
    
    // More lenient thresholds for better detection without being too aggressive
    const baseThreshold = screenArea > (1920 * 1080) ? 180 : 140;
    const adjustedThreshold = Math.floor(baseThreshold * Math.min(pixelRatio, 1.5));
    
    this.thresholds = {
      height: Math.max(adjustedThreshold, 120),
      width: Math.max(adjustedThreshold, 120),
      combined: Math.max(Math.floor(adjustedThreshold * 0.6), 80),
      small: Math.max(Math.floor(adjustedThreshold * 0.4), 60)
    };
    
    console.log('🔒 Dynamic thresholds calculated:', this.thresholds);
    return this.thresholds;
  }

  initializeDetectionMethods() {
    // Method 1: Enhanced window size detection
    this.detectionMethods.set('windowSize', this.createWindowSizeDetector());
    
    // Method 2: Orientation and resize detection
    this.detectionMethods.set('orientation', this.createOrientationDetector());
    
    // Method 3: Enhanced Console Detection
    this.detectionMethods.set('console', this.createEnhancedConsoleDetector());
    
    // Method 4: Performance timing detection
    this.detectionMethods.set('performance', this.createPerformanceDetector());
    
    // Method 5: Keyboard shortcut detection
    this.detectionMethods.set('keyboard', this.createKeyboardDetector());
  }

  createWindowSizeDetector() {
    let lastCheck = 0;
    let resizeTimeout;
    
    const checkWindowSize = () => {
      const now = Date.now();
      if (now - lastCheck < this.config.DEBOUNCE_TIME) return;
      lastCheck = now;
      
      const heightDiff = window.outerHeight - window.innerHeight;
      const widthDiff = window.outerWidth - window.innerWidth;
      
      // Multiple criteria for better accuracy
      const criteria = [
        heightDiff > this.thresholds.height,
        widthDiff > this.thresholds.width,
        (heightDiff > this.thresholds.combined && widthDiff > this.thresholds.combined),
        window.outerWidth < window.innerWidth,
        window.outerHeight < window.innerHeight,
        (window.outerWidth < 800 && heightDiff > this.thresholds.small),
        (window.outerHeight < 600 && widthDiff > this.thresholds.small)
      ];
      
      const detectionScore = criteria.filter(Boolean).length;
      const isDetected = detectionScore >= 1; // Require at least 1 criteria for faster detection
      
      this.processDetection('windowSize', isDetected, {
        heightDiff,
        widthDiff,
        detectionScore,
        criteria: criteria.map((c, i) => ({ index: i, met: c }))
      });
    };
    
    // Debounced resize listener
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(checkWindowSize, 100);
    };
    
    window.addEventListener('resize', handleResize);
    
    return {
      check: checkWindowSize,
      cleanup: () => {
        window.removeEventListener('resize', handleResize);
        clearTimeout(resizeTimeout);
      }
    };
  }

  createOrientationDetector() {
    const checkOrientation = () => {
      // Only check on mobile devices
      if (!window.orientation && !screen.orientation) return;
      
      const heightDiff = window.outerHeight - window.innerHeight;
      const widthDiff = window.outerWidth - window.innerWidth;
      
      // On mobile, DevTools cause significant size changes
      const isMobileDevTools = (
        (window.innerWidth < 768 && heightDiff > 150) ||
        (window.innerHeight < 600 && widthDiff > 150)
      );
      
      this.processDetection('orientation', isMobileDevTools, {
        heightDiff,
        widthDiff,
        orientation: window.orientation || screen.orientation?.angle
      });
    };
    
    window.addEventListener('orientationchange', () => {
      setTimeout(checkOrientation, 500); // Wait for orientation change to complete
    });
    
    return {
      check: checkOrientation,
      cleanup: () => window.removeEventListener('orientationchange', checkOrientation)
    };
  }

  createEnhancedConsoleDetector() {
    let consoleCheckCount = 0;
    const maxConsoleChecks = 3;
    
    const checkConsolePanel = () => {
      if (consoleCheckCount >= maxConsoleChecks) return;
      
      // Method 1: RegExp toString detection
      const devtools = /./;
      let devToolsOpen = false;
      
      devtools.toString = () => {
        devToolsOpen = true;
        return 'DevTools';
      };
      
      try {
        console.log('%c', devtools);
        if (devToolsOpen) {
          consoleCheckCount++;
          this.processDetection('console', true, { 
            method: 'panel_detection',
            checkCount: consoleCheckCount
          });
        }
      } catch (e) {
        // Ignore errors
      }
      
      // Method 2: Console API check
      const consoleCheck = () => {
        const element = document.createElement('div');
        Object.defineProperty(element, 'id', {
          get: function() {
            devToolsOpen = true;
            return 'console-detector';
          },
          configurable: true
        });
        
        try {
          console.log('%c', 'color: transparent', element);
          if (devToolsOpen) {
            consoleCheckCount++;
            this.processDetection('console', true, { 
              method: 'api_detection',
              checkCount: consoleCheckCount
            });
          }
        } catch (e) {
          // Ignore errors
        }
      };
      
      consoleCheck();
    };
    
    const interval = setInterval(checkConsolePanel, 3000);
    this.intervals.push(interval);
    
    return {
      check: checkConsolePanel,
      cleanup: () => clearInterval(interval)
    };
  }

  createPerformanceDetector() {
    const checkPerformance = () => {
      if (!window.performance || !window.performance.now) return;
      
      const start = performance.now();
      const iterations = 100000;
      
      // Simple performance test
      for (let i = 0; i < iterations; i++) {
        Math.random();
      }
      
      const end = performance.now();
      const duration = end - start;
      
      // If execution is unusually slow, might indicate debugging
      const isSlowExecution = duration > 50; // 50ms threshold
      
      this.processDetection('performance', isSlowExecution, {
        duration,
        iterations,
        threshold: 50
      });
    };
    
    const interval = setInterval(checkPerformance, 8000);
    this.intervals.push(interval);
    
    return {
      check: checkPerformance,
      cleanup: () => clearInterval(interval)
    };
  }

  createKeyboardDetector() {
    const handleKeyDown = (e) => {
      const devToolsKeys = [
        e.key === 'F12',
        e.ctrlKey && e.shiftKey && e.key === 'I',
        e.ctrlKey && e.shiftKey && e.key === 'J',
        e.ctrlKey && e.shiftKey && e.key === 'C',
        e.ctrlKey && e.key === 'U',
        e.metaKey && e.altKey && e.key === 'I', // Mac
        e.metaKey && e.altKey && e.key === 'J', // Mac
        e.metaKey && e.altKey && e.key === 'C'  // Mac
      ];
      
      if (devToolsKeys.some(Boolean)) {
        e.preventDefault();
        this.processDetection('keyboard', true, {
          key: e.key,
          ctrlKey: e.ctrlKey,
          shiftKey: e.shiftKey,
          metaKey: e.metaKey,
          altKey: e.altKey
        });
        return false;
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    
    return {
      check: () => {}, // Passive detector
      cleanup: () => document.removeEventListener('keydown', handleKeyDown)
    };
  }

  processDetection(method, isDetected, data) {
    const now = Date.now();
    
    if (isDetected) {
      this.detectionState.consecutiveDetections++;
      this.detectionState.consecutiveNormalStates = 0;
      
      // Check if we meet the threshold for detection
      if (this.detectionState.consecutiveDetections >= this.config.DETECTION_THRESHOLD && 
          !this.devToolsDetected) {
        
        // Additional validation to prevent false positives
        if (this.validateDetection(method, data)) {
          this.triggerDevToolsDetection(method, data);
        } else {
          this.detectionState.falsePositiveCount++;
          console.warn('🔒 False positive detected for method:', method);
        }
      }
    } else {
      this.detectionState.consecutiveNormalStates++;
      this.detectionState.consecutiveDetections = 0;
      
      if (this.detectionState.consecutiveNormalStates >= this.config.NORMAL_THRESHOLD && 
          this.devToolsDetected) {
        this.triggerDevToolsClose();
      }
    }
    
    // Reset false positive counter periodically
    if (now - this.detectionState.lastDetectionTime > this.config.RESET_INTERVAL) {
      this.detectionState.falsePositiveCount = 0;
      this.detectionState.lastDetectionTime = now;
    }
  }

  validateDetection(method, data) {
    // Additional validation to prevent false positives
    if (this.detectionState.falsePositiveCount >= this.config.MAX_FALSE_POSITIVES) {
      return false;
    }
    // Ensure we only detect when DevTools size changes make sense
    const validSizeChanges = (data.heightDiff > 0 && data.widthDiff > 0);
    // Detect if window.innerWidth is greater than a typical screen size
    const impossibleWidth = (window.innerWidth > 1600 && data.widthDiff > 100);
    // Combine criteria for strong validation
    const validConditions = validSizeChanges || impossibleWidth;
    
    // Method-specific validation (less strict for better detection)
    switch (method) {
      case 'windowSize':
        return data.detectionScore >= 1 && (data.heightDiff > 80 || data.widthDiff > 80);
      case 'console':
        return data.accessCount <= 3; // Limit console-based detections
      case 'performance':
        return data.duration > 25; // More lenient threshold
      case 'keyboard':
        return true; // Always validate keyboard detection
      default:
        return true;
    }
  }

  triggerDevToolsDetection(method, data) {
    if (this.devToolsDetected) return;
    
    this.devToolsDetected = true;
    console.log('🔒 DevTools detected via:', method, data);
    
    // Apply comprehensive protection
    this.applyProtection();
    
    // Show warning
    this.showWarning('Developer tools detected - Content protected');
    
    // Report detection (if backend is available)
    this.reportDetection(method, data);
  }

  triggerDevToolsClose() {
    if (!this.devToolsDetected) return;
    
    this.devToolsDetected = false;
    console.log('🔒 DevTools closed - restoring content');
    
    // Restore content
    this.restoreContent();
    
    // Reset detection state
    this.detectionState.consecutiveDetections = 0;
    this.detectionState.consecutiveNormalStates = 0;
  }

  applyProtection() {
    const body = document.body;
    const html = document.documentElement;
    
    // Add protection classes
    body.classList.add('devtools-detected', 'security-blur');
    html.classList.add('devtools-detected');
    
    // Complete website blocking with comprehensive protection
    const protectionStyles = `
      filter: blur(20px) contrast(0.2) brightness(0.3) !important;
      -webkit-filter: blur(20px) contrast(0.2) brightness(0.3) !important;
      -moz-filter: blur(20px) contrast(0.2) brightness(0.3) !important;
      -o-filter: blur(20px) contrast(0.2) brightness(0.3) !important;
      -ms-filter: blur(20px) contrast(0.2) brightness(0.3) !important;
      transition: filter 0.2s ease !important;
      pointer-events: none !important;
      user-select: none !important;
      -webkit-user-select: none !important;
      -moz-user-select: none !important;
      -ms-user-select: none !important;
      opacity: 0.1 !important;
    `;
    
    body.style.cssText += protectionStyles;
    
    // Block all content completely
    const allElements = document.querySelectorAll('*:not(.devtools-overlay):not(.devtools-overlay *)');
    allElements.forEach(element => {
      if (element.tagName !== 'SCRIPT' && element.tagName !== 'STYLE' && element.tagName !== 'META') {
        element.style.cssText += `
          filter: blur(30px) contrast(0.1) !important;
          opacity: 0.05 !important;
          visibility: hidden !important;
          pointer-events: none !important;
          user-select: none !important;
        `;
      }
    });
    
    // Show security overlay (this will be the only visible content)
    this.showSecurityOverlay();
    
    // Disable all interactions
    this.disableInteractions();
    
    // Block scrolling
    body.style.overflow = 'hidden';
    html.style.overflow = 'hidden';
    
    // Additional security measures
    this.blockAdditionalFeatures();
  }
  
  // Block additional features when DevTools are detected
  blockAdditionalFeatures() {
    // Disable right-click context menu
    document.addEventListener('contextmenu', this.preventAction, true);
    
    // Disable text selection
    document.addEventListener('selectstart', this.preventAction, true);
    
    // Disable drag and drop
    document.addEventListener('dragstart', this.preventAction, true);
    document.addEventListener('drop', this.preventAction, true);
    
    // Disable printing
    window.addEventListener('beforeprint', this.preventAction, true);
    
    // Disable save page
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        return false;
      }
    }, true);
    
    // Hide cursor
    document.body.style.cursor = 'none';
    
    // Disable focus on elements
    const allElements = document.querySelectorAll('*');
    allElements.forEach(element => {
      element.setAttribute('tabindex', '-1');
      element.blur();
    });
  }
  
  // Prevent any action
  preventAction = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    return false;
  }

  restoreContent() {
    const body = document.body;
    const html = document.documentElement;
    
    // Remove protection classes
    body.classList.remove('devtools-detected', 'security-blur');
    html.classList.remove('devtools-detected');
    body.classList.add('devtools-restored');
    
    // Clear body styles
    body.style.filter = '';
    body.style.webkitFilter = '';
    body.style.mozFilter = '';
    body.style.oFilter = '';
    body.style.msFilter = '';
    body.style.pointerEvents = '';
    body.style.userSelect = '';
    body.style.webkitUserSelect = '';
    body.style.mozUserSelect = '';
    body.style.opacity = '';
    body.style.overflow = '';
    html.style.overflow = '';
    
    // Restore all elements
    const allElements = document.querySelectorAll('*');
    allElements.forEach(element => {
      if (element.tagName !== 'SCRIPT' && element.tagName !== 'STYLE' && element.tagName !== 'META') {
        element.style.filter = '';
        element.style.opacity = '';
        element.style.visibility = '';
        element.style.pointerEvents = '';
        element.style.userSelect = '';
      }
    });
    
    // Remove overlay
    this.removeSecurityOverlay();
    
    // Re-enable interactions
    this.enableInteractions();
    
    // Restore additional features
    this.restoreAdditionalFeatures();
    
    // Remove restored class after animation
    setTimeout(() => {
      body.classList.remove('devtools-restored');
    }, 500);
  }
  
  // Restore additional features when DevTools are closed
  restoreAdditionalFeatures() {
    // Remove event listeners
    document.removeEventListener('contextmenu', this.preventAction, true);
    document.removeEventListener('selectstart', this.preventAction, true);
    document.removeEventListener('dragstart', this.preventAction, true);
    document.removeEventListener('drop', this.preventAction, true);
    window.removeEventListener('beforeprint', this.preventAction, true);
    
    // Restore cursor
    document.body.style.cursor = '';
    
    // Restore focus capability
    const allElements = document.querySelectorAll('*');
    allElements.forEach(element => {
      element.removeAttribute('tabindex');
    });
  }

  showSecurityOverlay() {
    if (document.querySelector('.devtools-overlay')) return;
    
    const overlay = document.createElement('div');
    overlay.className = 'devtools-overlay';
    overlay.style.cssText = `
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      width: 100vw !important;
      height: 100vh !important;
      background: rgba(0, 0, 0, 0.95) !important;
      z-index: 999999 !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      backdrop-filter: blur(10px) !important;
      -webkit-backdrop-filter: blur(10px) !important;
    `;
    
    overlay.innerHTML = `
      <div style="
        text-align: center !important;
        padding: 60px 40px !important;
        background: rgba(0, 0, 0, 0.9) !important;
        border-radius: 20px !important;
        border: 2px solid rgba(255, 255, 255, 0.1) !important;
        box-shadow: 0 25px 50px rgba(0, 0, 0, 0.8) !important;
        max-width: 500px !important;
        margin: 20px !important;
        color: white !important;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
      ">
        <div style="font-size: 64px; margin-bottom: 30px; animation: pulse 2s infinite;">🔒</div>
        <div style="font-size: 32px; margin-bottom: 20px; font-weight: bold; color: #ff6b6b;">Access Blocked</div>
        <div style="font-size: 18px; margin-bottom: 20px; line-height: 1.6; color: #fff;">
          Developer tools detected. This website is protected from unauthorized access.
        </div>
        <div style="font-size: 16px; opacity: 0.8; margin-bottom: 20px;">
          Please close developer tools to continue browsing.
        </div>
        <div style="font-size: 14px; opacity: 0.6; padding: 15px; background: rgba(255, 255, 255, 0.05); border-radius: 8px;">
          This security measure protects the content and user privacy.
        </div>
      </div>
    `;
    
    document.body.appendChild(overlay);
    
    // Make sure overlay is always on top
    setTimeout(() => {
      overlay.style.zIndex = '2147483647';
    }, 100);
  }

  removeSecurityOverlay() {
    const overlay = document.querySelector('.devtools-overlay');
    if (overlay) {
      overlay.remove();
    }
  }

  showWarning(message) {
    if (document.querySelector('.security-warning')) return;
    
    const warning = document.createElement('div');
    warning.className = 'security-warning';
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
    }, 4000);
  }

  disableInteractions() {
    const preventEvent = (e) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    };
    
    document.addEventListener('selectstart', preventEvent, true);
    document.addEventListener('contextmenu', preventEvent, true);
    document.addEventListener('dragstart', preventEvent, true);
    document.addEventListener('drop', preventEvent, true);
    document.addEventListener('copy', preventEvent, true);
    document.addEventListener('cut', preventEvent, true);
    document.addEventListener('paste', preventEvent, true);
    
    this.preventEventHandler = preventEvent;
  }

  enableInteractions() {
    if (this.preventEventHandler) {
      document.removeEventListener('selectstart', this.preventEventHandler, true);
      document.removeEventListener('contextmenu', this.preventEventHandler, true);
      document.removeEventListener('dragstart', this.preventEventHandler, true);
      document.removeEventListener('drop', this.preventEventHandler, true);
      document.removeEventListener('copy', this.preventEventHandler, true);
      document.removeEventListener('cut', this.preventEventHandler, true);
      document.removeEventListener('paste', this.preventEventHandler, true);
      this.preventEventHandler = null;
    }
  }

  reportDetection(method, data) {
    // Report to backend if available
    try {
      fetch('/api/security-event', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event: 'devtools_detected',
          method,
          data,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href
        })
      }).catch(() => {
        // Ignore fetch errors
      });
    } catch (e) {
      // Ignore errors
    }
  }

  startMonitoring() {
    // Start continuous monitoring
    const monitoringInterval = setInterval(() => {
      this.detectionMethods.forEach((detector, method) => {
        try {
          detector.check();
        } catch (e) {
          console.warn('Error in detection method:', method, e);
        }
      });
    }, 1000);
    
    this.intervals.push(monitoringInterval);
  }

  // Public API methods
  forceCheck() {
    this.detectionMethods.forEach((detector, method) => {
      detector.check();
    });
    
    return {
      detected: this.devToolsDetected,
      state: this.detectionState,
      thresholds: this.thresholds
    };
  }

  getStatus() {
    return {
      isActive: this.isActive,
      devToolsDetected: this.devToolsDetected,
      detectionState: this.detectionState,
      thresholds: this.thresholds,
      methods: Array.from(this.detectionMethods.keys())
    };
  }

  disable() {
    this.isActive = false;
    this.cleanup();
    if (this.devToolsDetected) {
      this.restoreContent();
    }
    console.log('🔒 Advanced DevTools Detection disabled');
  }

  cleanup() {
    // Clear all intervals
    this.intervals.forEach(interval => clearInterval(interval));
    this.intervals = [];
    
    // Cleanup all detection methods
    this.detectionMethods.forEach(detector => {
      if (detector.cleanup) {
        detector.cleanup();
      }
    });
    this.detectionMethods.clear();
    
    // Disconnect observers
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    
    // Re-enable interactions
    this.enableInteractions();
  }
}

// Create and export singleton instance
const advancedDevToolsDetection = new AdvancedDevToolsDetection();

// Add debugging utilities
if (typeof window !== 'undefined') {
  window.advancedDevToolsDebug = {
    getStatus: () => advancedDevToolsDetection.getStatus(),
    forceCheck: () => advancedDevToolsDetection.forceCheck(),
    disable: () => advancedDevToolsDetection.disable(),
    cleanup: () => advancedDevToolsDetection.cleanup()
  };
}

export default advancedDevToolsDetection;
