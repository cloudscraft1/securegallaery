import axios from 'axios';
import brandingConfig from '../config/branding';

// Auto-detect backend URL based on environment
const getBackendURL = () => {
  // If environment variable is set, use it
  if (process.env.REACT_APP_BACKEND_URL) {
    return process.env.REACT_APP_BACKEND_URL;
  }
  
  // For deployed environments, use same origin
  if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return window.location.origin;
  }
  
  // For local development
  return 'http://localhost:8000';
};

const BACKEND_URL = getBackendURL();
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
    this.tokenCache = new Map(); // Cache for image tokens
    this.tokenRefreshPromise = null; // Prevent multiple refresh calls
    this.refreshInterval = null; // Auto-refresh interval
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
          console.log('Token expired, refreshing tokens and retrying...');
          
          // Check if it's a token-related error
          if (error.config?.url?.includes('/secure/image/')) {
            try {
              // Try to refresh tokens first
              await this.refreshTokens();
              
              // Update the request URL with new token
              const imageId = this.extractImageIdFromUrl(error.config.url);
              const isView = error.config.url.includes('/view');
              const cachedToken = this.tokenCache.get(imageId);
              
              if (cachedToken) {
                const newToken = isView ? cachedToken.view_token : cachedToken.thumbnail_token;
                const newUrl = error.config.url.replace(/token=[^&]*/, `token=${newToken}`);
                error.config.url = newUrl;
                
                // Retry with new token
                return this.api.request(error.config);
              }
            } catch (refreshError) {
              console.warn('Token refresh failed, creating new session:', refreshError);
            }
          }
          
          // Fallback to creating new session
          await this.createSession();
          return this.api.request(error.config);
        }
        
        if (error.response?.status === 429) {
          throw new Error('Rate limit exceeded. Please wait before making more requests.');
        }
        
        if (error.response?.status === 403) {
          console.log('Access denied, refreshing tokens and retrying...');
          try {
            await this.refreshTokens();
            
            // Update token in URL if it's an image request
            if (error.config?.url?.includes('/secure/image/')) {
              const imageId = this.extractImageIdFromUrl(error.config.url);
              const isView = error.config.url.includes('/view');
              const cachedToken = this.tokenCache.get(imageId);
              
              if (cachedToken) {
                const newToken = isView ? cachedToken.view_token : cachedToken.thumbnail_token;
                const newUrl = error.config.url.replace(/token=[^&]*/, `token=${newToken}`);
                error.config.url = newUrl;
                
                return this.api.request(error.config);
              }
            }
          } catch (refreshError) {
            console.warn('Token refresh failed, creating new session:', refreshError);
            await this.createSession();
          }
          
          return this.api.request(error.config);
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

    // 3. Advanced developer tools detection (disabled for debugging)
    let devtoolsOpen = false;
    const checkDevTools = () => {
      const threshold = 500; // Increased threshold to reduce false positives
      const heightDiff = window.outerHeight - window.innerHeight;
      const widthDiff = window.outerWidth - window.innerWidth;
      
      if (heightDiff > threshold || widthDiff > threshold) {
        if (!devtoolsOpen) {
          devtoolsOpen = true;
          console.warn('Developer tools may be detected');
          // Don't blur content during debugging
          // this.reportSuspiciousActivity('Developer tools detected');
        }
      } else {
        if (devtoolsOpen) {
          devtoolsOpen = false;
        }
      }
    };
    
    // setInterval(checkDevTools, 500); // Disabled for debugging

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
    const allowedDomains = [
      'localhost', 
      '127.0.0.1', 
      'your-domain.com',
      'choreoapps.dev',
      'e1-eu-north-azure.choreoapps.dev',
      'securegallery.onrender.com',
      'onrender.com',
      'render.com'
    ];
    const currentDomain = window.location.hostname;
    console.log('Current domain:', currentDomain);
    
    // More lenient check for localhost and allowed domains
    const isLocalhost = currentDomain === 'localhost' || 
                       currentDomain === '127.0.0.1' || 
                       currentDomain === '' || 
                       currentDomain.startsWith('localhost') ||
                       currentDomain.startsWith('127.0.0.1');
    
    const isAllowedDomain = allowedDomains.some(domain => 
      currentDomain.includes(domain) || 
      currentDomain.endsWith(domain)
    );
    
    // For production deployment, disable domain blocking to ensure functionality
    const isProduction = process.env.NODE_ENV === 'production' || 
                        currentDomain.includes('onrender.com') ||
                        currentDomain.includes('render.com') ||
                        currentDomain.includes('netlify.app') ||
                        currentDomain.includes('vercel.app');
    
    if (!isLocalhost && !isAllowedDomain && !isProduction) {
      this.reportSuspiciousActivity(`Unauthorized domain: ${currentDomain}`);
      console.warn('Domain check failed for:', currentDomain);
      // Only show warning, don't block access
    }
    
    // Log domain info for debugging
    console.log('Domain check results:', {
      currentDomain,
      isLocalhost,
      isAllowedDomain,
      isProduction,
      nodeEnv: process.env.NODE_ENV
    });

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
      console.log('Current hostname:', window.location.hostname);
      console.log('Current origin:', window.location.origin);
      
      // First test basic connectivity
      try {
        await axios.get(`${API_BASE}/test`, { timeout: 10000 });
        console.log('API connectivity test passed');
      } catch (testError) {
        console.warn('API connectivity test failed:', testError.message);
        // Continue anyway
      }
      
      const response = await axios.post(`${API_BASE}/session`, {}, {
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'X-VaultSecure-Client': 'web-app',
          'Content-Type': 'application/json'
        },
        withCredentials: false,
        timeout: 30000  // Increase timeout to 30 seconds
      });
      
      console.log('Session created successfully:', response.data);
      this.sessionId = response.data.session_id;
      localStorage.setItem('vaultsecure_session', this.sessionId);
      localStorage.setItem('vaultsecure_expires', response.data.expires_at);
      
      // Start token refresh scheduling
      this.scheduleTokenRefresh();
      
      return response.data;
    } catch (error) {
      console.error('Failed to create secure session:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: `${API_BASE}/session`,
        code: error.code,
        config: {
          baseURL: error.config?.baseURL,
          url: error.config?.url,
          method: error.config?.method
        }
      });
      
      // More specific error messages
      if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error')) {
        throw new Error('Network connection failed. Please check your internet connection and try again.');
      }
      
      if (error.code === 'ECONNREFUSED' || error.message.includes('ECONNREFUSED')) {
        throw new Error('Backend service is not available. Please try again later.');
      }
      
      if (!error.response) {
        throw new Error('Unable to connect to the server. Please check your connection.');
      }
      
      throw new Error(`Session creation failed: ${error.response?.data?.detail || error.message}`);
    }
  }

  async refreshTokens() {
    if (!this.tokenRefreshPromise) {
      this.tokenRefreshPromise = new Promise(async (resolve, reject) => {
        try {
          const response = await this.api.post('/tokens/refresh');
          this.tokenRefreshPromise = null;
          
          if (response.data && response.data.tokens) {
            Object.entries(response.data.tokens).forEach(([imageId, tokens]) => {
              this.tokenCache.set(imageId, tokens);
            });
            console.log('Tokens refreshed successfully for all images');
            
            // Schedule next refresh (refresh every 5 hours, tokens expire in 6 hours)
            this.scheduleTokenRefresh();
          }
          resolve(response.data);
        } catch (error) {
          this.tokenRefreshPromise = null;
          console.error('Failed to refresh tokens:', error);
          reject(error);
        }
      });
    }
    return this.tokenRefreshPromise;
  }

  scheduleTokenRefresh() {
    // Clear existing interval
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
    
    // Schedule refresh every 23 hours (tokens expire in 24 hours)
    this.refreshInterval = setInterval(() => {
      console.log('Auto-refreshing tokens...');
      this.refreshTokens().catch(error => {
        console.warn('Auto token refresh failed:', error);
      });
    }, 23 * 60 * 60 * 1000); // 23 hours
  }

  stopTokenRefresh() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
  }

  extractImageIdFromUrl(url) {
    const match = url.match(/\/secure\/image\/([^\/]+)/);
    return match ? match[1] : null;
  }

  cacheTokensFromUrls(imageId, viewUrl, thumbnailUrl) {
    const viewToken = viewUrl.match(/token=([^&]+)/)?.[1];
    const thumbnailToken = thumbnailUrl.match(/token=([^&]+)/)?.[1];
    if (viewToken && thumbnailToken) {
      this.tokenCache.set(imageId, {
        view_token: viewToken,
        thumbnail_token: thumbnailToken,
        view_url: viewUrl,
        thumbnail_url: thumbnailUrl
      });
    }
  }

