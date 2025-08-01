import React, { useState, useEffect, useRef } from 'react';
import apiService from '../services/api';
import brandingConfig from '../config/branding';

const SimpleImageDisplay = ({ imageId, alt, className, style, onLoad, onError }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const canvasRef = useRef(null);
  const hasInitialized = useRef(false);
  const currentImageId = useRef(null);
  const loadingTimeoutRef = useRef(null);
  const maxRetries = 3;
  const loadingTimeout = 15000; // 15 seconds timeout

  useEffect(() => {
    // Prevent re-initialization for the same image
    if (hasInitialized.current && currentImageId.current === imageId) {
      return;
    }

    // Reset state for new image
    if (currentImageId.current !== imageId) {
      hasInitialized.current = false;
      currentImageId.current = imageId;
      setLoading(true);
      setError(false);
    }

    if (!imageId || !canvasRef.current || hasInitialized.current) {
      return;
    }

    hasInitialized.current = true;

    const loadImage = async () => {
      try {
        console.log('SimpleImageDisplay: Loading image for ID:', imageId, 'attempt:', retryCount + 1);
        
        // Clear any existing timeout
        if (loadingTimeoutRef.current) {
          clearTimeout(loadingTimeoutRef.current);
        }
        
        // Set loading timeout
        loadingTimeoutRef.current = setTimeout(() => {
          console.warn('SimpleImageDisplay: Loading timeout for:', imageId);
          handleLoadingError('Loading timeout');
        }, loadingTimeout);
        
        // Get images from API with caching
        const images = await apiService.getImages();
        const imageData = images.find(img => img.id === imageId);
        
        if (!imageData) {
          console.error('SimpleImageDisplay: Image not found for ID:', imageId);
          clearTimeout(loadingTimeoutRef.current);
          renderPlaceholder('Image not found');
          return;
        }

        console.log('SimpleImageDisplay: Found image data:', imageData);
        
        // Try to load secure image with timeout protection
        try {
          const secureImageData = await Promise.race([
            apiService.getSecureImageData(imageData.url),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Secure image timeout')), loadingTimeout - 1000)
            )
          ]);
          
          clearTimeout(loadingTimeoutRef.current);
          
          if (secureImageData && secureImageData.success && secureImageData.imageData) {
            renderImageToCanvas(secureImageData.imageData);
          } else {
            renderPlaceholder(imageData.title);
          }
        } catch (secureError) {
          clearTimeout(loadingTimeoutRef.current);
          console.warn('SimpleImageDisplay: Secure loading failed:', secureError);
          handleLoadingError(imageData.title || 'Secure loading failed');
        }
      } catch (error) {
        clearTimeout(loadingTimeoutRef.current);
        console.error('SimpleImageDisplay: Error loading image:', error);
        handleLoadingError('Loading error');
      }
    };
    
    const handleLoadingError = (errorMessage) => {
      if (retryCount < maxRetries) {
        console.log(`SimpleImageDisplay: Retrying load for ${imageId}, attempt ${retryCount + 2}`);
        setRetryCount(prev => prev + 1);
        // Retry after a short delay
        setTimeout(() => {
          hasInitialized.current = false;
          loadImage();
        }, 1000 * (retryCount + 1)); // Exponential backoff
      } else {
        console.error(`SimpleImageDisplay: Max retries exceeded for ${imageId}`);
        renderPlaceholder(errorMessage);
      }
    };

    const renderImageToCanvas = (imageDataUrl) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        try {
          console.log('SimpleImageDisplay: Image loaded, rendering to canvas');
          
          const container = canvas.parentElement;
          const containerWidth = container?.clientWidth || 400;
          const containerHeight = container?.clientHeight || 400;
          
          // Set canvas size to match container exactly
          canvas.width = containerWidth;
          canvas.height = containerHeight;
          
          // Calculate aspect ratio for COVER fit (fills entire container)
          const aspectRatio = img.width / img.height;
          const containerAspect = containerWidth / containerHeight;
          
          let drawWidth, drawHeight, drawX, drawY;
          
          // Use object-fit: cover logic - crop to fill container completely
          if (aspectRatio > containerAspect) {
            // Image is wider - fit to height and crop width
            drawHeight = containerHeight;
            drawWidth = containerHeight * aspectRatio;
            drawX = (containerWidth - drawWidth) / 2;
            drawY = 0;
          } else {
            // Image is taller - fit to width and crop height
            drawWidth = containerWidth;
            drawHeight = containerWidth / aspectRatio;
            drawX = 0;
            drawY = (containerHeight - drawHeight) / 2;
          }
          
          // Clear and draw image to fill entire canvas
          ctx.clearRect(0, 0, containerWidth, containerHeight);
          ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
          
          
          setLoading(false);
          setError(false);
          
          if (onLoad) onLoad(img);
        } catch (renderError) {
          console.error('Error rendering image:', renderError);
          renderPlaceholder('Render error');
        }
      };
      
      img.onerror = () => {
        console.error('Failed to load image into canvas');
        renderPlaceholder('Image load error');
      };
      
      img.src = imageDataUrl;
    };

    const renderPlaceholder = (title) => {
      const canvas = canvasRef.current;
      if (!canvas) {
        setLoading(false);
        setError(true);
        return;
      }

      try {
        const ctx = canvas.getContext('2d');
        const container = canvas.parentElement;
        const containerWidth = container?.clientWidth || 400;
        const containerHeight = container?.clientHeight || 400;
        
        canvas.width = containerWidth;
        canvas.height = containerHeight;
        
        // Create gradient background
        const colors = {
          '1': '#FF6B6B',
          '2': '#4ECDC4', 
          '3': '#45B7D1',
          '4': '#96CEB4',
          '5': '#FFEAA7'
        };
        
        const color = colors[imageId] || '#4338ca';
        
        const gradient = ctx.createLinearGradient(0, 0, containerWidth, containerHeight);
        gradient.addColorStop(0, color);
        gradient.addColorStop(1, color + '88');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, containerWidth, containerHeight);
        
        // Add text
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('🔒 SECURE CONTENT', containerWidth/2, containerHeight/2 - 20);
        
        ctx.font = '12px Arial';
        ctx.fillText(title || 'Secure Image', containerWidth/2, containerHeight/2 + 5);
        
        ctx.font = '10px Arial';
        ctx.fillText(`ID: ${imageId}`, containerWidth/2, containerHeight/2 + 20);
        
        
        setLoading(false);
        if (onLoad) {
          // Create a mock image object with square aspect ratio for placeholders
          const mockImg = {
            naturalWidth: containerWidth || 400,
            naturalHeight: containerHeight || 400,
            width: containerWidth || 400,
            height: containerHeight || 400
          };
          onLoad(mockImg);
        }
      } catch (placeholderError) {
        console.error('Error rendering placeholder:', placeholderError);
        setLoading(false);
        setError(true);
        if (onError) onError(placeholderError);
      }
    };

    loadImage();
    
    // Cleanup timeout on unmount
    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
    };
  }, [imageId, onLoad, onError, retryCount]);

  if (error) {
    return (
      <div className={`${className} bg-red-900/20 border border-red-500/30 rounded-lg flex items-center justify-center`} style={style}>
        <div className="text-red-400 text-center p-4">
          <div className="text-lg font-bold">🔒 SECURE ACCESS DENIED</div>
          <div className="text-sm">Protection Active</div>
        </div>
      </div>
    );
  }

  return (
    <div 
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
        onContextMenu={(e) => {
          e.preventDefault();
          return false;
        }}
        onDragStart={(e) => {
          e.preventDefault();
          return false;
        }}
      />
    </div>
  );
};

export default SimpleImageDisplay;
