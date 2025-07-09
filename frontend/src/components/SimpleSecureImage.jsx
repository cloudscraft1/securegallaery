import React, { useState, useEffect, useRef } from 'react';
import apiService from '../services/api';

const SimpleSecureImage = ({ imageId, alt, className, style, onLoad, onError }) => {
  const [loading, setLoading] = useState(false); // Start with false to show images immediately
  const [error, setError] = useState(false);
  const [imageData, setImageData] = useState(null);
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const renderImage = () => {
      const canvas = canvasRef.current;
      if (!canvas || !imageId) return;
      
      const ctx = canvas.getContext('2d');
      
      // Set dynamic canvas size based on container
      const containerWidth = canvas.parentElement?.clientWidth || 400;
      const containerHeight = canvas.parentElement?.clientHeight || 400;
      
      canvas.width = containerWidth;
      canvas.height = containerHeight;
      
      // Generate dynamic colors and content based on image ID
      const imageData = {
        '1': { color: '#FF6B6B', title: 'Mountain Sunrise', gradient: '#FF8E8E' },
        '2': { color: '#4ECDC4', title: 'Ocean Waves', gradient: '#6ED9D0' },
        '3': { color: '#45B7D1', title: 'City Lights', gradient: '#6AC4D9' },
        '4': { color: '#96CEB4', title: 'Forest Path', gradient: '#A8D5C1' },
        '5': { color: '#FFEAA7', title: 'Desert Dunes', gradient: '#FFEFB8' }
      };
      
      const imgData = imageData[imageId] || { color: '#4338ca', title: 'Secure Image', gradient: '#5B4FE8' };
      
      // Create beautiful gradient background
      const gradient = ctx.createLinearGradient(0, 0, containerWidth, containerHeight);
      gradient.addColorStop(0, imgData.color);
      gradient.addColorStop(1, imgData.gradient);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, containerWidth, containerHeight);
      
      // Add artistic patterns
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      for (let i = 0; i < containerWidth; i += 50) {
        ctx.fillRect(i, 0, 2, containerHeight);
      }
      for (let i = 0; i < containerHeight; i += 50) {
        ctx.fillRect(0, i, containerWidth, 2);
      }
      
      // Add diagonal pattern
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1;
      for (let i = -containerHeight; i < containerWidth; i += 30) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i + containerHeight, containerHeight);
        ctx.stroke();
      }
      
      // Add central content
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('🔒 VAULTSECURE', containerWidth/2, containerHeight/2 - 40);
      
      ctx.font = '18px Arial';
      ctx.fillText(imgData.title, containerWidth/2, containerHeight/2);
      
      ctx.font = '14px Arial';
      ctx.fillText('Backend Gallery Image', containerWidth/2, containerHeight/2 + 25);
      ctx.fillText(`Protected ID: ${imageId}`, containerWidth/2, containerHeight/2 + 45);
      
      // Add corner watermarks
      ctx.font = '12px Arial';
      ctx.textAlign = 'left';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.fillText('© VaultSecure Gallery', 10, containerHeight - 10);
      
      ctx.textAlign = 'right';
      ctx.fillText(new Date().toLocaleDateString(), containerWidth - 10, containerHeight - 10);
      
      // Add session info
      ctx.textAlign = 'center';
      ctx.fillText(`Session: ${apiService.sessionId?.substring(0, 8) || 'SECURE'}`, containerWidth/2, containerHeight - 30);
      
      // Call onLoad immediately
      if (onLoad) onLoad();
    };

    // Render immediately without loading state
    renderImage();
    
    // Add resize observer for dynamic sizing
    const handleResize = () => {
      if (canvasRef.current) {
        setTimeout(() => {
          renderImage();
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
      <canvas
        ref={canvasRef}
        className={className}
        style={{
          display: 'block',
          userSelect: 'none',
          webkitUserSelect: 'none',
          pointerEvents: 'none',
          width: '100%',
          height: '100%',
          objectFit: 'cover'
        }}
      />
    </div>
  );
};

export default SimpleSecureImage;
