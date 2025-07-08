import React, { useRef, useEffect, useState, useCallback } from 'react';
import apiService from '../services/api';

const UltraSecureImage = ({ imageUrl, alt, className, style, onLoad, onError }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [protectionActive, setProtectionActive] = useState(true);

  // Advanced protection measures
  const activateUltraProtection = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    
    if (!canvas || !container) return;

    // 1. Disable canvas data extraction completely
    const originalToDataURL = canvas.toDataURL;
    const originalGetImageData = canvas.getContext('2d').getImageData;
    const originalGetContext = canvas.getContext;

    canvas.toDataURL = function() {
      apiService.reportSuspiciousActivity('SECURITY BREACH: Canvas data extraction attempted');
      throw new Error('🚨 SECURITY VIOLATION: Unauthorized data access blocked');
    };

    canvas.getContext('2d').getImageData = function() {
      apiService.reportSuspiciousActivity('SECURITY BREACH: Image data extraction attempted');
      throw new Error('🚨 SECURITY VIOLATION: Unauthorized data access blocked');
    };

    canvas.getContext = function(contextType) {
      if (contextType === 'webgl' || contextType === 'webgl2') {
        apiService.reportSuspiciousActivity('SECURITY BREACH: WebGL context access attempted');
        throw new Error('🚨 SECURITY VIOLATION: WebGL access blocked');
      }
      return originalGetContext.call(this, contextType);
    };

    // 2. Advanced screenshot detection
    let screenshotAttempts = 0;
    const detectScreenshot = () => {
      // Multiple screenshot detection methods
      const methods = [
        // Print Screen key
        () => {
          document.addEventListener('keyup', (e) => {
            if (e.keyCode === 44 || e.key === 'PrintScreen') {
              screenshotAttempts++;
              handleSecurityViolation('Screenshot attempt via Print Screen');
            }
          });
        },
        
        // Windows + Shift + S (Windows Snipping Tool)
        () => {
          document.addEventListener('keydown', (e) => {
            if (e.metaKey && e.shiftKey && e.key === 'S') {
              screenshotAttempts++;
              handleSecurityViolation('Screenshot attempt via Snipping Tool');
            }
          });
        },

        // Page visibility API (detect screen recording)
        () => {
          document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
              // Page became visible again - possible screen recording
              setTimeout(() => {
                if (canvas.style.filter !== 'blur(20px)') {
                  canvas.style.filter = 'blur(20px)';
                  setTimeout(() => {
                    canvas.style.filter = 'none';
                  }, 2000);
                }
              }, 100);
            }
          });
        }
      ];

      methods.forEach(method => method());
    };

    // 3. Ultimate developer tools detection
    const detectDevTools = () => {
      let devtoolsDetected = false;
      const threshold = 160;

      const check = () => {
        const heightDiff = window.outerHeight - window.innerHeight;
        const widthDiff = window.outerWidth - window.innerWidth;
        
        if (heightDiff > threshold || widthDiff > threshold) {
          if (!devtoolsDetected) {
            devtoolsDetected = true;
            handleSecurityViolation('Developer tools detected');
            
            // Complete protection mode
            canvas.style.filter = 'blur(50px)';
            canvas.style.opacity = '0.1';
            
            // Show security warning
            showSecurityAlert('🚨 DEVELOPER TOOLS DETECTED - CONTENT BLOCKED');
          }
        } else {
          if (devtoolsDetected) {
            devtoolsDetected = false;
            canvas.style.filter = 'none';
            canvas.style.opacity = '1';
          }
        }
      };

      setInterval(check, 100); // Very frequent checking
    };

    // 4. Advanced DOM protection
    const protectDOM = () => {
      // Prevent inspect element
      container.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        e.stopPropagation();
        handleSecurityViolation('Right-click blocked on protected content');
        return false;
      });

      // Prevent selection
      container.addEventListener('selectstart', (e) => {
        e.preventDefault();
        return false;
      });

      // Prevent drag and drop
      container.addEventListener('dragstart', (e) => {
        e.preventDefault();
        handleSecurityViolation('Drag attempt blocked');
        return false;
      });

      // Prevent copy/paste/cut
      ['copy', 'cut', 'paste'].forEach(event => {
        container.addEventListener(event, (e) => {
          e.preventDefault();
          handleSecurityViolation(`${event} operation blocked`);
        });
      });
    };

    // 5. Keyboard shortcuts protection
    const protectKeyboard = () => {
      document.addEventListener('keydown', (e) => {
        // Block all developer shortcuts
        const blockedCombos = [
          { ctrl: true, key: 'U' }, // View source
          { ctrl: true, key: 'S' }, // Save
          { ctrl: true, key: 'P' }, // Print
          { ctrl: true, shift: true, key: 'I' }, // Dev tools
          { ctrl: true, shift: true, key: 'J' }, // Console
          { ctrl: true, shift: true, key: 'C' }, // Inspect
          { key: 'F12' }, // Dev tools
          { ctrl: true, key: 'F5' }, // Hard refresh
          { ctrl: true, shift: true, key: 'R' }, // Hard refresh
        ];

        const isBlocked = blockedCombos.some(combo => {
          const ctrlMatch = combo.ctrl ? e.ctrlKey : !e.ctrlKey;
          const shiftMatch = combo.shift ? e.shiftKey : !e.shiftKey;
          const keyMatch = combo.key === e.key;
          return ctrlMatch && shiftMatch && keyMatch;
        });

        if (isBlocked) {
          e.preventDefault();
          e.stopPropagation();
          handleSecurityViolation(`Blocked shortcut: ${e.key}`);
          return false;
        }
      });
    };

    // 6. Network monitoring (detect image URL extraction)
    const protectNetwork = () => {
      // Override fetch and XMLHttpRequest to detect unauthorized requests
      const originalFetch = window.fetch;
      window.fetch = function(...args) {
        const url = args[0];
        if (typeof url === 'string' && url.includes('unsplash')) {
          apiService.reportSuspiciousActivity('SECURITY BREACH: Direct image URL access attempted');
          throw new Error('🚨 SECURITY VIOLATION: Direct image access blocked');
        }
        return originalFetch.apply(this, args);
      };
    };

    // Activate all protection methods
    detectScreenshot();
    detectDevTools();
    protectDOM();
    protectKeyboard();
    protectNetwork();

    return () => {
      // Cleanup function
      window.fetch = window.fetch.original || window.fetch;
    };
  }, []);

  const handleSecurityViolation = (violation) => {
    apiService.reportSuspiciousActivity(`SECURITY VIOLATION: ${violation}`);
    
    // Log to backend
    fetch('/api/security-violation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        violation,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent
      })
    }).catch(() => {}); // Silent fail
    
    // Visual feedback
    if (canvasRef.current) {
      canvasRef.current.style.filter = 'blur(30px)';
      setTimeout(() => {
        if (canvasRef.current) {
          canvasRef.current.style.filter = 'none';
        }
      }, 3000);
    }
  };

  const showSecurityAlert = (message) => {
    const alert = document.createElement('div');
    alert.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(220, 38, 38, 0.95);
      color: white;
      padding: 20px 30px;
      border-radius: 10px;
      z-index: 999999;
      font-weight: bold;
      border: 3px solid #dc2626;
      backdrop-filter: blur(10px);
      box-shadow: 0 0 50px rgba(220, 38, 38, 0.5);
    `;
    alert.textContent = message;
    document.body.appendChild(alert);
    
    setTimeout(() => {
      if (alert.parentNode) {
        alert.parentNode.removeChild(alert);
      }
    }, 5000);
  };

  useEffect(() => {
    if (!imageUrl || !canvasRef.current) return;

    const loadUltraSecureImage = async () => {
      try {
        setLoading(true);
        setError(false);

        // Get secure image data from backend
        const imageData = await apiService.getSecureImageData(imageUrl);
        
        if (!imageData.success) {
          throw new Error('Failed to load secure image');
        }

        // Render to canvas with maximum protection
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        img.onload = () => {
          // Set canvas size
          canvas.width = img.width;
          canvas.height = img.height;
          
          // Draw image
          ctx.drawImage(img, 0, 0);
          
          // Add multiple security watermarks
          ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
          ctx.font = 'bold 24px Arial';
          
          // Session-specific watermarks
          const sessionId = apiService.sessionId?.substring(0, 8) || 'SECURE';
          const timestamp = new Date().toISOString();
          
          // Multiple watermarks across image
          for (let x = 0; x < canvas.width; x += 200) {
            for (let y = 0; y < canvas.height; y += 150) {
              ctx.save();
              ctx.translate(x, y);
              ctx.rotate(-Math.PI / 6);
              ctx.fillText(`VAULTSECURE-${sessionId}`, 0, 0);
              ctx.fillText(timestamp, 0, 30);
              ctx.restore();
            }
          }
          
          // Edge watermarks
          ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
          ctx.fillText('© VAULTSECURE PROTECTED', 10, 30);
          ctx.fillText(`SESSION: ${sessionId}`, 10, canvas.height - 40);
          ctx.fillText(`IP: ${imageData.sessionId}`, canvas.width - 200, canvas.height - 10);
          
          setLoading(false);
          if (onLoad) onLoad();
        };
        
        img.onerror = () => {
          setError(true);
          setLoading(false);
          if (onError) onError();
        };
        
        img.src = imageData.imageData;
        
        // Activate ultra protection
        activateUltraProtection();
        
      } catch (err) {
        console.error('Error loading ultra-secure image:', err);
        setError(true);
        setLoading(false);
        if (onError) onError(err);
      }
    };

    loadUltraSecureImage();
  }, [imageUrl, onLoad, onError, activateUltraProtection]);

  const secureStyle = {
    ...style,
    userSelect: 'none',
    webkitUserSelect: 'none',
    mozUserSelect: 'none',
    msUserSelect: 'none',
    webkitUserDrag: 'none',
    webkitTouchCallout: 'none',
    webkitTapHighlightColor: 'transparent',
    pointerEvents: loading ? 'none' : 'auto',
    filter: protectionActive ? 'none' : 'blur(20px)'
  };

  if (error) {
    return (
      <div 
        className={`${className} flex items-center justify-center bg-red-900/20 border border-red-500/30 rounded-lg`}
        style={style}
      >
        <div className="text-red-400 text-center p-4">
          <div className="text-lg font-bold">🔒 ULTRA-SECURE ACCESS DENIED</div>
          <div className="text-sm">Maximum VaultSecure Protection Active</div>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative ultra-secure-container" style={secureStyle}>
      {loading && (
        <div 
          className="absolute inset-0 bg-gradient-to-br from-blue-900/50 to-indigo-900/50 animate-pulse rounded-lg flex items-center justify-center"
          style={style}
        >
          <div className="text-white text-center">
            <div className="animate-spin w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full mx-auto mb-2"></div>
            <div className="text-sm">🔒 Loading Ultra-Secure Image...</div>
          </div>
        </div>
      )}
      
      <canvas
        ref={canvasRef}
        className={className}
        style={{
          ...secureStyle,
          display: loading ? 'none' : 'block',
          imageRendering: 'crisp-edges'
        }}
      />
      
      {/* Invisible protection overlay */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'transparent',
          userSelect: 'none',
          webkitUserSelect: 'none',
          zIndex: 1
        }}
      />
    </div>
  );
};

export default UltraSecureImage;
