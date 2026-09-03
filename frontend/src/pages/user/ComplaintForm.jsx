import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/api";

const CATEGORIES = [
  { value: "hygiene_cleanliness", label: "Hygiene & Cleanliness (seats, corridor, washroom)" },
  { value: "food_related", label: "Food Related (unhygienic / overpriced food)" },
  { value: "staff_related", label: "Staff Related (rude / unresponsive staff)" },
  { value: "unknown_passenger", label: "Unknown Passenger Occupying Seat/Corridor" },
  { value: "public_nuisance", label: "Public Nuisance on Platform (screaming, brawling)" },
  { value: "non_urgent", label: "Non-Urgent (dustbin, broken property, missing seat)" },
];

export default function ComplaintForm() {
  const [category, setCategory] = useState(CATEGORIES[0].value);
  const [description, setDescription] = useState("");
  const [trainNo, setTrainNo] = useState("");
  const [coachNo, setCoachNo] = useState("");
  const [seatNo, setSeatNo] = useState("");
  const [locationNote, setLocationNote] = useState("");
  const [files, setFiles] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess(null);

    const formData = new FormData();
    formData.append("category", category);
    formData.append("description", description);
    formData.append("train_no", trainNo);
    formData.append("coach_no", coachNo);
    formData.append("seat_no", seatNo);
    formData.append("location_note", locationNote);
    for (const file of files) formData.append("files", file);

    try {
      const res = await api.post("/complaints", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setSuccess(res.data.complaint_number);
      setTimeout(() => navigate("/user/complaints"), 1500);
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to submit complaint");
    }
  }

  return (
    <div className="page">
      <h2>File a Complaint</h2>
      <form className="card-form" onSubmit={handleSubmit}>
        <label>Complaint Category</label>
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>

        <label>Description (optional)</label>
        <textarea
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe what happened..."
        />

        <div className="form-row">
          <div>
            <label>Train Number</label>
            <input value={trainNo} onChange={(e) => setTrainNo(e.target.value)} />
          </div>
          <div>
            <label>Coach Number</label>
            <input value={coachNo} onChange={(e) => setCoachNo(e.target.value)} />
          </div>
          <div>
            <label>Seat Number</label>
            <input value={seatNo} onChange={(e) => setSeatNo(e.target.value)} />
          </div>
        </div>

        <label>Location Note (e.g. platform number, station)</label>
        <input value={locationNote} onChange={(e) => setLocationNote(e.target.value)} />

        <label>Attach Photos/Videos (optional)</label>
        <input type="file" multiple accept="image/*,video/*" onChange={(e) => setFiles([...e.target.files])} />

        {error && <p className="error-text">{error}</p>}
        {success && <p className="success-text">Complaint submitted! Your complaint number: {success}</p>}

        <button type="submit">Submit Complaint</button>
      </form>
    </div>
  );
}
