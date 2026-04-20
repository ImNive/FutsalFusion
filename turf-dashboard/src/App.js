
import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import Login from "./pages/Login";
import Register from "./pages/Register";

import Dashboard from "./pages/Dashboard";
import Turfs from "./pages/Turfs";
import Slots from "./pages/Slots";
import Bookings from "./pages/Bookings";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
  };
  return (
    <Router>
      <Routes>
        {/* Login page (no sidebar) */}
        <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
        <Route path="/register" element={<Register setIsLoggedIn={setIsLoggedIn} />} />


        {/* Dashboard layout (with sidebar) */}
        <Route
  path="/*"
  element={
    isLoggedIn ? (
      <div style={{ display: "flex" }}>
        <Sidebar onLogout={handleLogout} />
        <div style={{  flex: 1 }}>
         <Header onLogout={handleLogout} /> 
          <div style={{ padding: "20px"}}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/turfs" element={<Turfs />} />
            <Route path="/slots" element={<Slots />} />
            <Route path="/bookings" element={<Bookings />} />
          </Routes>
        </div>
      </div>
      </div>
    ) : (
      <Navigate to="/login" />
    )
  }
        />
      </Routes>
    </Router>
  );
}

export default App;