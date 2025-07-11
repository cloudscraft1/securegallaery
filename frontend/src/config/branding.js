// Branding Configuration - All static strings and branding elements
// Change values in .env file to update branding across the entire application

// Debug environment variables
console.log('Environment variables loaded:');
console.log('REACT_APP_BRAND_NAME:', process.env.REACT_APP_BRAND_NAME);

const brandingConfig = {
  // Main Brand Name
  brandName: process.env.REACT_APP_BRAND_NAME || 'SecureGallery',
  brandNamePart1: process.env.REACT_APP_BRAND_NAME_PART1 || 'Secure',
  brandNamePart2: process.env.REACT_APP_BRAND_NAME_PART2 || 'Gallery',
  
  
  // Main Taglines and Descriptions
  tagline: process.env.REACT_APP_TAGLINE || 'Your memories, safeguarded with military-grade protection',
  vaultDescription: process.env.REACT_APP_VAULT_DESCRIPTION || 'Ultra-Secure Personal Vault',
  
  // Toast Messages
  securityMessage: process.env.REACT_APP_SECURITY_MESSAGE || '🔐 Security Activated',
  securityDescription: process.env.REACT_APP_SECURITY_DESCRIPTION || 'Protection is now active. Your images are secured.',
  
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

// Debug final configuration
console.log('Final branding configuration:');
console.log('brandName:', brandingConfig.brandName);

export default brandingConfig;
