// Minimal Security Service - Only Screenshot and DevTools Prevention
class MinimalSecurityService {
  constructor() {
    this.isActive = false;
    this.violations = [];
    this.devToolsDetected = false;
    this.init();
  }

  init() {
    if (this.isActive) return;
    this.isActive = true;
    
    console.log('🔒 VaultSecure: Minimal security protection activated');
    
    // Only initialize screenshot and devtools prevention
    this.preventScreenshots();
    this.preventDevTools();
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

  // Balanced developer tools prevention - only block devtools, keep site working
  preventDevTools() {
    let devToolsCheckCount = 0;

    // Enhanced devtools detection with multiple methods
    const checkDevTools = () => {
      const threshold = 100; // More sensitive threshold
      const heightDiff = window.outerHeight - window.innerHeight;
      const widthDiff = window.outerWidth - window.innerWidth;

      // Multiple detection conditions
      const devToolsOpen = 
        heightDiff > threshold || 
        widthDiff > threshold ||
        (window.outerWidth - window.innerWidth > 160) ||
        (window.outerHeight - window.innerHeight > 160);

      if (devToolsOpen) {
        devToolsCheckCount++;
        console.log('🔒 DevTools check', devToolsCheckCount, 'Height diff:', heightDiff, 'Width diff:', widthDiff);
        
        if (devToolsCheckCount > 1 && !this.devToolsDetected) {
          console.log('🔒 DevTools detected! Triggering protection...');
          this.devToolsDetected = true;
          this.handleDevToolsDetection();
          this.reportViolation('Developer tools detected');
        }
      } else {
        devToolsCheckCount = 0;
        if (this.devToolsDetected) {
          console.log('🔒 DevTools closed! Restoring content...');
          this.devToolsDetected = false;
          this.restoreContent();
        }
      }
    };

    // Check every 500ms (more frequent for better detection)
    setInterval(checkDevTools, 500);

    // Additional detection method using element inspection
    const detectDevToolsAdvanced = () => {
      let devtools = false;
      const element = document.createElement('div');
      element.style.fontSize = '0';
      
      Object.defineProperty(element, 'id', {
        get: function() {
          devtools = true;
          return 'devtools-detection';
        },
        configurable: true
      });
      
      // This will trigger the getter if devtools are open
      console.log('%c', 'color: transparent', element);
      
      if (devtools && !this.devToolsDetected) {
        console.log('🔒 DevTools detected via advanced method!');
        this.devToolsDetected = true;
        this.handleDevToolsDetection();
        this.reportViolation('Developer tools detected (advanced)');
      }
    };
    
    // Check with advanced method every 2 seconds
    setInterval(() => {
      try {
        detectDevToolsAdvanced();
      } catch (e) {
        // Ignore errors
      }
    }, 2000);

    // Only block ESSENTIAL developer tool shortcuts (don't break normal functionality)
    document.addEventListener('keydown', (e) => {
      // Block F12 key
      if (e.key === 'F12') {
        e.preventDefault();
        this.showWarning('Developer tools access is disabled');
        this.reportViolation('F12 key blocked');
        return false;
      }
      
      // Block Ctrl+Shift+I (Inspect) - but allow normal Ctrl+I
      if (e.ctrlKey && e.shiftKey && e.key === 'I') {
        e.preventDefault();
        this.showWarning('Developer tools access is disabled');
        this.reportViolation('Ctrl+Shift+I blocked');
        return false;
      }
      
      // Block Ctrl+Shift+J (Console) - but allow normal Ctrl+J
      if (e.ctrlKey && e.shiftKey && e.key === 'J') {
        e.preventDefault();
        this.showWarning('Developer tools access is disabled');
        this.reportViolation('Ctrl+Shift+J blocked');
        return false;
      }
      
      // Block Ctrl+Shift+C (Inspect Element) - but allow normal Ctrl+C
      if (e.ctrlKey && e.shiftKey && e.key === 'C') {
        e.preventDefault();
        this.showWarning('Developer tools access is disabled');
        this.reportViolation('Ctrl+Shift+C blocked');
        return false;
      }
      
      // Block Ctrl+U (View Source) - but allow other Ctrl+U usage
      if (e.ctrlKey && e.key === 'u') {
        e.preventDefault();
        this.showWarning('View source is disabled');
        this.reportViolation('Ctrl+U blocked');
        return false;
      }
    });

    // Enhanced debugger detection
    let debuggerCheckCount = 0;
    const checkDebugger = () => {
      try {
        const start = performance.now();
        debugger;
        const end = performance.now();
        
        console.log('🔒 Debugger check - time diff:', end - start, 'ms');
        
        if (end - start > 100) {
          debuggerCheckCount++;
          console.log('🔒 Debugger detected! Count:', debuggerCheckCount);
          
          if (debuggerCheckCount > 1 && !this.devToolsDetected) {
            console.log('🔒 DevTools detected via debugger!');
            this.devToolsDetected = true;
            this.handleDevToolsDetection();
            this.reportViolation('Debugger detected');
          }
        } else {
          debuggerCheckCount = 0;
        }
      } catch (e) {
        // Ignore errors
      }
    };
    
    // Check debugger every 2 seconds (more frequent)
    setInterval(checkDebugger, 2000);
    
    // Force detection on first load
    setTimeout(() => {
      console.log('🔒 Running initial detection checks...');
      checkDevTools();
      checkDebugger();
      detectDevToolsAdvanced();
    }, 1000);
    
    // Test detection immediately on page load
    const testDetection = () => {
      const heightDiff = window.outerHeight - window.innerHeight;
      const widthDiff = window.outerWidth - window.innerWidth;
      console.log('🔒 Initial detection test - Height diff:', heightDiff, 'Width diff:', widthDiff);
      
      if (heightDiff > 100 || widthDiff > 100) {
        console.log('🔒 DevTools may already be open!');
        this.devToolsDetected = true;
        this.handleDevToolsDetection();
        this.reportViolation('Developer tools detected on load');
      }
    };
    
    // Run test after a short delay
    setTimeout(testDetection, 500);
  }

  // Handle developer tools detection - balanced approach
  handleDevToolsDetection() {
    this.showWarning('Developer tools detected - Content protected');
    
    console.log('🔒 DevTools detected - applying image protection');
    
    // Only blur actual images and canvases, not entire site
    const imageElements = document.querySelectorAll('canvas, img');
    const galleryItems = document.querySelectorAll('.gallery-item');
    
    console.log('🔒 Found', imageElements.length, 'image elements and', galleryItems.length, 'gallery items');
    
    // Blur actual image elements
    imageElements.forEach((img, index) => {
      console.log('🔒 Blurring image element', index, img.tagName);
      img.style.filter = 'blur(20px)';
      img.style.opacity = '0.4';
      img.style.transition = 'all 0.5s ease';
    });
    
    // Blur gallery items (containing images)
    galleryItems.forEach((item, index) => {
      console.log('🔒 Blurring gallery item', index, item.className);
      item.style.filter = 'blur(20px)';
      item.style.opacity = '0.4';
      item.style.transition = 'all 0.5s ease';
    });
    
    // Add simple security overlay only on gallery area
    this.showSecurityOverlay();
  }

  // Restore content when dev tools are closed
  restoreContent() {
    console.log('🔒 DevTools closed - restoring content');
    
    // Restore actual image elements
    const imageElements = document.querySelectorAll('canvas, img');
    const galleryItems = document.querySelectorAll('.gallery-item');
    
    console.log('🔒 Restoring', imageElements.length, 'image elements and', galleryItems.length, 'gallery items');
    
    imageElements.forEach((img, index) => {
      console.log('🔒 Restoring image element', index, img.tagName);
      img.style.filter = 'none';
      img.style.opacity = '1';
      img.style.transition = 'all 0.5s ease';
    });
    
    galleryItems.forEach((item, index) => {
      console.log('🔒 Restoring gallery item', index, item.className);
      item.style.filter = 'none';
      item.style.opacity = '1';
      item.style.transition = 'all 0.5s ease';
    });
    
    // Remove security overlay
    this.removeSecurityOverlay();
  }

  // Show security overlay - only on gallery area
  showSecurityOverlay() {
    // Don't add multiple overlays
    if (document.querySelector('.devtools-overlay')) return;

    // Find the gallery area
    const galleryArea = document.querySelector('.gallery-grid') || document.querySelector('.gallery-item')?.parentElement;
    if (!galleryArea) return;

    const overlay = document.createElement('div');
    overlay.className = 'devtools-overlay';
    overlay.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.7);
      z-index: 999998;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 18px;
      font-weight: bold;
      font-family: Arial, sans-serif;
      pointer-events: none;
      border-radius: 10px;
    `;
    
    overlay.innerHTML = `
      <div style="text-align: center; padding: 20px; background: rgba(0, 0, 0, 0.8); border-radius: 10px;">
        <div style="font-size: 24px; margin-bottom: 10px;">🔒</div>
        <div style="margin-bottom: 8px;">Images Protected</div>
        <div style="font-size: 12px; opacity: 0.9;">
          Close developer tools to view images
        </div>
      </div>
    `;
    
    // Position relative to gallery area
    galleryArea.style.position = 'relative';
    galleryArea.appendChild(overlay);
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
const minimalSecurity = new MinimalSecurityService();
export default minimalSecurity;
