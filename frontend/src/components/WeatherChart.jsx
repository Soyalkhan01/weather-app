import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const WeatherChart = ({ forecast }) => {
  if (!forecast) return null;

  const chartData = forecast.map((day) => ({
    date: day.date.slice(5),
    temp: day.day.avgtemp_c,
  }));

  return (
    <div style={{ width: "100%", height: 300, marginTop: "25px" }}>
      <h3 style={{ textAlign: "center", marginBottom: "10px" }}>
        🌡 5 Day Temperature Chart
      </h3>

      <ResponsiveContainer>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="temp"
            stroke="#38bdf8"
            strokeWidth={3}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default WeatherChart;