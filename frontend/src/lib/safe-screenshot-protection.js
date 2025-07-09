/**
 * Safe Screenshot Protection System
 * Provides screenshot protection without breaking app functionality
 */

class SafeScreenshotProtection {
  constructor() {
    this.isActive = false;
    this.warningCallback = null;
    
    // Bind methods
    this.handleKeyboardShortcuts = this.handleKeyboardShortcuts.bind(this);
    this.preventContextMenu = this.preventContextMenu.bind(this);
    this.preventPrint = this.preventPrint.bind(this);
  }

  /**
   * Initialize safe screenshot protection
   */
  initialize(warningCallback = null) {
    try {
      this.warningCallback = warningCallback;
      this.isActive = true;

// Only initialize if we're in a browser environment
      if (typeof window === 'undefined' || typeof document === 'undefined') {
        return;
      }

      // Block only critical screenshot shortcuts
      document.addEventListener('keydown', this.handleKeyboardShortcuts, true);
      
      // Right-click context menu available; only block copy actions
      const copyHandler = event => {
        if (event.target && (event.target.classList.contains('protected-content') || event.target.closest('.protected-content'))) {
          event.preventDefault();
          this.reportSecurityEvent('Copy operation blocked on protected content');
          this.showWarning('Copy operation blocked!');
        }
      }
      document.addEventListener('copy', copyHandler, false);
      
      // Maintain reduced print prevention (for sensitive cases)
      window.addEventListener('beforeprint', this.preventPrint);
      
      // 4. Screen recording/capture detection (safe version)
      this.detectScreenCapture();
      
      // 5. CSS-based protection
      this.applyCSSProtection();

      console.log('🛡️ Safe Screenshot Protection Activated');
    } catch (error) {
      console.warn('Screenshot protection initialization failed:', error);
    }
  }

  /**
   * Block critical keyboard shortcuts for screenshots
   */
  handleKeyboardShortcuts(event) {
    try {
      // Only block when user is actively on protected content
      if (!event.target.closest('.protected-content')) {
        return true; // Allow all shortcuts on non-protected content
      }

      const forbidden = [
        // Only block the most critical screenshot shortcuts
        { key: 'PrintScreen', ctrl: false, alt: false, shift: false },
        { key: 'Print', ctrl: false, alt: false, shift: false },
        // Alt+PrintScreen (active window)
        { key: 'PrintScreen', ctrl: false, alt: true, shift: false },
        { key: 'Print', ctrl: false, alt: true, shift: false },
      ];

      for (const combo of forbidden) {
        if (event.key === combo.key &&
            event.ctrlKey === combo.ctrl &&
            event.altKey === combo.alt &&
            event.shiftKey === combo.shift) {
          
          event.preventDefault();
          event.stopPropagation();
          
          this.reportSecurityEvent(`Blocked screenshot shortcut: ${this.getShortcutName(combo)}`);
          this.showWarning('Screenshot attempt blocked!');
          
          return false;
        }
      }
    } catch (error) {
      console.warn('Error in keyboard shortcut handler:', error);
    }
  }

  /**
   * Prevent right-click context menu on protected content only
   */
  preventContextMenu(event) {
    try {
      // Only block right-click on protected content
      const target = event.target;
      if (target && (target.classList.contains('protected-content') || 
                     target.closest('.protected-content'))) {
        event.preventDefault();
        event.stopPropagation();
        this.reportSecurityEvent('Right-click blocked on protected content');
        return false;
      }
      // Allow right-click on non-protected content
      return true;
    } catch (error) {
      console.warn('Error in context menu handler:', error);
      return true;
    }
  }

  /**
   * Prevent printing
   */
  preventPrint(event) {
    try {
      event.preventDefault();
      event.stopPropagation();
      this.reportSecurityEvent('Print attempt blocked');
      this.showWarning('Printing blocked for security!');
      return false;
    } catch (error) {
      console.warn('Error in print handler:', error);
      return false;
    }
  }

