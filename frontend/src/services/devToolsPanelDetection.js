// Advanced DevTools Panel Detection Service
// This service detects DevTools by checking for specific panel behaviors

class DevToolsPanelDetection {
  constructor() {
    this.isActive = false;
    this.devToolsDetected = false;
    this.detectionMethods = [];
    this.intervals = [];
    this.config = {
      CHECK_INTERVAL: 2000,
      MAX_CHECKS: 5
    };
    this.checkCount = 0;
    
    this.init();
  }

  init() {
    if (this.isActive) return;
    this.isActive = true;
    
    console.log('🔒 DevTools Panel Detection: Initializing...');
    
    // Start monitoring
    this.startMonitoring();
    
    // Setup cleanup
    window.addEventListener('beforeunload', () => this.cleanup());
  }

  startMonitoring() {
    const monitorInterval = setInterval(() => {
      this.checkDevToolsPanels();
    }, this.config.CHECK_INTERVAL);
    
    this.intervals.push(monitorInterval);
  }

  checkDevToolsPanels() {
    if (this.checkCount >= this.config.MAX_CHECKS) return;
    
    // Method 1: Console panel detection using RegExp toString
    this.checkConsolePanel();
    
    // Method 2: Elements panel detection
    this.checkElementsPanel();
    
    // Method 3: Network panel detection
    this.checkNetworkPanel();
    
    // Method 4: Performance panel detection
    this.checkPerformancePanel();
    
    // Method 5: Debugger detection
    this.checkDebuggerPanel();
    
    this.checkCount++;
  }

  checkConsolePanel() {
    const devtools = /./;
    let panelOpen = false;
    
    devtools.toString = () => {
      panelOpen = true;
      return 'DevTools Console Panel Detected';
    };
    
    try {
      console.log('%c', devtools);
      if (panelOpen && !this.devToolsDetected) {
        this.triggerDevToolsDetection('console_panel');
      }
    } catch (e) {
      // Ignore errors
    }
  }

  checkElementsPanel() {
    // Create a temporary element to detect inspection
    const testElement = document.createElement('div');
    testElement.id = 'devtools-detector-element';
    testElement.style.display = 'none';
    
    let elementInspected = false;
    
    Object.defineProperty(testElement, 'innerHTML', {
      get: function() {
        elementInspected = true;
        return 'DevTools Elements Panel Detected';
      },
      configurable: true
    });
    
    document.body.appendChild(testElement);
    
    // Check if element was inspected
    setTimeout(() => {
      if (elementInspected && !this.devToolsDetected) {
        this.triggerDevToolsDetection('elements_panel');
      }
      if (testElement.parentNode) {
        testElement.parentNode.removeChild(testElement);
      }
    }, 100);
  }

  checkNetworkPanel() {
    // Detect network monitoring by checking for unusual fetch behavior
    const originalFetch = window.fetch;
    let networkMonitored = false;
    
    window.fetch = function(...args) {
      networkMonitored = true;
      return originalFetch.apply(this, args);
    };
    
    // Make a test fetch
    try {
      fetch('data:text/plain,test').catch(() => {});
    } catch (e) {
      // Ignore errors
    }
    
    // Restore original fetch
    window.fetch = originalFetch;
    
    if (networkMonitored && !this.devToolsDetected) {
      this.triggerDevToolsDetection('network_panel');
    }
  }

  checkPerformancePanel() {
    // Check for performance monitoring
    if (window.performance && window.performance.mark) {
      const startTime = performance.now();
      
      try {
        performance.mark('devtools-test');
        const endTime = performance.now();
        
        // If marking takes unusually long, DevTools might be open
        if (endTime - startTime > 10 && !this.devToolsDetected) {
          this.triggerDevToolsDetection('performance_panel');
        }
        
        performance.clearMarks('devtools-test');
      } catch (e) {
        // Ignore errors
      }
    }
  }

  checkDebuggerPanel() {
    // Check for debugger by measuring execution time
    const startTime = performance.now();
    
    try {
      // This will pause execution if debugger is open
      debugger;
      
      const endTime = performance.now();
      
      // If execution was paused, DevTools debugger is open
      if (endTime - startTime > 100 && !this.devToolsDetected) {
        this.triggerDevToolsDetection('debugger_panel');
      }
    } catch (e) {
      // Ignore errors
    }
  }

  triggerDevToolsDetection(method) {
    if (this.devToolsDetected) return;
    
    this.devToolsDetected = true;
    console.log('🔒 DevTools detected via panel:', method);
    
    // Trigger the main detection system
    if (window.advancedDevToolsDetection) {
      window.advancedDevToolsDetection.devToolsDetected = true;
      window.advancedDevToolsDetection.applyProtection();
    }
    
    // Show warning
    this.showWarning('DevTools panel detected - Content protected');
  }

  showWarning(message) {
    if (document.querySelector('.devtools-panel-warning')) return;
    
    const warning = document.createElement('div');
    warning.className = 'devtools-panel-warning';
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
    }, 4000);
  }

  // Check if DevTools are currently open
  isDevToolsOpen() {
    // Quick check using window dimensions
    const heightDiff = window.outerHeight - window.innerHeight;
    const widthDiff = window.outerWidth - window.innerWidth;
    
    // Only trigger if dimensions suggest DevTools are open
    return (
      heightDiff > 150 ||
      widthDiff > 150 ||
      window.outerWidth < window.innerWidth ||
      window.outerHeight < window.innerHeight
    );
  }

  // Force check all panels
  forceCheck() {
    this.checkCount = 0;
    this.checkDevToolsPanels();
    return {
      detected: this.devToolsDetected,
      dimensionsCheck: this.isDevToolsOpen()
    };
  }

  // Reset detection state
  reset() {
    this.devToolsDetected = false;
    this.checkCount = 0;
    console.log('🔒 DevTools Panel Detection: Reset');
  }

  // Disable detection
  disable() {
    this.isActive = false;
    this.cleanup();
    console.log('🔒 DevTools Panel Detection: Disabled');
  }

  // Cleanup
  cleanup() {
    this.intervals.forEach(interval => clearInterval(interval));
    this.intervals = [];
  }
}

// Create and export singleton instance
const devToolsPanelDetection = new DevToolsPanelDetection();

// Make available globally for testing
if (typeof window !== 'undefined') {
  window.devToolsPanelDetection = devToolsPanelDetection;
}

export default devToolsPanelDetection;
