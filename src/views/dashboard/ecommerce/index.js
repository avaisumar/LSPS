// ** React Imports
import { useContext, useEffect, useState } from "react";
import axios from "axios";

// ** Reactstrap Imports
import { Row, Col } from "reactstrap";

// ** Context
import { ThemeColors } from "@src/utility/context/ThemeColors";

// ** Components
import StatsHorizontal from "@components/widgets/stats/StatsHorizontal";
import { User, UserCheck, UserPlus, UserX } from "react-feather";
import { useSkin } from "@hooks/useSkin";
import ChartjsDoughnutChart from "../../charts/chart-js/ChartjsDoughnutChart";

import "@styles/react/libs/charts/apex-charts.scss";
import "@styles/base/pages/dashboard-ecommerce.scss";
import { useSelector } from "react-redux";

const EcommerceDashboard = () => {
  const { colors } = useContext(ThemeColors);
  const { skin } = useSkin();

  const [taskData, setTaskData] = useState({
    total: 0,
    pending: 0,
    in_progress: 0,
    completed: 0,
  });

  const token = useSelector((state) => state.auth.accessToken);
  console.log("token", token); // ✅ adjust key if different
  useEffect(() => {
    axios
      .get("https://lspschoolerp.pythonanywhere.com/erp-api/task/dashboard/", {
        headers: {
          Authorization: `Token ${token}`, // ✅ attach token here
          "Content-Type": "application/json",
        },
      })
      .then((res) => {
        if (res.data?.self) {
          setTaskData(res.data.self);
        }
      })
      .catch((err) => {
        console.error("❌ Error fetching dashboard data:", err);
      });
  }, []);

  const labelColor = skin === "dark" ? "#b4b7bd" : "#6e6b7b";
  console.log("taskData", taskData);

  return (
    <div id="dashboard-ecommerce">
      <Row>
        <Col lg="3" sm="6">
          <StatsHorizontal
            color="primary"
            statTitle="Total Tasks"
            icon={<User size={20} />}
            renderStats={<h3 className="fw-bolder mb-75">{taskData.total}</h3>}
          />
        </Col>
        <Col lg="3" sm="6">
          <StatsHorizontal
            color="danger"
            statTitle="Pending Tasks"
            icon={<UserPlus size={20} />}
            renderStats={
              <h3 className="fw-bolder mb-75">{taskData.pending}</h3>
            }
          />
        </Col>
        <Col lg="3" sm="6">
          <StatsHorizontal
            color="success"
            statTitle="In Progress"
            icon={<UserCheck size={20} />}
            renderStats={
              <h3 className="fw-bolder mb-75">{taskData.in_progress}</h3>
            }
          />
        </Col>
        <Col lg="3" sm="6">
          <StatsHorizontal
            color="warning"
            statTitle="Completed Tasks"
            icon={<UserX size={20} />}
            renderStats={
              <h3 className="fw-bolder mb-75">{taskData.completed}</h3>
            }
          />
        </Col>
      </Row>

      <Row className="match-height mt-2">
        <Col lg="4" md="6" xs="12">
          <ChartjsDoughnutChart
            tooltipShadow="rgba(0, 0, 0, 0.25)"
            successColorShade={colors.success.main}
            warningLightColor={colors.warning.light}
            primary={colors.primary.main}
            taskData={taskData}
          />
        </Col>
      </Row>
    </div>
  );
};

export default EcommerceDashboard;
