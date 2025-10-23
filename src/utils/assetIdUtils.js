/**
 * Asset ID Utility Functions
 * 
 * Standardized Asset ID Format: BLR-IT-LTP-2025-0012
 * - BLR: Location (Bangalore)
 * - IT: Department
 * - LTP: Asset Type (Laptop)
 * - 2025: Purchase Year
 * - 0012: Unique Number
 */

// Location mappings
const LOCATION_CODES = {
  'Bangalore': 'BLR',
  'Mumbai': 'MUM',
  'Delhi': 'DEL',
  'Chennai': 'CHN',
  'Kolkata': 'KOL',
  'Hyderabad': 'HYD',
  'Pune': 'PUN',
  'Ahmedabad': 'AHM',
  'Jaipur': 'JAI',
  'Kochi': 'KOC',
  'Default': 'BLR' // Default to Bangalore
};

// Department mappings
const DEPARTMENT_CODES = {
  'IT': 'IT',
  'Information Technology': 'IT',
  'Human Resources': 'HR',
  'Finance': 'FIN',
  'Operations': 'OPS',
  'Marketing': 'MKT',
  'Sales': 'SAL',
  'Administration': 'ADM',
  'Legal': 'LEG',
  'Research and Development': 'RND',
  'Customer Service': 'CSV',
  'Quality Assurance': 'QA',
  'Production': 'PRD',
  'Logistics': 'LOG',
  'Security': 'SEC',
  'Default': 'IT' // Default to IT
};

// Asset Type mappings
const ASSET_TYPE_CODES = {
  'Laptop': 'LTP',
  'Desktop': 'DTP',
  'Server': 'SVR',
  'Printer': 'PRT',
  'Scanner': 'SCN',
  'Router': 'RTR',
  'Switch': 'SWT',
  'Firewall': 'FWL',
  'Monitor': 'MNT',
  'Keyboard': 'KBD',
  'Mouse': 'MOU',
  'Tablet': 'TAB',
  'Smartphone': 'SPH',
  'Projector': 'PRJ',
  'Camera': 'CAM',
  'Vehicle': 'VEH',
  'Furniture': 'FUR',
  'Equipment': 'EQP',
  'Software': 'SWF',
  'License': 'LIC',
  'Default': 'EQP' // Default to Equipment
};

/**
 * Generate a standardized asset ID
 * @param {Object} params - Asset parameters
 * @param {string} params.location - Asset location
 * @param {string} params.department - Asset department
 * @param {string} params.assetType - Asset type/category
 * @param {string|number} params.purchaseYear - Purchase year
 * @param {string|number} params.uniqueNumber - Unique sequence number
 * @returns {string} Formatted asset ID
 */
export const generateAssetId = (params) => {
  const {
    location = 'Default',
    department = 'Default',
    assetType = 'Default',
    purchaseYear = new Date().getFullYear(),
    uniqueNumber = '0001'
  } = params;

  // Get codes with fallbacks
  const locationCode = LOCATION_CODES[location] || LOCATION_CODES['Default'];
  const departmentCode = DEPARTMENT_CODES[department] || DEPARTMENT_CODES['Default'];
  const assetTypeCode = ASSET_TYPE_CODES[assetType] || ASSET_TYPE_CODES['Default'];
  
  // Format year (ensure 4 digits)
  const yearCode = String(purchaseYear).slice(-4);
  
  // Format unique number (ensure 4 digits with leading zeros)
  const uniqueCode = String(uniqueNumber).padStart(4, '0');
  
  return `${locationCode}-${departmentCode}-${assetTypeCode}-${yearCode}-${uniqueCode}`;
};

/**
 * Parse an asset ID to extract its components
 * @param {string} assetId - Asset ID to parse
 * @returns {Object} Parsed components
 */
