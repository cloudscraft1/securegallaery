// DevTools Detection Test Utilities
// Use these functions to test and debug the DevTools detection system

export const DevToolsTestUtils = {
  // Get current detection status
  getStatus() {
    if (window.advancedDevToolsDebug) {
      return window.advancedDevToolsDebug.getStatus();
    }
    return { error: 'Advanced DevTools Detection not available' };
  },

  // Force a detection check
  forceCheck() {
    if (window.advancedDevToolsDebug) {
      return window.advancedDevToolsDebug.forceCheck();
    }
    return { error: 'Advanced DevTools Detection not available' };
  },

  // Get current window dimensions
  getDimensions() {
    return {
      outerWidth: window.outerWidth,
      outerHeight: window.outerHeight,
      innerWidth: window.innerWidth,
      innerHeight: window.innerHeight,
      heightDiff: window.outerHeight - window.innerHeight,
      widthDiff: window.outerWidth - window.innerWidth,
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      availWidth: window.screen.availWidth,
      availHeight: window.screen.availHeight,
      devicePixelRatio: window.devicePixelRatio || 1
    };
  },

  // Check if dimensions suggest DevTools are open
  checkDimensions() {
    const dims = this.getDimensions();
    const status = this.getStatus();
    
    let analysis = {
      dimensions: dims,
      status: status,
      analysis: {}
    };

    if (status.thresholds) {
      analysis.analysis = {
        heightExceeded: dims.heightDiff > status.thresholds.height,
        widthExceeded: dims.widthDiff > status.thresholds.width,
        combinedExceeded: dims.heightDiff > status.thresholds.combined && dims.widthDiff > status.thresholds.combined,
        impossibleDimensions: dims.outerWidth < dims.innerWidth || dims.outerHeight < dims.innerHeight,
        smallScreenAdjustment: {
          height: dims.outerWidth < 800 && dims.heightDiff > status.thresholds.small,
          width: dims.outerHeight < 600 && dims.widthDiff > status.thresholds.small
        }
      };
    }

    return analysis;
  },

  // Test all detection methods
  testAllMethods() {
    console.log('🔧 Testing DevTools Detection Methods...');
    
    const results = {
      dimensions: this.getDimensions(),
      status: this.getStatus(),
      analysis: this.checkDimensions()
    };

    console.log('📊 Detection Results:', results);
    
    return results;
  },

  // Monitor dimensions continuously
  startMonitoring(interval = 1000) {
    console.log('🔄 Starting dimension monitoring...');
    
    const monitoringInterval = setInterval(() => {
      const dims = this.getDimensions();
      const status = this.getStatus();
      
      console.log('📏 Current dimensions:', {
        heightDiff: dims.heightDiff,
        widthDiff: dims.widthDiff,
        detected: status.devToolsDetected,
        consecutiveDetections: status.detectionState?.consecutiveDetections || 0,
        consecutiveNormalStates: status.detectionState?.consecutiveNormalStates || 0
      });
    }, interval);

    // Return function to stop monitoring
    return () => {
      clearInterval(monitoringInterval);
      console.log('⏹️ Dimension monitoring stopped');
    };
  },

  // Simulate DevTools detection
  simulateDetection() {
    console.log('🎭 Simulating DevTools detection...');
    
    // Create a temporary element to trigger detection
    const testElement = document.createElement('div');
    testElement.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(255, 0, 0, 0.1);
      z-index: 999999;
      pointer-events: none;
    `;
    
    document.body.appendChild(testElement);
    
    // Apply test blur
    document.body.style.filter = 'blur(5px)';
    
    setTimeout(() => {
      document.body.removeChild(testElement);
      document.body.style.filter = '';
      console.log('🎭 Simulation ended');
    }, 3000);
  },

  // Disable DevTools detection
  disable() {
    if (window.advancedDevToolsDebug) {
      window.advancedDevToolsDebug.disable();
      console.log('🔒 DevTools detection disabled');
    }
  },

  // Get help text
  getHelp() {
    return `
DevTools Detection Test Utilities:

1. DevToolsTestUtils.getStatus() - Get current detection status
2. DevToolsTestUtils.forceCheck() - Force a detection check
3. DevToolsTestUtils.getDimensions() - Get window dimensions
4. DevToolsTestUtils.checkDimensions() - Analyze dimensions for DevTools
5. DevToolsTestUtils.testAllMethods() - Test all detection methods
6. DevToolsTestUtils.startMonitoring() - Start continuous monitoring
7. DevToolsTestUtils.simulateDetection() - Simulate DevTools detection
8. DevToolsTestUtils.disable() - Disable DevTools detection

Usage in browser console:
> DevToolsTestUtils.getStatus()
> DevToolsTestUtils.testAllMethods()
> const stopMonitoring = DevToolsTestUtils.startMonitoring()
> stopMonitoring() // To stop monitoring
    `;
  }
};

// Make utilities available globally for testing
if (typeof window !== 'undefined') {
  window.DevToolsTestUtils = DevToolsTestUtils;
  console.log('🔧 DevTools Test Utilities loaded. Type "DevToolsTestUtils.getHelp()" for help.');
}

export default DevToolsTestUtils;
