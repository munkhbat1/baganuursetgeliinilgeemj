import React, { createContext, useContext, useState } from "react";
import { adminApi } from "../api";

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("astra_admin_token"));

  const login = async (password) => {
    const { token: newToken } = await adminApi.login(password);
    localStorage.setItem("astra_admin_token", newToken);
    setToken(newToken);
  };

  const logout = async () => {
    try {
      await adminApi.logout();
    } catch {
      // token may already be invalid — clear locally regardless
    }
    localStorage.removeItem("astra_admin_token");
    setToken(null);
  };

  return (
    <AdminAuthContext.Provider value={{ token, isAuthed: !!token, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return ctx;
}
