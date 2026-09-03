import { useEffect, useState } from "react";
import api, { API_BASE_URL } from "../../api/api";

export default function AdminComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [staffList, setStaffList] = useState({}); // complaintId -> chosen staff id
  const [staffOptions, setStaffOptions] = useState([]);
  const [filterPriority, setFilterPriority] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [message, setMessage] = useState("");

  function loadComplaints() {
    const params = {};
    if (filterPriority) params.priority = filterPriority;
    if (filterStatus) params.status = filterStatus;
    api.get("/complaints", { params }).then((res) => setComplaints(res.data));
  }

  function loadStaffOptions() {
    api.get("/auth/users", { params: { role: "staff" } }).then((res) => setStaffOptions(res.data));
  }

  useEffect(() => {
    loadComplaints();
  }, [filterPriority, filterStatus]);

  useEffect(() => {
    loadStaffOptions();
  }, []);

  async function handleAssign(complaintId) {
    const staffId = staffList[complaintId];
    if (!staffId) {
      setMessage("Enter a staff ID first.");
      return;
    }
    try {
      await api.post(`/complaints/${complaintId}/assign`, { staff_id: Number(staffId) });
      setMessage(`Complaint ${complaintId} assigned.`);
      loadComplaints();
    } catch (err) {
      setMessage(err.response?.data?.detail || "Assignment failed");
    }
  }

  return (
    <div className="page">
      <h2>All Complaints</h2>
      <p className="hint-text">
        Need to add staff? Head to <strong>Manage Users</strong> in the nav bar to create staff or
        admin accounts — new staff will show up in the assignment dropdown below.
      </p>

      <div className="filter-bar">
        <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)}>
          <option value="">All priorities</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="assigned">Assigned</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="verified">Verified</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

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

            {c.status === "pending" && (
              <div className="assign-row">
                <select
                  value={staffList[c.id] || ""}
                  onChange={(e) => setStaffList({ ...staffList, [c.id]: e.target.value })}
                >
                  <option value="">Select staff…</option>
                  {staffOptions.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.username} ({s.staff_type?.replaceAll("_", " ")})
                    </option>
                  ))}
                </select>
                <button onClick={() => handleAssign(c.id)}>Assign</button>
              </div>
            )}
            {c.assigned_staff_id && (
              <p className="hint-text">
                Assigned to{" "}
                {staffOptions.find((s) => s.id === c.assigned_staff_id)?.username || `staff #${c.assigned_staff_id}`}
              </p>
            )}
          </div>
        ))}
        {complaints.length === 0 && <p>No complaints match this filter.</p>}
      </div>
    </div>
  );
}
