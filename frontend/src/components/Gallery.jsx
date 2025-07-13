import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, Heart, Download, Sparkles, Shield, Lock, AlertTriangle, CheckCircle } from 'lucide-react';
import ImageModal from './ImageModal';
import UltraSecureImage from './UltraSecureImage';
import SimpleImageDisplay from './SimpleImageDisplay';
import apiService from '../services/api';
import { useToast } from '../hooks/use-toast';
import screenshotProtection from '../lib/safe-screenshot-protection';
import brandingConfig from '../config/branding';

const Gallery = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageLoading, setImageLoading] = useState({});
  const [imageAspectRatios, setImageAspectRatios] = useState({});
  const [sessionStatus, setSessionStatus] = useState('connecting');
  const [securityLevel, setSecurityLevel] = useState('maximum');
  const [hoveredImage, setHoveredImage] = useState(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMorePages, setHasMorePages] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [pageSize] = useState(12); // Load 12 images per page
  const [requestLock, setRequestLock] = useState(false); // Prevent multiple simultaneous requests
  
  const { toast } = useToast();

  const handleVisibilityChange = () => {
    if (document.hidden) {
      // Clear sensitive data when page is hidden
      console.clear();
    }
  };

  useEffect(() => {
    initializeSecureGallery();
    
    // Initialize advanced screenshot protection
    screenshotProtection.initialize((message) => {
      toast({
        title: "🚨 Security Alert",
        description: message,
        variant: "destructive",
      });
    });
    
    // Add page visibility change listener for security
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Cleanup on unmount
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      screenshotProtection.destroy();
    };
  }, []);

  const initializeSecureGallery = async () => {
    try {
      console.log('Gallery: Starting secure gallery initialization');
      setSessionStatus('connecting');
      
      // Add minimum loading time to show the beautiful loading screen
      const startTime = Date.now();
      const minLoadingTime = 4000; // 4 seconds minimum
      
      // Progressive loading steps with delays
      console.log('Gallery: Waiting for initial delay');
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Initialize secure session
      console.log('Gallery: Initializing secure session');
      await apiService.initializeSession();
      await new Promise(resolve => setTimeout(resolve, 600));
      
      console.log('Gallery: Session initialized, updating status');
      setSessionStatus('connected');
      setSecurityLevel(apiService.getSecurityLevel());
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Fetch protected images (first page only)
      console.log('Gallery: Fetching protected images (first page)');
      const response = await apiService.getImages(1, pageSize);
      console.log('Gallery: Fetched images response:', response);
      
      if (response && response.images) {
        setImages(response.images);
        setCurrentPage(1);
        setTotalPages(response.totalPages || 1);
        setHasMorePages(response.hasMore || false);
        console.log('Gallery: Images count:', response.images.length);
        console.log('Gallery: Total pages:', response.totalPages);
        console.log('Gallery: Has more pages:', response.hasMore);
      } else {
        // Fallback for old API response format
        const fetchedImages = response || [];
        setImages(fetchedImages);
        setCurrentPage(1);
        setTotalPages(1);
        setHasMorePages(false);
        console.log('Gallery: Images count (fallback):', fetchedImages.length);
      }
      
      await new Promise(resolve => setTimeout(resolve, 600));
      
      // Calculate remaining time to meet minimum loading duration
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, minLoadingTime - elapsedTime);
      
      // Wait for remaining time if needed
      if (remainingTime > 0) {
        await new Promise(resolve => setTimeout(resolve, remainingTime));
      }
      
      toast({
        title: brandingConfig.securityMessage,
        description: brandingConfig.securityDescription,
        variant: "default",
      });
      
    } catch (error) {
      console.error('Failed to initialize secure gallery:', error);
      setSessionStatus('error');
      
      // Still show minimum loading time even on error
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      toast({
        title: "🚨 Security Error",
        description: error.message || "Failed to establish secure connection.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const loadMoreImages = async () => {
    // Prevent multiple simultaneous requests
    if (loadingMore || !hasMorePages || requestLock) return;
    
    try {
      setLoadingMore(true);
      setRequestLock(true);
      console.log('Gallery: Loading more images, page:', currentPage + 1);
      
      // Add delay to prevent rapid-fire requests
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const response = await apiService.getImages(currentPage + 1, pageSize);
      console.log('Gallery: Fetched additional images response:', response);
      
      if (response && response.images) {
        setImages(prev => [...prev, ...response.images]);
        setCurrentPage(prev => prev + 1);
        setTotalPages(response.totalPages || totalPages);
        setHasMorePages(response.hasMore || false);
        console.log('Gallery: Added images count:', response.images.length);
        console.log('Gallery: Total images now:', images.length + response.images.length);
      } else {
        // Fallback for old API response format
        const fetchedImages = response || [];
        if (fetchedImages.length > 0) {
          setImages(prev => [...prev, ...fetchedImages]);
          setCurrentPage(prev => prev + 1);
        }
        setHasMorePages(false);
      }
      
      toast({
        title: "📸 More Images Loaded",
        description: `Successfully loaded ${response?.images?.length || 0} more images.`,
        variant: "default",
      });
      
    } catch (error) {
      console.error('Failed to load more images:', error);
      
      // Implement exponential backoff for retries
      const isRateLimited = error.message?.includes('Too many requests') || error.status === 429;
      
      if (isRateLimited) {
        toast({
          title: "⏳ Rate Limited",
          description: "Please wait a moment before loading more images.",
          variant: "destructive",
        });
        
        // Wait longer before allowing next request
        setTimeout(() => {
          setRequestLock(false);
        }, 5000); // 5 second cooldown
      } else {
        toast({
          title: "❌ Load Error",
          description: error.message || "Failed to load more images.",
          variant: "destructive",
        });
      }
    } finally {
      setLoadingMore(false);
      if (!error || !error.message?.includes('Too many requests')) {
        // Release lock immediately if no rate limiting
        setTimeout(() => {
          setRequestLock(false);
        }, 1000); // 1 second cooldown for normal requests
      }
    }
  };

  const handleImageLoad = useCallback((imageId) => {
    console.log('Gallery: Image loaded successfully:', imageId);
    setImageLoading(prev => ({ ...prev, [imageId]: false }));
    
    // Protect the loaded image with advanced screenshot protection
    setTimeout(() => {
      const canvasElements = document.querySelectorAll('.ultra-secure-container canvas');
      console.log('Gallery: Protecting', canvasElements.length, 'canvas elements');
      canvasElements.forEach(canvas => {
        screenshotProtection.protectElement(canvas);
      });
    }, 100);
  }, []);

  const handleImageLoadWithAspectRatio = useCallback((imageId, imgElement) => {
    if (imgElement && imgElement.naturalWidth && imgElement.naturalHeight) {
      const aspectRatio = imgElement.naturalWidth / imgElement.naturalHeight;
      setImageAspectRatios(prev => ({ ...prev, [imageId]: aspectRatio }));
      console.log('Gallery: Image aspect ratio calculated:', imageId, aspectRatio);
    }
    handleImageLoad(imageId);
  }, [handleImageLoad]);

  const getImageClass = useCallback((imageId, index) => {
    const aspectRatio = imageAspectRatios[imageId];
    
    // Dynamic masonry layout with moderate sizing based on aspect ratio
    if (aspectRatio) {
      // Use actual aspect ratio for balanced dynamic sizing
      if (aspectRatio > 2.0) {
        return 'gallery-item gallery-item-panorama'; // Wide panoramic images
      } else if (aspectRatio > 1.5) {
        return 'gallery-item gallery-item-wide'; // Wide landscape images
      } else if (aspectRatio > 1.2) {
        return 'gallery-item gallery-item-hero'; // Medium landscape hero
      } else if (aspectRatio < 0.6) {
        return 'gallery-item gallery-item-portrait'; // Tall portrait images
      } else if (aspectRatio < 0.8) {
        return 'gallery-item gallery-item-tall'; // Tall images
      } else {
        // Square and near-square images
        return 'gallery-item gallery-item-square';
      }
    } else {
      // Balanced fallback pattern with moderate dynamic sizing
      const dynamicPatterns = [
        'gallery-item gallery-item-square',    // 0: Standard square (most common)
        'gallery-item gallery-item-square',    // 1: Standard square
        'gallery-item gallery-item-wide',      // 2: Wide (horizontal)
        'gallery-item gallery-item-square',    // 3: Standard square
        'gallery-item gallery-item-compact',   // 4: Compact
        'gallery-item gallery-item-square',    // 5: Standard square
        'gallery-item gallery-item-tall',      // 6: Tall (vertical)
        'gallery-item gallery-item-square',    // 7: Standard square
        'gallery-item gallery-item-square',    // 8: Standard square
        'gallery-item gallery-item-hero',      // 9: Hero (moderate wide)
        'gallery-item gallery-item-square',    // 10: Standard square
        'gallery-item gallery-item-mini',      // 11: Mini
        'gallery-item gallery-item-square',    // 12: Standard square
        'gallery-item gallery-item-square',    // 13: Standard square
        'gallery-item gallery-item-panorama',  // 14: Panorama (occasional)
        'gallery-item gallery-item-square',    // 15: Standard square
        'gallery-item gallery-item-square',    // 16: Standard square
        'gallery-item gallery-item-portrait',  // 17: Portrait (occasional)
        'gallery-item gallery-item-square',    // 18: Standard square
        'gallery-item gallery-item-grand',     // 19: Grand (rare, moderate 2x2)
      ];
      
      return dynamicPatterns[index % dynamicPatterns.length];
    }
  }, [imageAspectRatios]);

  const handleImageLoadStart = useCallback((imageId) => {
    console.log('Gallery: Image load started for:', imageId);
    setImageLoading(prev => ({ ...prev, [imageId]: true }));
  }, []);

  const handleImageError = useCallback((imageId) => {
    console.log('Gallery: Image load error for:', imageId);
    setImageLoading(prev => ({ ...prev, [imageId]: false }));
  }, []);

  const openImageModal = (image) => {
    setSelectedImage(image);
    
    // Log security event
    console.log('🔒 VaultSecure: Secure image access granted');
  };

  const closeImageModal = () => {
    setSelectedImage(null);
  };

  const navigateImage = (direction) => {
    const currentIndex = images.findIndex(img => img.id === selectedImage.id);
    let newIndex;
    
    if (direction === 'next') {
      newIndex = (currentIndex + 1) % images.length;
    } else {
      newIndex = (currentIndex - 1 + images.length) % images.length;
    }
    
    setSelectedImage(images[newIndex]);
  };

  const handleLikeImage = async (imageId) => {
    try {
      await apiService.likeImage(imageId);
      
      // Update local state
      setImages(prev => prev.map(img => 
        img.id === imageId 
          ? { ...img, likes: img.likes + 1 }
          : img
      ));
      
      toast({
        title: "❤️ Liked!",
        description: "Image added to your favorites securely.",
        variant: "default",
      });
    } catch (error) {
      console.error('Failed to like image:', error);
      toast({
        title: "❌ Error",
        description: error.message || "Failed to like image.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
          <div className="absolute top-0 right-4 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-2000"></div>
        </div>
        
        {/* Centered Loading Content */}
        <div className="flex items-center justify-center min-h-screen relative z-10">
          <div className="text-center px-4">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="flex flex-col items-center"
            >
              {/* Logo/Icon Section */}
              <div className="mb-8">
                <div className="relative flex items-center justify-center">
                  <div className="absolute -inset-6 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full blur opacity-75 animate-pulse"></div>
                  <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 p-6 rounded-full">
                    <Shield className="w-16 h-16 text-white" />
                  </div>
                </div>
              </div>
              
              {/* Brand Title */}
              <motion.h1 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.8 }}
                className="text-5xl lg:text-7xl font-black mb-4"
              >
                <span className="bg-gradient-to-r from-white via-blue-200 to-indigo-200 bg-clip-text text-transparent">
                  {brandingConfig.brandNamePart1}
                </span>
                <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-blue-600 bg-clip-text text-transparent">
                  {brandingConfig.brandNamePart2}
                </span>
              </motion.h1>
              
              {/* Loading Spinner */}
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="mb-6"
              >
                <div className="w-20 h-20 border-4 border-blue-500/30 rounded-full relative mx-auto">
                  <div className="absolute inset-0 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
                  <div className="absolute inset-3 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-full flex items-center justify-center">
                    {sessionStatus === 'connecting' && <Shield className="w-8 h-8 text-blue-300 animate-pulse" />}
                    {sessionStatus === 'connected' && <CheckCircle className="w-8 h-8 text-green-300 animate-pulse" />}
                    {sessionStatus === 'error' && <AlertTriangle className="w-8 h-8 text-red-300 animate-pulse" />}
                  </div>
                </div>
              </motion.div>
              
              {/* Status Text */}
              <motion.p 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.8 }}
                className="text-xl text-blue-200 mb-4 max-w-md"
              >
                {sessionStatus === 'connecting' && brandingConfig.loadingMessages.connecting}
                {sessionStatus === 'connected' && brandingConfig.loadingMessages.connected}
                {sessionStatus === 'error' && brandingConfig.loadingMessages.error}
              </motion.p>
              
              {/* Security Level Indicator */}
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.9, duration: 0.8 }}
                className="flex items-center justify-center gap-2 text-blue-300/80"
              >
                <Lock className="w-4 h-4" />
                <span className="text-sm font-medium">{brandingConfig.vaultDescription}</span>
                <Lock className="w-4 h-4" />
              </motion.div>
              
              {/* Progress Dots */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.1, duration: 0.6 }}
                className="flex space-x-2 mt-8"
              >
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-blue-300 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden protected-content">
      {/* Enhanced Animated Background Elements */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-10 left-10 w-96 h-96 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
        <div className="absolute top-0 right-4 w-80 h-80 bg-gradient-to-r from-indigo-500 to-pink-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute -bottom-8 left-20 w-88 h-88 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full mix-blend-multiply filter blur-2xl animate-pulse delay-3000"></div>
      </div>
      
      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white/10 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      {/* Security Status Indicators */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-2 right-2 sm:top-4 sm:right-4 z-50 flex flex-col gap-1 sm:gap-2"
      >
        <div className="bg-green-500/20 backdrop-blur-sm border border-green-500/30 rounded-full px-2 sm:px-4 py-1 sm:py-2">
          <div className="flex items-center gap-1 sm:gap-2 text-green-300">
            <Shield className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="text-xs sm:text-sm font-medium hidden sm:inline">{brandingConfig.statusLabels.secureGallery}</span>
          </div>
        </div>
        <div className="bg-blue-500/20 backdrop-blur-sm border border-blue-500/30 rounded-full px-2 sm:px-4 py-1 sm:py-2">
          <div className="flex items-center gap-1 sm:gap-2 text-blue-300">
            <Lock className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="text-xs sm:text-sm font-medium hidden sm:inline">{brandingConfig.statusLabels.protectedImages}</span>
          </div>
        </div>
      </motion.div>

      {/* Hero Header */}
      <motion.div 
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 text-center py-8 sm:py-12 lg:py-16 px-4"
      >
        <div className="inline-flex items-center justify-center mb-4 sm:mb-6">
          <div className="relative">
            <div className="absolute -inset-2 sm:-inset-4 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full blur opacity-75 animate-pulse"></div>
            <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 p-2 sm:p-4 rounded-full">
              <Shield className="w-8 h-8 sm:w-12 sm:h-12 text-white" />
            </div>
          </div>
        </div>
        
        <motion.h1 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-8xl font-black mb-4 sm:mb-6 leading-tight"
        >
          <span className="bg-gradient-to-r from-white via-blue-200 to-indigo-200 bg-clip-text text-transparent">
            {brandingConfig.brandNamePart1}
          </span>
          <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-blue-600 bg-clip-text text-transparent">
            {brandingConfig.brandNamePart2}
          </span>
        </motion.h1>
        
        <motion.p 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-blue-200 mb-3 sm:mb-4 max-w-xs sm:max-w-lg md:max-w-xl lg:max-w-2xl mx-auto px-4"
        >
          {brandingConfig.tagline}
        </motion.p>
        
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.8 }}
          className="flex items-center justify-center gap-1 sm:gap-2 text-blue-300 flex-wrap"
        >
          <Lock className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
          <span className="text-xs sm:text-sm md:text-base lg:text-lg text-center">{brandingConfig.vaultDescription}</span>
          <Lock className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
        </motion.div>
        
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.8 }}
          className="mt-2 sm:mt-4 text-xs sm:text-sm text-blue-400/80 px-4"
        >
          {brandingConfig.securityLevel.prefix} {securityLevel.toUpperCase()} {brandingConfig.securityLevel.suffix}
        </motion.div>
      </motion.div>

      {/* Gallery Grid */}
      <div className="relative z-10 w-full pb-8 sm:pb-16">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          className="gallery-grid"
        >
          {images.map((image, index) => (
            <motion.div
              key={image.id}
              initial={{ opacity: 0, y: 60, scale: 0.9, rotateY: -15 }}
              animate={{ opacity: 1, y: 0, scale: 1, rotateY: 0 }}
              transition={{ 
                delay: index * 0.08, 
                duration: 0.8,
                ease: [0.25, 0.46, 0.45, 0.94]
              }}
              className={`${getImageClass(image.id, index)} group cursor-pointer protected-content`}
              onClick={() => openImageModal(image)}
              onMouseEnter={() => setHoveredImage(image.id)}
              onMouseLeave={() => setHoveredImage(null)}
              style={{
                perspective: '1000px',
                transformStyle: 'preserve-3d'
              }}
            >
              {/* Enhanced Modern Glass Card */}
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-xl border border-white/30 shadow-2xl w-full h-full transition-all duration-500 group-hover:shadow-3xl group-hover:scale-[1.02] group-hover:border-white/50">
                {/* Background Pattern */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-indigo-500/5 opacity-50"></div>
                
                {/* Animated Border Glow */}
                <div className={`absolute inset-0 rounded-3xl transition-all duration-500 ${
                  hoveredImage === image.id 
                    ? 'shadow-[0_0_30px_rgba(59,130,246,0.3)] ring-2 ring-blue-400/30' 
                    : 'shadow-[0_0_20px_rgba(255,255,255,0.1)]'
                }`}></div>
                
                <div className="relative w-full h-full">
                  {/* Enhanced Loading shimmer effect */}
                  {imageLoading[image.id] && (
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-indigo-900/30 to-purple-900/20 animate-pulse rounded-3xl">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-12 h-12 border-4 border-white/30 rounded-full border-t-white/70 animate-spin"></div>
                      </div>
                    </div>
                  )}
                  
                  {/* Ultra-Secure Image with Maximum Protection */}
                  <SimpleImageDisplay
                    imageId={image.id}
                    alt={image.title}
                    className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110 protected-content rounded-3xl"
                    onLoad={(imgElement) => handleImageLoadWithAspectRatio(image.id, imgElement)}
                    onError={() => handleImageError(image.id)}
                    style={{ 
                      width: '100%',
                      height: '100%',
                      display: 'block'
                    }}
                  />
                  
                  {/* Enhanced Dynamic gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl"></div>
                  
                  {/* Floating Action Icons */}
                  <div className={`absolute top-3 right-3 flex gap-2 transition-all duration-300 ${
                    hoveredImage === image.id 
                      ? 'opacity-100 translate-y-0' 
                      : 'opacity-0 translate-y-2'
                  }`}>
                    <div className="bg-white/20 backdrop-blur-sm rounded-full p-2 hover:bg-white/30 transition-colors">
                      <Heart className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm rounded-full p-2 hover:bg-white/30 transition-colors">
                      <Eye className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  
                  {/* Bottom Info Panel */}
                  <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent backdrop-blur-sm rounded-b-3xl p-4 transition-all duration-300 ${
                    hoveredImage === image.id 
                      ? 'opacity-100 translate-y-0' 
                      : 'opacity-0 translate-y-4'
                  }`}>
                    <div className="text-white text-sm font-medium mb-1 truncate">
                      {image.title || 'Secure Image'}
                    </div>
                    <div className="flex items-center gap-2 text-white/70 text-xs">
                      <Shield className="w-3 h-3" />
                      <span>Protected</span>
                    </div>
                  </div>
                  
                  {/* Animated Corner Accent */}
                  <div className={`absolute top-3 left-3 w-3 h-3 rounded-full transition-all duration-300 ${
                    hoveredImage === image.id 
                      ? 'bg-gradient-to-r from-blue-400 to-purple-400 shadow-lg shadow-blue-400/50 scale-110' 
                      : 'bg-white/30 scale-100'
                  }`}></div>
                  
                  {/* Subtle Shine Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-3xl"></div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
        
        {/* Load More Button */}
        {hasMorePages && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center mt-8 px-4"
          >
            <button
              onClick={loadMoreImages}
              disabled={loadingMore || requestLock}
              className="group relative bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold py-4 px-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed transform hover:scale-105"
            >
              {/* Background glow effect */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
              
              {/* Button content */}
              <div className="relative flex items-center gap-3">
                {loadingMore ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 rounded-full border-t-white animate-spin"></div>
                    <span>Loading More Images...</span>
                  </>
                ) : requestLock ? (
                  <>
                    <div className="w-5 h-5 border-2 border-yellow-300/30 rounded-full border-t-yellow-300 animate-spin"></div>
                    <span>Please wait...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>Load More Images</span>
                    <div className="text-xs bg-white/20 px-2 py-1 rounded-full">
                      Page {currentPage + 1} of {totalPages}
                    </div>
                  </>
                )}
              </div>
            </button>
          </motion.div>
        )}
        
        {/* End of Gallery Message */}
        {!hasMorePages && images.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center mt-8 px-4"
          >
            <div className="text-center text-blue-300/80">
              <div className="flex items-center gap-2 justify-center mb-2">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">All images loaded</span>
              </div>
              <div className="text-sm text-blue-400/60">
                Showing {images.length} secure images
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Image Modal */}
      <ImageModal
        image={selectedImage}
        isOpen={!!selectedImage}
        onClose={closeImageModal}
        onNavigate={navigateImage}
        canNavigate={images.length > 1}
        onLike={handleLikeImage}
      />
    </div>
  );
};

export default Gallery;