  /**
   * Detect screen recording/capture attempts (safe version)
   */
  detectScreenCapture() {
    try {
      // Use Media Capture API to detect screen sharing
      if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
        // Monitor for screen capture requests
        const originalGetDisplayMedia = navigator.mediaDevices.getDisplayMedia;
        navigator.mediaDevices.getDisplayMedia = () => {
          this.reportSecurityEvent('Screen capture API called - BLOCKED');
          this.showWarning('Screen recording blocked!');
          throw new Error('Screen capture not allowed');
        };
      }

      // Monitor for getUserMedia with screen capture
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const originalGetUserMedia = navigator.mediaDevices.getUserMedia;
        navigator.mediaDevices.getUserMedia = (constraints) => {
          if (constraints && constraints.video && 
              (constraints.video.mediaSource === 'screen' || 
               constraints.video.chromeMediaSource === 'screen')) {
            this.reportSecurityEvent('Screen capture via getUserMedia - BLOCKED');
            this.showWarning('Screen capture blocked!');
            throw new Error('Screen capture not allowed');
          }
          return originalGetUserMedia.call(navigator.mediaDevices, constraints);
        };
      }
    } catch (error) {
      console.warn('Error setting up screen capture detection:', error);
    }
  }

  /**
   * Apply CSS-based protection
   */
  applyCSSProtection() {
    try {
      const style = document.createElement('style');
      style.textContent = `
        /* Prevent selection and highlighting on protected content */
        .protected-content {
          -webkit-user-select: none !important;
          -moz-user-select: none !important;
          -ms-user-select: none !important;
          user-select: none !important;
          -webkit-touch-callout: none !important;
          -webkit-tap-highlight-color: transparent !important;
        }
        
        /* Disable print styles */
        @media print {
          .protected-content {
            display: none !important;
          }
          .protected-content::after {
            content: "SCREENSHOT/PRINT BLOCKED - VAULTSECURE PROTECTED CONTENT" !important;
            display: block !important;
            color: red !important;
            font-size: 24px !important;
            text-align: center !important;
            padding: 50px !important;
          }
        }
      `;
      document.head.appendChild(style);
    } catch (error) {
      console.warn('Error applying CSS protection:', error);
    }
  }

  /**
   * Show warning message
   */
  showWarning(message) {
    try {
      if (this.warningCallback) {
        this.warningCallback(message);
      } else {
        console.warn('🛡️ SECURITY:', message);
      }
    } catch (error) {
      console.warn('Error showing warning:', error);
    }
  }

  /**
   * Report security event
   */
  reportSecurityEvent(event) {
    try {
      console.warn(`🛡️ SECURITY EVENT: ${event}`);
      
      // Could send to analytics/logging service
      if (window.apiService && window.apiService.reportSuspiciousActivity) {
        window.apiService.reportSuspiciousActivity(event);
      }
    } catch (error) {
      console.warn('Error reporting security event:', error);
    }
  }

  /**
   * Get shortcut name for logging
   */
  getShortcutName(combo) {
    let name = '';
    if (combo.ctrl) name += 'Ctrl+';
    if (combo.alt) name += 'Alt+';
    if (combo.shift) name += 'Shift+';
    name += combo.key;
    return name;
  }

  /**
   * Protect specific element
   */
  protectElement(element) {
    try {
      if (element) {
        element.classList.add('protected-content');
        
        // Additional protection
        element.style.webkitUserSelect = 'none';
        element.style.mozUserSelect = 'none';
        element.style.msUserSelect = 'none';
        element.style.userSelect = 'none';
        element.draggable = false;
      }
    } catch (error) {
      console.warn('Error protecting element:', error);
    }
  }

  /**
   * Destroy protection
   */
  destroy() {
    try {
      this.isActive = false;
      
      // Remove event listeners
      document.removeEventListener('keydown', this.handleKeyboardShortcuts, true);
      document.removeEventListener('contextmenu', this.preventContextMenu, false);
      window.removeEventListener('beforeprint', this.preventPrint);
    } catch (error) {
      console.warn('Error destroying screenshot protection:', error);
    }
  }
}

// Export singleton instance
const safeScreenshotProtection = new SafeScreenshotProtection();
export default safeScreenshotProtection;
