import { useState } from "react";
import api from "../../api/api";

export default function ReportLostItem() {
  const [itemName, setItemName] = useState("");
  const [description, setDescription] = useState("");
  const [lostLocation, setLostLocation] = useState("");
  const [dateLost, setDateLost] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      await api.post("/lost-found/reports", {
        item_name: itemName,
        description,
        lost_location: lostLocation,
        date_lost: dateLost ? new Date(dateLost).toISOString() : null,
        contact_info: contactInfo,
      });
      setSuccess(true);
      setItemName("");
      setDescription("");
      setLostLocation("");
      setDateLost("");
      setContactInfo("");
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to submit report");
    }
  }

  return (
    <div className="page">
      <h2>Report a Lost Item</h2>
      <form className="card-form" onSubmit={handleSubmit}>
        <label>Item Name</label>
        <input value={itemName} onChange={(e) => setItemName(e.target.value)} required />

        <label>Description</label>
        <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />

        <label>Where you lost it (train/coach/station)</label>
        <input value={lostLocation} onChange={(e) => setLostLocation(e.target.value)} />

        <label>Approximate date lost</label>
        <input type="date" value={dateLost} onChange={(e) => setDateLost(e.target.value)} />

        <label>Contact Info</label>
        <input value={contactInfo} onChange={(e) => setContactInfo(e.target.value)} placeholder="Phone or email" />

        {error && <p className="error-text">{error}</p>}
        {success && <p className="success-text">Report submitted. We'll notify you if a match is found.</p>}

        <button type="submit">Submit Report</button>
      </form>
    </div>
  );
}
