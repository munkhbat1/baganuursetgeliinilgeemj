import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAdminAuth } from "./AdminAuthContext";

export default function AdminLayout() {
  const { logout } = useAdminAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/admin/login");
  };

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-sidebar__brand">
          <img src="/logo.jpeg" alt="Багануур Сэтгэлийн Илгээмж" className="admin-sidebar__logo" />
        </div>
        <nav>
          <NavLink to="/admin" end className="admin-nav-link">Хянах самбар</NavLink>
          <NavLink to="/admin/products" className="admin-nav-link">Бараа</NavLink>
          <NavLink to="/admin/categories" className="admin-nav-link">Ангилал</NavLink>
          <NavLink to="/admin/orders" className="admin-nav-link">Захиалга</NavLink>
          <NavLink to="/admin/content" className="admin-nav-link">Контент</NavLink>
        </nav>
        <button className="admin-logout" onClick={handleLogout}>Гарах</button>
      </aside>
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
