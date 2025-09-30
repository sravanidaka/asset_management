import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../App.css";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from "chart.js";
import { Pie, Bar, Doughnut } from "react-chartjs-2";

// Register Chart.js components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

const Row = ({ children }) => (
  <div className="row g-3 mb-4">{children}</div>
);

const Card = ({ title, children, icon, color }) => (
  <div className="card custom-card h-100">
    <div className="card-body">
      <div className="d-flex align-items-center mb-3">
        <div
          className={`icon-box bg-${color} text-white rounded-circle p-2 me-3`}
        >
          <i className={`bi bi-${icon}`}></i>
        </div>
        <h6 className="mb-0 fw-bold">{title}</h6>
      </div>
      {children}
    </div>
  </div>
);

export default function Dashboard() {
  // Data for Total Assets chart
  const totalAssetsData = {
    labels: ["IT Assets", "Non-IT Assets"],
    datasets: [
      {
        data: [800, 450],
        backgroundColor: ["#4e73df", "#1cc88a"],
        hoverBackgroundColor: ["#2e59d9", "#17a673"],
        borderWidth: 0,
      },
    ],
  };

  // Data for Asset Status chart
  const assetStatusData = {
    labels: ["Active", "In Maintenance", "Disposed"],
    datasets: [
      {
        data: [1100, 50, 100],
        backgroundColor: ["#1cc88a", "#f6c23e", "#e74a3b"],
        hoverBackgroundColor: ["#17a673", "#dda20a", "#c0392b"],
        borderWidth: 0,
      },
    ],
  };

  // Data for Upcoming Expiries chart
  const expiryData = {
    labels: ["Laptop (AST-105)", "Server (AST-210)", "Printer (AST-301)"],
    datasets: [
      {
        label: "Days until expiry",
        data: [30, 46, 63],
        backgroundColor: "#4e73df",
        borderColor: "#4e73df",
        borderWidth: 1,
        borderRadius: 5,
      },
    ],
  };

  // Data for Asset Distribution chart
  const distributionData = {
    labels: ["Departments", "Locations"],
    datasets: [
      {
        data: [5, 3],
        backgroundColor: ["#36b9cc", "#f6c23e"],
        hoverBackgroundColor: ["#2c9faf", "#dda20a"],
        borderWidth: 0,
      },
    ],
  };

  // Data for Assigned vs Unassigned chart
  const assignmentData = {
    labels: ["Assigned", "Unassigned"],
    datasets: [
      {
        data: [950, 300],
        backgroundColor: ["#1cc88a", "#858796"],
        hoverBackgroundColor: ["#17a673", "#60616f"],
        borderWidth: 0,
      },
    ],
  };

  // Data for Maintenance Due chart
  const maintenanceData = {
    labels: ["Preventive", "Corrective"],
    datasets: [
      {
        data: [3, 1],
        backgroundColor: ["#36b9cc", "#e74a3b"],
        hoverBackgroundColor: ["#2c9faf", "#c0392b"],
        borderWidth: 0,
      },
    ],
  };

  // Data for Disposal Summary chart
  const disposalData = {
    labels: ["IT Assets", "Non-IT Assets"],
    datasets: [
      {
        label: "Assets Disposed",
        data: [65, 35],
        backgroundColor: "#e74a3b",
        borderColor: "#e74a3b",
        borderWidth: 1,
        borderRadius: 5,
      },
    ],
  };

  // Data for Asset Cost Summary chart
  const costData = {
    labels: ["IT Assets", "Non-IT Assets", "Maintenance", "Disposal"],
    datasets: [
      {
        label: "Cost in $",
        data: [960000, 540000, 25000, 50000],
        backgroundColor: ["#4e73df", "#1cc88a", "#f6c23e", "#e74a3b"],
        borderColor: ["#4e73df", "#1cc88a", "#f6c23e", "#e74a3b"],
        borderWidth: 1,
        borderRadius: 5,
      },
    ],
  };

  // Options for bar charts
  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  // Options for pie/doughnut charts
  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
      },
    },
  };

  return (
    <div className="container-fluid p-1 dashboard-container">
      {/* Top bar */}
      <div className="container-fluid p-1">
        <h2 className="mb-1">Dashboard</h2>
        <p className="mt-0">Overview of all asset-related KPIs</p>
      </div>

      {/* Row 1 */}
      <Row>
        <div className="col-md-4">
          <Card title="Total Assets" icon="cpu" color="primary">
            <div className="text-center mb-2">
              <div className="display-6 af-metric text-success">1,250</div>
              <div className="small text-muted">Total Assets</div>
            </div>
            <div style={{ height: "200px" }}>
              <Pie data={totalAssetsData} options={pieOptions} />
            </div>
          </Card>
        </div>
        <div className="col-md-4">
          <Card title="Asset Status" icon="activity" color="info">
            <div style={{ height: "200px" }}>
              <Doughnut data={assetStatusData} options={pieOptions} />
            </div>
          </Card>
        </div>
        <div className="col-md-4">
          <Card title="Upcoming Expiries" icon="calendar-event" color="warning">
            <div style={{ height: "200px" }}>
              <Bar data={expiryData} options={barOptions} />
            </div>
          </Card>
        </div>
      </Row>

      {/* Row 2 */}
      <Row>
        <div className="col-md-4">
          <Card title="Asset Distribution" icon="diagram-3" color="success">
            <div className="text-center mb-2">
              <div className="h3 af-metric text-success">8</div>
              <div className="small text-muted">Distribution Points</div>
            </div>
            <div style={{ height: "200px" }}>
              <Pie data={distributionData} options={pieOptions} />
            </div>
          </Card>
        </div>
        <div className="col-md-4">
          <Card
            title="Assigned vs Unassigned"
            icon="person-check"
            color="primary"
          >
            <div className="text-center mb-2">
              <div className="h3 af-metric text-success">1,250</div>
              <div className="small text-muted">Total Assets</div>
            </div>
            <div style={{ height: "200px" }}>
              <Doughnut data={assignmentData} options={pieOptions} />
            </div>
          </Card>
        </div>
        <div className="col-md-4">
          <Card title="Maintenance Due" icon="tools" color="danger">
            <div className="text-center mb-2">
              <div className="h3 af-metric text-success">4</div>
              <div className="small text-muted">Assets due for maintenance</div>
            </div>
            <div style={{ height: "200px" }}>
              <Pie data={maintenanceData} options={pieOptions} />
            </div>
          </Card>
        </div>
      </Row>

      {/* Row 3 */}
      <Row>
        <div className="col-md-4">
          <Card title="Disposal Summary" icon="trash" color="danger">
            <div className="text-center mb-2">
              <div className="h3 af-metric text-success">100</div>
              <div className="small text-muted">Total Disposed</div>
            </div>
            <div style={{ height: "200px" }}>
              <Bar data={disposalData} options={barOptions} />
            </div>
            <div className="text-center mt-2">
              <div className="h5">$50,000</div>
              <div className="small text-muted">Total Value</div>
            </div>
          </Card>
        </div>
        <div className="col-md-4">
          <Card title="Asset Cost Summary" icon="cash-coin" color="success">
            <div className="text-center mb-2">
              <div className="h3 af-metric text-success">$1,500,000</div>
              <div className="small text-muted">Total Asset Value</div>
            </div>
            <div style={{ height: "200px" }}>
              <Bar data={costData} options={barOptions} />
            </div>
          </Card>
        </div>
        <div className="col-md-4">
          <Card title="Reports" icon="download" color="info">
            <div className="d-flex flex-wrap gap-2">
              <button className="btn report-btn">
                <i className="bi bi-journal-text me-2" />
                Asset Register
              </button>
              <button className="btn report-btn">
                <i className="bi bi-clipboard2-pulse me-2" />
                Issue Logs
              </button>
              <button className="btn report-btn">
                <i className="bi bi-cpu me-2" />
                AMC Summary
              </button>
              <button className="btn report-btn">
                <i className="bi bi-file-earmark-text me-2" />
                Disposal Report
              </button>
            </div>
          </Card>
        </div>
      </Row>

      {/* Footer buttons */}
      <div className="d-flex justify-content-end gap-2">
        <button className="btn-add px-4">Export</button>
        <button className="btn-add px-4">Add Asset</button>
      </div>
    </div>
  );
}
