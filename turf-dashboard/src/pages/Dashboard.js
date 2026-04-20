import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import { useEffect, useState } from "react";

function Dashboard() {
  const [stats, setStats] = useState({
    totalBookings: 0,
    totalRevenue: 0,
    totalTurfs: 0,
    totalSlots:0,
    todayBookings:0,
    bookedSlots:0,
    availableSlots:0
  });

  useEffect(() => {
    fetch("http://localhost:5000/api/dashboard")
    .then(res => res.json())
    .then(data => {
      setStats(data);
    })
    .catch (err => console.log(err));
  },[]);

  const chartData =[ 
   { name : "Bookings", value: stats.totalBookings },
   { name : "Revenue", value: stats.totalRevenue },
   { name : "Turfs", value: stats.totalTurfs }
  ];

  return (
    <div>
      <h1 style={{ marginBottom: "25px" }}>Dashboard Overview</h1>

      <div style={gridContainer}>
        <div style={cardStyle}>
          <h3>Total Turfs</h3>
          <h2>{stats.totalTurfs}</h2>
        </div>

        <div style={cardStyle}>
          <h3>Total Slots</h3>
          <h2>{stats.totalSlots}</h2>
        </div>

        <div style={cardStyle}>
          <h3>Today’s Bookings</h3>
          <h2>{stats.todayBookings}</h2>
        </div>

        <div style={cardStyle}>
          <h3>Revenue (Today)</h3>
          <h2>{stats.totalRevenue}</h2>
        </div>

        <div style={cardStyle}>
          <h3>Booked Slots</h3>
          <h2>{stats.bookedSlots}</h2>
        </div>

        <div style={cardStyle}>
          <h3>Available Slots</h3>
          <h2>{stats.availableSlots}</h2>
        </div>
        </div>
        <div style={chartContainer}>
        <h2 style={{marginBottom: "20px"}}>Analytics</h2>
        <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray= "3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="value" fill="#2563eb" /> 
        </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

const gridContainer = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "20px",
  marginBottom: "40px"
};

const chartContainer ={
  background: "#ffffff",
  padding: "30px",
  borderRadius: "120px",
  boxShadow: "0 6px 15px rgba(0,0,0,0.08)",
  marginTop:"20px"
};

const cardStyle = {
  background: "linear-gradient(135deg, #3b82f6, #60a5fa)",
  color:"#fff",
  padding: "20px",
  borderRadius: "12px",
  boxShadow: "0 6px 15px rgba(0, 0, 0, 0.1)",
  textAlign: "center",
  fontSize: "18px",
  minHeight: "110px",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center"
};

export default Dashboard;