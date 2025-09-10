/**
 * Store-related utility functions
 */

// Generate a readable store ID based on store name
export const generateStoreId = (storeName: string): string => {
  // Remove special characters and convert to lowercase
  const cleanName = storeName
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens

  // Add random suffix to ensure uniqueness
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  
  return `${cleanName}-${randomSuffix}`;
};

// Generate a professional store slug
export const generateStoreSlug = (storeName: string, storeId: string): string => {
  const cleanName = storeName
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  // Use last 6 characters of store ID as suffix
  const suffix = storeId.slice(-6);
  
  return `${cleanName}-${suffix}`;
};

// Validate store ID format
export const isValidStoreId = (storeId: string): boolean => {
  // Store ID should be at least 6 characters and contain only alphanumeric and hyphens
  const storeIdRegex = /^[a-z0-9][a-z0-9-]{4,}[a-z0-9]$/;
  return storeIdRegex.test(storeId);
};

// Generate readable product ID
export const generateProductId = (productName: string, storeId: string): string => {
  const cleanName = productName
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  // Use store ID suffix + random suffix
  const storeSuffix = storeId.slice(-3);
  const randomSuffix = Math.random().toString(36).substring(2, 6);
  
  return `${cleanName}-${storeSuffix}${randomSuffix}`;
};

// Format store display name
export const formatStoreDisplayName = (storeName: string): string => {
  return storeName
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

// Generate store code (for internal reference)
export const generateStoreCode = (storeName: string): string => {
  const words = storeName.split(' ').filter(word => word.length > 0);
  let code = '';
  
  if (words.length === 1) {
    // Single word: take first 3 characters
    code = words[0].substring(0, 3).toUpperCase();
  } else {
    // Multiple words: take first letter of each word (max 4)
    code = words
      .slice(0, 4)
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase();
  }
  
  // Add 3 digit random number
  const randomNum = Math.floor(100 + Math.random() * 900);
  
  return `${code}${randomNum}`;
};