import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/button';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Heart, 
  Share2, 
  Eye,
  Calendar,
  Camera,
  MapPin,
  Sparkles,
  Download,
  Star,
  Shield,
  Lock,
  AlertTriangle
} from 'lucide-react';
import SecureImage from './SecureImage';
import apiService from '../services/api';
import screenshotProtection from '../lib/safe-screenshot-protection';

const ImageModal = ({ image, isOpen, onClose, onNavigate, canNavigate, onLike }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [liked, setLiked] = useState(false);
  const [securityWarning, setSecurityWarning] = useState(false);

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
    
    // Protect the modal image with enhanced screenshot protection
    setTimeout(() => {
      const modalImages = document.querySelectorAll('.protected-content img');
      modalImages.forEach(img => {
        screenshotProtection.protectElement(img);
      });
    }, 100);
  }, []);

  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'ArrowLeft' && canNavigate) onNavigate('prev');
    if (e.key === 'ArrowRight' && canNavigate) onNavigate('next');
    
    // Note: Screenshot detection is now handled by the advanced protection system
  }, [onClose, onNavigate, canNavigate]);

  const handleLike = useCallback(() => {
    if (onLike && image) {
      onLike(image.id);
      setLiked(true);
    }
  }, [onLike, image]);

  const handleDownloadAttempt = useCallback(() => {
    setSecurityWarning(true);
    setTimeout(() => setSecurityWarning(false), 3000);
    apiService.reportSuspiciousActivity('Download attempt blocked');
  }, []);

  useEffect(() => {
    if (image) {
      setImageLoaded(false);
      setLiked(false);
    }
  }, [image]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyPress);
      document.body.style.overflow = 'hidden';
      
      // Additional security: disable print
      window.addEventListener('beforeprint', (e) => {
        e.preventDefault();
        setSecurityWarning(true);
        setTimeout(() => setSecurityWarning(false), 3000);
        apiService.reportSuspiciousActivity('Print attempt blocked');
      });
      
      return () => {
        document.removeEventListener('keydown', handleKeyPress);
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen, handleKeyPress]);

  if (!isOpen || !image) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm protected-content"
        onClick={onClose}
      >
        {/* Security Warning */}
        <AnimatePresence>
          {securityWarning && (
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className="fixed top-4 left-1/2 transform -translate-x-1/2 z-60 bg-red-500/90 backdrop-blur-sm border border-red-500 rounded-lg px-6 py-3"
            >
              <div className="flex items-center gap-2 text-white">
                <AlertTriangle className="w-5 h-5" />
                <span className="font-semibold">🚨 SECURITY ALERT: Action Blocked</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-indigo-900/20"></div>
        
        <div className="absolute inset-0 flex items-center justify-center p-4">
          {/* Navigation Buttons */}
          {canNavigate && (
            <>
              <motion.div
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10"
              >
                <Button
                  variant="ghost"
                  size="lg"
                  className="w-14 h-14 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white border border-white/20 rounded-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    onNavigate('prev');
                  }}
                >
                  <ChevronLeft className="w-6 h-6" />
                </Button>
              </motion.div>
              
              <motion.div
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10"
              >
                <Button
                  variant="ghost"
                  size="lg"
                  className="w-14 h-14 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white border border-white/20 rounded-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    onNavigate('next');
                  }}
                >
                  <ChevronRight className="w-6 h-6" />
                </Button>
              </motion.div>
            </>
          )}

          {/* Header Controls */}
          <motion.div
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="absolute top-4 left-4 right-4 z-10"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
                  <Shield className="w-4 h-4 text-blue-400" />
                  <span className="text-white text-sm font-medium">VaultSecure</span>
                </div>
                <div className="flex items-center gap-2 bg-green-500/20 backdrop-blur-sm rounded-full px-4 py-2 border border-green-500/30">
                  <Lock className="w-4 h-4 text-green-400" />
                  <span className="text-green-300 text-sm">Protected</span>
                </div>
                <div className="flex items-center gap-2 bg-blue-500/20 backdrop-blur-sm rounded-full px-4 py-2 border border-blue-500/30">
                  <Eye className="w-4 h-4 text-blue-400" />
                  <span className="text-blue-300 text-sm">Secure View</span>
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="lg"
                className="w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white border border-white/20 rounded-full"
                onClick={onClose}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </motion.div>

          {/* Main Content */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="relative max-w-7xl max-h-[85vh] w-full h-full flex items-center justify-center mt-16"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative">
              {/* Loading State */}
              {!imageLoaded && (
                <div className="absolute inset-0 bg-gradient-to-br from-blue-900/50 to-indigo-900/50 animate-pulse rounded-2xl backdrop-blur-sm"></div>
              )}
              
              {/* Main Secure Image */}
              <motion.div
                key={image.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="max-w-full max-h-[85vh] rounded-2xl shadow-2xl border border-white/10"
              >
                {/* Localhost fallback */}
                {window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? (
                  <img
                    src={image.url.startsWith('http') ? image.url : `http://localhost:8000${image.url}`}
                    alt={image.title}
                    className="max-w-full max-h-[85vh] object-contain rounded-2xl protected-content"
                    onLoad={handleImageLoad}
                    onError={(e) => {
                      console.log('Modal image failed to load:', image.url);
                      setImageLoaded(true);
                    }}
                    style={{
                      filter: imageLoaded ? 'none' : 'blur(5px)',
                      transition: 'filter 0.3s ease',
                      userSelect: 'none',
                      pointerEvents: 'none'
                    }}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      console.log('🔒 Right-click blocked in modal');
                      return false;
                    }}
                    draggable="false"
                  />
                ) : (
                  <SecureImage
                    imageUrl={image.url}
                    alt={image.title}
                    className="max-w-full max-h-[85vh] object-contain rounded-2xl protected-content"
                    onLoad={handleImageLoad}
                    onError={() => setImageLoaded(true)}
                    style={{
                      filter: imageLoaded ? 'none' : 'blur(5px)',
                      transition: 'filter 0.3s ease'
                    }}
                  />
                )}
              </motion.div>
              
              {/* Security Watermark */}
              <div className="absolute top-4 right-4 bg-blue-500/30 backdrop-blur-sm rounded-lg px-3 py-2 border border-blue-500/40">
                <div className="flex items-center gap-2 text-blue-200">
                  <Shield className="w-5 h-5" />
                  <span className="text-sm font-semibold">VAULTSECURE PROTECTED</span>
                </div>
              </div>
              
              {/* Glow Effect */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/20 to-indigo-500/20 blur-xl -z-10"></div>
            </div>
          </motion.div>

        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ImageModal;