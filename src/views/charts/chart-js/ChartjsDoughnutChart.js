// ** Third Party Components
import { Doughnut } from "react-chartjs-2";
import { Monitor, Clock, Tablet, CheckCircle } from "react-feather";

// ** Reactstrap Imports
import { Card, CardHeader, CardTitle, CardBody } from "reactstrap";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const ChartjsDoughnutChart = ({ taskData }) => {
  const { total = 0, pending = 0, in_progress = 0, completed = 0 } = taskData || {};

  // 🎨 New Color Scheme
  const COLORS = {
    pending: "#FF4D4F",       // Red
    inProgress: "#FFC107",    // Yellow
    completed: "#28C76F",     // Green
    total: "#1677FF"          // Blue (used in icon)
  };

  const data = {
    labels: ["Pending", "In Progress", "Completed"],
    datasets: [
      {
        data: [pending, in_progress, completed],
        backgroundColor: [
          COLORS.pending,
          COLORS.inProgress,
          COLORS.completed
        ],
        borderWidth: 0,
      },
    ],
  };

  const options = {
    maintainAspectRatio: false,
    cutout: "65%",
    plugins: {
      legend: { display: true, position: "bottom" },
    },
  };

  const totalTasks = pending + in_progress + completed;

  return (
    <Card>
      <CardHeader>
        <CardTitle tag="h4">Task Status Overview</CardTitle>
      </CardHeader>

      <CardBody>
        <div style={{ height: "275px" }}>
          <Doughnut data={data} options={options} height={275} />
        </div>

        <div className="mt-2">

          {/* 🔵 Total */}
          <div className="d-flex justify-content-between align-items-center mb-1">
            <div className="d-flex align-items-center">
              <Monitor size={17} style={{ color: COLORS.total }} />
              <span className="fw-bold ms-75 me-25">Total Tasks</span>
            </div>
            <span className="fw-bold">{total || totalTasks}</span>
          </div>

          {/* 🔴 Pending */}
          <div className="d-flex justify-content-between align-items-center mb-1">
            <div className="d-flex align-items-center">
              <Tablet size={17} style={{ color: COLORS.pending }} />
              <span className="fw-bold ms-75 me-25">Pending</span>
            </div>
            <span>{pending}</span>
          </div>

          {/* 🟡 In Progress */}
          <div className="d-flex justify-content-between align-items-center mb-1">
            <div className="d-flex align-items-center">
              <Clock size={17} style={{ color: COLORS.inProgress }} />
              <span className="fw-bold ms-75 me-25">In Progress</span>
            </div>
            <span>{in_progress}</span>
          </div>

          {/* 🟢 Completed */}
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              <CheckCircle size={17} style={{ color: COLORS.completed }} />
              <span className="fw-bold ms-75 me-25">Completed</span>
            </div>
            <span>{completed}</span>
          </div>

        </div>
      </CardBody>
    </Card>
  );
};

export default ChartjsDoughnutChart;
