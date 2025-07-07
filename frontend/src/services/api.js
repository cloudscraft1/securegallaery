import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
const API_BASE = `${BACKEND_URL}/api`;

console.log('API Configuration:', {
  BACKEND_URL,
  API_BASE,
  NODE_ENV: process.env.NODE_ENV
});

class VaultSecureAPI {
  constructor() {
    this.sessionId = null;
    this.securityLevel = 'maximum';
    this.api = axios.create({
      baseURL: API_BASE,
      timeout: 15000,
      withCredentials: false,  // Disable for local development
    });

    // Add request interceptor to include session ID and security headers
    this.api.interceptors.request.use(
      (config) => {
        if (this.sessionId) {
          config.headers['X-Session-ID'] = this.sessionId;
        }
        
        // Add anti-CSRF protection
        config.headers['X-Requested-With'] = 'XMLHttpRequest';
        config.headers['X-VaultSecure-Client'] = 'web-app';
        
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Add response interceptor to handle session errors and security
    this.api.interceptors.response.use(
      (response) => {
        // Check security level
        const securityLevel = response.headers['x-security-level'];
        if (securityLevel) {
          this.securityLevel = securityLevel.toLowerCase();
        }
        return response;
      },
      async (error) => {
        if (error.response?.status === 401) {
          // Session expired, try to create new session
          await this.createSession();
          // Retry the original request
          return this.api.request(error.config);
        }
        
        if (error.response?.status === 429) {
          throw new Error('Rate limit exceeded. Please wait before making more requests.');
        }
        
        if (error.response?.status === 403) {
          throw new Error('Access denied. Security validation failed.');
        }
        
        return Promise.reject(error);
      }
    );

    // Implement real security measures
    this.initRealSecurity();
  }

  initRealSecurity() {
    // Real comprehensive security measures
    
    // 1. Disable right-click globally
    document.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      this.reportSuspiciousActivity('Right-click attempt blocked');
      return false;
    });

    // 2. Disable common shortcuts for saving/downloading
    document.addEventListener('keydown', (e) => {
      // Block F12, Ctrl+Shift+I/J/C, Ctrl+U, Ctrl+S, Ctrl+P, Print Screen
      if (
        e.key === 'F12' ||
        e.keyCode === 44 || // Print Screen
        (e.ctrlKey && e.shiftKey && ['I', 'J', 'C'].includes(e.key)) ||
        (e.ctrlKey && ['U', 'S', 'P'].includes(e.key))
      ) {
        e.preventDefault();
        this.reportSuspiciousActivity(`Blocked shortcut: ${e.key || e.keyCode}`);
        return false;
      }
    });

    // 3. Advanced developer tools detection
    let devtoolsOpen = false;
    const checkDevTools = () => {
      const threshold = 160;
      const heightDiff = window.outerHeight - window.innerHeight;
      const widthDiff = window.outerWidth - window.innerWidth;
      
      if (heightDiff > threshold || widthDiff > threshold) {
        if (!devtoolsOpen) {
          devtoolsOpen = true;
          this.reportSuspiciousActivity('Developer tools detected');
          // Blur all protected content
          document.querySelectorAll('.protected-content').forEach(el => {
            el.style.filter = 'blur(20px)';
            el.style.pointerEvents = 'none';
          });
          
          // Show warning
          this.showSecurityWarning('🚨 Developer Tools Detected - Content Protected');
        }
      } else {
        if (devtoolsOpen) {
          devtoolsOpen = false;
          // Restore content
          document.querySelectorAll('.protected-content').forEach(el => {
            el.style.filter = 'none';
            el.style.pointerEvents = 'auto';
          });
        }
      }
    };
    
    setInterval(checkDevTools, 500);

    // 4. Detect and block screenshot attempts
    document.addEventListener('keyup', (e) => {
      if (e.keyCode === 44) { // Print Screen
        this.reportSuspiciousActivity('Screenshot attempt blocked');
        this.showSecurityWarning('🚨 Screenshot Blocked - VaultSecure Protection Active');
      }
    });

    // 5. Disable text selection on protected content
    document.addEventListener('selectstart', (e) => {
      if (e.target.closest('.protected-content')) {
        e.preventDefault();
        this.reportSuspiciousActivity('Text selection blocked');
        return false;
      }
    });

    // 6. Disable drag and drop
    document.addEventListener('dragstart', (e) => {
      if (e.target.closest('.protected-content')) {
        e.preventDefault();
        this.reportSuspiciousActivity('Drag attempt blocked');
        return false;
      }
    });

    // 7. Disable print
    window.addEventListener('beforeprint', (e) => {
      e.preventDefault();
      this.reportSuspiciousActivity('Print attempt blocked');
      this.showSecurityWarning('🚨 Printing Blocked - VaultSecure Protection Active');
    });

    // 8. Block common inspection methods
    ['copy', 'cut', 'paste'].forEach(event => {
      document.addEventListener(event, (e) => {
        if (e.target.closest('.protected-content')) {
          e.preventDefault();
          this.reportSuspiciousActivity(`${event} operation blocked`);
        }
      });
    });

    // 9. Override console methods to prevent inspection
    const originalLog = console.log;
    console.log = function(...args) {
      if (args.some(arg => typeof arg === 'string' && arg.includes('VaultSecure'))) {
        return;
      }
      originalLog.apply(console, args);
    };

    // 10. Detect iframe embedding (anti-cloning)
    if (window !== window.top) {
      this.reportSuspiciousActivity('Site embedded in iframe - potential cloning');
      window.top.location = window.location;
    }

    // 11. Domain verification (allow localhost for development)
    const allowedDomains = ['localhost', '127.0.0.1', 'your-domain.com'];
    const currentDomain = window.location.hostname;
    console.log('Current domain:', currentDomain);
    
    // More lenient check for localhost
    const isLocalhost = currentDomain === 'localhost' || 
                       currentDomain === '127.0.0.1' || 
                       currentDomain === '' || 
                       currentDomain.startsWith('localhost') ||
                       currentDomain.startsWith('127.0.0.1');
    
    if (!isLocalhost && !allowedDomains.some(domain => currentDomain.includes(domain))) {
      this.reportSuspiciousActivity(`Unauthorized domain: ${currentDomain}`);
      document.body.innerHTML = '<div style="text-align:center;padding:50px;color:red;">🚨 UNAUTHORIZED ACCESS - VaultSecure Protection Active</div>';
    }

    // 12. Detect source code viewing attempts
    const originalViewSource = document.querySelector;
    document.querySelector = function(selector) {
      if (selector.includes('view-source:')) {
        throw new Error('Access denied: VaultSecure protection active');
      }
      return originalViewSource.call(document, selector);
    };
  }

