import { useEffect, useState } from "react";
import api, { API_BASE_URL } from "../../api/api";

const STATUS_LABELS = {
  pending: "Pending Review",
  assigned: "Assigned to Staff",
  in_progress: "Being Worked On",
  resolved: "Resolved — Awaiting Verification",
  verified: "Completed & Verified",
  rejected: "Sent Back to Staff",
};

export default function MyComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/complaints/mine")
      .then((res) => setComplaints(res.data))
      .catch((err) => setError(err.response?.data?.detail || "Failed to load complaints"));
  }, []);

  return (
    <div className="page">
      <h2>My Complaints & Progress</h2>
      {error && <p className="error-text">{error}</p>}
      {complaints.length === 0 && !error && <p>You haven't filed any complaints yet.</p>}
      <div className="complaint-list">
        {complaints.map((c) => (
          <div className="complaint-card" key={c.id}>
            <div className="complaint-card-header">
              <strong>{c.complaint_number}</strong>
              <span className={`badge badge-${c.priority}`}>{c.priority}</span>
              <span className="badge">{STATUS_LABELS[c.status] || c.status}</span>
            </div>
            <p><strong>Category:</strong> {c.category.replaceAll("_", " ")}</p>
            {c.description && <p><strong>Description:</strong> {c.description}</p>}
            <p>
              {c.train_no && `Train ${c.train_no} `}
              {c.coach_no && `Coach ${c.coach_no} `}
              {c.seat_no && `Seat ${c.seat_no}`}
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

            {c.reports.length > 0 && (
              <div className="report-section">
                <h4>Staff Progress Report</h4>
                {c.reports.map((r) => (
                  <div key={r.id} className="report-item">
                    <p>{r.description}</p>
                    <p className="hint-text">{r.verified ? "✅ Verified by admin" : "⏳ Awaiting admin verification"}</p>
                    {r.admin_remark && <p className="hint-text">Admin remark: {r.admin_remark}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
