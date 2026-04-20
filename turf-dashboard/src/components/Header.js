function Header({ onLogout }) {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userName = user.name || "Owner";

  return (
    <div style={headerStyle}>
      <h2 style={{ margin: 0 }}>Futsal Fusion Dashboard</h2>

      <div>
        <span style={{ marginRight: "20px" }}>Welcome, {userName} 👋</span>
        <button style={logoutBtn} onClick={onLogout}>Logout</button>
      </div>
    </div>
  );
}

const headerStyle = {
  width: "100%",
  height: "60px",
  background: "#ffffff",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "0 25px",
  boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
  position: "sticky",
  top: 0,
  zIndex: 100
};

const logoutBtn = {
  padding: "8px 15px",
  background: "#ef4444",
  border: "none",
  color: "#fff",
  borderRadius: "6px",
  cursor: "pointer"
};

export default Header;