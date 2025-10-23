// Utility functions for table operations

/**
 * Safe string comparison for table sorting
 * Handles null, undefined, and non-string values
 */
export const safeStringCompare = (a, b) => {
  const aVal = a || '';
  const bVal = b || '';
  return aVal.toString().localeCompare(bVal.toString());
};

/**
 * Safe numeric comparison for table sorting
 * Handles null, undefined, and non-numeric values
 */
export const safeNumericCompare = (a, b) => {
  const aVal = parseFloat(a) || 0;
  const bVal = parseFloat(b) || 0;
  return aVal - bVal;
};

/**
 * Safe date comparison for table sorting
 * Handles null, undefined, and invalid date values
 */
export const safeDateCompare = (a, b) => {
  const aDate = new Date(a);
  const bDate = new Date(b);
  
  // If either date is invalid, treat as epoch (1970-01-01)
  const aTime = isNaN(aDate.getTime()) ? 0 : aDate.getTime();
  const bTime = isNaN(bDate.getTime()) ? 0 : bDate.getTime();
  
  return aTime - bTime;
};

