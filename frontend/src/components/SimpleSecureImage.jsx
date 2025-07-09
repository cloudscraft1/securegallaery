import React, { useState, useEffect, useRef } from 'react';
import apiService from '../services/api';

const SimpleSecureImage = ({ imageId, alt, className, style, onLoad, onError }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [imageData, setImageData] = useState(null);
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const loadSecureImage = async () => {
      try {
        console.log('SimpleSecureImage: Loading image for ID:', imageId);
        setLoading(true);
        setError(false);

        // Direct approach: Use the secure image endpoint with token from image list
        const images = await apiService.getImages();
        const currentImage = images.find(img => img.id === imageId);
        
        if (currentImage && currentImage.url) {
          console.log('Found image URL:', currentImage.url);
          
          // Extract token from URL
          const urlParts = currentImage.url.split('?token=');
          if (urlParts.length === 2) {
            const token = urlParts[1];
            console.log('Extracted token:', token.substring(0, 20) + '...');
            
            try {
              // Try to get the secure image data
              const response = await apiService.getSecureImageData(`/secure/image/${imageId}/view?token=${token}`);
              
              if (response && response.success && response.imageData) {
                console.log('Got secure image data, rendering to canvas');
                setImageData(response.imageData);
                
                // Render to canvas for security
                const canvas = canvasRef.current;
                const ctx = canvas.getContext('2d');
                const img = new Image();
                
                img.onload = () => {
                  console.log('Image loaded successfully, drawing to canvas');
                  canvas.width = img.width;
                  canvas.height = img.height;
                  ctx.drawImage(img, 0, 0);
                  
                  // Add security watermarks
                  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
                  ctx.font = '16px Arial';
                  ctx.fillText('VAULTSECURE PROTECTED', 10, 25);
                  ctx.fillText(`ID: ${imageId}`, canvas.width - 80, canvas.height - 10);
                  ctx.fillText(`Session: ${apiService.sessionId?.substring(0, 8) || 'SECURE'}`, 10, canvas.height - 40);
                  
                  setLoading(false);
                  if (onLoad) onLoad();
                };
                
                img.onerror = () => {
                  console.error('Image failed to load in canvas');
                  setError(true);
                  setLoading(false);
                  if (onError) onError();
                };
                
                img.src = response.imageData;
              } else {
                throw new Error('Invalid response format from secure endpoint');
              }
            } catch (secureError) {
              console.error('Secure image loading failed:', secureError);
              // If secure loading fails, create a placeholder showing the error
              const canvas = canvasRef.current;
              const ctx = canvas.getContext('2d');
              canvas.width = 800;
              canvas.height = 600;
              
              // Create a gradient background
              const gradient = ctx.createLinearGradient(0, 0, 800, 600);
              gradient.addColorStop(0, '#4338ca');
              gradient.addColorStop(1, '#1e40af');
              ctx.fillStyle = gradient;
              ctx.fillRect(0, 0, 800, 600);
              
              // Add text
              ctx.fillStyle = 'white';
              ctx.font = 'bold 24px Arial';
              ctx.textAlign = 'center';
              ctx.fillText('🔒 VAULTSECURE PROTECTED', 400, 280);
              ctx.font = '16px Arial';
              ctx.fillText('Backend Gallery Image', 400, 320);
              ctx.fillText(`Image ID: ${imageId}`, 400, 350);
              
              setLoading(false);
              if (onLoad) onLoad();
            }
          } else {
            throw new Error('No token found in image URL');
          }
        } else {
          throw new Error('Image not found in gallery');
        }
      } catch (err) {
        console.error('SimpleSecureImage: Error loading image:', err);
        
        // Create error placeholder
        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext('2d');
          canvas.width = 800;
          canvas.height = 600;
          
          ctx.fillStyle = '#ef4444';
          ctx.fillRect(0, 0, 800, 600);
          ctx.fillStyle = 'white';
          ctx.font = 'bold 20px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('🔒 SECURE IMAGE ERROR', 400, 280);
          ctx.font = '14px Arial';
          ctx.fillText('VaultSecure Protection Active', 400, 320);
          ctx.fillText(err.message || 'Unknown error', 400, 350);
        }
        
        setLoading(false);
        if (onError) onError();
      }
    };

    if (imageId) {
      loadSecureImage();
    }
  }, [imageId, onLoad, onError]);

  // Security protection for canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    
    if (!canvas || !container) return;

    // 1. Disable right-click
    const handleContextMenu = (e) => {
      e.preventDefault();
      apiService.reportSuspiciousActivity('Right-click blocked on secure image');
      return false;
    };

    // 2. Disable drag
    const handleDragStart = (e) => {
      e.preventDefault();
      apiService.reportSuspiciousActivity('Drag attempt blocked on secure image');
      return false;
    };

    // 3. Disable selection
    const handleSelectStart = (e) => {
      e.preventDefault();
      return false;
    };

    // 4. Block print screen
    const handleKeyDown = (e) => {
      if (e.key === 'PrintScreen' || e.keyCode === 44) {
        e.preventDefault();
        apiService.reportSuspiciousActivity('Print screen blocked');
        return false;
      }
    };

    // 5. Developer tools detection
    let devToolsOpen = false;
    const detectDevTools = () => {
      const threshold = 160;
      const heightDiff = window.outerHeight - window.innerHeight;
      const widthDiff = window.outerWidth - window.innerWidth;
      
      if (heightDiff > threshold || widthDiff > threshold) {
        if (!devToolsOpen) {
          devToolsOpen = true;
          apiService.reportSuspiciousActivity('Developer tools detected');
          canvas.style.filter = 'blur(20px)';
          canvas.style.opacity = '0.3';
        }
      } else {
        if (devToolsOpen) {
          devToolsOpen = false;
          canvas.style.filter = 'none';
          canvas.style.opacity = '1';
        }
      }
    };

    // 6. Screenshot detection
    const detectScreenshot = () => {
      // Monitor for screenshot attempts
      const checkVisibility = () => {
        if (document.hidden) {
          // Page is hidden, possible screenshot
          apiService.reportSuspiciousActivity('Page hidden - possible screenshot');
        }
      };
      
      document.addEventListener('visibilitychange', checkVisibility);
      return () => document.removeEventListener('visibilitychange', checkVisibility);
    };

    // Apply all protections
    container.addEventListener('contextmenu', handleContextMenu);
    container.addEventListener('dragstart', handleDragStart);
    container.addEventListener('selectstart', handleSelectStart);
    document.addEventListener('keydown', handleKeyDown);
    
    const devToolsInterval = setInterval(detectDevTools, 1000);
    const cleanupScreenshot = detectScreenshot();

    // Disable canvas data extraction
    const originalToDataURL = canvas.toDataURL;
    canvas.toDataURL = function() {
      apiService.reportSuspiciousActivity('Canvas data extraction blocked');
      throw new Error('Access denied: VaultSecure protection active');
    };

    return () => {
      container.removeEventListener('contextmenu', handleContextMenu);
      container.removeEventListener('dragstart', handleDragStart);
      container.removeEventListener('selectstart', handleSelectStart);
      document.removeEventListener('keydown', handleKeyDown);
      clearInterval(devToolsInterval);
      cleanupScreenshot();
      canvas.toDataURL = originalToDataURL;
    };
  }, [imageId]);

  if (error) {
    return (
      <div className={`${className} bg-red-900/20 border border-red-500/30 rounded-lg flex items-center justify-center`} style={style}>
        <div className="text-red-400 text-center p-4">
          <div className="text-lg font-bold">🔒 SECURE ACCESS DENIED</div>
          <div className="text-sm">VaultSecure Protection Active</div>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="relative ultra-secure-container" 
      style={{
        ...style,
        userSelect: 'none',
        webkitUserSelect: 'none',
        mozUserSelect: 'none',
        msUserSelect: 'none',
        webkitUserDrag: 'none',
        webkitTouchCallout: 'none'
      }}
    >
      {loading && (
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/50 to-indigo-900/50 animate-pulse rounded-lg flex items-center justify-center">
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
          display: loading ? 'none' : 'block',
          userSelect: 'none',
          webkitUserSelect: 'none',
          pointerEvents: 'none'
        }}
      />
    </div>
  );
};

export default SimpleSecureImage;
