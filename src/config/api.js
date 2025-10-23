import authInterceptor from '../utils/authInterceptor';

// API Configuration
const API_CONFIG = {
  // Main API base URL
  BASE_URL: 'http://202.53.92.35:5004/api',
  
  // API endpoints
  ENDPOINTS: {
    // Authentication
    LOGIN: '/auth/login',
    FORGOT_PASSWORD: '/auth/forgot-password',
    
    // Assets
    ASSETS: '/assets',
    ASSETS_PROCURE: '/assets/procure',
    ASSETS_ALLOCATE: '/assets/allocate',
    ASSETS_TRANSFER: '/assets/transfer',
    ASSETS_FINANCIAL: '/assets/financial',
    ASSETS_DISPOSAL: '/assets/disposal',
    
    // Users & Roles
    USERS: '/users',
    ROLES: '/roles/getRolesList',
    
    // Settings
    CATEGORIES: '/settings/getSettingCategoriesList',
    STATUSES: '/settings/getSettingStatusList',
    LOCATIONS: '/settings/getSettingLocationList',
    VENDORS: '/settings/getSettingVendorList',
    PAYMENT_METHODS: '/settings/getSettingPaymentMethodsList',
    SERVICE_TYPES: '/settings/getSettingServiceTypesList',
    APPROVAL_HIERARCHIES: '/settings/getSettingApprovalHierarchiesList',
    
    // Maintenance
    MAINTENANCE: '/maintenance',
    MAINTENANCE_HISTORY: '/maintenance/history',
    MAINTENANCE_SCHEDULE: '/maintenance/schedule',
    MAINTENANCE_SERVICE_LOG: '/maintenance/service-log',
    
    // Financials
    FINANCIALS: '/financials',
    
    // Disposal
    DISPOSAL: '/disposal',
    
    // Compliance (using server API)
    COMPLIANCE: '/compliance',
    COMPLIANCE_AUDIT: '/compliance/audit',
    COMPLIANCE_AUDIT_PLAN: '/compliance/auditplan',
    COMPLIANCE_ASSIGN_TEAM: '/compliance/assignteam',
    COMPLIANCE_AUDIT_EXECUTION: '/compliance/auditexecution',
    COMPLIANCE_AUDIT_REVIEW: '/compliance/auditreview'
  }
};

// API Helper functions
export const getApiUrl = (endpoint) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Generic API call function using auth interceptor
export const apiCall = async (endpoint, options = {}) => {
  return authInterceptor.apiCall(endpoint, options);
};

