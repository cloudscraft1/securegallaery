import React, { useRef, useEffect, useState } from 'react';
import apiService from '../services/api';

const SecureImage = ({ imageUrl, alt, className, style, onLoad, onError }) => {
  const canvasRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!imageUrl || !canvasRef.current) return;

    const loadSecureImage = async () => {
      try {
        setLoading(true);
        setError(false);

        // For localhost development, try secure method first, fallback if needed
        const isLocalhost = window.location.hostname === 'localhost' || 
                           window.location.hostname === '127.0.0.1';

        try {
          // Try secure image data from backend
          const imageData = await apiService.getSecureImageData(imageUrl);
          
          if (!imageData.success) {
            throw new Error('Failed to load secure image');
          }

          // Render to canvas with protection
          apiService.renderSecureImage(canvasRef.current, imageData, () => {
            setLoading(false);
            if (onLoad) onLoad();
          });
        } catch (secureError) {
          console.log('Secure method failed, trying fallback for localhost:', secureError);
          
          if (isLocalhost) {
            // Fallback: Load image directly but still render to canvas with watermarks
            const img = new Image();
            img.crossOrigin = 'anonymous';
            
            img.onload = () => {
              const canvas = canvasRef.current;
              const ctx = canvas.getContext('2d');
              
              canvas.width = img.width;
              canvas.height = img.height;
              
              // Draw image
              ctx.drawImage(img, 0, 0);
              
              // Add development watermarks
              ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
              ctx.font = '20px Arial';
              ctx.fillText('VAULTSECURE DEVELOPMENT', 10, 30);
              ctx.fillText('LOCALHOST ONLY', 10, canvas.height - 20);
              
              // Still apply protection
              canvas.oncontextmenu = (e) => {
                e.preventDefault();
                apiService.reportSuspiciousActivity('Right-click blocked on dev image');
                return false;
              };
              
              setLoading(false);
              if (onLoad) onLoad();
            };
            
            img.onerror = () => {
              setError(true);
              setLoading(false);
            };
            
            // Get the full URL for the image
            const fullImageUrl = imageUrl.startsWith('http') ? 
              imageUrl : 
              `${process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000'}${imageUrl}`;
            
            img.src = fullImageUrl;
          } else {
            throw secureError;
          }
        }

        // Additional security measures
        const canvas = canvasRef.current;
        
        // Disable save as
        canvas.addEventListener('contextmenu', (e) => {
          e.preventDefault();
          apiService.reportSuspiciousActivity('Context menu blocked on secure image');
        });

        // Disable print screen
        document.addEventListener('keyup', (e) => {
          if (e.keyCode === 44) {
            apiService.reportSuspiciousActivity('Print screen blocked');
            e.preventDefault();
          }
        });

        // Detect developer tools
        let devtools = false;
        setInterval(() => {
          if (window.outerHeight - window.innerHeight > 160 || 
              window.outerWidth - window.innerWidth > 160) {
            if (!devtools) {
              devtools = true;
              apiService.reportSuspiciousActivity('Developer tools detected');
              // Optionally blur or hide the canvas
              canvas.style.filter = 'blur(10px)';
              setTimeout(() => {
                canvas.style.filter = 'none';
              }, 3000);
            }
          } else {
            devtools = false;
          }
        }, 1000);

        // Prevent canvas data extraction
        const originalToDataURL = canvas.toDataURL;
        canvas.toDataURL = function() {
          apiService.reportSuspiciousActivity('Canvas data extraction blocked');
          throw new Error('Access denied: VaultSecure protection active');
        };

        const originalGetImageData = canvas.getContext('2d').getImageData;
        canvas.getContext('2d').getImageData = function() {
          apiService.reportSuspiciousActivity('Canvas image data access blocked');
          throw new Error('Access denied: VaultSecure protection active');
        };

      } catch (err) {
        console.error('Error loading secure image:', err);
        setError(true);
        setLoading(false);
        if (onError) onError(err);
      }
    };

    loadSecureImage();
  }, [imageUrl, onLoad, onError]);

  // Additional CSS to prevent common hacks
  const secureStyle = {
    ...style,
    userSelect: 'none',
    webkitUserSelect: 'none',
    mozUserSelect: 'none',
    msUserSelect: 'none',
    webkitUserDrag: 'none',
    webkitTouchCallout: 'none',
    webkitTapHighlightColor: 'transparent',
    pointerEvents: loading ? 'none' : 'auto'
  };

  if (error) {
    return (
      <div 
        className={`${className} flex items-center justify-center bg-red-900/20 border border-red-500/30 rounded-lg`}
        style={style}
      >
        <div className="text-red-400 text-center p-4">
          <div className="text-lg font-bold">🔒 Access Denied</div>
          <div className="text-sm">VaultSecure Protection Active</div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative" style={secureStyle}>
      {loading && (
        <div 
          className="absolute inset-0 bg-gradient-to-br from-blue-900/50 to-indigo-900/50 animate-pulse rounded-lg flex items-center justify-center"
          style={style}
        >
          <div className="text-white text-center">
            <div className="animate-spin w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full mx-auto mb-2"></div>
            <div className="text-sm">Loading Secure Image...</div>
          </div>
        </div>
      )}
      <canvas
        ref={canvasRef}
        className={className}
        style={{
          ...secureStyle,
          display: loading ? 'none' : 'block'
        }}
        onContextMenu={(e) => {
          e.preventDefault();
          apiService.reportSuspiciousActivity('Right-click blocked on secure canvas');
          return false;
        }}
        onDragStart={(e) => {
          e.preventDefault();
          apiService.reportSuspiciousActivity('Drag blocked on secure canvas');
          return false;
        }}
      />
      
      {/* Invisible overlay to prevent selection */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'transparent',
          userSelect: 'none',
          webkitUserSelect: 'none'
        }}
      />
    </div>
  );
};

export default SecureImage;
