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

  // Prevent developer tools only
  preventDevTools() {
    let checkCount = 0;

    const checkDevTools = () => {
      const threshold = 160;
      const heightDiff = window.outerHeight - window.innerHeight;
      const widthDiff = window.outerWidth - window.innerWidth;

      if (heightDiff > threshold || widthDiff > threshold) {
        checkCount++;
        if (checkCount > 3 && !this.devToolsDetected) {
          this.devToolsDetected = true;
          this.handleDevToolsDetection();
          this.reportViolation('Developer tools detected');
        }
      } else {
        checkCount = 0;
        if (this.devToolsDetected) {
          this.devToolsDetected = false;
          this.restoreContent();
        }
      }
    };

    // Check every 2 seconds (less aggressive)
    setInterval(checkDevTools, 2000);

    // Block F12 key only
    document.addEventListener('keydown', (e) => {
      if (e.key === 'F12') {
        e.preventDefault();
        this.showWarning('Developer tools access is disabled');
        this.reportViolation('F12 key blocked');
        return false;
      }
    });
  }

  // Handle developer tools detection
  handleDevToolsDetection() {
    this.showWarning('Developer tools detected - Content protected');
    
    // Only blur images, not entire page
    const images = document.querySelectorAll('canvas, img');
    images.forEach(img => {
      img.style.filter = 'blur(15px)';
      img.style.opacity = '0.5';
    });
  }

  // Restore content when dev tools are closed
  restoreContent() {
    const images = document.querySelectorAll('canvas, img');
    images.forEach(img => {
      img.style.filter = 'none';
      img.style.opacity = '1';
    });
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
