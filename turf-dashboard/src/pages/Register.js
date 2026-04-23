import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

function Register({ setIsLoggedIn }) {
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("http://192.168.100.120:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name, 
          mobile, 
          email: email || undefined, 
          password, 
          role: "turf_owner" // Automatically set for dashboard users
        }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        setIsLoggedIn(true);
        navigate("/");
      } else {
        setError(data.error || data.message || "Registration failed");
      }
    } catch (err) {
      setError("Network error. Is the backend running?");
    }
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h2 style={{ marginBottom: "20px" }}>Create Owner Account</h2>

        {error && <p style={{ color: "red", fontSize: "0.9rem" }}>{error}</p>}

        <form onSubmit={handleRegister}>
          <input
            type="text"
            placeholder="Full Name"
            style={inputStyle}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <input
            type="text"
            placeholder="Mobile Number"
            style={inputStyle}
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            required
          />

          <input
            type="email"
            placeholder="Email (Optional)"
            style={inputStyle}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            style={inputStyle}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button style={buttonStyle} type="submit">
            Register
          </button>
        </form>

        <p style={{ marginTop: "20px", fontSize: "0.9rem" }}>
          Already have an account? <Link to="/login" style={{ color: "#2563eb" }}>Login</Link>
        </p>
      </div>
    </div>
  );
}

const containerStyle = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  minHeight: "100vh",
  background: "#f1f5f9",
  padding: "20px"
};

const cardStyle = {
  background: "#fff",
  padding: "30px",
  width: "350px",
  borderRadius: "8px",
  boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
  textAlign: "center"
};

const inputStyle = {
  width: "100%",
  padding: "10px",
  marginBottom: "15px",
  borderRadius: "5px",
  border: "1px solid #ccc",
  boxSizing: "border-box"
};

const buttonStyle = {
  width: "100%",
  padding: "10px",
  background: "#2563eb",
  color: "#fff",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
  fontWeight: "bold"
};

export default Register;
