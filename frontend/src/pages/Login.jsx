import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [identifier, setIdentifier] = useState(""); // PNR or phone
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      const res = await api.post("/auth/login", { identifier, password });
      login(res.data);
      const role = res.data.role;
      if (role === "admin") navigate("/admin/complaints");
      else if (role === "staff") navigate("/staff/complaints");
      else navigate("/user/complaint/new");
    } catch (err) {
      setError(err.response?.data?.detail || "Login failed");
    }
  }

  return (
    <div className="auth-page">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Login</h2>
        <label>PNR or Phone Number</label>
        <input value={identifier} onChange={(e) => setIdentifier(e.target.value)} required />
        <label>Password</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        {error && <p className="error-text">{error}</p>}
        <button type="submit">Login</button>
        <p>
          New here? <a href="/signup">Create an account</a>
        </p>
        <p className="hint-text">Demo admin login: phone 9999999999 / password admin123</p>
      </form>
    </div>
  );
}
