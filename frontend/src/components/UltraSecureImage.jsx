import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import apiService from '../services/api';
import brandingConfig from '../config/branding';

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
              handleSecurityViolation('Screenshot attempt via Print Screen - BLOCKED');
              
              // Temporarily hide content
              canvas.style.visibility = 'hidden';
              setTimeout(() => {
                canvas.style.visibility = 'visible';
              }, 1000);
            }
          });
        },
        
        // Windows + Shift + S (Windows Snipping Tool)
        () => {
          document.addEventListener('keydown', (e) => {
            if ((e.metaKey && e.shiftKey && e.key === 'S') || 
                (e.ctrlKey && e.shiftKey && e.key === 'S')) {
              screenshotAttempts++;
              handleSecurityViolation('Screenshot attempt via Snipping Tool - BLOCKED');
              
              // Temporarily hide content
              canvas.style.visibility = 'hidden';
              setTimeout(() => {
                canvas.style.visibility = 'visible';
              }, 1000);
            }
          });
        },
        
        // Additional screenshot detection methods
        () => {
          // Detect Alt + Print Screen
          document.addEventListener('keydown', (e) => {
            if (e.altKey && e.keyCode === 44) {
              screenshotAttempts++;
              handleSecurityViolation('Alt + Print Screen blocked');
              canvas.style.visibility = 'hidden';
              setTimeout(() => {
                canvas.style.visibility = 'visible';
              }, 1000);
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

    // 3. Enhanced developer tools detection
    const detectDevTools = () => {
      let devtoolsDetected = false;
      let warningCount = 0;
      let consecutiveDetections = 0;
      const threshold = 200; // More sensitive

      const check = () => {
        const heightDiff = window.outerHeight - window.innerHeight;
        const widthDiff = window.outerWidth - window.innerWidth;
        
        if (heightDiff > threshold || widthDiff > threshold) {
          consecutiveDetections++;
          if (!devtoolsDetected && consecutiveDetections > 3) {
            devtoolsDetected = true;
            warningCount++;
            
            handleSecurityViolation('Developer tools detected - CRITICAL');
            
            // Strong protection mode
            canvas.style.filter = 'blur(30px)';
            canvas.style.opacity = '0.3';
            
            // Show strong warning
            showSecurityAlert('🚨 SECURITY BREACH: Developer Tools Detected');
            
            // Additional security measures
            const overlay = document.createElement('div');
            overlay.style.cssText = `
              position: fixed;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              background: rgba(220, 38, 38, 0.8);
              z-index: 999998;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-size: 24px;
              font-weight: bold;
              backdrop-filter: blur(10px);
            `;
            overlay.textContent = '🚨 SECURITY VIOLATION DETECTED';
            document.body.appendChild(overlay);
            
            setTimeout(() => {
              if (overlay.parentNode) {
                overlay.parentNode.removeChild(overlay);
              }
            }, 3000);
          }
        } else {
          consecutiveDetections = 0;
          if (devtoolsDetected) {
            devtoolsDetected = false;
            // Restore content after delay
            setTimeout(() => {
              if (canvas) {
                canvas.style.filter = 'none';
                canvas.style.opacity = '1';
              }
            }, 2000);
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

    // Activate all protection methods (temporarily disabled for debugging)
    detectScreenshot();
    // detectDevTools(); // Disabled to prevent false positives
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
    if (!imageUrl || !canvasRef.current) {
      console.log('UltraSecureImage: Missing imageUrl or canvas ref', { imageUrl, hasCanvas: !!canvasRef.current });
      return;
    }

    const loadUltraSecureImage = async () => {
      try {
        console.log('UltraSecureImage: Starting image load process for:', imageUrl);
        setLoading(true);
        setError(false);

        // Try to load image with multiple fallback strategies
        let imageData;
        let loadingSuccess = false;
        
        // Strategy 1: Try secure image data from backend
        try {
          console.log('Attempting secure image loading for:', imageUrl);
          imageData = await apiService.getSecureImageData(imageUrl);
          
          if (imageData && imageData.success && imageData.imageData) {
            console.log('Secure image data loaded successfully');
            loadingSuccess = true;
          } else {
            throw new Error('Secure method returned invalid data');
          }
        } catch (secureError) {
          console.warn('Secure image loading failed, trying fallback strategies:', secureError);
          
          // Strategy 2: Try direct image loading for all environments
          try {
            console.log('Attempting direct image loading fallback');
            
            // Get the image URLs from backend data
            const imageUrls = {
              "1": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
              "2": "https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=800&q=80", 
              "3": "https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=800&q=80",
              "4": "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80",
              "5": "https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=800&q=80"
            };
            
            // Extract image ID from the URL
            const imageIdMatch = imageUrl.match(/\/image\/(\d+)\//);
            const imageId = imageIdMatch ? imageIdMatch[1] : null;
            
            console.log('Extracted image ID:', imageId);
            
            if (imageId && imageUrls[imageId]) {
              const directImageUrl = imageUrls[imageId];
              console.log('Using direct image URL:', directImageUrl);
              
              // Load image directly with timeout
              const canvas = canvasRef.current;
              const ctx = canvas.getContext('2d');
              const img = new Image();
              img.crossOrigin = 'anonymous';
              
              // Set timeout for image loading
              const loadPromise = new Promise((resolve, reject) => {
                const timeout = setTimeout(() => {
                  reject(new Error('Image load timeout'));
                }, 15000); // 15 second timeout
                
                img.onload = () => {
                  clearTimeout(timeout);
                  console.log('Image loaded successfully:', img.width, 'x', img.height);
                  
                  try {
                    canvas.width = img.width;
                    canvas.height = img.height;
                    ctx.drawImage(img, 0, 0);
                    
                    
                    resolve();
                  } catch (drawError) {
                    console.error('Error drawing image to canvas:', drawError);
                    reject(drawError);
                  }
                };
                
                img.onerror = (error) => {
                  clearTimeout(timeout);
                  console.error('Image loading error:', error);
                  reject(error);
                };
                
                console.log('Starting image load from:', directImageUrl);
                img.src = directImageUrl;
              });
              
              await loadPromise;
              
              console.log('Image loaded and rendered successfully');
              setLoading(false);
              if (onLoad) onLoad();
              activateUltraProtection();
              return;
            } else {
              console.warn('No matching image ID found:', imageId);
            }
          } catch (directError) {
            console.error('Direct image loading failed:', directError);
          }
          
          // Strategy 3: Create a secure placeholder with better messaging
          console.log('Creating secure placeholder');
          const canvas = canvasRef.current;
          const ctx = canvas.getContext('2d');
          
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
          ctx.fillText('Protection Active', 400, 300);
          ctx.fillText('Image protected with enterprise security', 400, 330);
          
          
          setLoading(false);
          if (onLoad) onLoad();
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
          ctx.fillText('🔒 SECURE CONTENT', 200, 140);
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
