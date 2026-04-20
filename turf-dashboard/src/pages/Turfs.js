import { useState, useEffect } from "react";

function Turfs() {
  const [formData, setFormData] = useState({ name: "", location: "", pricePerHour: "", phone: "" });
  const [turfs, setTurfs] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const fetchTurfs = async () => {
    const res = await fetch("http://localhost:5000/api/turfs");
    const data = await res.json();
    setTurfs(data);
  };

  useEffect(() => { fetchTurfs(); }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = editingId 
        ? `http://localhost:5000/api/update-turf/${editingId}`
        : "http://localhost:5000/api/add-turf";
    
    const method = editingId ? "PUT" : "POST";

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    alert(editingId ? "Turf Updated!" : "Turf Added!");
    setFormData({ name: "", location: "", pricePerHour: "", phone: "" });
    setEditingId(null);
    fetchTurfs();
  };

  const startEdit = (turf) => {
    setEditingId(turf._id);
    setFormData({ name: turf.name, location: turf.location, pricePerHour: turf.pricePerHour, phone: turf.phone || "" });
  };

  const toggleActive = async (id, currentStatus) => {
      await fetch(`http://localhost:5000/api/update-turf/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isActive: !currentStatus })
      });
      fetchTurfs();
  };

  const deleteTurf = async (id) => {
      if (window.confirm("Are you sure? This will permanently delete the turf.")) {
          await fetch(`http://localhost:5000/api/delete-turf/${id}`, { method: "DELETE" });
          fetchTurfs();
      }
  };

  return (
    <div style={{ padding: "20px" }}>
      <div style={card}>
          <h2>{editingId ? "Edit Turf" : "Add New Turf"}</h2>
          <form onSubmit={handleSubmit} style={formStyle}>
            <input name="name" placeholder="Turf Name" value={formData.name} onChange={handleInputChange} style={inputStyle} required />
            <input name="location" placeholder="Location" value={formData.location} onChange={handleInputChange} style={inputStyle} />
            <input name="phone" placeholder="Contact Mobile" value={formData.phone} onChange={handleInputChange} style={inputStyle} />
            <input name="pricePerHour" type="number" placeholder="Price per Hour (Rs.)" value={formData.pricePerHour} onChange={handleInputChange} style={inputStyle} required />
            <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" style={addBtn}>{editingId ? "Save Changes" : "Create Turf"}</button>
                {editingId && <button type="button" onClick={() => { setEditingId(null); setFormData({name:"", location:"", pricePerHour:"", phone:""}); }} style={cancelBtn}>Cancel</button>}
            </div>
          </form>
      </div>

      <h2>Your Turfs</h2>
      <div style={grid}>
          {turfs.map((turf) => (
            <div key={turf._id} style={{ ...turfCard, opacity: turf.isActive ? 1 : 0.6 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <h3>{turf.name}</h3>
                  <span style={{ 
                      padding: "4px 8px", borderRadius: "12px", fontSize: "10px", 
                      backgroundColor: turf.isActive ? "#dcfce7" : "#fee2e2", color: turf.isActive ? "#166534" : "#991b1b" 
                  }}>
                    {turf.isActive ? "ACTIVE" : "CLOSED"}
                  </span>
              </div>
              <p>📍 {turf.location}</p>
              <p>📞 {turf.phone || "No phone"}</p>
              <p>💰 Rs. {turf.pricePerHour}/hr</p>
              
              <div style={actionRow}>
                  <button onClick={() => startEdit(turf)} style={editBtn}>Edit</button>
                  <button onClick={() => toggleActive(turf._id, turf.isActive)} style={statusBtn}>
                      {turf.isActive ? "Close for Today" : "Open Turf"}
                  </button>
                  <button onClick={() => deleteTurf(turf._id)} style={delBtn}>Delete</button>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

const card = { background: "#fff", padding: "25px", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", marginBottom: "30px" };
const formStyle = { display: "flex", flexDirection: "column", gap: "15px" };
const inputStyle = { padding: "12px", borderRadius: "8px", border: "1px solid #e2e8f0", fontSize: "14px" };
const addBtn = { padding: "12px", background: "#2563eb", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" };
const cancelBtn = { padding: "12px", background: "#64748b", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer" };
const grid = { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" };
const turfCard = { background: "#fff", padding: "20px", borderRadius: "12px", border: "1px solid #e2e8f0" };
const actionRow = { display: "flex", gap: "10px", marginTop: "15px" };
const editBtn = { padding: "6px 12px", background: "#f1f5f9", border: "none", borderRadius: "6px", cursor: "pointer" };
const statusBtn = { padding: "6px 12px", background: "#334155", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", flex: 1 };
const delBtn = { padding: "6px 12px", background: "#fee2e2", color: "#991b1b", border: "none", borderRadius: "6px", cursor: "pointer" };

export default Turfs;