export const parseAssetId = (assetId) => {
  if (!assetId || typeof assetId !== 'string') {
    return null;
  }

  const parts = assetId.split('-');
  if (parts.length !== 5) {
    return null;
  }

  const [locationCode, departmentCode, assetTypeCode, yearCode, uniqueCode] = parts;

  // Find the actual names from codes
  const location = Object.keys(LOCATION_CODES).find(key => LOCATION_CODES[key] === locationCode) || locationCode;
  const department = Object.keys(DEPARTMENT_CODES).find(key => DEPARTMENT_CODES[key] === departmentCode) || departmentCode;
  const assetType = Object.keys(ASSET_TYPE_CODES).find(key => ASSET_TYPE_CODES[key] === assetTypeCode) || assetTypeCode;

  return {
    location,
    department,
    assetType,
    purchaseYear: parseInt(yearCode),
    uniqueNumber: parseInt(uniqueCode),
    locationCode,
    departmentCode,
    assetTypeCode,
    yearCode,
    uniqueCode
  };
};

/**
 * Validate if an asset ID follows the correct format
 * @param {string} assetId - Asset ID to validate
 * @returns {boolean} Always returns true (no format validation)
 */
export const validateAssetId = (assetId) => {
  // No format validation - accept any asset ID
  return true;
};

/**
 * Get the next unique number for a given asset type, department, and year
 * This would typically query a database to get the next sequence number
 * For now, it returns a random number between 1-9999
 * @param {string} assetType - Asset type
 * @param {string} department - Department
 * @param {string|number} year - Purchase year
 * @returns {number} Next unique number
 */
export const getNextUniqueNumber = (assetType, department, year) => {
  // In a real implementation, this would query the database
  // to get the highest unique number for this combination
  // and return the next one
  
  // For now, generate a random number between 1-9999
  // This should be replaced with actual database logic
  return Math.floor(Math.random() * 9999) + 1;
};

/**
 * Auto-generate asset ID based on form data
 * @param {Object} formData - Form data containing asset information
 * @returns {string} Generated asset ID
 */
export const autoGenerateAssetId = (formData) => {
  const {
    location = 'Default',
    department = 'Default',
    category = 'Default',
    purchase_date
  } = formData;

  // Extract year from purchase date
  let purchaseYear = new Date().getFullYear();
  if (purchase_date) {
    const date = new Date(purchase_date);
    if (!isNaN(date.getTime())) {
      purchaseYear = date.getFullYear();
    }
  }

  // Get next unique number
  const uniqueNumber = getNextUniqueNumber(category, department, purchaseYear);

  return generateAssetId({
    location,
    department,
    assetType: category,
    purchaseYear,
    uniqueNumber
  });
};

/**
 * Get all available location codes
 * @returns {Object} Location codes mapping
 */
export const getLocationCodes = () => {
  return { ...LOCATION_CODES };
};

/**
 * Get all available department codes
 * @returns {Object} Department codes mapping
 */
export const getDepartmentCodes = () => {
  return { ...DEPARTMENT_CODES };
};

/**
 * Get all available asset type codes
 * @returns {Object} Asset type codes mapping
 */
export const getAssetTypeCodes = () => {
  return { ...ASSET_TYPE_CODES };
};

/**
 * Format existing asset ID to new format (for migration)
 * @param {string} oldAssetId - Old asset ID
 * @param {Object} assetData - Asset data to determine new format
 * @returns {string} New formatted asset ID
 */
export const migrateAssetId = (oldAssetId, assetData) => {
  // If it's already in the new format, return as is
  if (validateAssetId(oldAssetId)) {
    return oldAssetId;
  }

  // Otherwise, generate new ID based on asset data
  return autoGenerateAssetId(assetData);
};

export default {
  generateAssetId,
  parseAssetId,
  validateAssetId,
  getNextUniqueNumber,
  autoGenerateAssetId,
  getLocationCodes,
  getDepartmentCodes,
  getAssetTypeCodes,
  migrateAssetId
};
