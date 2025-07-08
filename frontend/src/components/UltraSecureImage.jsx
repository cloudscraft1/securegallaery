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

    // 3. Smart developer tools detection
    const detectDevTools = () => {
      let devtoolsDetected = false;
      let warningCount = 0;
      const threshold = 300; // Increased leniency

      const check = () => {
        const heightDiff = window.outerHeight - window.innerHeight;
        const widthDiff = window.outerWidth - window.innerWidth;
        
        if (heightDiff > threshold || widthDiff > threshold) {
          if (!devtoolsDetected) {
            devtoolsDetected = true;
            warningCount++;
            
            // Log only if consistently detected
            if (warningCount > 5) {
              handleSecurityViolation('Developer tools consistently detected');
              
              // More gentle protection mode
              canvas.style.filter = 'blur(5px)';
              canvas.style.opacity = '0.9';
              
              // Show gentle warning
              showSecurityAlert('🔒 Developer Tools Detected - Content Protected');
            }
          }
        } else {
          if (devtoolsDetected) {
            devtoolsDetected = false;
            // Restore content after longer delay
            setTimeout(() => {
              if (canvas) {
                canvas.style.filter = 'none';
                canvas.style.opacity = '1';
              }
            }, 1500);
          }
        }
      };

      setInterval(check, 500); // Less frequent checking to avoid performance issues
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

    // 5. Smart keyboard shortcuts protection (only when hovering protected content)
    const protectKeyboard = () => {
      document.addEventListener('keydown', (e) => {
        // Only block when user is focused on protected content
        const isOnProtectedContent = e.target.closest('.ultra-secure-container') || 
                                   document.activeElement.closest('.ultra-secure-container');
        
        if (!isOnProtectedContent) return; // Allow normal usage elsewhere
        
        // Block only critical developer shortcuts
        const blockedCombos = [
          { ctrl: true, shift: true, key: 'I' }, // Dev tools
          { ctrl: true, shift: true, key: 'J' }, // Console
          { ctrl: true, shift: true, key: 'C' }, // Inspect
          { key: 'F12' }, // Dev tools
        ];

        const isBlocked = blockedCombos.some(combo => {
          const ctrlMatch = combo.ctrl ? e.ctrlKey : !combo.ctrl || !e.ctrlKey;
          const shiftMatch = combo.shift ? e.shiftKey : !combo.shift || !e.shiftKey;
          const keyMatch = combo.key === e.key;
          return ctrlMatch && shiftMatch && keyMatch;
        });

        if (isBlocked) {
          e.preventDefault();
          e.stopPropagation();
          handleSecurityViolation(`Blocked developer shortcut: ${e.key}`);
          return false;
        }
      });
    };

    // 6. Smart network protection (monitor but don't break functionality)
    const protectNetwork = () => {
      // Monitor but don't block - just log suspicious activity
      const originalFetch = window.fetch;
      window.fetch = function(...args) {
        const url = args[0];
        if (typeof url === 'string' && url.includes('unsplash') && !url.includes('/api/')) {
          // Log but don't block - this allows legitimate use while monitoring
          apiService.reportSuspiciousActivity('MONITORED: Direct image URL access attempted');
          console.warn('🔒 VaultSecure: Direct image access detected and logged');
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

        // Try secure image data from backend first
        let imageData;
        try {
          imageData = await apiService.getSecureImageData(imageUrl);
          if (!imageData.success) {
            throw new Error('Secure method failed');
          }
        } catch (secureError) {
          console.warn('Secure image loading failed, using fallback:', secureError);
          
          // Fallback: Create a secure placeholder with watermarks
          const canvas = canvasRef.current;
          const ctx = canvas.getContext('2d');
          
          // Create a secure placeholder
          canvas.width = 800;
          canvas.height = 600;
          
          // Draw gradient background
          const gradient = ctx.createLinearGradient(0, 0, 800, 600);
          gradient.addColorStop(0, '#4338ca');
          gradient.addColorStop(1, '#1e40af');
          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, 800, 600);
          
          // Add secure content message
          ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
          ctx.font = 'bold 32px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('🔒 SECURE CONTENT', 400, 250);
          ctx.font = '18px Arial';
          ctx.fillText('VaultSecure Protection Active', 400, 300);
          ctx.fillText('Image protected with enterprise security', 400, 330);
          
          // Add watermarks
          const sessionId = apiService.sessionId?.substring(0, 8) || 'SECURE';
          ctx.font = '12px Arial';
          ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
          ctx.textAlign = 'left';
          ctx.fillText(`© VAULTSECURE - Session: ${sessionId}`, 20, 580);
          ctx.fillText(`Protected: ${new Date().toLocaleString()}`, 20, 560);
          
          setLoading(false);
          if (onLoad) onLoad();
          
          // Still activate protection
          activateUltraProtection();
          return;
        }

        // Render secure image data
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        img.onload = () => {
          // Set canvas size
          canvas.width = img.width;
          canvas.height = img.height;
          
          // Draw image
          ctx.drawImage(img, 0, 0);
          
          // Add security watermarks
          ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
          ctx.font = 'bold 20px Arial';
          
          // Session-specific watermarks
          const sessionId = apiService.sessionId?.substring(0, 8) || 'SECURE';
          const timestamp = new Date().toISOString();
          
          // Diagonal watermarks
          for (let x = 0; x < canvas.width; x += 250) {
            for (let y = 0; y < canvas.height; y += 200) {
              ctx.save();
              ctx.translate(x, y);
              ctx.rotate(-Math.PI / 6);
              ctx.fillText(`VAULTSECURE-${sessionId}`, 0, 0);
              ctx.restore();
            }
          }
          
          // Corner watermarks
          ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
          ctx.font = '14px Arial';
          ctx.fillText('© VAULTSECURE', 10, 25);
          ctx.fillText(`ID: ${sessionId}`, canvas.width - 100, canvas.height - 10);
          
          setLoading(false);
          if (onLoad) onLoad();
        };
        
        img.onerror = () => {
          // Even on error, show secure placeholder
          const canvas = canvasRef.current;
          const ctx = canvas.getContext('2d');
          canvas.width = 400;
          canvas.height = 300;
          
          ctx.fillStyle = '#ef4444';
          ctx.fillRect(0, 0, 400, 300);
          ctx.fillStyle = 'white';
          ctx.font = 'bold 16px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('🔒 SECURE IMAGE', 200, 140);
          ctx.fillText('Load Error - Protected', 200, 170);
          
          setLoading(false);
          if (onError) onError();
        };
        
        img.src = imageData.imageData;
        
        // Activate protection
        activateUltraProtection();
        
      } catch (err) {
        console.error('Error in secure image system:', err);
        
        // Final fallback - secure error state
        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext('2d');
          canvas.width = 400;
          canvas.height = 300;
          
          ctx.fillStyle = '#1e40af';
          ctx.fillRect(0, 0, 400, 300);
          ctx.fillStyle = 'white';
          ctx.font = 'bold 18px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('🔒 VAULTSECURE', 200, 140);
          ctx.fillText('Temporary Load Issue', 200, 170);
        }
        
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
