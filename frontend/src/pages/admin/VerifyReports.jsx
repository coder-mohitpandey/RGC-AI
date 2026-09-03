import { useEffect, useState } from "react";
import api, { API_BASE_URL } from "../../api/api";

export default function VerifyReports() {
  const [complaints, setComplaints] = useState([]);
  const [remarks, setRemarks] = useState({});
  const [message, setMessage] = useState("");

  function load() {
    api.get("/complaints/reports/pending-verification").then((res) => setComplaints(res.data));
  }

  useEffect(() => {
    load();
  }, []);

  async function handleVerify(reportId, approve) {
    try {
      await api.post(`/complaints/reports/${reportId}/verify`, {
        approve,
        admin_remark: remarks[reportId] || "",
      });
      setMessage(approve ? "Report approved & complaint marked verified." : "Report rejected & sent back to staff.");
      load();
    } catch (err) {
      setMessage(err.response?.data?.detail || "Action failed");
    }
  }

  return (
    <div className="page">
      <h2>Verify Staff Reports</h2>
      {message && <p className="hint-text">{message}</p>}
      <div className="complaint-list">
        {complaints.map((c) => (
          <div className="complaint-card" key={c.id}>
            <div className="complaint-card-header">
              <strong>{c.complaint_number}</strong>
              <span className="badge">{c.category.replaceAll("_", " ")}</span>
            </div>
            <p className="hint-text">Original complaint: {c.description}</p>

            {c.reports
              .filter((r) => !r.verified)
              .map((r) => (
                <div key={r.id} className="report-item">
                  <p><strong>Staff report:</strong> {r.description}</p>
                  {r.media.length > 0 && (
                    <div className="media-strip">
                      {r.media.map((m) => (
                        <a key={m.id} href={`${API_BASE_URL}/${m.file_path}`} target="_blank" rel="noreferrer">
                          {m.media_type === "image" ? "🖼️ proof image" : "🎬 proof video"}
                        </a>
                      ))}
                    </div>
                  )}
                  <textarea
                    placeholder="Optional remark..."
                    rows={2}
                    value={remarks[r.id] || ""}
                    onChange={(e) => setRemarks({ ...remarks, [r.id]: e.target.value })}
                  />
                  <div className="button-row">
                    <button onClick={() => handleVerify(r.id, true)}>Approve &amp; Close</button>
                    <button onClick={() => handleVerify(r.id, false)} className="secondary-btn">
                      Reject &amp; Send Back
                    </button>
                  </div>
                </div>
              ))}
          </div>
        ))}
        {complaints.length === 0 && <p>No reports pending verification.</p>}
      </div>
    </div>
  );
}
