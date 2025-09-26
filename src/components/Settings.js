import React from "react";
import {
  FaFolder,
  FaCheckSquare,
  FaMapMarkerAlt,
  FaBuilding,
  FaCalculator,
  FaCog,
  FaSitemap,
} from "react-icons/fa";

function Settings({ onNavigate }) {
  const cards = [
    {
      title: "Asset Categories",
      description: "Define and manage categories for your assets.",
      button: "Manage Categories",
      icon: <FaFolder />,
      screen: "ManageCategory",
    },
    {
      title: "Asset Statuses",
      description: "Configure various lifecycle statuses for assets.",
      button: "Manage Statuses",
      icon: <FaCheckSquare />,
      screen: "ManageStatus",
    },
    {
      title: "Departments / Locations",
      description: "Set up departments and physical locations.",
      button: "Manage Locations",
      icon: <FaMapMarkerAlt />,
      screen: "ManageLocation",
    },
    {
      title: "Vendors",
      description: "Maintain a list of all your asset vendors.",
      button: "Manage Vendors",
      icon: <FaBuilding />,
      screen: "ManageVendor",
    },
    {
      title: "Depreciation Methods",
      description: "Configure methods for asset depreciation.",
      button: "Manage Methods",
      icon: <FaCalculator />,
      screen: "PaymentMethods",
    },
    {
      title: "Service Types",
      description: "Define types of services related to assets.",
      button: "Manage Types",
      icon: <FaCog />,
      screen: "ServiceTypes",
    },
    {
      title: "Approval Hierarchies",
      description: "Set up multi-level approval workflows.",
      button: "Manage Hierarchies",
      icon: <FaSitemap />,
      screen: "ApprovalHierarchies",
    },
  ];

  return (
    <div className="container-fluid p-1">
      <h2 className="mb-1">Settings</h2>
      <h4>Master Data Setup</h4>
      <p className="mt-0">Configure master values used across the system.</p>

      <div className="card p-4 shadow-md">
        <h6 className="fs-5 mb-3">Configurable Lists</h6>
        <div className="row">
          {cards.map((card, index) => (
            <div className="col-md-4 mb-3" key={index}>
              {/* ✅ Make all cards equal height */}
              <div className="card h-100 shadow-sm d-flex flex-column">
                <div className="card-body d-flex flex-column">
                  <div className="d-flex align-items-center mb-2">
                    <span className="icon me-2">{card.icon}</span>
                    <span className="fw-bold">{card.title}</span>
                  </div>
                  <p className="text-muted flex-grow-1">{card.description}</p>
                  <button
                    className="btn btn-sm btn-primary w-100 mt-auto"
                    onClick={() => typeof onNavigate === "function" && card.screen && onNavigate(card.screen)}
                  >
                    {card.button}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Settings;