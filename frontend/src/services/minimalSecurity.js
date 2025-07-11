// Basic Security Service - Screenshot Protection Only
class BasicSecurityService {
  constructor() {
    this.isActive = false;
    this.violations = [];
    this.sessionId = this.generateSessionId();
    this.init();
  }

  init() {
    if (this.isActive) return;
    this.isActive = true;
    
    console.log('🔒 VaultSecure: Basic security protection activated');
    
    // Initialize screenshot protection only
    this.preventScreenshots();
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
const basicSecurity = new BasicSecurityService();

export default basicSecurity;
