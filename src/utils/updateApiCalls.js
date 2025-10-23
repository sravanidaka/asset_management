// Script to update all API calls to use auth interceptor
// This is a reference file showing the pattern for updating API calls

// OLD PATTERN (Manual token handling):
/*
import axios from "axios";

const fetchData = async () => {
  const token = sessionStorage.getItem("token");
  const response = await axios.get("http://202.53.92.35:5004/api/endpoint", {
    headers: {
      "x-access-token": token,
      "Content-Type": "application/json",
    },
  });
  return response.data;
};
*/

// NEW PATTERN (Using auth interceptor):
/*
import { api } from '../config/api';

const fetchData = async () => {
  const result = await api.getEndpoint();
  if (result.success) {
    return result.data;
  } else {
    throw new Error(result.error);
  }
};
*/

// Common API endpoint mappings:
const API_MAPPINGS = {
  // Assets
  'GET /api/assets': 'api.getAssets()',
  'POST /api/assets': 'api.createAsset(data)',
  'PUT /api/assets': 'api.updateAsset(data)',
  'DELETE /api/assets': 'api.deleteAsset(data)',
  
  // Asset Operations
  'POST /api/assets/procure': 'api.procureAsset(data)',
  'POST /api/assets/allocate': 'api.allocateAsset(data)',
  'POST /api/assets/transfer': 'api.transferAsset(data)',
  'POST /api/assets/financial': 'api.financialAsset(data)',
  'POST /api/assets/disposal': 'api.disposeAsset(data)',
  
  // Settings
  'GET /api/settings/getSettingCategoriesList': 'api.getCategories()',
  'GET /api/settings/getSettingStatusList': 'api.getStatuses()',
  'GET /api/settings/getSettingLocationList': 'api.getLocations()',
  'GET /api/settings/getSettingVendorList': 'api.getVendors()',
  'GET /api/settings/getSettingPaymentMethodsList': 'api.getPaymentMethods()',
  'GET /api/settings/getSettingServiceTypesList': 'api.getServiceTypes()',
  'GET /api/settings/getSettingApprovalHierarchiesList': 'api.getApprovalHierarchies()',
  
  // Users & Roles
  'GET /api/users': 'api.getUsers()',
  'POST /api/users': 'api.createUser(data)',
  'PUT /api/users': 'api.updateUser(data)',
  'DELETE /api/users': 'api.deleteUser(data)',
  'GET /api/roles/getRolesList': 'api.getRoles()',
  'POST /api/roles': 'api.createRole(data)',
  'PUT /api/roles': 'api.updateRole(data)',
  'DELETE /api/roles': 'api.deleteRole(data)',
  
  // Maintenance
  'GET /api/maintenance': 'api.getMaintenance()',
  'POST /api/maintenance': 'api.createMaintenance(data)',
  'PUT /api/maintenance': 'api.updateMaintenance(data)',
  'DELETE /api/maintenance': 'api.deleteMaintenance(data)',
  'GET /api/maintenance/history': 'api.getMaintenanceHistory()',
  'GET /api/maintenance/schedule': 'api.getMaintenanceSchedule()',
  'GET /api/maintenance/service-log': 'api.getMaintenanceServiceLog()',
  
  // Financials & Disposal
  'GET /api/financials': 'api.getFinancials()',
  'POST /api/financials': 'api.createFinancial(data)',
  'GET /api/disposal': 'api.getDisposal()',
  'POST /api/disposal': 'api.createDisposal(data)',
  
  // Compliance
  'GET /api/compliance': 'api.getCompliance()',
  'POST /api/compliance': 'api.createCompliance(data)',
  'PUT /api/compliance': 'api.updateCompliance(data)',
  'DELETE /api/compliance': 'api.deleteCompliance(data)'
};

// Response handling patterns:
const RESPONSE_PATTERNS = {
  // OLD: response.data
  // NEW: result.data
  
  // OLD: response.data.success
  // NEW: result.success
  
  // OLD: response.data.message
  // NEW: result.error
  
  // OLD: response.status
  // NEW: result.status
};

export { API_MAPPINGS, RESPONSE_PATTERNS };
