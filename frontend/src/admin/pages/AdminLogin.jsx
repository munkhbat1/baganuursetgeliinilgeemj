import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminAuth } from "../AdminAuthContext";

export default function AdminLogin() {
  const { login, isAuthed } = useAdminAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (isAuthed) navigate("/admin", { replace: true });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(password);
      navigate("/admin");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login">
      <form className="admin-login__card" onSubmit={handleSubmit}>
        <img src="/logo.jpeg" alt="Багануур Сэтгэлийн Илгээмж" className="admin-login__logo" />
        <h1>Удирдлагын самбар</h1>
        <p>Удирдлагын самбарт нэвтрэх нууц үгээ оруулна уу.</p>
        <input
          type="password"
          placeholder="Нууц үг"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoFocus
        />
        {error && <p className="form-error">{error}</p>}
        <button className="btn btn--solid btn--full" disabled={loading}>
          {loading ? "Шалгаж байна..." : "Нэвтрэх"}
        </button>
      </form>
    </div>
  );
}
