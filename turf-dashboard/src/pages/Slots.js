import { useEffect, useState } from "react";

function Slots() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [selectedTurf, setSelectedTurf] = useState("");
  const [turfs, setTurfs] = useState([]);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch all turfs for the selector
  useEffect(() => {
    fetch("http://localhost:5000/api/turfs")
      .then(res => res.json())
      .then(data => {
        setTurfs(data);
        if (data.length > 0) setSelectedTurf(data[0]._id);
      })
      .catch(err => console.log(err));
  }, []);

  // Fetch slot status when date or turf changes
  useEffect(() => {
    if (selectedTurf && selectedDate) {
      setLoading(true);
      fetch(`http://localhost:5000/api/slots-status?turfId=${selectedTurf}&date=${selectedDate}`)
        .then(res => res.json())
        .then(data => {
          setSlots(data);
          setLoading(false);
        })
        .catch(err => {
          console.log(err);
          setLoading(false);
        });
    }
  }, [selectedTurf, selectedDate]);

  return (
    <div>
      <h1 style={{ marginBottom: "20px" }}>Manage Slots</h1>

      <div style={filterContainer}>
        <div style={inputGroup}>
          <label>Select Turf:</label>
          <select 
            value={selectedTurf} 
            onChange={(e) => setSelectedTurf(e.target.value)}
            style={selectStyle}
          >
            {turfs.map(t => (
              <option key={t._id} value={t._id}>{t.name}</option>
            ))}
          </select>
        </div>

        <div style={inputGroup}>
          <label>Select Date:</label>
          <input 
            type="date" 
            value={selectedDate} 
            onChange={(e) => setSelectedDate(e.target.value)} 
            style={inputStyle}
          />
        </div>
      </div>

      <div style={card}>
        <h3 style={{ borderBottom: "1px solid #ddd", paddingBottom: "10px" }}>
          Slots for {selectedDate}
        </h3>

        {loading ? (
          <p>Loading slots...</p>
        ) : (
          <div style={slotsGrid}>
            {slots.map((s) => (
              <div key={s.slot} style={slotItem}>
                <span style={{ fontWeight: "500" }}>{s.slot}</span>
                <span style={{
                  padding: "4px 8px",
                  borderRadius: "4px",
                  fontSize: "12px",
                  fontWeight: "bold",
                  backgroundColor: getStatusColor(s.status),
                  color: "#fff"
                }}>
                  {s.status.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const getStatusColor = (status) => {
  switch (status) {
    case "booked": return "#ef4444"; // Red
    case "closed": return "#64748b"; // Gray
    case "available": return "#22c55e"; // Green
    default: return "#000";
  }
};

const filterContainer = {
  display: "flex",
  gap: "20px",
  marginBottom: "30px",
  background: "#fff",
  padding: "20px",
  borderRadius: "12px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
};

const inputGroup = {
  display: "flex",
  flexDirection: "column",
  gap: "8px"
};

const selectStyle = {
  padding: "10px",
  borderRadius: "6px",
  border: "1px solid #cbd5e1",
  minWidth: "200px"
};

const inputStyle = {
  padding: "10px",
  borderRadius: "6px",
  border: "1px solid #cbd5e1"
};

const card = {
  background: "#fff",
  padding: "30px",
  borderRadius: "12px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
};

const slotsGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
  gap: "15px",
  marginTop: "20px"
};

const slotItem = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "12px 15px",
  background: "#f8fafc",
  borderRadius: "8px",
  border: "1px solid #e2e8f0"
};

export default Slots;