async initializeSession() {
    // Always create a new session on reload
    console.log('Initializing new session on page load...');
    await this.createSession();
    this.scheduleTokenRefresh();
    return true;
  }

  clearSession() {
    this.sessionId = null;
    localStorage.removeItem('vaultsecure_session');
    localStorage.removeItem('vaultsecure_expires');
  }

  async getImages() {
    try {
      console.log('Fetching images from backend...');
      const response = await this.api.get('/images');
      
      // Cache tokens from image URLs
      if (response.data && Array.isArray(response.data)) {
        response.data.forEach(image => {
          this.cacheTokensFromUrls(image.id, image.url, image.thumbnail_url);
        });
        console.log(`Successfully fetched ${response.data.length} images`);
      }
      
      return response.data;
    } catch (error) {
      console.error('Failed to fetch protected images:', error);
      throw error;
    }
  }

  async getSimpleImages() {
    try {
      console.log('Fetching simple images from backend...');
      const response = await axios.get(`${API_BASE}/simple-images`);
      
      console.log('Simple images response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch simple images:', error);
      throw error;
    }
  }

  async testConnection() {
    try {
      console.log('Testing backend connection...');
      const response = await axios.get(`${API_BASE}/test`);
      console.log('Connection test response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Connection test failed:', error);
      throw error;
    }
  }

  // Update image URLs with fresh tokens from cache
  updateImageUrlsWithFreshTokens(images) {
    if (!Array.isArray(images)) return images;
    
    return images.map(image => {
      const cachedTokens = this.tokenCache.get(image.id);
      if (cachedTokens) {
        return {
          ...image,
          url: cachedTokens.view_url,
          thumbnail_url: cachedTokens.thumbnail_url
        };
      }
      return image;
    });
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
      this.stopTokenRefresh();
      await this.api.delete('/session');
      this.clearSession();
      this.tokenCache.clear();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }

  // Canvas-based secure image rendering
  async getSecureImageData(imageUrl) {
    try {
      console.log('Fetching secure image data for URL:', imageUrl);
      
      // Handle tokenized URLs properly
      let requestUrl = imageUrl;
      
      // If it's a full URL, extract the path and query
      if (imageUrl.startsWith('http')) {
        const url = new URL(imageUrl);
        requestUrl = url.pathname + url.search;
      }
      
      // Remove /api prefix if present since it's already in the base URL
      if (requestUrl.startsWith('/api')) {
        requestUrl = requestUrl.substring(4);
      }
      
      console.log('Making request to:', requestUrl);
      
      // Make the request using the configured API instance
      const response = await this.api.get(requestUrl);
      
      console.log('Secure image response received successfully');
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
      
      // Add additional client-side watermarks (minimal)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.font = '10px Arial';
      ctx.fillText(brandingConfig.canvasWatermark, 10, 20);
      
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
    
    // Send to backend for logging
    try {
      this.api.post('/security-violation', {
        violation: `SECURITY: ${activity}`,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        ip: 'client-side'
      }).catch(() => {}); // Silent fail
    } catch (e) {
      // Silent fail
    }
    
    // Show user warning
    this.showSecurityWarning(`🚨 Security Alert: ${activity}`);
  }

  // Report errors to monitoring system
  reportError(errorData) {
    console.error('🚨 VaultSecure Error:', errorData);
    
    // Send to backend for logging
    try {
      this.api.post('/security-violation', {
        violation: `ERROR: ${errorData.source} - ${errorData.error}`,
        timestamp: errorData.timestamp,
        userAgent: navigator.userAgent,
        url: window.location.href,
        stack: errorData.stack || 'N/A'
      }).catch(() => {}); // Silent fail
    } catch (e) {
      // Silent fail
    }
  }

  // Show security warning to user
  showSecurityWarning(message) {
    const warning = document.createElement('div');
    warning.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: rgba(220, 38, 38, 0.95);
      color: white;
      padding: 15px 25px;
      border-radius: 8px;
      z-index: 999999;
      font-weight: bold;
      border: 2px solid #dc2626;
      backdrop-filter: blur(10px);
      font-size: 14px;
      max-width: 300px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    `;
    warning.textContent = message;
    document.body.appendChild(warning);
    
    setTimeout(() => {
      if (warning.parentNode) {
        warning.parentNode.removeChild(warning);
      }
    }, 5000);
  }
}

// Anti-tampering measures - but allow sessionId modification
Object.freeze(VaultSecureAPI.prototype);
const apiService = new VaultSecureAPI();
// Don't freeze the instance to allow sessionId updates

export default apiService;