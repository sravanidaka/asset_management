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
  PointElement,
  LineElement,
  Filler,
  RadialLinearScale,
} from "chart.js";
import { 
  Pie, 
  Bar, 
  Doughnut, 
  Line, 
  PolarArea, 
  Radar,
  Scatter,
  Bubble
} from "react-chartjs-2";

// Register Chart.js components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  PointElement,
  LineElement,
  Filler,
  RadialLinearScale
);

const Row = ({ children }) => (
  <div className="row g-3 mb-4">{children}</div>
);

const Card = ({ title, children, icon, color }) => (
  <div className="card custom-card h-100">
    <div className="card-body">
      <div className="d-flex align-items-center mb-3">
        <div
          className={`icon-box bg-${color} text-white rounded-circle me-3`}
          style={{
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%'
          }}
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
  // 1. PIE CHART - Total Assets
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

  // 2. DOUGHNUT CHART - Asset Status
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

  // 3. BAR CHART - Upcoming Expiries
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

  // 4. POLAR AREA CHART - Asset Distribution
  const distributionData = {
    labels: ["IT", "Furniture", "Equipment", "Vehicles", "Machinery"],
    datasets: [
      {
        data: [45, 25, 15, 10, 5],
        backgroundColor: ["#36b9cc", "#f6c23e", "#e74a3b", "#1cc88a", "#858796"],
        hoverBackgroundColor: ["#2c9faf", "#dda20a", "#c0392b", "#17a673", "#60616f"],
        borderWidth: 1,
      },
    ],
  };

  // 5. LINE CHART - Assigned vs Unassigned (Trend over time)
  const assignmentData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Assigned",
        data: [800, 850, 900, 920, 950, 950],
        borderColor: "#1cc88a",
        backgroundColor: "rgba(28, 200, 138, 0.1)",
        fill: true,
        tension: 0.4,
      },
      {
        label: "Unassigned",
        data: [450, 400, 350, 320, 300, 300],
        borderColor: "#858796",
        backgroundColor: "rgba(133, 135, 150, 0.1)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  // 6. RADAR CHART - Maintenance Due
  const maintenanceData = {
    labels: ["Preventive", "Corrective", "Emergency", "Scheduled", "Overdue"],
    datasets: [
      {
        label: "Maintenance Tasks",
        data: [3, 1, 0, 2, 1],
        backgroundColor: "rgba(54, 185, 204, 0.2)",
        borderColor: "#36b9cc",
        borderWidth: 2,
        pointBackgroundColor: "#36b9cc",
        pointBorderColor: "#fff",
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor: "#36b9cc",
      },
    ],
  };

  // 7. SCATTER CHART - Disposal Summary
  const disposalData = {
    datasets: [
      {
        label: "IT Assets",
        data: [
          { x: 1000, y: 65 },
          { x: 2000, y: 70 },
          { x: 3000, y: 75 },
        ],
        backgroundColor: "#e74a3b",
        borderColor: "#e74a3b",
      },
      {
        label: "Non-IT Assets",
        data: [
          { x: 1000, y: 35 },
          { x: 2000, y: 30 },
          { x: 3000, y: 25 },
        ],
        backgroundColor: "#f6c23e",
        borderColor: "#f6c23e",
      },
    ],
  };

  // 8. BUBBLE CHART - Asset Cost Summary
  const costData = {
    datasets: [
      {
        label: "IT Assets",
        data: [
          { x: 1, y: 960000, r: 20 },
          { x: 2, y: 540000, r: 15 },
          { x: 3, y: 25000, r: 5 },
          { x: 4, y: 50000, r: 8 },
        ],
        backgroundColor: "rgba(78, 115, 223, 0.6)",
        borderColor: "#4e73df",
      },
    ],
  };

  // Options for different chart types
  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
      },
    },
  };

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

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const polarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
      },
    },
  };

  const radarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
      },
    },
    scales: {
      r: {
        beginAtZero: true,
      },
    },
  };

  const scatterOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Asset Value ($)",
        },
      },
      y: {
        title: {
          display: true,
          text: "Disposal Count",
        },
        beginAtZero: true,
      },
    },
  };

  const bubbleOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Asset Category",
        },
      },
      y: {
        title: {
          display: true,
          text: "Cost ($)",
        },
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="container-fluid p-1 dashboard-container">
      {/* Top bar */}
      <div className="container-fluid p-1">
        <h2 className="mb-1">Dashboard</h2>
        <p className="mt-0">Overview of all asset-related KPIs with diverse chart types</p>
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
              <PolarArea data={distributionData} options={polarOptions} />
            </div>
          </Card>
        </div>
        <div className="col-md-4">
          <Card
            title="Assignment Trends"
            icon="person-check"
            color="primary"
          >
            <div className="text-center mb-2">
              <div className="h3 af-metric text-success">1,250</div>
              <div className="small text-muted">Total Assets</div>
            </div>
            <div style={{ height: "200px" }}>
              <Line data={assignmentData} options={lineOptions} />
            </div>
          </Card>
        </div>
        <div className="col-md-4">
          <Card title="Maintenance Analysis" icon="tools" color="danger">
            <div className="text-center mb-2">
              <div className="h3 af-metric text-success">4</div>
              <div className="small text-muted">Assets due for maintenance</div>
            </div>
            <div style={{ height: "200px" }}>
              <Radar data={maintenanceData} options={radarOptions} />
            </div>
          </Card>
        </div>
      </Row>

      {/* Row 3 */}
      <Row>
        <div className="col-md-4">
          <Card title="Disposal Analysis" icon="trash" color="danger">
            <div className="text-center mb-2">
              <div className="h3 af-metric text-success">100</div>
              <div className="small text-muted">Total Disposed</div>
            </div>
            <div style={{ height: "200px" }}>
              <Scatter data={disposalData} options={scatterOptions} />
            </div>
            <div className="text-center mt-2">
              <div className="h5">$50,000</div>
              <div className="small text-muted">Total Value</div>
            </div>
          </Card>
        </div>
        <div className="col-md-4">
          <Card title="Cost Analysis" icon="cash-coin" color="success">
            <div className="text-center mb-2">
              <div className="h3 af-metric text-success">$1,500,000</div>
              <div className="small text-muted">Total Asset Value</div>
            </div>
            <div style={{ height: "200px" }}>
              <Bubble data={costData} options={bubbleOptions} />
            </div>
          </Card>
        </div>
        <div className="col-md-4">
          <Card title="Reports" icon="download" color="info">
            <div className="reports-grid">
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