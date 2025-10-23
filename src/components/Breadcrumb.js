import React from 'react';
import { useLocation } from 'react-router-dom';
import { Breadcrumb } from 'antd';
import { FaHome } from 'react-icons/fa';

const CustomBreadcrumb = () => {
  const location = useLocation();

  // Generate breadcrumb items based on current path
  const generateBreadcrumbItems = () => {
    const pathSegments = location.pathname.split('/').filter(segment => segment);
    const breadcrumbItems = [
      {
        title: (
          <span className="d-flex align-items-center gap-1">
            <FaHome size={12} />
            <span>Home</span>
          </span>
        ),
        href: '/'
      }
    ];

    // Map path segments to readable names with module information
    const pathNames = {
      'dashboard': 'Dashboard',
      'register': 'Asset Registration',
      'procure': 'Asset Procurement',
      'allocate': 'Asset Allocation',
      'transfer': 'Asset Transfer',
      'financial': 'Financial Management',
      'disposal': 'Asset Disposal',
      'ManageVendor': 'Vendor Management',
      'ManageCategory': 'Category Management',
      'ManageLocation': 'Location Management',
      'ManageStatus': 'Status Management',
      'ServiceTypes': 'Service Types',
      'PaymentMethods': 'Payment Methods',
      'ApprovalHierarchies': 'Approval Hierarchies',
      'requests': 'Service Requests',
      'service-log': 'Service Log',
      'schedule': 'Maintenance Schedule',
      'history': 'Asset History',
      'reports': 'Reports & Analytics',
      'financials': 'Financial Reports',
      'compliance': 'Compliance Management',
      'disposalreport': 'Disposal Reports',
      'settings': 'System Settings',
      'user': 'User Management',
      'roles': 'Role Management'
    };

    // Module mapping for better breadcrumb structure
    const moduleMapping = {
      'dashboard': { module: 'Dashboard', page: 'Overview' },
      'register': { module: 'Asset Management', page: 'Asset Registration' },
      'procure': { module: 'Asset Management', page: 'Asset Procurement' },
      'allocate': { module: 'Asset Management', page: 'Asset Allocation' },
      'transfer': { module: 'Asset Management', page: 'Asset Transfer' },
      'financial': { module: 'Financial Management', page: 'Financial Overview' },
      'disposal': { module: 'Asset Management', page: 'Asset Disposal' },
      'ManageVendor': { module: 'System Settings', page: 'Vendor Management' },
      'ManageCategory': { module: 'System Settings', page: 'Category Management' },
      'ManageLocation': { module: 'System Settings', page: 'Location Management' },
      'ManageStatus': { module: 'System Settings', page: 'Status Management' },
      'ServiceTypes': { module: 'System Settings', page: 'Service Types' },
      'PaymentMethods': { module: 'System Settings', page: 'Payment Methods' },
      'ApprovalHierarchies': { module: 'System Settings', page: 'Approval Hierarchies' },
      'requests': { module: 'Service Management', page: 'Service Requests' },
      'service-log': { module: 'Service Management', page: 'Service Log' },
      'schedule': { module: 'Maintenance', page: 'Maintenance Schedule' },
      'history': { module: 'Asset Management', page: 'Asset History' },
      'reports': { module: 'Analytics', page: 'Reports & Analytics' },
      'financials': { module: 'Financial Management', page: 'Financial Reports' },
      'compliance': { module: 'Compliance', page: 'Compliance Management' },
      'disposalreport': { module: 'Analytics', page: 'Disposal Reports' },
      'settings': { module: 'System Settings', page: 'System Configuration' },
      'user': { module: 'User Management', page: 'User Administration' },
      'roles': { module: 'User Management', page: 'Role Management' }
    };

    pathSegments.forEach((segment, index) => {
      const isLast = index === pathSegments.length - 1;
      const moduleInfo = moduleMapping[segment];
      
      if (moduleInfo) {
        // Add module if it's different from the previous one
        const currentModule = moduleInfo.module;
        const lastModule = breadcrumbItems[breadcrumbItems.length - 1]?.module;
        
        if (currentModule !== lastModule) {
          breadcrumbItems.push({
            title: currentModule,
            href: isLast ? undefined : `/${pathSegments.slice(0, index + 1).join('/')}`,
            module: currentModule
          });
        }
        
        // Add the specific page
        breadcrumbItems.push({
          title: moduleInfo.page,
          href: isLast ? undefined : `/${pathSegments.slice(0, index + 1).join('/')}`,
          module: currentModule
        });
      } else {
        // Fallback for unmapped segments
        breadcrumbItems.push({
          title: pathNames[segment] || segment.charAt(0).toUpperCase() + segment.slice(1),
          href: isLast ? undefined : `/${pathSegments.slice(0, index + 1).join('/')}`
        });
      }
    });

    return breadcrumbItems;
  };

  return (
    <div className="breadcrumb-container mb-3 d-flex justify-content-end">
      <Breadcrumb
        items={generateBreadcrumbItems()}
        style={{ 
          fontSize: '14px',
          background: 'transparent',
          padding: '0',
          margin: '0'
        }}
      />
    </div>
  );
};

export default CustomBreadcrumb;