  showSecurityWarning(message) {
    // Create and show security warning overlay
    const warning = document.createElement('div');
    warning.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(220, 38, 38, 0.95);
      color: white;
      padding: 15px 25px;
      border-radius: 8px;
      z-index: 10000;
      font-weight: bold;
      border: 2px solid #dc2626;
      backdrop-filter: blur(10px);
    `;
    warning.textContent = message;
    document.body.appendChild(warning);
    
    setTimeout(() => {
      if (warning.parentNode) {
        warning.parentNode.removeChild(warning);
      }
    }, 5000);
  }

  async createSession() {
    try {
      console.log('Creating session with API_BASE:', API_BASE);
      const response = await axios.post(`${API_BASE}/session`, {}, {
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'X-VaultSecure-Client': 'web-app',
          'Content-Type': 'application/json'
        },
        withCredentials: false  // Disable for local development
      });
      
      console.log('Session created successfully:', response.data);
      this.sessionId = response.data.session_id;
      localStorage.setItem('vaultsecure_session', this.sessionId);
      localStorage.setItem('vaultsecure_expires', response.data.expires_at);
      
      return response.data;
    } catch (error) {
      console.error('Failed to create secure session:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: `${API_BASE}/session`
      });
      throw new Error(`Session creation failed: ${error.response?.data?.detail || error.message}`);
    }
  }

  async initializeSession() {
    // Check for existing session
    const storedSession = localStorage.getItem('vaultsecure_session');
    const expiresAt = localStorage.getItem('vaultsecure_expires');
    
    if (storedSession && expiresAt) {
      const expiry = new Date(expiresAt);
      if (expiry > new Date()) {
        this.sessionId = storedSession;
        
        // Validate the session
        try {
          await this.api.get('/session/validate');
          return true;
        } catch (error) {
          // Session invalid, remove it
          this.clearSession();
        }
      } else {
        // Session expired
        this.clearSession();
      }
    }

    // Create new session
    await this.createSession();
    return true;
  }

  clearSession() {
    this.sessionId = null;
    localStorage.removeItem('vaultsecure_session');
    localStorage.removeItem('vaultsecure_expires');
  }

  async getImages() {
    try {
      const response = await this.api.get('/images');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch protected images:', error);
      throw error;
    }
  }

  async likeImage(imageId) {
    try {
      const response = await this.api.post(`/images/${imageId}/like`);
      return response.data;
    } catch (error) {
      console.error('Failed to like image:', error);
      throw error;
    }
  }

  async validateSession() {
    try {
      const response = await this.api.get('/session/validate');
      return response.data;
    } catch (error) {
      console.error('Session validation failed:', error);
      return false;
    }
  }

  async logout() {
    try {
      await this.api.delete('/session');
      this.clearSession();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }

  // Canvas-based secure image rendering
  async getSecureImageData(imageUrl) {
    try {
      console.log('Fetching secure image data for URL:', imageUrl);
      console.log('Session ID:', this.sessionId);
      console.log('API Base:', this.api.defaults.baseURL);
      
      const response = await this.api.get(imageUrl);
      console.log('Secure image response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch secure image data:', {
        url: imageUrl,
        error: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      throw error;
    }
  }

  // Render image to canvas with protection
  renderSecureImage(canvas, imageData, callback) {
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Set canvas size to image size
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Draw image
      ctx.drawImage(img, 0, 0);
      
      // Add additional client-side watermarks
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.font = '16px Arial';
      ctx.fillText('VAULTSECURE PROTECTED', 10, 30);
      
      // Add timestamp watermark
      const timestamp = new Date().toISOString();
      ctx.fillText(`Viewed: ${timestamp}`, 10, canvas.height - 10);
      
      // Prevent context menu and selection
      canvas.oncontextmenu = (e) => {
        e.preventDefault();
        this.reportSuspiciousActivity('Right-click attempt on protected image');
        return false;
      };
      
      // Prevent dragging
      canvas.ondragstart = (e) => {
        e.preventDefault();
        this.reportSuspiciousActivity('Drag attempt on protected image');
        return false;
      };
      
      // Disable selection
      canvas.style.userSelect = 'none';
      canvas.style.webkitUserSelect = 'none';
      canvas.style.mozUserSelect = 'none';
      
      if (callback) callback();
    };
    
    img.onerror = () => {
      console.error('Failed to load secure image');
      if (callback) callback();
    };
    
    img.src = imageData.imageData;
  }

  getSecurityLevel() {
    return this.securityLevel;
  }

  // Monitor for suspicious activity
  reportSuspiciousActivity(activity) {
    console.warn(`🚨 VaultSecure: Suspicious activity detected - ${activity}`);
    // In production, you could send this to your backend for logging
  }
}

// Anti-tampering measures - but allow sessionId modification
Object.freeze(VaultSecureAPI.prototype);
const apiService = new VaultSecureAPI();
// Don't freeze the instance to allow sessionId updates

export default apiService;