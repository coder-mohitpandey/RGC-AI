import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState({
    token: localStorage.getItem("token") || null,
    role: localStorage.getItem("role") || null,
    username: localStorage.getItem("username") || null,
    userId: localStorage.getItem("user_id") || null,
  });

  function login({ access_token, role, username, user_id }) {
    localStorage.setItem("token", access_token);
    localStorage.setItem("role", role);
    localStorage.setItem("username", username);
    localStorage.setItem("user_id", user_id);
    setAuth({ token: access_token, role, username, userId: user_id });
  }

  function logout() {
    localStorage.clear();
    setAuth({ token: null, role: null, username: null, userId: null });
  }

  return (
    <AuthContext.Provider value={{ ...auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
