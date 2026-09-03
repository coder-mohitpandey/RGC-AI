import { useEffect, useState } from "react";
import api from "../../api/api";

const STAFF_TYPES = [
  { value: "guard", label: "Guard" },
  { value: "cleaning_crew", label: "Cleaning Crew" },
  { value: "management", label: "Management" },
];

const emptyStaffForm = { username: "", phone: "", password: "", staff_type: "guard" };
const emptyAdminForm = { username: "", phone: "", password: "" };

export default function ManageUsers() {
  const [staffForm, setStaffForm] = useState(emptyStaffForm);
  const [adminForm, setAdminForm] = useState(emptyAdminForm);
  const [staffList, setStaffList] = useState([]);
  const [adminList, setAdminList] = useState([]);
  const [staffMsg, setStaffMsg] = useState(null); // { type: 'error'|'success', text }
  const [adminMsg, setAdminMsg] = useState(null);

  function loadUsers() {
    api.get("/auth/users", { params: { role: "staff" } }).then((res) => setStaffList(res.data));
    api.get("/auth/users", { params: { role: "admin" } }).then((res) => setAdminList(res.data));
  }

  useEffect(() => {
    loadUsers();
  }, []);

  async function handleCreateStaff(e) {
    e.preventDefault();
    setStaffMsg(null);
    try {
      const res = await api.post("/auth/create-staff", staffForm);
      setStaffMsg({ type: "success", text: `Staff account created: ${res.data.username} (#${res.data.id})` });
      setStaffForm(emptyStaffForm);
      loadUsers();
    } catch (err) {
      setStaffMsg({ type: "error", text: err.response?.data?.detail || "Failed to create staff account" });
    }
  }

  async function handleCreateAdmin(e) {
    e.preventDefault();
    setAdminMsg(null);
    try {
      const res = await api.post("/auth/create-admin", adminForm);
      setAdminMsg({ type: "success", text: `Admin account created: ${res.data.username} (#${res.data.id})` });
      setAdminForm(emptyAdminForm);
      loadUsers();
    } catch (err) {
      setAdminMsg({ type: "error", text: err.response?.data?.detail || "Failed to create admin account" });
    }
  }

  return (
    <div className="page">
      <h2>Manage Users</h2>
      <p className="hint-text">
        Create staff (guard / cleaning crew / management) and admin accounts here. Regular users
        can only self-register through Sign Up — this page is the only way to create staff or
        additional admin logins.
      </p>

      <div className="form-row">
        <form className="card-form" onSubmit={handleCreateStaff}>
          <h3>Create Staff Account</h3>

          <label>Username</label>
          <input
            required
            value={staffForm.username}
            onChange={(e) => setStaffForm({ ...staffForm, username: e.target.value })}
          />

          <label>Phone</label>
          <input
            required
            value={staffForm.phone}
            onChange={(e) => setStaffForm({ ...staffForm, phone: e.target.value })}
          />

          <label>Password</label>
          <input
            required
            type="password"
            value={staffForm.password}
            onChange={(e) => setStaffForm({ ...staffForm, password: e.target.value })}
          />

          <label>Staff Type</label>
          <select
            value={staffForm.staff_type}
            onChange={(e) => setStaffForm({ ...staffForm, staff_type: e.target.value })}
          >
            {STAFF_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>

          <button type="submit">Create Staff</button>

          {staffMsg && (
            <p className={staffMsg.type === "error" ? "error-text" : "success-text"}>{staffMsg.text}</p>
          )}
        </form>

        <form className="card-form" onSubmit={handleCreateAdmin}>
          <h3>Create Admin Account</h3>

          <label>Username</label>
          <input
            required
            value={adminForm.username}
            onChange={(e) => setAdminForm({ ...adminForm, username: e.target.value })}
          />

          <label>Phone</label>
          <input
            required
            value={adminForm.phone}
            onChange={(e) => setAdminForm({ ...adminForm, phone: e.target.value })}
          />

          <label>Password</label>
          <input
            required
            type="password"
            value={adminForm.password}
            onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
          />

          <button type="submit">Create Admin</button>

          {adminMsg && (
            <p className={adminMsg.type === "error" ? "error-text" : "success-text"}>{adminMsg.text}</p>
          )}
        </form>
      </div>

      <h3 style={{ marginTop: 32 }}>Existing Staff</h3>
      <div className="complaint-list">
        {staffList.map((u) => (
          <div className="complaint-card" key={u.id}>
            <div className="complaint-card-header">
              <strong>{u.username}</strong>
              <span className="badge">#{u.id}</span>
              {u.staff_type && <span className="badge">{u.staff_type.replaceAll("_", " ")}</span>}
            </div>
            <p className="hint-text">Phone: {u.phone}</p>
          </div>
        ))}
        {staffList.length === 0 && <p className="hint-text">No staff accounts yet.</p>}
      </div>

      <h3 style={{ marginTop: 32 }}>Existing Admins</h3>
      <div className="complaint-list">
        {adminList.map((u) => (
          <div className="complaint-card" key={u.id}>
            <div className="complaint-card-header">
              <strong>{u.username}</strong>
              <span className="badge">#{u.id}</span>
            </div>
            <p className="hint-text">Phone: {u.phone}</p>
          </div>
        ))}
        {adminList.length === 0 && <p className="hint-text">No admin accounts yet.</p>}
      </div>
    </div>
  );
}
