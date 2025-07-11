// Test script for devtools detection
// Run this in the browser console to test the functionality

console.log('🔧 Testing DevTools Detection...');

// Import the security service
import comprehensiveSecurity from './services/minimalSecurity.js';

// Test functions
window.testDevToolsDetection = {
  // Check current state
  checkState: () => {
    console.log('Current DevTools State:', {
      detected: comprehensiveSecurity.devToolsDetected,
      outerHeight: window.outerHeight,
      innerHeight: window.innerHeight,
      outerWidth: window.outerWidth,
      innerWidth: window.innerWidth,
      heightDiff: window.outerHeight - window.innerHeight,
      widthDiff: window.outerWidth - window.innerWidth
    });
  },
  
  // Force check
  forceCheck: () => {
    comprehensiveSecurity.forceCheckDevTools();
  },
  
  // Manually trigger detection
  triggerDetection: () => {
    comprehensiveSecurity.triggerDevToolsDetection('manual_test');
  },
  
  // Manually trigger close
  triggerClose: () => {
    comprehensiveSecurity.triggerDevToolsClose();
  },
  
  // Get violations
  getViolations: () => {
    return comprehensiveSecurity.getViolations();
  },
  
  // Clean up
  cleanup: () => {
    comprehensiveSecurity.cleanup();
  }
};

console.log('🔧 Test functions available:', Object.keys(window.testDevToolsDetection));
console.log('Usage: testDevToolsDetection.checkState()');
