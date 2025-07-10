// Branding Configuration - All static strings and branding elements
// Change values in .env file to update branding across the entire application

const brandingConfig = {
  // Main Brand Name
  brandName: process.env.REACT_APP_BRAND_NAME || 'VaultSecure',
  brandNamePart1: process.env.REACT_APP_BRAND_NAME_PART1 || 'Vault',
  brandNamePart2: process.env.REACT_APP_BRAND_NAME_PART2 || 'Secure',
  
  // Watermark and Security Labels
  canvasWatermark: process.env.REACT_APP_CANVAS_WATERMARK || 'secure',
  
  // Main Taglines and Descriptions
  tagline: process.env.REACT_APP_TAGLINE || 'Your memories, safeguarded with military-grade protection',
  vaultDescription: process.env.REACT_APP_VAULT_DESCRIPTION || 'Ultra-Secure Personal Vault',
  
  // Toast Messages
  securityMessage: process.env.REACT_APP_SECURITY_MESSAGE || '🔐 Security Activated',
  securityDescription: process.env.REACT_APP_SECURITY_DESCRIPTION || 'VaultSecure protection is now active. Your images are secured.',
  
  // Loading Messages
  loadingMessages: {
    connecting: process.env.REACT_APP_LOADING_MESSAGE_CONNECTING || 'Activating maximum security protocols...',
    connected: process.env.REACT_APP_LOADING_MESSAGE_CONNECTED || 'Loading your protected gallery...',
    error: process.env.REACT_APP_LOADING_MESSAGE_ERROR || 'Security breach detected. Please refresh.'
  },
  
  // Status Indicators
  statusLabels: {
    secureGallery: 'Secure Gallery',
    protectedImages: 'Protected Images',
    protectedStatus: 'Protected',
    secureView: 'Secure View'
  },
  
  // Security Level Indicators
  securityLevel: {
    prefix: 'Security Level:',
    suffix: '• Protected Gallery • Token-Based Access: ENABLED'
  }
};

export default brandingConfig;
