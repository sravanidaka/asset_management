/**
 * Test file for Asset ID Utility Functions
 * This file contains test cases to verify the asset ID format implementation
 */

import { 
  generateAssetId, 
  parseAssetId, 
  validateAssetId, 
  autoGenerateAssetId,
  getLocationCodes,
  getDepartmentCodes,
  getAssetTypeCodes
} from './assetIdUtils';

// Test cases for asset ID generation
export const testAssetIdGeneration = () => {
  console.log('=== Testing Asset ID Generation ===');
  
  // Test 1: Basic generation
  const basicId = generateAssetId({
    location: 'Bangalore',
    department: 'IT',
    assetType: 'Laptop',
    purchaseYear: 2025,
    uniqueNumber: 12
  });
  console.log('Basic ID:', basicId);
  console.log('Expected: BLR-IT-LTP-2025-0012');
  console.log('Match:', basicId === 'BLR-IT-LTP-2025-0012');
  
  // Test 2: Auto generation
  const autoId = autoGenerateAssetId({
    location: 'Mumbai',
    department: 'HR',
    category: 'Furniture',
    purchase_date: new Date('2024-01-01')
  });
  console.log('Auto ID:', autoId);
  console.log('Starts with MUM-HR-FUR-2024:', autoId.startsWith('MUM-HR-FUR-2024'));
  
  // Test 3: Edge cases
  const edgeCaseId = generateAssetId({
    location: 'Default',
    department: 'Default',
    assetType: 'Default',
    purchaseYear: 2023,
    uniqueNumber: 1
  });
  console.log('Edge case ID:', edgeCaseId);
  console.log('Expected: BLR-IT-EQP-2023-0001');
  console.log('Match:', edgeCaseId === 'BLR-IT-EQP-2023-0001');
};

// Test cases for asset ID parsing
export const testAssetIdParsing = () => {
  console.log('\n=== Testing Asset ID Parsing ===');
  
  // Test 1: Valid ID parsing
  const parsed = parseAssetId('BLR-IT-LTP-2025-0012');
  console.log('Parsed data:', parsed);
  console.log('Location:', parsed?.location);
  console.log('Department:', parsed?.department);
  console.log('Asset Type:', parsed?.assetType);
  console.log('Purchase Year:', parsed?.purchaseYear);
  console.log('Unique Number:', parsed?.uniqueNumber);
  
  // Test 2: Invalid ID parsing
  const invalidParsed = parseAssetId('INVALID-ID');
  console.log('Invalid ID parsed:', invalidParsed);
  console.log('Should be null:', invalidParsed === null);
};

// Test cases for asset ID validation
export const testAssetIdValidation = () => {
  console.log('\n=== Testing Asset ID Validation ===');
  
  const testCases = [
    { id: 'BLR-IT-LTP-2025-0012', expected: true, description: 'Valid format' },
    { id: 'MUM-HR-FUR-2024-0001', expected: true, description: 'Valid format with different codes' },
    { id: 'INVALID-ID', expected: false, description: 'Invalid format' },
    { id: 'BLR-IT-LTP-2025', expected: false, description: 'Missing unique number' },
    { id: 'BLR-IT-LTP-25-0012', expected: false, description: 'Invalid year format' },
    { id: 'BLR-IT-LTP-2025-12', expected: false, description: 'Invalid unique number format' },
    { id: '', expected: false, description: 'Empty string' },
    { id: null, expected: false, description: 'Null value' },
    { id: undefined, expected: false, description: 'Undefined value' }
  ];
  
  testCases.forEach(testCase => {
    const result = validateAssetId(testCase.id);
    const passed = result === testCase.expected;
    console.log(`${testCase.description}: ${passed ? 'PASS' : 'FAIL'}`);
    console.log(`  Input: "${testCase.id}"`);
    console.log(`  Expected: ${testCase.expected}, Got: ${result}`);
  });
};

// Test cases for code mappings
export const testCodeMappings = () => {
  console.log('\n=== Testing Code Mappings ===');
  
  const locationCodes = getLocationCodes();
  const departmentCodes = getDepartmentCodes();
  const assetTypeCodes = getAssetTypeCodes();
  
  console.log('Location codes:', locationCodes);
  console.log('Department codes:', departmentCodes);
  console.log('Asset type codes:', assetTypeCodes);
  
  // Test specific mappings
  console.log('Bangalore code:', locationCodes['Bangalore'] === 'BLR');
  console.log('IT code:', departmentCodes['IT'] === 'IT');
  console.log('Laptop code:', assetTypeCodes['Laptop'] === 'LTP');
};

// Run all tests
export const runAllTests = () => {
  console.log('Starting Asset ID Utility Tests...\n');
  
  try {
    testAssetIdGeneration();
    testAssetIdParsing();
    testAssetIdValidation();
    testCodeMappings();
    
    console.log('\n=== All Tests Completed ===');
    console.log('Check the console output above for test results.');
  } catch (error) {
    console.error('Test execution failed:', error);
  }
};

// Export test runner for easy access
export default {
  testAssetIdGeneration,
  testAssetIdParsing,
  testAssetIdValidation,
  testCodeMappings,
  runAllTests
};
