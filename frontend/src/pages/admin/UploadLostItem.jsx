import { useState } from "react";
import api from "../../api/api";

export default function UploadLostItem() {
  const [itemName, setItemName] = useState("");
  const [description, setDescription] = useState("");
  const [foundLocation, setFoundLocation] = useState("");
  const [keptAtStation, setKeptAtStation] = useState("");
  const [image, setImage] = useState(null);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    const formData = new FormData();
    formData.append("item_name", itemName);
    formData.append("description", description);
    formData.append("found_location", foundLocation);
    formData.append("kept_at_station", keptAtStation);
    if (image) formData.append("image", image);

    try {
      await api.post("/lost-found/items", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setSuccess(true);
      setItemName("");
      setDescription("");
      setFoundLocation("");
      setKeptAtStation("");
      setImage(null);
    } catch (err) {
      setError(err.response?.data?.detail || "Upload failed");
    }
  }

  return (
    <div className="page">
      <h2>Publish a Found Item</h2>
      <form className="card-form" onSubmit={handleSubmit}>
        <label>Item Name</label>
        <input value={itemName} onChange={(e) => setItemName(e.target.value)} required />

        <label>Description</label>
        <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />

        <label>Found At (train/coach/station)</label>
        <input value={foundLocation} onChange={(e) => setFoundLocation(e.target.value)} />

        <label>Kept At (station where user can claim)</label>
        <input value={keptAtStation} onChange={(e) => setKeptAtStation(e.target.value)} />

        <label>Photo</label>
        <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} />

        {error && <p className="error-text">{error}</p>}
        {success && <p className="success-text">Item published to Lost &amp; Found.</p>}

        <button type="submit">Publish</button>
      </form>
    </div>
  );
}
