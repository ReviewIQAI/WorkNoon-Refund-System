import { createContext, useContext, useEffect, useState } from "react";
import { api } from "@/lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);      // null = unknown/checking, false = logged out, obj = logged in
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("wn_token");
    if (!token) {
      setAdmin(false);
      setChecking(false);
      return;
    }
    api
      .get("/auth/me")
      .then((res) => setAdmin(res.data))
      .catch(() => {
        localStorage.removeItem("wn_token");
        setAdmin(false);
      })
      .finally(() => setChecking(false));
  }, []);

  const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    localStorage.setItem("wn_token", res.data.access_token);
    setAdmin(res.data.user);
    return res.data.user;
  };

  const logout = () => {
    localStorage.removeItem("wn_token");
    setAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ admin, checking, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
