import { useEffect, useState } from "react";
import api, { API_BASE_URL } from "../../api/api";

export default function StaffComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [reportText, setReportText] = useState({});
  const [reportFiles, setReportFiles] = useState({});
  const [message, setMessage] = useState("");

  function load() {
    api.get("/complaints/staff/assigned").then((res) => setComplaints(res.data));
  }

  useEffect(() => {
    load();
  }, []);

  async function handleStart(id) {
    await api.post(`/complaints/${id}/start`);
    load();
  }

  async function handleSubmitReport(id) {
    const description = reportText[id];
    if (!description) {
      setMessage("Please describe what was done before submitting.");
      return;
    }
    const formData = new FormData();
    formData.append("description", description);
    const files = reportFiles[id] || [];
    for (const f of files) formData.append("files", f);

    try {
      await api.post(`/complaints/${id}/report`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setMessage("Report sent to admin for verification.");
      load();
    } catch (err) {
      setMessage(err.response?.data?.detail || "Failed to submit report");
    }
  }

  return (
    <div className="page">
      <h2>My Assigned Complaints</h2>
      {message && <p className="hint-text">{message}</p>}
      <div className="complaint-list">
        {complaints.map((c) => (
          <div className="complaint-card" key={c.id}>
            <div className="complaint-card-header">
              <strong>{c.complaint_number}</strong>
              <span className={`badge badge-${c.priority}`}>{c.priority}</span>
              <span className="badge">{c.status}</span>
            </div>
            <p><strong>Category:</strong> {c.category.replaceAll("_", " ")}</p>
            {c.description && <p>{c.description}</p>}
            <p className="hint-text">
              {c.train_no && `Train ${c.train_no} `}
              {c.coach_no && `Coach ${c.coach_no} `}
              {c.seat_no && `Seat ${c.seat_no} `}
              {c.location_note}
            </p>

            {c.media.length > 0 && (
              <div className="media-strip">
                {c.media.map((m) => (
                  <a key={m.id} href={`${API_BASE_URL}/${m.file_path}`} target="_blank" rel="noreferrer">
                    {m.media_type === "image" ? "🖼️ view image" : "🎬 view video"}
                  </a>
                ))}
              </div>
            )}

            {c.status === "assigned" && <button onClick={() => handleStart(c.id)}>Start Working</button>}

            {(c.status === "assigned" || c.status === "in_progress" || c.status === "rejected") && (
              <div className="report-form">
                <label>Describe what was done to resolve it</label>
                <textarea
                  rows={3}
                  value={reportText[c.id] || ""}
                  onChange={(e) => setReportText({ ...reportText, [c.id]: e.target.value })}
                />
                <label>Proof (optional)</label>
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={(e) => setReportFiles({ ...reportFiles, [c.id]: [...e.target.files] })}
                />
                <button onClick={() => handleSubmitReport(c.id)}>Submit Report to Admin</button>
              </div>
            )}

            {c.status === "resolved" && <p className="hint-text">⏳ Awaiting admin verification</p>}
            {c.status === "verified" && <p className="success-text">✅ Verified &amp; closed</p>}
          </div>
        ))}
        {complaints.length === 0 && <p>No complaints assigned to you yet.</p>}
      </div>
    </div>
  );
}
