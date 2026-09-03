import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { token, role, username, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <nav className="navbar">
      <div className="navbar-brand">🚆 Railway Complaint System</div>
      <div className="navbar-links">
        {token && role === "user" && (
          <>
            <Link to="/user/complaint/new">File Complaint</Link>
            <Link to="/user/complaints">My Complaints</Link>
            <Link to="/user/lost-found">Lost &amp; Found</Link>
            <Link to="/user/lost-found/report">Report Lost Item</Link>
          </>
        )}
        {token && role === "admin" && (
          <>
            <Link to="/admin/complaints">Complaints</Link>
            <Link to="/admin/verify-reports">Verify Reports</Link>
            <Link to="/admin/lost-found/upload">Upload Found Item</Link>
            <Link to="/admin/manage-users">Manage Users</Link>
          </>
        )}
        {token && role === "staff" && (
          <>
            <Link to="/staff/complaints">My Assignments</Link>
          </>
        )}
        {token ? (
          <>
            <span className="navbar-user">Hi, {username}</span>
            <button onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/signup">Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  );
}
