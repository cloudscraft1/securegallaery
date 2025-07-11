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
      DETECTION_THRESHOLD: 4,    // Require multiple consecutive detections
      NORMAL_THRESHOLD: 3,       // Require multiple consecutive normal states
      DEBOUNCE_TIME: 300,        // Minimum time between checks
      MAX_FALSE_POSITIVES: 2,    // Maximum allowed false positives
      RESET_INTERVAL: 10000      // Reset false positive counter every 10 seconds
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
    
    // Adjust thresholds based on screen size and pixel ratio
    const baseThreshold = screenArea > (1920 * 1080) ? 200 : 160;
    const adjustedThreshold = Math.floor(baseThreshold * pixelRatio);
    
    this.thresholds = {
      height: Math.max(adjustedThreshold, 140),
      width: Math.max(adjustedThreshold, 140),
      combined: Math.max(Math.floor(adjustedThreshold * 0.7), 100),
      small: Math.max(Math.floor(adjustedThreshold * 0.5), 80)
    };
    
    console.log('🔒 Dynamic thresholds calculated:', this.thresholds);
    return this.thresholds;
  }

  initializeDetectionMethods() {
    // Method 1: Enhanced window size detection
    this.detectionMethods.set('windowSize', this.createWindowSizeDetector());
    
    // Method 2: Orientation and resize detection
    this.detectionMethods.set('orientation', this.createOrientationDetector());
    
    // Method 3: Console detection (limited)
    this.detectionMethods.set('console', this.createConsoleDetector());
    
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
      const isDetected = detectionScore >= 2; // Require at least 2 criteria
      
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

  createConsoleDetector() {
    let consoleAccessCount = 0;
    const maxConsoleChecks = 3;
    
    const checkConsole = () => {
      if (consoleAccessCount >= maxConsoleChecks) return;
      
      let devToolsOpen = false;
      const element = document.createElement('div');
      
      Object.defineProperty(element, 'id', {
        get: function() {
          devToolsOpen = true;
          return 'devtools-detector';
        },
        configurable: true
      });
      
      try {
        console.log('%c', 'color: transparent', element);
        if (devToolsOpen) {
          consoleAccessCount++;
          this.processDetection('console', true, { 
            method: 'property_access',
            accessCount: consoleAccessCount
          });
        }
      } catch (e) {
        // Ignore errors
      }
    };
    
    const interval = setInterval(checkConsole, 5000);
    this.intervals.push(interval);
    
    return {
      check: checkConsole,
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
    
    // Method-specific validation
    switch (method) {
      case 'windowSize':
        return data.detectionScore >= 2 && (data.heightDiff > 100 || data.widthDiff > 100);
      case 'console':
        return data.accessCount <= 3; // Limit console-based detections
      case 'performance':
        return data.duration > 30; // More conservative threshold
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
    
    // Apply comprehensive inline styles for maximum compatibility
    const protectionStyles = `
      filter: blur(15px) contrast(0.3) brightness(0.4) !important;
      -webkit-filter: blur(15px) contrast(0.3) brightness(0.4) !important;
      -moz-filter: blur(15px) contrast(0.3) brightness(0.4) !important;
      -o-filter: blur(15px) contrast(0.3) brightness(0.4) !important;
      -ms-filter: blur(15px) contrast(0.3) brightness(0.4) !important;
      transition: filter 0.3s ease !important;
      pointer-events: none !important;
      user-select: none !important;
      -webkit-user-select: none !important;
      -moz-user-select: none !important;
      -ms-user-select: none !important;
    `;
    
    body.style.cssText += protectionStyles;
    
    // Additional protection for sensitive elements
    const sensitiveElements = document.querySelectorAll('img, video, canvas, svg');
    sensitiveElements.forEach(element => {
      element.style.cssText += 'filter: blur(25px) contrast(0.1) !important; opacity: 0.2 !important;';
    });
    
    // Show security overlay
    this.showSecurityOverlay();
    
    // Disable interactions
    this.disableInteractions();
  }

  restoreContent() {
    const body = document.body;
    const html = document.documentElement;
    
    // Remove protection classes
    body.classList.remove('devtools-detected', 'security-blur');
    html.classList.remove('devtools-detected');
    body.classList.add('devtools-restored');
    
    // Clear styles
    body.style.filter = '';
    body.style.webkitFilter = '';
    body.style.mozFilter = '';
    body.style.oFilter = '';
    body.style.msFilter = '';
    body.style.pointerEvents = '';
    body.style.userSelect = '';
    body.style.webkitUserSelect = '';
    body.style.mozUserSelect = '';
    
    // Restore sensitive elements
    const sensitiveElements = document.querySelectorAll('img, video, canvas, svg');
    sensitiveElements.forEach(element => {
      element.style.filter = '';
      element.style.opacity = '';
    });
    
    // Remove overlay
    this.removeSecurityOverlay();
    
    // Re-enable interactions
    this.enableInteractions();
    
    // Remove restored class after animation
    setTimeout(() => {
      body.classList.remove('devtools-restored');
    }, 500);
  }

  showSecurityOverlay() {
    if (document.querySelector('.devtools-overlay')) return;
    
    const overlay = document.createElement('div');
    overlay.className = 'devtools-overlay';
    overlay.innerHTML = `
      <div class="devtools-overlay-content">
        <div style="font-size: 48px; margin-bottom: 20px;">🔒</div>
        <div style="font-size: 24px; margin-bottom: 16px;">Content Protected</div>
        <div style="font-size: 16px; opacity: 0.9; line-height: 1.4;">
          Close developer tools to access the content
        </div>
        <div style="font-size: 14px; opacity: 0.7; margin-top: 12px;">
          This content is protected from unauthorized access
        </div>
      </div>
    `;
    
    document.body.appendChild(overlay);
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