// Specific API functions using auth interceptor
export const api = {
  // Assets
  getAssets: () => authInterceptor.get(API_CONFIG.ENDPOINTS.ASSETS),
  createAsset: (data) => authInterceptor.post(API_CONFIG.ENDPOINTS.ASSETS, data),
  updateAsset: (data) => authInterceptor.put(API_CONFIG.ENDPOINTS.ASSETS, data),
  deleteAsset: (data) => authInterceptor.delete(API_CONFIG.ENDPOINTS.ASSETS, data),
  
  // Asset Operations
  procureAsset: (data) => authInterceptor.post(API_CONFIG.ENDPOINTS.ASSETS_PROCURE, data),
  allocateAsset: (data) => authInterceptor.post(API_CONFIG.ENDPOINTS.ASSETS_ALLOCATE, data),
  transferAsset: (data) => authInterceptor.post(API_CONFIG.ENDPOINTS.ASSETS_TRANSFER, data),
  financialAsset: (data) => authInterceptor.post(API_CONFIG.ENDPOINTS.ASSETS_FINANCIAL, data),
  disposeAsset: (data) => authInterceptor.post(API_CONFIG.ENDPOINTS.ASSETS_DISPOSAL, data),
  
  // Users
  getUsers: () => authInterceptor.get(API_CONFIG.ENDPOINTS.USERS),
  createUser: (data) => authInterceptor.post(API_CONFIG.ENDPOINTS.USERS, data),
  updateUser: (data) => authInterceptor.put(API_CONFIG.ENDPOINTS.USERS, data),
  deleteUser: (data) => authInterceptor.delete(API_CONFIG.ENDPOINTS.USERS, data),
  
  // Roles
  getRoles: () => authInterceptor.get(API_CONFIG.ENDPOINTS.ROLES),
  createRole: (data) => authInterceptor.post(API_CONFIG.ENDPOINTS.ROLES, data),
  updateRole: (data) => authInterceptor.put(API_CONFIG.ENDPOINTS.ROLES, data),
  deleteRole: (data) => authInterceptor.delete(API_CONFIG.ENDPOINTS.ROLES, data),
  
  // Settings
  getCategories: () => authInterceptor.get(API_CONFIG.ENDPOINTS.CATEGORIES),
  createCategory: (data) => authInterceptor.post(API_CONFIG.ENDPOINTS.CATEGORIES, data),
  updateCategory: (data) => authInterceptor.put(API_CONFIG.ENDPOINTS.CATEGORIES, data),
  deleteCategory: (data) => authInterceptor.delete(API_CONFIG.ENDPOINTS.CATEGORIES, data),
  
  getStatuses: () => authInterceptor.get(API_CONFIG.ENDPOINTS.STATUSES),
  createStatus: (data) => authInterceptor.post(API_CONFIG.ENDPOINTS.STATUSES, data),
  updateStatus: (data) => authInterceptor.put(API_CONFIG.ENDPOINTS.STATUSES, data),
  deleteStatus: (data) => authInterceptor.delete(API_CONFIG.ENDPOINTS.STATUSES, data),
  
  getLocations: () => authInterceptor.get(API_CONFIG.ENDPOINTS.LOCATIONS),
  createLocation: (data) => authInterceptor.post(API_CONFIG.ENDPOINTS.LOCATIONS, data),
  updateLocation: (data) => authInterceptor.put(API_CONFIG.ENDPOINTS.LOCATIONS, data),
  deleteLocation: (data) => authInterceptor.delete(API_CONFIG.ENDPOINTS.LOCATIONS, data),
  
  getVendors: () => authInterceptor.get(API_CONFIG.ENDPOINTS.VENDORS),
  createVendor: (data) => authInterceptor.post(API_CONFIG.ENDPOINTS.VENDORS, data),
  updateVendor: (data) => authInterceptor.put(API_CONFIG.ENDPOINTS.VENDORS, data),
  deleteVendor: (data) => authInterceptor.delete(API_CONFIG.ENDPOINTS.VENDORS, data),
  
  getPaymentMethods: () => authInterceptor.get(API_CONFIG.ENDPOINTS.PAYMENT_METHODS),
  createPaymentMethod: (data) => authInterceptor.post(API_CONFIG.ENDPOINTS.PAYMENT_METHODS, data),
  updatePaymentMethod: (data) => authInterceptor.put(API_CONFIG.ENDPOINTS.PAYMENT_METHODS, data),
  deletePaymentMethod: (data) => authInterceptor.delete(API_CONFIG.ENDPOINTS.PAYMENT_METHODS, data),
  
  getServiceTypes: () => authInterceptor.get(API_CONFIG.ENDPOINTS.SERVICE_TYPES),
  createServiceType: (data) => authInterceptor.post(API_CONFIG.ENDPOINTS.SERVICE_TYPES, data),
  updateServiceType: (data) => authInterceptor.put(API_CONFIG.ENDPOINTS.SERVICE_TYPES, data),
  deleteServiceType: (data) => authInterceptor.delete(API_CONFIG.ENDPOINTS.SERVICE_TYPES, data),
  
  getApprovalHierarchies: () => authInterceptor.get(API_CONFIG.ENDPOINTS.APPROVAL_HIERARCHIES),
  createApprovalHierarchy: (data) => authInterceptor.post(API_CONFIG.ENDPOINTS.APPROVAL_HIERARCHIES, data),
  updateApprovalHierarchy: (data) => authInterceptor.put(API_CONFIG.ENDPOINTS.APPROVAL_HIERARCHIES, data),
  deleteApprovalHierarchy: (data) => authInterceptor.delete(API_CONFIG.ENDPOINTS.APPROVAL_HIERARCHIES, data),
  
  // Financials
  getFinancials: () => authInterceptor.get(API_CONFIG.ENDPOINTS.FINANCIALS),
  createFinancial: (data) => authInterceptor.post(API_CONFIG.ENDPOINTS.FINANCIALS, data),
  updateFinancial: (data) => authInterceptor.put(API_CONFIG.ENDPOINTS.FINANCIALS, data),
  deleteFinancial: (data) => authInterceptor.delete(API_CONFIG.ENDPOINTS.FINANCIALS, data),
  
  // Maintenance
  getMaintenance: () => authInterceptor.get(API_CONFIG.ENDPOINTS.MAINTENANCE),
  createMaintenance: (data) => authInterceptor.post(API_CONFIG.ENDPOINTS.MAINTENANCE, data),
  updateMaintenance: (data) => authInterceptor.put(API_CONFIG.ENDPOINTS.MAINTENANCE, data),
  deleteMaintenance: (data) => authInterceptor.delete(API_CONFIG.ENDPOINTS.MAINTENANCE, data),
  
  getMaintenanceHistory: () => authInterceptor.get(API_CONFIG.ENDPOINTS.MAINTENANCE_HISTORY),
  getMaintenanceSchedule: () => authInterceptor.get(API_CONFIG.ENDPOINTS.MAINTENANCE_SCHEDULE),
  getMaintenanceServiceLog: () => authInterceptor.get(API_CONFIG.ENDPOINTS.MAINTENANCE_SERVICE_LOG),
  
  // Disposal
  getDisposal: () => authInterceptor.get(API_CONFIG.ENDPOINTS.DISPOSAL),
  createDisposal: (data) => authInterceptor.post(API_CONFIG.ENDPOINTS.DISPOSAL, data),
  updateDisposal: (data) => authInterceptor.put(API_CONFIG.ENDPOINTS.DISPOSAL, data),
  deleteDisposal: (data) => authInterceptor.delete(API_CONFIG.ENDPOINTS.DISPOSAL, data),
  
  // Compliance
  getCompliance: () => authInterceptor.get(API_CONFIG.ENDPOINTS.COMPLIANCE),
  createCompliance: (data) => authInterceptor.post(API_CONFIG.ENDPOINTS.COMPLIANCE, data),
  updateCompliance: (data) => authInterceptor.put(API_CONFIG.ENDPOINTS.COMPLIANCE, data),
  deleteCompliance: (data) => authInterceptor.delete(API_CONFIG.ENDPOINTS.COMPLIANCE, data),
  
  // Compliance Audit
  getComplianceAudit: () => authInterceptor.get(API_CONFIG.ENDPOINTS.COMPLIANCE_AUDIT),
  createComplianceAudit: (data) => authInterceptor.post(API_CONFIG.ENDPOINTS.COMPLIANCE_AUDIT, data),
  updateComplianceAudit: (data) => authInterceptor.put(API_CONFIG.ENDPOINTS.COMPLIANCE_AUDIT, data),
  deleteComplianceAudit: (data) => authInterceptor.delete(API_CONFIG.ENDPOINTS.COMPLIANCE_AUDIT, data),
  
  // Compliance Audit Plan
  getComplianceAuditPlan: () => authInterceptor.get(API_CONFIG.ENDPOINTS.COMPLIANCE_AUDIT_PLAN),
  createComplianceAuditPlan: (data) => authInterceptor.post(API_CONFIG.ENDPOINTS.COMPLIANCE_AUDIT_PLAN, data),
  updateComplianceAuditPlan: (data) => authInterceptor.put(API_CONFIG.ENDPOINTS.COMPLIANCE_AUDIT_PLAN, data),
  deleteComplianceAuditPlan: (data) => authInterceptor.delete(API_CONFIG.ENDPOINTS.COMPLIANCE_AUDIT_PLAN, data),
  
  // Compliance Assign Team
  getComplianceAssignTeam: () => authInterceptor.get(API_CONFIG.ENDPOINTS.COMPLIANCE_ASSIGN_TEAM),
  createComplianceAssignTeam: (data) => authInterceptor.post(API_CONFIG.ENDPOINTS.COMPLIANCE_ASSIGN_TEAM, data),
  updateComplianceAssignTeam: (data) => authInterceptor.put(API_CONFIG.ENDPOINTS.COMPLIANCE_ASSIGN_TEAM, data),
  deleteComplianceAssignTeam: (data) => authInterceptor.delete(API_CONFIG.ENDPOINTS.COMPLIANCE_ASSIGN_TEAM, data),
  
  // Compliance Audit Execution
  getComplianceAuditExecution: () => authInterceptor.get(API_CONFIG.ENDPOINTS.COMPLIANCE_AUDIT_EXECUTION),
  createComplianceAuditExecution: (data) => authInterceptor.post(API_CONFIG.ENDPOINTS.COMPLIANCE_AUDIT_EXECUTION, data),
  updateComplianceAuditExecution: (data) => authInterceptor.put(API_CONFIG.ENDPOINTS.COMPLIANCE_AUDIT_EXECUTION, data),
  deleteComplianceAuditExecution: (data) => authInterceptor.delete(API_CONFIG.ENDPOINTS.COMPLIANCE_AUDIT_EXECUTION, data),
  
  // Compliance Audit Review
  getComplianceAuditReview: () => authInterceptor.get(API_CONFIG.ENDPOINTS.COMPLIANCE_AUDIT_REVIEW),
  createComplianceAuditReview: (data) => authInterceptor.post(API_CONFIG.ENDPOINTS.COMPLIANCE_AUDIT_REVIEW, data),
  updateComplianceAuditReview: (data) => authInterceptor.put(API_CONFIG.ENDPOINTS.COMPLIANCE_AUDIT_REVIEW, data),
  deleteComplianceAuditReview: (data) => authInterceptor.delete(API_CONFIG.ENDPOINTS.COMPLIANCE_AUDIT_REVIEW, data)
};

export { API_CONFIG };
export default API_CONFIG;
