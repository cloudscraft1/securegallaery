import React, { useState, useEffect, useRef } from 'react';
import apiService from '../services/api';

const SimpleSecureImage = ({ imageId, alt, className, style, onLoad, onError }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const loadAndRenderImage = async () => {
      if (!imageId || !canvasRef.current) {
        console.warn('SimpleSecureImage: Missing imageId or canvas ref');
        return;
      }
      
      console.log('SimpleSecureImage: Loading image for ID:', imageId);
      setLoading(true);
      setError(false);
      
      try {
        // First, get the images list to find the URL for this imageId
        const images = await apiService.getImages();
        const imageData = images.find(img => img.id === imageId);
        
        if (!imageData) {
          console.error('SimpleSecureImage: Image not found for ID:', imageId);
          setError(true);
          setLoading(false);
          return;
        }
        
        console.log('SimpleSecureImage: Found image data:', imageData);
        
        // Try to load the secure image from backend
        try {
          const secureImageData = await apiService.getSecureImageData(imageData.url);
          
          if (secureImageData && secureImageData.success && secureImageData.imageData) {
            console.log('SimpleSecureImage: Successfully loaded secure image data');
            
            // Render the image to canvas
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            const img = new Image();
            
            img.onload = () => {
              console.log('SimpleSecureImage: Image loaded, rendering to canvas');
              
              // Set canvas size based on container
              const containerWidth = canvas.parentElement?.clientWidth || 400;
              const containerHeight = canvas.parentElement?.clientHeight || 400;
              
              canvas.width = containerWidth;
              canvas.height = containerHeight;
              
              // Calculate aspect ratio to fit image properly
              const aspectRatio = img.width / img.height;
              const containerAspect = containerWidth / containerHeight;
              
              let drawWidth, drawHeight, drawX, drawY;
              
              if (aspectRatio > containerAspect) {
                // Image is wider than container
                drawWidth = containerWidth;
                drawHeight = containerWidth / aspectRatio;
                drawX = 0;
                drawY = (containerHeight - drawHeight) / 2;
              } else {
                // Image is taller than container
                drawHeight = containerHeight;
                drawWidth = containerHeight * aspectRatio;
                drawX = (containerWidth - drawWidth) / 2;
                drawY = 0;
              }
              
              // Clear canvas and draw image
              ctx.clearRect(0, 0, containerWidth, containerHeight);
              ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
              
              // Add small watermark overlay (the backend already adds watermarks)
              ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
              ctx.font = '12px Arial';
              ctx.textAlign = 'left';
              ctx.fillText('© VaultSecure', 10, containerHeight - 10);
              
              setImageLoaded(true);
              setLoading(false);
              
              if (onLoad) onLoad();
            };
            
            img.onerror = (imgError) => {
              console.error('SimpleSecureImage: Failed to load image into canvas:', imgError);
              setError(true);
              setLoading(false);
              if (onError) onError(imgError);
            };
            
            img.src = secureImageData.imageData;
            
          } else {
            throw new Error('Invalid secure image data received');
          }
        } catch (secureError) {
          console.error('SimpleSecureImage: Secure image loading failed:', secureError);
          
          // Fallback: Create a placeholder with the image title
          const canvas = canvasRef.current;
          const ctx = canvas.getContext('2d');
          
          // Set canvas size
          const containerWidth = canvas.parentElement?.clientWidth || 400;
          const containerHeight = canvas.parentElement?.clientHeight || 400;
          
          canvas.width = containerWidth;
          canvas.height = containerHeight;
          
          // Create gradient background based on image ID
          const colors = {
            '1': { start: '#FF6B6B', end: '#FF8E8E' },
            '2': { start: '#4ECDC4', end: '#6ED9D0' },
            '3': { start: '#45B7D1', end: '#6AC4D9' },
            '4': { start: '#96CEB4', end: '#A8D5C1' },
            '5': { start: '#FFEAA7', end: '#FFEFB8' }
          };
          
          const color = colors[imageId] || { start: '#4338ca', end: '#5B4FE8' };
          
          const gradient = ctx.createLinearGradient(0, 0, containerWidth, containerHeight);
          gradient.addColorStop(0, color.start);
          gradient.addColorStop(1, color.end);
          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, containerWidth, containerHeight);
          
          // Add content
          ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
          ctx.font = 'bold 20px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('🔒 VAULTSECURE', containerWidth/2, containerHeight/2 - 30);
          
          ctx.font = '16px Arial';
          ctx.fillText(imageData.title || 'Secure Image', containerWidth/2, containerHeight/2);
          
          ctx.font = '12px Arial';
          ctx.fillText('Loading from gallery...', containerWidth/2, containerHeight/2 + 25);
          ctx.fillText(`ID: ${imageId}`, containerWidth/2, containerHeight/2 + 45);
          
          // Add corner info
          ctx.font = '10px Arial';
          ctx.textAlign = 'left';
          ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
          ctx.fillText('© VaultSecure Gallery', 10, containerHeight - 10);
          
          ctx.textAlign = 'right';
          ctx.fillText(new Date().toLocaleDateString(), containerWidth - 10, containerHeight - 10);
          
          setLoading(false);
          if (onLoad) onLoad();
        }
      } catch (error) {
        console.error('SimpleSecureImage: Error loading image:', error);
        setError(true);
        setLoading(false);
        if (onError) onError(error);
      }
    };

    loadAndRenderImage();
    
    // Add resize observer for dynamic sizing
    const handleResize = () => {
      if (canvasRef.current && imageLoaded) {
        setTimeout(() => {
          loadAndRenderImage();
        }, 100);
      }
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
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

    // 5. Developer tools detection - reduced sensitivity
    let devToolsOpen = false;
    const detectDevTools = () => {
      const threshold = 300; // Increased threshold to reduce false positives
      const heightDiff = window.outerHeight - window.innerHeight;
      const widthDiff = window.outerWidth - window.innerWidth;
      
      // Only trigger if both dimensions are significantly different
      if (heightDiff > threshold && widthDiff > threshold) {
        if (!devToolsOpen) {
          devToolsOpen = true;
          // Only log, don't blur content
          console.warn('Developer tools may be open');
        }
      } else {
        if (devToolsOpen) {
          devToolsOpen = false;
        }
      }
    };

      // 6. Screenshot detection - reduced sensitivity
      const detectScreenshot = () => {
        // Only monitor for actual screenshot key combinations, not page visibility
        const checkKeyPress = (e) => {
          if (e.key === 'PrintScreen' || e.keyCode === 44) {
            apiService.reportSuspiciousActivity('Print screen key detected');
          }
        };
        
        document.addEventListener('keydown', checkKeyPress);
        return () => document.removeEventListener('keydown', checkKeyPress);
      };

    // Apply all protections
    container.addEventListener('contextmenu', handleContextMenu);
    container.addEventListener('dragstart', handleDragStart);
    container.addEventListener('selectstart', handleSelectStart);
    document.addEventListener('keydown', handleKeyDown);
    
    // const devToolsInterval = setInterval(detectDevTools, 1000); // Disabled for debugging
    const cleanupScreenshot = detectScreenshot();
    console.log('SimpleSecureImage: Security protections activated for image', imageId);

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
      // clearInterval(devToolsInterval); // Disabled for debugging
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
            <div className="text-sm">🔒 Loading Secure Image...</div>
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
          pointerEvents: 'auto',
          width: '100%',
          height: '100%',
          objectFit: 'cover'
        }}
      />
    </div>
  );
};

export default SimpleSecureImage;
