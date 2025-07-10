import React, { useState, useEffect, useRef, useCallback } from 'react';
import apiService from '../services/api';
import brandingConfig from '../config/branding';

const SimpleSecureImage = ({ imageId, alt, className, style, onLoad, onError }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [imageData, setImageData] = useState(null);
  const [hasLoaded, setHasLoaded] = useState(false);
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const loadingRef = useRef(false);

  // Memoize the callback functions to prevent re-renders
  const stableOnLoad = useCallback(() => {
    if (onLoad && !hasLoaded) {
      setHasLoaded(true);
      onLoad();
    }
  }, [onLoad, hasLoaded]);

  const stableOnError = useCallback((err) => {
    if (onError) {
      onError(err);
    }
  }, [onError]);

  const renderImageToCanvas = useCallback((imageDataUrl) => {
    return new Promise((resolve) => {
      if (!canvasRef.current) {
        resolve();
        return;
      }

      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        try {
          console.log('SimpleSecureImage: Image loaded, rendering to canvas');
          
          // Set canvas size based on container or default
          const container = canvas.parentElement;
          const containerWidth = container?.clientWidth || 400;
          const containerHeight = container?.clientHeight || 400;
          
          // Set canvas dimensions
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
          
          // Add minimal canvas watermark
          ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
          ctx.font = '10px Arial';
          ctx.textAlign = 'left';
          ctx.fillText(brandingConfig.canvasWatermark, 8, containerHeight - 8);
          
          setLoading(false);
          setError(false);
          loadingRef.current = false;
          
          stableOnLoad();
          resolve();
        } catch (renderError) {
          console.error('Error rendering image to canvas:', renderError);
          setError(true);
          setLoading(false);
          loadingRef.current = false;
          stableOnError(renderError);
          resolve();
        }
      };
      
      img.onerror = (imgError) => {
        console.error('SimpleSecureImage: Failed to load image into canvas:', imgError);
        setError(true);
        setLoading(false);
        loadingRef.current = false;
        stableOnError(imgError);
        resolve();
      };
      
      img.src = imageDataUrl;
    });
  }, [stableOnLoad, stableOnError]);

  const renderFallbackImage = useCallback((id, title) => {
    return new Promise((resolve) => {
      if (!canvasRef.current) {
        setLoading(false);
        setError(true);
        loadingRef.current = false;
        resolve();
        return;
      }

      try {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        
        // Set canvas size
        const container = canvas.parentElement;
        const containerWidth = container?.clientWidth || 400;
        const containerHeight = container?.clientHeight || 400;
        
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
        
        const color = colors[id] || { start: '#4338ca', end: '#5B4FE8' };
        
        const gradient = ctx.createLinearGradient(0, 0, containerWidth, containerHeight);
        gradient.addColorStop(0, color.start);
        gradient.addColorStop(1, color.end);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, containerWidth, containerHeight);
        
        // Add content with better positioning
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.font = 'bold 18px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('🔒 SECURE CONTENT', containerWidth/2, containerHeight/2 - 25);
        
        ctx.font = '14px Arial';
        ctx.fillText(title || 'Secure Image', containerWidth/2, containerHeight/2 + 5);
        
        ctx.font = '11px Arial';
        ctx.fillText(`ID: ${id}`, containerWidth/2, containerHeight/2 + 25);
        
        // Add minimal watermark
        ctx.font = '10px Arial';
        ctx.textAlign = 'left';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.fillText(brandingConfig.canvasWatermark, 8, containerHeight - 8);
        
        setLoading(false);
        loadingRef.current = false;
        stableOnLoad();
        resolve();
      } catch (fallbackError) {
        console.error('Error rendering fallback image:', fallbackError);
        setLoading(false);
        setError(true);
        loadingRef.current = false;
        stableOnError(fallbackError);
        resolve();
      }
    });
  }, [stableOnLoad, stableOnError]);

  useEffect(() => {
    // Prevent multiple simultaneous loads
    if (!imageId || loadingRef.current) {
      return;
    }

    const loadAndRenderImage = async () => {
      if (loadingRef.current) return; // Double check
      
      loadingRef.current = true;
      console.log('SimpleSecureImage: Loading image for ID:', imageId);
      setLoading(true);
      setError(false);
      setHasLoaded(false);
      
      try {
        // First, get the images list to find the secure URL for this imageId
        const images = await apiService.getImages();
        const foundImageData = images.find(img => img.id === imageId);
        
        if (!foundImageData) {
          console.error('SimpleSecureImage: Image not found for ID:', imageId);
          await renderFallbackImage(imageId, 'Image not found');
          return;
        }
        
        console.log('SimpleSecureImage: Found image data:', foundImageData);
        setImageData(foundImageData);
        
        // Try to load the secure image using the provided secure URL
        try {
          const secureImageData = await apiService.getSecureImageData(foundImageData.url);
          
          if (secureImageData && secureImageData.success && secureImageData.imageData) {
            console.log('SimpleSecureImage: Successfully loaded secure image data');
            await renderImageToCanvas(secureImageData.imageData);
          } else {
            console.warn('SimpleSecureImage: Invalid secure image data, using fallback');
            await renderFallbackImage(imageId, foundImageData.title);
          }
        } catch (secureError) {
          console.error('SimpleSecureImage: Secure image loading failed:', secureError);
          await renderFallbackImage(imageId, foundImageData.title);
        }
      } catch (error) {
        console.error('SimpleSecureImage: Error loading image:', error);
        await renderFallbackImage(imageId, 'Loading error');
      }
    };

    loadAndRenderImage();
    
  }, [imageId, renderImageToCanvas, renderFallbackImage]);

