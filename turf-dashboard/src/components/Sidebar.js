import { NavLink } from "react-router-dom";

function Sidebar({onLogout}) {
  return (
    <div style={styles.sidebar}>
      <h2 style={styles.title}>Futsal Fusion</h2>

      <nav>
        <ul style={styles.list}>
          <li><NavLink to="/" style={navStyle}>Dashboard</NavLink></li>
          <li><NavLink to="/turfs" style={navStyle}>Turfs</NavLink></li>
          <li><NavLink to="/slots" style={navStyle}>Slots</NavLink></li>
          <li><NavLink to="/bookings" style={navStyle}>Bookings</NavLink></li>
          <li style={styles.logout} onClick={onLogout}>Logout</li>
        </ul>
      </nav>
    </div>
  );
}

const styles = {
 sidebar: {
  width: "220px",
  height: "100vh",
  background: "#0f172a",
  color: "#fff",
  padding: "20px",
  boxShadow: "2px 0 5px rgba(0,0,0,0.1)"
},
  title: {
    marginBottom: "30px"
  },
  list: {
    listStyle: "none",
    padding: 0
  },
  link: {
  display: "block",
  padding: "10px",
  color: "#e5e7eb",
  textDecoration: "none",
  borderRadius: "6px"
},
  logout: {
    marginTop: "30px",
    color: "red",
    cursor: "pointer"
  }
};
const navStyle = ({ isActive }) => ({
  display: "block",
  padding: "10px",
  color: isActive ? "#fff" : "#e5e7eb",
  background: isActive ? "#2563eb" : "transparent",
  borderRadius: "6px",
  textDecoration: "none",
  marginBottom: "5px"
});
export default Sidebar;