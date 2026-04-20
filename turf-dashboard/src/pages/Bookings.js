import {useEffect, useState } from "react";

function Bookings() {
  const[bookings, setBookings] = useState([]);

  useEffect(() => {
    fetch(`http://localhost:5000/api/bookings`)
    .then(res => res.json())
    .then(data => {
      console.log("DATA FROM BACKEND:", data);
      setBookings(data);
    })
    .catch(err => console.log(err));
  }, []);

  const updateStatus = async (id, status) => {
    await fetch(`http://localhost:5000/api/booking-status/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });

     fetch(`http://localhost:5000/api/bookings`)
    .then(res => res.json())
    .then(data => setBookings(data));
};


  return (
    <div>
      <h1 style={{ marginBottom: "20px", color: "#0f172a"}}>Bookings</h1>

      {bookings.map((b) => (
        <div key={b._id} style={card}>
          <p><b>Player Name:</b> {b.playerName}</p>
          <p><b>Phone:</b> {b.phone || "N/A"}</p>
          <p><b>Date:</b> {b.date}</p>
          <p><b>Time:</b> {b.timeSlot}</p>
          <p><b>Amount:</b> Rs {b.amount}</p>
          <p><b>Payment:</b> <span style={{ color: b.paymentMethod === 'online' ? 'blue' : 'orange' }}>{b.paymentMethod?.toUpperCase() || 'CASH'}</span></p>
          <p><b>Status:</b> {b.status}</p>
          <button onClick={() => updateStatus(b._id, "confirmed")} style={btnConfirm} disabled={b.status === 'confirmed'}> Confirm </button>
          <button onClick={() => updateStatus(b._id, "cancelled")} style={btnCancel} disabled={b.status === 'cancelled'}> Cancel </button>
        </div>
      ))}
    </div>
  );
}


const card = {
  background: "#fff",
  padding: "15px",
  margin: "10px",
  borderRadius:"8px",
  boxShadow: "0 3px 8px rgba(0,0,0,0.1)"
};

const btnConfirm = {
  padding: "8px 12px",
  marginRight: "10px",
  background: "green",
  color: "#fff",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer"
};

const btnCancel = {
  padding: "8px 12px",
  background: "red",
  color: "#fff",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer"
};

export default Bookings;