import React, { useState, useEffect } from "react";
import { Pie } from "@ant-design/plots";
import { reportsContext } from "../../contexts/ReportsContext";
import secondsToHms from "../../_helpers/secondsToHms";
import { Box, Typography } from "@mui/material";

export default function EmployeesCharts() {
  const { savedReports } = React.useContext(reportsContext);
  const [chartData, setchartData] = useState([]);
  const [totalHours, settotalHours] = useState(null);
  const [totalPData, settotalPData] = useState(null);

  useEffect(() => {
    let arr = savedReports?.reports[0]?.byEmployees.map((emp) => {
      let o = {
        type: `${emp._id.firstName} ${emp._id.lastName}`,
        value: emp.totalHours,
      };
      return o;
    });
    setchartData(arr);
    settotalHours(savedReports?.reports[0]?.total[0]?.totalHours);
    settotalPData(savedReports?.reports[0]?.total[0]?.avgPerformanceData);
  }, [savedReports]);

  const config = {
    autoFit: true,
    data: chartData,
    angleField: "value",
    colorField: "type",
    radius: 0.75,
    label: {
      formatter: (datum) => {
        return `${datum.type}: ${secondsToHms(datum.value)}`;
      },
      autoHide: true,
      type: "spider",
      labelHeight: 28,
    },
    tooltip: {
      formatter: (datum) => {
        return {
          name: datum.type,
          value: Math.trunc((datum.value * 100) / totalHours) + "%",
        };
      },
    },
    interactions: [
      {
        type: "element-selected",
      },
      {
        type: "element-active",
      },
    ],
  };
  return (
    <Box>
      <Box sx={{}}>
        <Typography variant="h2" sx={{ opacity: 1, textAlign: "left" }}>
          Employees savedReports
        </Typography>
      </Box>
      <Box>
        <Box>
          <Typography variant="h3" sx={{ opacity: 0.6, textAlign: "left" }}>
            {secondsToHms(totalHours)}
          </Typography>
          <Typography variant="h4" sx={{ opacity: 0.6, textAlign: "left" }}>
            {Math.trunc(totalPData)}%
          </Typography>
        </Box>
        <div>
          <Pie style={{ flexGrow: "2" }} {...config} />
        </div>
      </Box>
    </Box>
  );
}