// Security protection for canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    
    if (!canvas || !container) return;

    // Disable drag
    const handleDragStart = (e) => {
      e.preventDefault();
      apiService.reportSuspiciousActivity('Drag attempt blocked on secure image');
      return false;
    };

    // Custom context menu handler
    const handleContextMenu = (e) => {
      e.preventDefault();
      
      // Show custom context menu with disabled options
      const menu = document.createElement('div');
      menu.style.cssText = `
        position: fixed;
        top: ${e.clientY}px;
        left: ${e.clientX}px;
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 8px;
        border-radius: 4px;
        font-size: 12px;
        z-index: 10000;
        border: 1px solid #333;
      `;
      
      menu.innerHTML = `
        <div style="padding: 4px 8px; color: #888; cursor: not-allowed;">Copy Image (Disabled)</div>
        <div style="padding: 4px 8px; color: #888; cursor: not-allowed;">Save Image (Disabled)</div>
        <div style="padding: 4px 8px; color: #888; cursor: not-allowed;">View Image (Disabled)</div>
        <div style="padding: 4px 8px; color: #4CAF50;">🔒 VaultSecure Protected</div>
      `;
      
      document.body.appendChild(menu);
      
      // Remove menu after 3 seconds or on click
      setTimeout(() => {
        if (menu.parentNode) menu.parentNode.removeChild(menu);
      }, 3000);
      
      const removeMenu = () => {
        if (menu.parentNode) menu.parentNode.removeChild(menu);
        document.removeEventListener('click', removeMenu);
      };
      
      document.addEventListener('click', removeMenu);
      
      apiService.reportSuspiciousActivity('Right-click detected on secure image');
      return false;
    };

    // Block copy operations
    const handleCopy = (e) => {
      e.preventDefault();
      apiService.reportSuspiciousActivity('Copy operation blocked on secure image');
      return false;
    };

    // Monitor dev tools without drastic actions
    let devToolsOpen = false;
    const detectDevTools = () => {
      const threshold = 300;
      const heightDiff = window.outerHeight - window.innerHeight;
      const widthDiff = window.outerWidth - window.innerWidth;
      
      if (heightDiff > threshold && widthDiff > threshold) {
        devToolsOpen = true;
        console.warn('Developer tools detected');
      } else {
        devToolsOpen = false;
      }
    };

    // Reduced screenshot detection
    const detectScreenshot = () => {
      const checkKeyPress = (e) => {
        if (e.key === 'PrintScreen') {
          apiService.reportSuspiciousActivity('Print screen key detected');
          alert('Screenshot detected!');
        }
      };
      
      document.addEventListener('keydown', checkKeyPress);
      return () => document.removeEventListener('keydown', checkKeyPress);
    };

    // Apply protections
    container.addEventListener('dragstart', handleDragStart);
    container.addEventListener('contextmenu', handleContextMenu);
    container.addEventListener('copy', handleCopy);
    setInterval(detectDevTools, 2000);
    const cleanupScreenshot = detectScreenshot();
    console.log('SimpleSecureImage: Adjusted security protections activated for image', imageId);

    // Restore original toDataURL
    const originalToDataURL = canvas.toDataURL;
    canvas.toDataURL = function() {
      apiService.reportSuspiciousActivity('Canvas data extraction blocked');
      throw new Error('Access denied: VaultSecure protection active');
    };

    return () => {
      container.removeEventListener('dragstart', handleDragStart);
      container.removeEventListener('contextmenu', handleContextMenu);
      container.removeEventListener('copy', handleCopy);
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
